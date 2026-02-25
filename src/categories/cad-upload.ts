import { CAD_BASE, CAD_PRICE, FORMAT_TOLERANCE_MM, WF_SCAN_PRICE_PER_CM } from "../core/compat";
import { money } from "../core/compat";

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
 */
export function detectFormatFromDimensions(widthMm: number, heightMm: number): {
  format: string;
  isFormatowy: boolean;
  isStandardWidth: boolean;
} {
  console.log("detectFormatFromDimensions called with:", { widthMm, heightMm });
  console.log("CAD_BASE:", CAD_BASE);
  
  const shorter = Math.min(widthMm, heightMm);
  const longer = Math.max(widthMm, heightMm);
  console.log("shorter:", shorter, "longer:", longer);

  // Check standard formats by width
  for (const [fmt, base] of Object.entries(CAD_BASE)) {
    if (fmt === 'R1067') continue; // Skip roll for now
    const baseWidth = (base as any).w;
    const baseLength = (base as any).l;
    console.log("Checking format", fmt, "width:", baseWidth, "length:", baseLength);

    // Check if width matches
    if (Math.abs(shorter - baseWidth) < 0.5) {
      console.log("Width matches for format", fmt);
      // Check if length is within tolerance
      if (Math.abs(longer - baseLength) <= FORMAT_TOLERANCE_MM) {
        console.log("Length also matches - formatowy");
        return {
          format: fmt,
          isFormatowy: true,
          isStandardWidth: true
        };
      } else {
        console.log("Length doesn't match - meter-based");
        // Width matches but length doesn't = meter-based (mb)
        return {
          format: fmt,
          isFormatowy: false,
          isStandardWidth: true
        };
      }
    }
  }

  console.log("No standard format found - non-standard");
  // Non-standard width
  return {
    format: `${Math.round(shorter)}mm`,
    isFormatowy: false,
    isStandardWidth: false
  };
}

/**
 * Calculate print price for CAD file.
 * Uses formatowe vs metr-bieżący pricing.
 */
export function calculateCadPrintPrice(
  widthMm: number,
  heightMm: number,
  format: string,
  isFormatowy: boolean,
  mode: 'bw' | 'color',
  qty: number
): number {
  console.log("calculateCadPrintPrice called with:", { widthMm, heightMm, format, isFormatowy, mode, qty });
  
  const prices = CAD_PRICE[mode];
  console.log("CAD_PRICE:", CAD_PRICE);
  console.log("prices for mode", mode, ":", prices);

  if (isFormatowy) {
    // Format-based pricing
    const price = prices.formatowe[format];
    console.log("Format-based price for", format, ":", price);
    if (!price) return 0;
    return qty * price;
  } else {
    // Meter-based pricing
    const price = prices.mb[format];
    console.log("Meter-based price for", format, ":", price);
    if (!price) return 0;
    // Use longer side (usually height) for length in meters
    const lengthMeters = Math.max(widthMm, heightMm) / 1000;
    console.log("Length in meters:", lengthMeters);
    return qty * lengthMeters * price;
  }
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
  if (!scanning) return 0;

  // Scanning: longer side in mm × price per cm
  const longerSide = Math.max(widthMm, heightMm);
  return qty * longerSide * WF_SCAN_PRICE_PER_CM;
}

/**
 * Calculate total price for a file and return updated entry.
 */
export function updateCadFileEntry(
  entry: Partial<CadUploadFileEntry>,
  mode: 'bw' | 'color'
): CadUploadFileEntry {
  const widthMm = entry.widthMm || 0;
  const heightMm = entry.heightMm || 0;
  const format = entry.format || 'unknown';
  const isFormatowy = entry.isFormatowy || false;
  const qty = 1; // For now, always qty=1

  const printPrice = calculateCadPrintPrice(widthMm, heightMm, format, isFormatowy, mode, qty);
  const foldingPrice = calculateCadFoldingPrice(format, isFormatowy, widthMm, heightMm, entry.folding || false, qty);
  const scanPrice = calculateCadScanningPrice(widthMm, heightMm, entry.scanning || false, qty);

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
    folding: entry.folding || false,
    scanning: entry.scanning || false,
    printPrice,
    foldingPrice,
    scanPrice,
    totalPrice: parseFloat(money(printPrice + foldingPrice + scanPrice))
  };
}
