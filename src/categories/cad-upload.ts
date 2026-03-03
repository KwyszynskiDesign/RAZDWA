import { CAD_BASE, CAD_PRICE, FORMAT_TOLERANCE_MM, WF_SCAN_PRICE_PER_CM } from "../core/compat";
import { money } from "../core/compat";
import { getFileDimensions, detectPaperFormat, formatDimensionOutput, pixelsToMm as pxToMmUtil } from "../utils/fileDimensionReader";
import { PDFDocument } from "pdf-lib";

/** Pixel to millimeters conversion at 300 DPI */
export const PX_TO_MM_300DPI = 25.4 / 300;

/** File entry with dimensions and pricing data */
export interface CadUploadFileEntry {
  id: number;
  name: string;
  widthPx: number;
  heightPx: number;
  widthMm: number;
  heightMm: number;
  format: string;
  isFormatowy: boolean;
  isStandardWidth: boolean;
  pageCount: number;
  mode: 'color' | 'bw';
  folding: boolean;
  scanning: boolean;
  printPrice: number;
  foldingPrice: number;
  scanPrice: number;
  totalPrice: number;
}

/**
 * Detect CAD format from dimensions (mm).
 * Based on SHORTER side (= paper/roll width).
 * FIXED: Inteligentna klasyfikacja A4-A0+ z ±15mm tolerancją
 */
export function detectFormatFromDimensions(widthMm: number, heightMm: number): {
  format: string;
  isFormatowy: boolean;
  isStandardWidth: boolean;
} {
  const FORMAT_TOLERANCE_CLASSIFY = 15; // ±15mm dla klasyfikacji A-formatów
  
  const shorter = Math.min(widthMm, heightMm);
  const longer = Math.max(widthMm, heightMm);
  
  console.group('📏 FORMAT CLASSIFICATION');
  console.log(`📐 Dim: ${shorter.toFixed(1)}×${longer.toFixed(1)}mm`);
  
  function inRange(value: number, target: number): boolean {
    return Math.abs(value - target) <= FORMAT_TOLERANCE_CLASSIFY;
  }
  
  // CAD pricing starts at A3 – smaller formats are treated as A3
  if (inRange(shorter, 297)) {
    const fmt = 'A3';
    if (fmt) {
      console.log(`✅ ${fmt}`);
      console.groupEnd();
      return { format: fmt, isFormatowy: true, isStandardWidth: true };
    }
  }
  
  if (inRange(shorter, 420)) {
    const fmt = 'A2';
    if (fmt) {
      console.log(`✅ ${fmt}`);
      console.groupEnd();
      return { format: fmt, isFormatowy: true, isStandardWidth: true };
    }
  }
  
  if (inRange(shorter, 594)) {
    const fmt = 'A1';
    if (fmt) {
      console.log(`✅ ${fmt}`);
      console.groupEnd();
      return { format: fmt, isFormatowy: true, isStandardWidth: true };
    }
  }
  
  if (inRange(shorter, 841)) {
    const fmt = 'A0';
    if (fmt) {
      console.log(`✅ ${fmt}`);
      console.groupEnd();
      return { format: fmt, isFormatowy: true, isStandardWidth: true };
    }
  }

  if (inRange(shorter, 914)) {
    const fmt = 'A0p';
    console.log(`✅ ${fmt}`);
    console.groupEnd();
    return { format: fmt, isFormatowy: true, isStandardWidth: true };
  }
  
  // A0+ i Custom: rozmiary niestandarowe
  let rollKey = 'A3';
  if (shorter <= 297 + FORMAT_TOLERANCE_CLASSIFY) rollKey = 'A3';
  else if (shorter <= 420 + FORMAT_TOLERANCE_CLASSIFY) rollKey = 'A2';
  else if (shorter <= 594 + FORMAT_TOLERANCE_CLASSIFY) rollKey = 'A1';
  else if (shorter <= 841 + FORMAT_TOLERANCE_CLASSIFY) rollKey = 'A0';
  else if (shorter <= 914 + FORMAT_TOLERANCE_CLASSIFY) rollKey = 'A0p';
  else rollKey = 'R1067';
  
  console.log(`✅ MB ${rollKey}`);
  console.groupEnd();
  
  return {
    format: rollKey,
    isFormatowy: false,
    isStandardWidth: rollKey !== 'R1067'
  };
}

/**
 * Calculate print price for CAD file.
 * Uses formatowe vs metr-bieżący pricing.
 */
export function calculateCadPrintPrice(format: string, isColor: boolean): number {
  const mode: 'bw' | 'color' = isColor ? 'color' : 'bw';
  const prices = CAD_PRICE[mode];

  const formatPrice = prices.formatowe[format];
  if (formatPrice) return formatPrice;

  const mbPrice = prices.mb[format];
  return mbPrice || 0;
}

function calculateCadPrintPriceWithDimensions(
  widthMm: number,
  heightMm: number,
  format: string,
  isFormatowy: boolean,
  mode: 'bw' | 'color',
  qty: number
): number {
  const prices = CAD_PRICE[mode];

  if (isFormatowy) {
    const price = prices.formatowe[format];
    if (!price) return 0;
    return qty * price;
  }

  // Dla metr bieżącego: drugi bok (dłuższy) w cm * 0.08 zł
  const lengthCm = Math.max(widthMm, heightMm) / 10;
  const pricePerCm = 0.08;
  return qty * lengthCm * pricePerCm;
}

/**
 * Calculate folding price for CAD file.
 */
export function calculateCadFoldingPrice(
  format: string,
  isFormatowy: boolean,
  widthMm: number,
  heightMm: number,
  folding: boolean,
  qty: number
): number {
  if (!folding) return 0;

  if (isFormatowy) {
    // Format-based folding price
    const FOLD_PRICES: Record<string, number> = {
      A0p: 4.0,
      A0: 3.0,
      A1: 2.0,
      A2: 1.5,
      A3: 1.0,
      A3L: 0.7,
    };
    const price = FOLD_PRICES[format];
    return price ? qty * price : 0;
  } else {
    // Non-format folding = per m²
    const areaM2 = (widthMm / 1000) * (heightMm / 1000);
    return qty * areaM2 * 2.5; // 2.5 zł/m²
  }
}

/**
 * Calculate scanning price for CAD file.
 */
export function calculateCadScanningPrice(
  widthMm: number,
  heightMm: number,
  scanning: boolean,
  qty: number
): number {
  // Skanowanie jest wyłączone dla CAD Upload
  return 0;
}

/**
 * Calculate total price for a file and return updated entry.
 */
export function updateCadFileEntry(
  entry: Partial<CadUploadFileEntry>,
  mode: 'bw' | 'color'
): CadUploadFileEntry;
export function updateCadFileEntry(
  file: File,
  isColor?: boolean
): Promise<CadUploadFileEntry>;
export function updateCadFileEntry(
  arg1: Partial<CadUploadFileEntry> | File,
  arg2?: 'bw' | 'color' | boolean
): CadUploadFileEntry | Promise<CadUploadFileEntry> {
  console.log("🟡 updateCadFileEntry called with:", arg1 instanceof File ? "File" : "Entry", arg2);
  console.log("🟡 CAD_PRICE value:", CAD_PRICE);
  
  if (arg1 instanceof File) {
    const file = arg1;
    const isColor = typeof arg2 === "boolean" ? arg2 : false;
    const mode: 'bw' | 'color' = isColor ? 'color' : 'bw';

    console.log("🟡 Processing file mode:", mode);

    return loadImageDimensions(file)
      .then(({ widthPx, heightPx, pageCount }) => {
        console.log("🟡 Image dimensions:", widthPx, heightPx, "pageCount:", pageCount);
        const widthMm = pxToMm(widthPx);
        const heightMm = pxToMm(heightPx);
        console.log("🟡 Dimensions in mm:", widthMm, heightMm);
        const fmt = detectFormatFromDimensions(widthMm, heightMm);
        console.log("🟡 Detected format:", fmt);
        const printPrice = calculateCadPrintPriceWithDimensions(
          widthMm,
          heightMm,
          fmt.format,
          fmt.isFormatowy,
          mode,
          pageCount
        );
        console.log("🟡 Calculated print price for", pageCount, "pages:", printPrice);

        return {
          id: Date.now(),
          name: file.name,
          widthPx,
          heightPx,
          widthMm,
          heightMm,
          format: fmt.format,
          isFormatowy: fmt.isFormatowy,
          isStandardWidth: fmt.isStandardWidth,
          pageCount,
          mode,
          folding: false,
          scanning: false,
          printPrice,
          foldingPrice: 0,
          scanPrice: 0,
          totalPrice: parseFloat(money(printPrice))
        };
      })
      .catch(() => {
        console.error("🔴 Error loading image dimensions");
        return {
          id: Date.now(),
          name: file.name,
          widthPx: 0,
          heightPx: 0,
          widthMm: 0,
          heightMm: 0,
          format: "unknown",
          isFormatowy: false,
          isStandardWidth: false,
          pageCount: 0,
          mode,
          folding: false,
          scanning: false,
          printPrice: 0,
          foldingPrice: 0,
          scanPrice: 0,
          totalPrice: 0
        };
      });
  }

  const entry = arg1;
  const mode = (arg2 as 'bw' | 'color') || 'bw';
  const widthMm = entry.widthMm || 0;
  const heightMm = entry.heightMm || 0;
  const format = entry.format || 'unknown';
  const isFormatowy = entry.isFormatowy || false;
  const qty = entry.pageCount || 1;

  console.log("🟡 Recalculating existing entry:", { format, mode, folding: entry.folding, scanning: entry.scanning, pageCount: qty });

  const printPrice = calculateCadPrintPriceWithDimensions(widthMm, heightMm, format, isFormatowy, mode, qty);
  const foldingPrice = calculateCadFoldingPrice(format, isFormatowy, widthMm, heightMm, entry.folding || false, qty);
  const scanPrice = calculateCadScanningPrice(widthMm, heightMm, entry.scanning || false, qty);

  console.log("🟡 Recalculated prices:", { printPrice, foldingPrice, scanPrice });

  return {
    id: entry.id || 0,
    name: entry.name || '',
    widthPx: entry.widthPx || 0,
    heightPx: entry.heightPx || 0,
    widthMm,
    heightMm,
    format,
    isFormatowy,
    isStandardWidth: entry.isStandardWidth || false,
    pageCount: entry.pageCount || 1,
    mode: entry.mode || mode,
    folding: entry.folding || false,
    scanning: entry.scanning || false,
    printPrice,
    foldingPrice,
    scanPrice,
    totalPrice: parseFloat(money(printPrice + foldingPrice + scanPrice))
  };
}

function pxToMm(px: number): number {
  return px * PX_TO_MM_300DPI;
}

function loadImageDimensions(file: File): Promise<{ widthPx: number; heightPx: number; pageCount: number }>{
  return new Promise(async (resolve, reject) => {
    if (file.type === "application/pdf") {
      try {
        const bytes = await file.arrayBuffer();
        console.log("PDF bytes:", bytes.byteLength);
        const pdfDoc = await PDFDocument.load(bytes);
        const pageCount = pdfDoc.getPageCount();
        console.log("PDF loaded:", pageCount, "stron");
        const page = pdfDoc.getPage(0);
        const { width, height } = page.getSize(); // points (1/72 inch)
        console.log("Page size:", { width, height });
        
        // Convert points → px (300 DPI)
        const pxPerPoint = 300 / 72;
        const widthPx = Math.round(width * pxPerPoint);
        const heightPx = Math.round(height * pxPerPoint);
        console.log("Final px:", { widthPx, heightPx });
        
        resolve({ widthPx, heightPx, pageCount });
      } catch (err) {
        reject(new Error("Failed to load PDF"));
      }
      return;
    }

    if (!file.type.startsWith("image/")) {
      reject(new Error("Unsupported file type"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          widthPx: img.naturalWidth || img.width,
          heightPx: img.naturalHeight || img.height,
          pageCount: 1
        });
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
