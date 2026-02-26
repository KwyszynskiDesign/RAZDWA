// cad-upload.js – kalkulator uploadowania plików CAD z pełnym cennikiem
// LEGACY JS (nie TypeScript) – docs/js/categories/cad-upload.js

import { drukCad } from '../prices.js';

console.log('✅ CAD WIELKOFORMATOWE FULL SYSTEM IMPORTED');

// ─── 🎯 WSZYSTKIE GLOBALNE STAŁE – ZERO UNDEFINED! ──────────────────────────────

/** Cena skanowania: 0,08 zł/cm */
const SCAN_PER_CM = 0.08;

/** Tolerancja (mm) przy sprawdzaniu długości formatowej */
const TOLERANCJA_MM = 5;

/** Ceny składania (złożenie) dla różnych formatów */
const SKLAD_CENY = {
  'A0+': 5.50,
  'A0': 5.00,
  'A1': 3.00,
  'A2': 2.00,
  'A3': 1.00,
  'A4': 0.50,
  'nieformat': 0.50
};

/** Global array do kumulacji wszystkich wyników */
let globalneWyniki = [];

// ─── FAKTYCZNY CENNIK CAD WIELKOFORMATOWE (KOLOR + CZARNO-BIAŁY) ────────────────
const CAD_CENNIK = {
  // FORMATOWE: Ceny za jeden arkusz/stronę – zł za sztukę (KOLOR + B/W)
  formatowe: {
    kolor: {
      'A3': 5.30,     // 297×420mm
      'A2': 8.50,     // 420×594mm
      'A1': 12.00,    // 594×841mm
      'A0': 24.00,    // 841×1189mm
      'A0+': 26.00    // 914×1292mm
    },
    bw: {
      'A3': 2.50,     // 297×420mm czarno-biały
      'A2': 4.00,     // 420×594mm czarno-biały
      'A1': 6.00,     // 594×841mm czarno-biały
      'A0': 11.00,    // 841×1189mm czarno-biały
      'A0+': 12.50    // 914×1292mm czarno-biały (rolka 1067)
    }
  },
  
  // NIEFORMATOWE: Ceny za metr bieżący roli – zł/mb dla każdej szerokości (KOLOR + B/W)
  nieformatowe_mb: {
    kolor: {
      'A3': 12.00,    // 297mm szerokość rolki
      'A2': 13.90,    // 420mm szerokość rolki
      'A1': 14.50,    // 594mm szerokość rolki
      'A0': 20.00,    // 841mm szerokość rolki
      'A0+': 21.00,   // 914mm szerokość rolki
      '1067': 30.00   // 1067mm szerokość rolki
    },
    bw: {
      'A3': 3.50,     // 297mm szerokość rolki czarno-biały
      'A2': 4.50,     // 420mm szerokość rolki czarno-biały
      'A1': 5.00,     // 594mm szerokość rolki czarno-biały
      'A0': 9.00,     // 841mm szerokość rolki czarno-biały
      'A0+': 10.00,   // 914mm szerokość rolki czarno-biały
      '1067': 12.50   // 1067mm szerokość rolki czarno-biały
    }
  },
  
  // Mapowanie format → szerokość rolki (do obliczania metrowych)
  formatToWidth: {
    'A3': 297,
    'A2': 420,
    'A1': 594,
    'A0': 841,
    'A0+': 914
  },
  
  // Bazowe długości formatów (mm) – do rozpoznawania formatowych vs nieformatowych
  baseLengthMm: {
    'A3': 420,
    'A2': 594,
    'A1': 841,
    'A0': 1189,
    'A0+': 1292
  }
};

console.log('💎 CENNIK CAD WIELKOFORMATOWE załadowany:', CAD_CENNIK);

// ─── TRYB DRUKU (COLOR/BW) – domyślnie BW ─────────────────────────────────────
let PRINT_MODE = 'bw';  // Globalny tryb druku: 'bw' lub 'color'

function setPrintMode(mode) {
  if (mode !== 'bw' && mode !== 'color') {
    console.warn(`⚠️ Nieznany tryb: ${mode}, używam BW`);
    mode = 'bw';
  }
  PRINT_MODE = mode;
  console.log(`📋 Tryb druku zmieniony na: ${PRINT_MODE}`);
}

const BASE_LENGTHS  = CAD_CENNIK.baseLengthMm;
const WIDTHS        = CAD_CENNIK.formatToWidth;
const MAX_FILES_SOFT = 50;

/** Tolerancja (mm) przy sprawdzaniu długości formatowej */
const TOLERANCE_MM = 5;

const CAD_FORMATS = ['A3', 'A2', 'A1', 'A0', 'A0+'];

/**
 * ✅ GŁÓWNA FUNKCJA OBLICZANIA CENY CAD
 * Rozróżnia: FORMATOWE (cena stała) vs NIEFORMATOWE (metrowy)
 * Obsługuje: KOLOR i CZARNO-BIAŁY
 * 
 * @param {string} format - format (A3, A2, A1, A0, A0+)
 * @param {number} dlugosc_mm - długość w mm (jeśli różna od base length)
 * @param {number} strony - liczba stron/arkuszy
 * @returns {object} { cena: number, typ: 'formatowe'|'nieformatowe', wyjasnenie: string }
 */
function calculateCadCennik(format, dlugosc_mm, strony = 1) {
  if (!format || !CAD_CENNIK.formatowe.kolor[format]) {
    console.warn(`⚠️ Nieznany format: ${format}`);
    return { cena: 0, typ: 'unknown', wyjasnenie: 'Nieznany format' };
  }

  // Wybierz tryb druku (KOLOR lub B/W)
  const modeKey = PRINT_MODE === 'color' ? 'kolor' : 'bw';
  const baseLength = CAD_CENNIK.baseLengthMm[format];
  const isFormatowy = Math.abs(dlugosc_mm - baseLength) <= TOLERANCE_MM;

  let cena, wyjasnenie;

  if (isFormatowy) {
    // FORMATOWE: cena stała za arkusz
    const cenaNetto = CAD_CENNIK.formatowe[modeKey][format];
    cena = cenaNetto * strony;
    const modeLabel = PRINT_MODE === 'color' ? 'kolor' : 'cz-b';
    wyjasnenie = `Formatowe ${format} ${modeLabel} = ${cenaNetto}zł × ${strony}str`;
    console.log(`💲 FORMATOWE: ${format} (${dlugosc_mm}mm ≈ ${baseLength}mm base) ${modeLabel} × ${strony}str = ${cena.toFixed(2)}zł`);
  } else {
    // NIEFORMATOWE: cena za metr bieżący
    const szerokosc = WIDTHS[format];
    const cenaMb = CAD_CENNIK.nieformatowe_mb[modeKey][format];
    const metryBiezace = dlugosc_mm / 1000;
    cena = (cenaMb * metryBiezace * strony).toFixed(2);
    const modeLabel = PRINT_MODE === 'color' ? 'kolor' : 'cz-b';
    wyjasnenie = `Nieformatowe ${format} ${modeLabel} ${dlugosc_mm}mm = ${metryBiezace.toFixed(3)}mb × ${cenaMb}zł/mb × ${strony}str`;
    console.log(`📐 NIEFORMATOWE: ${format} ${dlugosc_mm}mm ${modeLabel} = ${metryBiezace.toFixed(3)}m × ${cenaMb}zł/mb × ${strony}str = ${cena}zł`);
  }

  return {
    cena: parseFloat(cena),
    typ: isFormatowy ? 'formatowe' : 'nieformatowe',
    wyjasnenie: wyjasnenie,
    format: format,
    dlugosc_mm: dlugosc_mm,
    strony: strony
  };
}

/**
 * ✅ PEŁNY SYSTEM CEN CAD – oblicza cenę na podstawie formatu, trybów i liczby stron
 * @param {string} format - format (A3, A2, A1, A0, A0+)
 * @param {number} strony - liczba stron/arkuszy
 * @param {string} mode - tryb ('bw' lub 'color'), jeśli undefined to PRINT_MODE
 * @returns {string} - cena formatowana (zł)
 */
function calculateCadFull(format, strony = 1, mode = undefined) {
  if (!mode) mode = PRINT_MODE;  // Use global PRINT_MODE if not specified
  
  // Use new cennik system
  const result = calculateCadCennik(format, BASE_LENGTHS[format], strony);
  return result.cena.toFixed(2);
}

/**
 * Oblicz cenę CAD z wymiarów – używa nowego systemu cennikowego
 * @param {number} widthMm - szerokość (mm)
 * @param {number} heightMm - wysokość (mm)
 * @param {number} qty - ilość
 * @param {string} mode - tryb ('bw' lub 'color'), jeśli undefined to PRINT_MODE
 * @returns {object} - { cena, typ, wyjasnenie }
 */
function calculateCadByDims(widthMm, heightMm, qty = 1, mode = undefined) {
  if (!mode) mode = PRINT_MODE;
  
  if (!widthMm || !heightMm || widthMm <= 0 || heightMm <= 0) {
    return { cena: 0, typ: 'error', wyjasnenie: 'Błędne wymiary' };
  }
  
  const longer = Math.max(widthMm, heightMm);
  const format = detectFormat(widthMm, heightMm);
  
  if (format === 'nieformatowy') {
    console.warn(`📐 Format nierozpoznany: ${widthMm}×${heightMm}mm`);
    return { cena: 0, typ: 'unknown', wyjasnenie: 'Format nierozpoznany' };
  }
  
  // Use new cennik
  const result = calculateCadCennik(format, longer, qty);
  return result;
}

// ─── GLOBAL STATE: KUMULACJA WYNIKÓW ─────────────────────────────────────────
let wszystkieWyniki = [];  // KUMULUJ wszystkie analizy PDF/obrazów
console.log('📦 Globalny array wyników inicjalizowany');

let _nextId = 1;

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtPLN(v) {
  return v.toFixed(2).replace('.', ',') + ' zł';
}

function debounce(fn, ms) {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
}

// ─── WYKRYWANIE FORMATU ──────────────────────────────────────────────────────
/** 
 * Wykryj format z tolerancją ±15mm. 
 * NOWA LOGIKA: Jeśli którykolwiek bok (krótszy LUB dłuższy) pasuje do standardowej szerokości,
 * przypisz format na podstawie tego boku (np. 297×212 → A3, bo ma bok 297mm)
 */
function detectFormat(wMm, hMm) {
  const short = Math.min(wMm, hMm);
  const long = Math.max(wMm, hMm);
  const TOLERANCE = 15;

  // Najpierw próbuj dokładne dopasowanie (oba wymiary pasują)
  if (Math.abs(short - 297) <= TOLERANCE && Math.abs(long - 420) <= TOLERANCE) return 'A3';
  if (Math.abs(short - 420) <= TOLERANCE && Math.abs(long - 594) <= TOLERANCE) return 'A2';
  if (Math.abs(short - 594) <= TOLERANCE && Math.abs(long - 841) <= TOLERANCE) return 'A1';
  if (Math.abs(short - 841) <= TOLERANCE && Math.abs(long - 1189) <= TOLERANCE) return 'A0';
  if (Math.abs(short - 914) <= TOLERANCE && Math.abs(long - 1292) <= TOLERANCE) return 'A0+';

  // NOWE: Jeśli którykolwiek bok pasuje do standardowej szerokości, użyj tego formatu
  // (np. 297×212mm → A3, bo ma bok 297mm)
  if (Math.abs(wMm - 914) <= TOLERANCE || Math.abs(hMm - 914) <= TOLERANCE) return 'A0+';
  if (Math.abs(wMm - 841) <= TOLERANCE || Math.abs(hMm - 841) <= TOLERANCE) return 'A0';
  if (Math.abs(wMm - 594) <= TOLERANCE || Math.abs(hMm - 594) <= TOLERANCE) return 'A1';
  if (Math.abs(wMm - 420) <= TOLERANCE || Math.abs(hMm - 420) <= TOLERANCE) return 'A2';
  if (Math.abs(wMm - 297) <= TOLERANCE || Math.abs(hMm - 297) <= TOLERANCE) return 'A3';

  // Fallback: szerokość >= próg → przypisz najbliższy format
  const shorter = Math.min(wMm, hMm);
  if (shorter >= WIDTHS['A0+'] - TOLERANCE) return 'A0+';
  if (shorter >= WIDTHS['A0'] - TOLERANCE)  return 'A0';
  if (shorter >= WIDTHS['A1'] - TOLERANCE)  return 'A1';
  if (shorter >= WIDTHS['A2'] - TOLERANCE)  return 'A2';
  if (shorter >= WIDTHS['A3'] - TOLERANCE)  return 'A3';
  
  return 'nieformatowy';
}

// ─── CLASSIFY FORMAT (UI) ─────────────────────────────────────────────────-
const CLASSIFY_TOLERANCE_MM = 15;

function classifyFormat(widthMm, heightMm) {
  const short = Math.min(widthMm, heightMm);
  const long = Math.max(widthMm, heightMm);

  console.group('📏 FORMAT CLASSIFICATION');
  console.log(`Input: ${widthMm}x${heightMm}mm → Short:${short} Long:${long}`);

  let result;
  // A-FORMATY z tolerancją ±15mm (dokładne mapowanie wymiarów)
  if (Math.abs(short - 210) <= CLASSIFY_TOLERANCE_MM && Math.abs(long - 297) <= CLASSIFY_TOLERANCE_MM) result = 'A4';
  else if (Math.abs(short - 297) <= CLASSIFY_TOLERANCE_MM && Math.abs(long - 420) <= CLASSIFY_TOLERANCE_MM) result = 'A3';
  else if (Math.abs(short - 420) <= CLASSIFY_TOLERANCE_MM && Math.abs(long - 594) <= CLASSIFY_TOLERANCE_MM) result = 'A2';
  else if (Math.abs(short - 594) <= CLASSIFY_TOLERANCE_MM && Math.abs(long - 841) <= CLASSIFY_TOLERANCE_MM) result = 'A1';
  else if (Math.abs(short - 841) <= CLASSIFY_TOLERANCE_MM && Math.abs(long - 1189) <= CLASSIFY_TOLERANCE_MM) result = 'A0';
  else result = classifyA0Plus(short, long);

  console.log('✅ PRODUCTION FORMAT READY');
  console.groupEnd();
  return result;
}

function inRange(value, min, max) {
  return value >= (min - CLASSIFY_TOLERANCE_MM) && value <= (max + CLASSIFY_TOLERANCE_MM);
}

function classifyA4(long) { return long >= 280 && long <= 310 ? 'A4' : 'A4-custom'; }
function classifyA3(long) { return long >= 400 && long <= 440 ? 'A3' : 'A3-custom'; }
function classifyA2(long) { return long >= 575 && long <= 615 ? 'A2' : 'A2-custom'; }
function classifyA1(long) { return long >= 825 && long <= 860 ? 'A1' : 'A1-custom'; }
function classifyA0(long) { return long >= 1170 && long <= 1215 ? 'A0' : 'A0-custom'; }
function classifyA0Plus(short, long) {
  const shortCm = Math.round(short / 10);
  const longCm = Math.round(long / 10);
  return short > 1189 ? `A0+ (${shortCm}x${longCm}cm)` : `Custom (${shortCm}x${longCm}cm)`;
}


// ─── OBLICZENIE CENY DRUKU JEDNEGO PLIKU ───────────────────────────────────
/** Oblicz cenę druku używając dokładnie tej samej logiki co druk-cad.js. */
function obliczPlik(entry, mode) {
  const { wMm, hMm, qty } = entry;
  if (!wMm || !hMm || wMm <= 0 || hMm <= 0) return 0;

  // Use new CAD_CENNIK system with PRINT_MODE
  const result = calculateCadByDims(wMm, hMm, qty, mode || PRINT_MODE);
  return result.cena || 0;
}

// ─── SKŁADANIE ──────────────────────────────────────────────────────────────
function updateSkladanie() {
  let total = 0;
  document.querySelectorAll('.sklad-qty').forEach(input => {
    const qty  = parseInt(input.value, 10) || 0;
    const fmt  = input.dataset.format || 'nieformat';
    if (qty > 0) {
      const cena = SKLAD_CENY[fmt] !== undefined ? SKLAD_CENY[fmt] : SKLAD_CENY['nieformat'];
      total += qty * cena;
    }
  });
  return total;
}

// ─── SKANOWANIE ─────────────────────────────────────────────────────────────
function updateSkan() {
  // Prefer per-row scan inputs if present
  const scanInputs = document.querySelectorAll('.cad-scan-input');
  let totalCm = 0;
  if (scanInputs.length > 0) {
    scanInputs.forEach(input => {
      totalCm += parseFloat(input.value || 0) || 0;
    });
  } else {
    const el = document.getElementById('skanCm');
    totalCm = parseFloat(el?.value || 0) || 0;
  }
  return { total: totalCm * SCAN_PER_CM, cm: totalCm };
}

// ──────────────────────────────────────────────────────────────────────────────
// MULTI-PAGE PDF ANALYSIS + RESULTS TABLE (before init to ensure availability)
// ──────────────────────────────────────────────────────────────────────────────

const PT_TO_MM = 0.3528;
const FORMAT_TOLERANCE_RATIO = 0.05;
const STANDARD_PAGE_FORMATS = [
  { format: 'A3', short: 297, long: 420 },
  { format: 'A4', short: 210, long: 297 }
];

function ptToMm(pt) {
  return Math.round(pt * PT_TO_MM);
}

function inTolerance(value, target, toleranceRatio) {
  return Math.abs(value - target) <= target * toleranceRatio;
}

function mapStandardFormat(widthMm, heightMm) {
  const short = Math.min(widthMm, heightMm);
  const long = Math.max(widthMm, heightMm);

  for (const f of STANDARD_PAGE_FORMATS) {
    if (inTolerance(short, f.short, FORMAT_TOLERANCE_RATIO) && inTolerance(long, f.long, FORMAT_TOLERANCE_RATIO)) {
      return f.format;
    }
  }

  return null;
}

export function getPageDimensions(page) {
  const viewport = page.getViewport({ scale: 1.0 });
  const widthMm = ptToMm(viewport.width);
  const heightMm = ptToMm(viewport.height);
  const mappedFormat = mapStandardFormat(widthMm, heightMm);
  const format = mappedFormat || detectFormat(widthMm, heightMm);
  const mm = `${widthMm}x${heightMm}mm`;

  return { format, mm, widthMm, heightMm };
}

/**
 * Wait for PDF.js to load (max 5 retries)
 */
async function waitForPdfJs(retries = 5) {
  for (let i = 0; i < retries; i++) {
    if (window.pdfjsLib) return window.pdfjsLib;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  return null;
}

/**
 * Analyze single PDF file (max 5 pages), extract dimensions, calculate total price
 * @param {File} file - PDF file
 * @returns {Promise} { pages: [{page, widthMm, heightMm, format}], totalPrice }
 */
export async function analyzePdf(file) {
  const pdfjs = await waitForPdfJs();
  if (!pdfjs) {
    console.error('❌ PDF.js MISSING - check worker');
    return { pages: [], totalPrice: 0 };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    
    console.log(`🔄 Loading PDF: ${file.name} (${(arrayBuffer.byteLength / 1024).toFixed(1)} KB)...`);
    
    const loadingTask = pdfjs.getDocument({
      data: arrayBuffer,
      verbosity: 0,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
      cMapPacked: true
    });
    
    const pdf = await loadingTask.promise;
    const pages = [];
    const maxPages = Math.min(5, pdf.numPages);

    console.group('📄 PDF Analysis');
    console.log(`📋 Pages: ${pdf.numPages} (analyzing max ${maxPages})`);

    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const { format, mm, widthMm, heightMm } = getPageDimensions(page);
      const pricingInfo = calculateCadByDims(widthMm, heightMm, 1);

      console.log(`  Page ${i}: ${format} (${mm}) - ${pricingInfo.wyjasnenie}`);
      
      pages.push({
        page: i,
        widthMm,
        heightMm,
        format,
        mm,
        pricing: pricingInfo
      });
    }

    // Calculate total price
    const totalPrice = pages.reduce((sum, p) => sum + p.pricing.cena, 0);
    
    console.log(`✅ Total PDF price: ${totalPrice.toFixed(2)} zł`);
    console.groupEnd();

    return { pages, totalPrice, fileName: file.name };
  } catch (err) {
    console.error(`❌ PDF parse error (${file.name}):`, err.message || err);
    console.error('Details:', { name: err.name, message: err.message, stack: err.stack?.split('\n').slice(0, 3).join('\n') });
    return { pages: [], totalPrice: 0, fileName: file.name };
  }
}

/**
 * Calculate CAD price from format – uses new CAD cennik system
 */
export function calculateCadPrice(format, strony = 1) {
  const result = calculateCadCennik(format, BASE_LENGTHS[format], strony);
  return result.cena.toFixed(2);
}

/**
 * Calculate CAD price from dimensions – uses new CAD cennik system
 */
export function calculateCadPriceByDims(widthMm, heightMm, qty = 1) {
  const result = calculateCadByDims(widthMm, heightMm, qty, PRINT_MODE);
  return result.cena.toFixed(2);
}

export function updatePrices() {
  const totalPriceEl = document.getElementById('results-total-price');
  const totalLiveEl = document.getElementById('results-total-live');
  const sumaEl = document.querySelector('.suma');

  let total = 0;

  document.querySelectorAll('tr.data-row').forEach(row => {
    const dimsCsv = row.dataset.dims;
    const formatsCsv = row.dataset.formats;
    const format = row.dataset.format;
    const priceCell = row.querySelector('[data-price-cell]');
    const totalCell = row.querySelector('[data-total-cell]');

    let rowTotal = 0;
    let pricePerPageText = '-';

    if (dimsCsv) {
      const dims = dimsCsv.split(',').map(d => d.trim()).filter(Boolean);
      const prices = dims.map(d => {
        const [w, h] = d.split('x').map(v => parseFloat(v));
        return calculateCadPriceByDims(w, h);
      });
      pricePerPageText = prices.map(p => `${p} zł`).join(', ');
      rowTotal = prices.reduce((sum, p) => sum + parseFloat(p), 0);
    } else if (formatsCsv) {
      const formats = formatsCsv.split(',').map(f => f.trim()).filter(Boolean);
      const prices = formats.map(f => calculateCadPrice(f, 1));
      pricePerPageText = prices.map(p => `${p} zł`).join(', ');
      rowTotal = prices.reduce((sum, p) => sum + parseFloat(p), 0);
    } else if (format) {
      const price = calculateCadPrice(format, 1);
      pricePerPageText = `${price} zł`;
      rowTotal = parseFloat(price);
    }

    if (priceCell) priceCell.textContent = pricePerPageText;
    if (totalCell) totalCell.innerHTML = `<strong>${rowTotal.toFixed(2)} zł</strong>`;
    total += rowTotal;
  });

  const totalText = `${total.toFixed(2)} zł`;
  if (totalPriceEl) totalPriceEl.textContent = totalText;
  if (totalLiveEl) totalLiveEl.textContent = `Suma całkowita: ${totalText}`;
  if (sumaEl && sumaEl !== totalLiveEl) sumaEl.textContent = totalText;
}

export function exportCSV() {
  let csv = 'Plik,Rozmiar mm,Tryb,Cena zł\n';
  const modeEl = document.getElementById('printMode');
  const mode = modeEl ? modeEl.value : 'color';

  document.querySelectorAll('tr.data-row').forEach(row => {
    const file = row.dataset.file || '';
    const size = row.dataset.size || '';
    const totalCell = row.querySelector('[data-total-cell]');
    const price = totalCell ? totalCell.textContent.replace(' zł', '') : '';
    csv += `${file},${size},${mode},${price}\n`;
  });

  download(csv, 'kalkulacja-druk.csv');
}

function download(content, filename) {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Analyze all dropped files (JPG/PNG + PDF multi-page)
 * @param {File[]} fileEntries - dropped files
 * @returns {Promise} { total, details: [{file, type, format/pages, price}], count }
 */
export async function analyzeAllFiles(fileEntries) {
  console.log('🔄 Analyzing all files...');
  
  let total = 0;
  const details = [];
  let fileIdx = 1;

  for (const file of fileEntries) {
    const fileName = file.name.toLowerCase();
    console.log(`  📄 Processing: ${file.name} (${fileName})`);
    
    if (fileName.endsWith('.pdf')) {
      // Analyze PDF multi-page
      const pdfData = await analyzePdf(file);
      if (pdfData.pages.length > 0) {
        total += pdfData.totalPrice;
        const pagesInfo = pdfData.pages.map(p => `${p.format}`).join(', ');
        const pagesSizes = pdfData.pages.map(p => p.mm).join(', ');
        const pagesDimsCsv = pdfData.pages.map(p => `${p.widthMm}x${p.heightMm}`).join(', ');
        const pricingExplain = pdfData.pages.map(p => p.pricing.wyjasnenie).join(', ');
        details.push({
          idx: fileIdx++,
          file: file.name,
          type: 'PDF',
          pagesCount: pdfData.pages.length,
          pagesFormats: pagesInfo,
          dimensions: pagesSizes,
          dimsCsv: pagesDimsCsv,
          formatsCsv: pdfData.pages.map(p => p.format).join(', '),
          pricePerPage: pricingExplain,
          price: pdfData.totalPrice,
          pricing: pdfData.pages[0].pricing  // Store first page pricing info
        });
        console.log(`  ✅ PDF: ${pdfData.totalPrice.toFixed(2)} zł (${pdfData.pages.length} pages), DETAILS PUSHED`);
      } else {
        console.warn(`  ⚠️ PDF has no pages: ${file.name}`);
      }
    } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png')) {
      // Single image file
      try {
        const dims = await detectImageDimensions(file);
        const format = detectFormat(dims.widthMm, dims.heightMm);
        const pricing = calculateCadByDims(dims.widthMm, dims.heightMm, 1);
        const price = pricing.cena;
        total += price;
        details.push({
          idx: fileIdx++,
          file: file.name,
          type: 'Image',
          format: format,
          dimensions: `${dims.widthMm}x${dims.heightMm}mm`,
          dimsCsv: `${dims.widthMm}x${dims.heightMm}`,
          pricePerPage: pricing.wyjasnenie,
          price: price,
          pricing: pricing
        });
        console.log(`  ✅ Image: ${price.toFixed(2)} zł (${format}), DETAILS PUSHED`);
      } catch (err) {
        console.warn(`  ⚠️ Could not read image: ${file.name}`, err);
      }
    } else {
      console.warn(`  ⚠️ Unsupported file type: ${file.name}`);
    }
  }

  console.log(`✅ Total: ${total.toFixed(2)} zł (${details.length} files)`);
  console.log('📋 FINAL DETAILS:', details);
  return { total, details, count: details.length };
}

/**
 * Detect image dimensions from blob
 * @param {File} file - Image file
 * @returns {Promise} { widthMm, heightMm }
 */
export async function detectImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // 300 DPI: px / 300 [inch] × 25.4 [mm/inch]
        const widthMm = Math.round((img.naturalWidth / 300) * 25.4);
        const heightMm = Math.round((img.naturalHeight / 300) * 25.4);
        resolve({ widthMm, heightMm });
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Render results table with file analysis
 * @param {Array} details - array of {file, type, format/pages, price}
 * @param {number} total - total price
 */
export function renderResultsTable(details, total) {
  const container = document.getElementById('results-container');
  const tbody = document.getElementById('results-body');
  const totalPriceEl = document.getElementById('results-total-price');
  const totalLiveEl = document.getElementById('results-total-live');

  if (!container || !tbody || !totalPriceEl) {
    console.warn('⚠️ Results table elements not found');
    return;
  }

  console.log(`🎨 RENDER TABLE: ${details.length} entries (CUMULATIVE), total ${total.toFixed(2)}`);
  console.log('📋 Details:', details);

  if (details.length === 0) {
    container.style.display = 'none';
    console.warn('⚠️ No details to render, hiding table');
    return;
  }

  // Render table rows – WSZYSTKIE elementy z array
  tbody.innerHTML = details.map((d, idx) => {
    const formatOrPages = d.type === 'PDF'
      ? `${d.pagesCount} str. (${d.pagesFormats})`
      : d.format;
    const pricePerPage = d.pricePerPage || '-';
    
    console.log(`  📝 Row ${idx}: ${d.file} | ${formatOrPages} | ${d.dimensions} | ${pricePerPage}`);
    
    return `
      <tr class="data-row" data-format="${escHtml(d.format || '')}" data-formats="${escHtml(d.formatsCsv || '')}" data-dims="${escHtml(d.dimsCsv || '')}" data-file="${escHtml(d.file)}" data-size="${escHtml(d.dimensions || '')}">
        <td><strong>${escHtml(d.file)}</strong></td>
        <td>${d.type}</td>
        <td>${formatOrPages}</td>
        <td>${d.dimensions || '-'}</td>
        <td data-price-cell>${pricePerPage}</td>
        <td data-total-cell style="text-align:right;"><strong>${fmtPLN(d.price)}</strong></td>
      </tr>
    `;
  }).join('');

  // Update total
  totalPriceEl.textContent = fmtPLN(total);
  if (totalLiveEl) {
    totalLiveEl.textContent = `Suma całkowita: ${fmtPLN(total)}`;
  }
  container.style.display = '';

  updatePrices();

  console.log(`✅ Results table rendered: ${details.length} ALL entries, total ${fmtPLN(total)}`);
}

// ─── MODULE-LEVEL DOM REFS (accessible to nested functions) ──────────────────
let modeEl = null;
let optZapEl = null;
let optPowEl = null;
let optEmailEl = null;
let tableBody = null;
let grandTotalEl = null;
let fileCountEl = null;

// ─── INIT ────────────────────────────────────────────────────────────────────
export function init() {
  const dropZone    = document.getElementById('cadDropZone');
  if (!dropZone) return;

  const fileInput   = document.getElementById('cadFileInput');
  const fileListEl  = document.getElementById('cadFileList');
  const summaryEl   = document.getElementById('cadSummary');
  fileCountEl = document.getElementById('cadFileCount');
  const totalEl     = document.getElementById('cadTotal');
  const warningEl   = document.getElementById('cadWarning');
  const ekranObliczen = document.getElementById('ekranObliczen');
  modeEl      = document.getElementById('cadMode');
  const printModeEl = document.getElementById('printMode');
  const vatToggleEl = document.getElementById('vatToggle');

  // ✅ ENABLE printMode – use full CAD system with COLOR/BW selection!
  if (printModeEl) {
    printModeEl.style.display = '';  // SHOW (was hidden)
    printModeEl.addEventListener('change', (e) => {
      const newMode = e.target.value || 'bw';
      setPrintMode(newMode);
      console.log(`🎨 Zmiana trybu druku na: ${newMode}`);
      renderFileList();   // ✅ Odśwież listę plików z nowymi cenami
        recalculateAllResults();  // ✅ Przelicz tabelę wyników (dolna tabela)
      recalculateAll();   // Przelicz tabelę podsumowania
    });
    // Inicjalizuj z aktualnym PRINT_MODE
    printModeEl.value = PRINT_MODE;
    console.log(`✅ Print mode selector enabled: ${PRINT_MODE}`);
  }
  
  // HIDE vatToggle – not needed anymore
  if (vatToggleEl) {
    const label = vatToggleEl.closest('label');
    if (label) label.style.display = 'none';
  }
  
  optZapEl    = document.getElementById('optZapelnienie');
  optPowEl    = document.getElementById('optPowieksz');
  optEmailEl  = document.getElementById('optEmail');
  
  // ✅ DOM elements for the old cad table system
  tableBody = document.querySelector('#resultsTable tbody') || document.getElementById('results-body');
  grandTotalEl = document.getElementById('results-total-live');

  let files = []; // [{ id, name, sizeMB, qty, wMm, hMm, skladanieQty, blob }]

  // ── Drop zone ──────────────────────────────────────────────────────────────
  dropZone.addEventListener('click', () => fileInput.click());
  dropZone.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') fileInput.click();
  });
  dropZone.addEventListener('dragenter', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragover',  e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', e => {
    if (!dropZone.contains(e.relatedTarget)) dropZone.classList.remove('drag-over');
  });
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    addFiles(e.dataTransfer.files);
    // NEW: Analyze files for results table
    analyzeAndRenderResults(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', e => {
    addFiles(e.target.files);
    // NEW: Analyze files for results table
    analyzeAndRenderResults(e.target.files);
    fileInput.value = '';
  });

  document.getElementById('clearBtn')?.addEventListener('click', () => {
    files = [];
    renderFileList();
    
    // RESET: Wyczyść również globalny array wyników
    wszystkieWyniki = [];
    console.log('🗑️ Wszystkie wyniki wyczyszczone, OBIE tabele cleared');
    
    const container = document.getElementById('results-container');
    if (container) container.style.display = 'none';
    
    // ✅ Wyczyść ekran obliczeń
    if (ekranObliczen) {
      ekranObliczen.style.display = 'none';
    }
  });

  // ── Global options triggers (.cad-options) ──────────────────────────────────
  const debouncedRecalc = debounce(recalculateAll, 200);
  [modeEl, optZapEl, optPowEl, optEmailEl].forEach(el => el?.addEventListener('change', debouncedRecalc));
  document.getElementById('skanCm')?.addEventListener('input', debouncedRecalc);
  
  // NO mode/VAT listeners for results table (direct CAD pricing)

  // ── File list event delegation ──────────────────────────────────────────────
  if (fileListEl) {
    fileListEl.addEventListener('click', e => {
      const delBtn = e.target.closest('[data-delete]');
      if (delBtn) { deleteFile(delBtn.dataset.delete); return; }
    });

    fileListEl.addEventListener('input', e => {
      const el = e.target;
      const byId = id => files.find(f => String(f.id) === id);

      // Bulk inputs
      if (el.id === 'cadBulkQty') {
        const v = parseInt(el.value, 10);
        if (!isNaN(v) && v > 0) files.forEach(f => { f.qty = Math.min(999, v); });
        renderFileList();
        debouncedRecalc();
        return;
      }
      if (el.id === 'cadBulkSklad') {
        const v = parseInt(el.value, 10);
        if (!isNaN(v) && v >= 0) files.forEach(f => { f.skladanieQty = Math.min(999, v); });
        renderFileList();
        debouncedRecalc();
        return;
      }
      if (el.id === 'cadBulkScan') {
        const v = parseFloat(el.value);
        if (!isNaN(v) && v >= 0) files.forEach(f => { f.scanCm = Math.min(9999, v); });
        renderFileList();
        debouncedRecalc();
        return;
      }

      // Per-row inputs
      if (el.classList.contains('cad-qty-input') && el.dataset.qtyid) {
        const entry = byId(el.dataset.qtyid);
        if (!entry) return;
        const v = parseInt(el.value, 10);
        if (isNaN(v) || v < 1) { el.value = entry.qty; return; }
        entry.qty = Math.min(999, v);
        renderFileList();
      } else if (el.classList.contains('sklad-qty')) {
        const entry = byId(el.dataset.skladid);
        if (entry) entry.skladanieQty = Math.max(0, parseInt(el.value, 10) || 0);
      } else if (el.classList.contains('cad-scan-input')) {
        const entry = byId(el.dataset.scanid);
        if (entry) entry.scanCm = Math.max(0, parseFloat(el.value) || 0);
      }
      debouncedRecalc();
    });
  }

  // Aktualizuj data-format na sklad-qty po zmianie wymiarów
  function updateSkladFormat(entry) {
    const fmt = (entry.wMm > 0 && entry.hMm > 0) ? detectFormat(entry.wMm, entry.hMm) : '';
    const skladFmt = (!fmt || fmt === 'nieformatowy') ? 'nieformat' : fmt;
    const skladEl = fileListEl?.querySelector(`.sklad-qty[data-skladid="${entry.id}"]`);
    if (skladEl) {
      skladEl.dataset.format = skladFmt;
      // Odśwież badge formatu
      const badge = fileListEl?.querySelector(`.cad-format-badge[data-badgeid="${entry.id}"]`);
      if (badge) badge.textContent = fmt || '';
    }
  }

  // ── File management ──────────────────────────────────────────────────────────
  function addFiles(fileList) {
    for (const f of fileList) {
      const entry = {
        id: _nextId++,
        name: f.name,
        sizeMB: (f.size / (1024 * 1024)).toFixed(2),
        qty: 1,
        wMm: 0,
        hMm: 0,
        typeLabel: f.type?.includes('pdf') || f.name.toLowerCase().endsWith('.pdf') ? 'PDF' : (f.type?.startsWith('image/') ? 'Image' : 'File'),
        formatLabel: '—',
        dimensionsLabel: '—',
        pricePerPageLabel: '—',
        pagesCount: 0,
        scanCm: 0,
        skladanieQty: 0,
        blob: f,
      };
      files.push(entry);
      if (f.type.startsWith('image/')) autoDetectDims(entry);
    }
    if (warningEl) warningEl.style.display = files.length > MAX_FILES_SOFT ? '' : 'none';
    renderFileList();
  }

  function deleteFile(id) {
    files = files.filter(f => String(f.id) !== String(id));
    if (warningEl) warningEl.style.display = files.length > MAX_FILES_SOFT ? '' : 'none';
    renderFileList();
  }

  async function autoDetectDims(entry) {
    if (!entry.blob?.type?.startsWith('image/')) return;
    try {
      const { wMm, hMm } = await new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(entry.blob);
        img.onload  = () => {
          URL.revokeObjectURL(url);
          // Zakładamy 300 DPI: px / 300 [inch] × 25,4 [mm/inch] = mm
          resolve({
            wMm: Math.round(img.naturalWidth  / 300 * 25.4),
            hMm: Math.round(img.naturalHeight / 300 * 25.4),
          });
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(); };
        img.src = url;
      });
      entry.wMm = wMm;
      entry.hMm = hMm;
      updateSkladFormat(entry);
      recalculateAll();
    } catch (err) { console.warn('Nie udało się wykryć wymiarów obrazu:', err); }
  }

  // ── Rendering ──────────────────────────────────────────────────────────────
  function renderFileList() {
    if (!fileListEl) return;
    if (files.length === 0) {
      fileListEl.innerHTML = '';
      if (summaryEl)     summaryEl.style.display  = 'none';
      dispatchPrice(0);
      return;
    }
    if (summaryEl) summaryEl.style.display = '';

    const totalSizeMb = files.reduce((sum, f) => sum + parseFloat(f.sizeMB || 0), 0);

    fileListEl.innerHTML = `
      <table class="cad-file-table">
        <thead>
          <tr>
            <th></th>
            <th>Plik</th>
            <th>MB</th>
            <th>Typ</th>
            <th>Format / Strony</th>
            <th>Rozmiar</th>
            <th>Cena/str.</th>
            <th>Kopie</th>
            <th>Składanie</th>
            <th>Skan (cm)</th>
            <th>Razem</th>
          </tr>
          <tr>
            <th></th>
            <th colspan="6" style="font-weight:500;color:var(--text-secondary)">Ustawienia zbiorcze</th>
            <th><input type="number" class="cad-table-input" id="cadBulkQty" min="1" max="999" placeholder="1" /></th>
            <th><input type="number" class="cad-table-input" id="cadBulkSklad" min="0" max="999" placeholder="0" /></th>
            <th><input type="number" class="cad-table-input" id="cadBulkScan" min="0" max="9999" placeholder="0" /></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${files.map(f => {
            const fmt      = (f.wMm > 0 && f.hMm > 0) ? detectFormat(f.wMm, f.hMm) : '';
            const skladFmt = (!fmt || fmt === 'nieformatowy') ? 'nieformat' : fmt;
            const dimsLabel = (f.wMm > 0 && f.hMm > 0)
              ? `${f.wMm}×${f.hMm} mm`
              : (f.blob?.type?.startsWith('image/') ? '⏳ wykrywanie…' : (f.dimensionsLabel || '—'));
            const drukPrice = obliczPlik(f, PRINT_MODE);
            const skladUnit = SKLAD_CENY[skladFmt] !== undefined ? SKLAD_CENY[skladFmt] : SKLAD_CENY['nieformat'];
            const skladPrice = (f.skladanieQty || 0) * skladUnit;
            const scanPrice = (f.scanCm || 0) * SCAN_PER_CM;
            const rowTotal = drukPrice + skladPrice + scanPrice;
            const rowTotalLabel = rowTotal > 0 ? fmtPLN(rowTotal) : '—';
            return `
              <tr class="cad-file-row" data-fileid="${f.id}">
                <td>
                  <button class="cad-delete-x" data-delete="${f.id}" aria-label="Usuń ${escHtml(f.name)}" title="Usuń plik">✕</button>
                </td>
                <td title="${escHtml(f.name)}">${escHtml(f.name)}</td>
                <td>${f.sizeMB} MB</td>
                <td>${escHtml(f.typeLabel || '—')}</td>
                <td>${escHtml(f.formatLabel || fmt || '—')}</td>
                <td>${escHtml(dimsLabel)}</td>
                <td>${escHtml(f.pricePerPageLabel || '—')}</td>
                <td>
                  <input type="number" class="cad-qty-input cad-table-input" data-qtyid="${f.id}" value="${f.qty}" min="1" max="999" />
                </td>
                <td>
                  <input type="number" class="sklad-qty cad-table-input" data-skladid="${f.id}" data-format="${escHtml(skladFmt)}"
                         value="${f.skladanieQty}" min="0" max="999" />
                </td>
                <td>
                  <input type="number" class="cad-scan-input cad-table-input" data-scanid="${f.id}" value="${f.scanCm || 0}" min="0" max="9999" />
                </td>
                <td><strong>${rowTotalLabel}</strong></td>
              </tr>
            `;
          }).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2"><strong>Podsumowanie</strong></td>
            <td colspan="2">${totalSizeMb.toFixed(2)} MB</td>
            <td colspan="6" style="text-align:right;"><strong>Razem:</strong></td>
            <td><strong>${fmtPLN(files.reduce((s, f) => {
              const fmt = (f.wMm > 0 && f.hMm > 0) ? detectFormat(f.wMm, f.hMm) : '';
              const skladFmt = (!fmt || fmt === 'nieformatowy') ? 'nieformat' : fmt;
              const skladUnit = SKLAD_CENY[skladFmt] !== undefined ? SKLAD_CENY[skladFmt] : SKLAD_CENY['nieformat'];
              const skladPrice = (f.skladanieQty || 0) * skladUnit;
              const scanPrice = (f.scanCm || 0) * SCAN_PER_CM;
              return s + obliczPlik(f, PRINT_MODE) + skladPrice + scanPrice;
            }, 0))}</strong></td>
          </tr>
        </tfoot>
      </table>
    `;

    recalculateAll();
  }

  // ── Główna kalkulacja ─────────────────────────────────────────────────────
  /**
   * ✅ Przelicz wszystkie wyniki z nowym trybem druku (kolor/B&W)
   * Używane przy zmianie trybu printMode
   */
  function recalculateAllResults() {
      if (wszystkieWyniki.length === 0) return;
    
      console.log(`🔄 Recalculating ${wszystkieWyniki.length} results with mode: ${PRINT_MODE}`);
    
      // Przelicz każdy wynik z nowym trybem
      wszystkieWyniki = wszystkieWyniki.map(w => {
        // Pobierz wymiary z dimsCsv (format: "297x420")
        if (w.dimsCsv && w.dimsCsv.includes('x')) {
          const dims = w.dimsCsv.split(',')[0].trim().split('x');
          const widthMm = parseFloat(dims[0]);
          const heightMm = parseFloat(dims[1]);
        
          if (widthMm > 0 && heightMm > 0) {
            const pricing = calculateCadByDims(widthMm, heightMm, 1, PRINT_MODE);
            return {
              ...w,
              price: pricing.cena,
              pricePerPage: pricing.wyjasnenie,
              pricing: pricing
            };
          }
        }
        return w;
      });
    
      // Renderuj WSZYSTKIE tabele z nowymi cenami
      const totalAll = wszystkieWyniki.reduce((sum, d) => sum + d.price, 0);
      renderResultsTable(wszystkieWyniki, totalAll);
      renderObliczen(wszystkieWyniki);
    
      console.log(`✅ Recalculated: total ${totalAll.toFixed(2)}zł`);
    }
  
    /**
  
  /**
   * NEW: Analyze dropped files and render results table (CUMULATIVE)
   * Handles PDF multi-page + single images
   * IMPORTANT: KUMULUJE do wszystkieWyniki (nie nadpisuje!)
   * SYNC: Renderuje OBIE tabele (górna + dolna)
   */
  async function analyzeAndRenderResults(fileList) {
    if (!fileList || fileList.length === 0) {
      console.warn('⚠️ Empty file list');
      return;
    }
    
    console.log(`🔄 Analyzing ${fileList.length} dropped files for results table...`);
    console.log(`📦 BEFORE: wszystkieWyniki.length = ${wszystkieWyniki.length}`);
    
    try {
      const result = await analyzeAllFiles(Array.from(fileList));
      console.log(`📊 Analysis complete: ${result.details.length} new items`);

      // ✅ Uzupełnij dane w liście plików (format, wymiary, cena/strona)
      result.details.forEach(d => {
        const entry = files.find(f => f.name === d.file);
        if (!entry) return;

        entry.typeLabel = d.type || entry.typeLabel;
        entry.formatLabel = d.type === 'PDF'
          ? `${d.pagesCount || 0} str. (${d.pagesFormats || ''})`
          : (d.format || '—');
        entry.dimensionsLabel = d.dimensions || '—';
        entry.pricePerPageLabel = d.pricePerPage || '—';
        entry.pagesCount = d.pagesCount || 0;

        // Zaktualizuj wymiary z dimsCsv (pierwsza strona)
        if (d.dimsCsv && d.dimsCsv.includes('x')) {
          const dims = d.dimsCsv.split(',')[0].trim().split('x');
          const widthMm = parseFloat(dims[0]);
          const heightMm = parseFloat(dims[1]);
          if (widthMm > 0 && heightMm > 0) {
            entry.wMm = widthMm;
            entry.hMm = heightMm;
          }
        }
      });
      
      // KUMULUJ: PUSH do globalnego array zamiast nadpisywać!
      wszystkieWyniki = wszystkieWyniki.concat(result.details);
      console.log(`📦 AFTER: wszystkieWyniki.length = ${wszystkieWyniki.length}`);
      console.log(`📋 ALL RESULTS SO FAR:`, wszystkieWyniki);
      
      // Renderuj WSZYSTKIE wyniki (nie tylko nowe!)
      const totalAll = wszystkieWyniki.reduce((sum, d) => sum + d.price, 0);
      renderResultsTable(wszystkieWyniki, totalAll);
      
      // ✅ Renderuj ekran obliczeń!
      console.log('📊 Rendering calculation screen...');
      renderObliczen(wszystkieWyniki);
    } catch (err) {
      console.error('❌ Failed to analyze files:', err);
    }
  }

  /**
   * ✅ RENDER CALCULATION EXPLANATION SCREEN
   * Shows how each price is calculated (formatowe vs nieformatowy/metrowy)
   * Displayed next to main table using CSS Grid
   * @param {Array} wyniki - calculation results from wszystkieWyniki
   */
  function renderObliczen(wyniki) {
    if (!ekranObliczen) return;
    
    const lista = document.getElementById('obliczeniaLista');
    if (!lista) {
      console.warn('⚠️ obliczeniaLista not found');
      return;
    }

    if (!wyniki || wyniki.length === 0) {
      lista.innerHTML = '<div style="color:#999;">Brak danych</div>';
      console.log('📊 No results to display');
      return;
    }

    console.log(`📊 Rendering ${wyniki.length} calculations explanation`);

    // Render each calculation with detailed explanation
    let html = wyniki.map((w, idx) => {
      const cenaCalkkowita = fmtPLN(w.price);
      
      // Use detailed pricing explanation
      const obliczenie = w.pricePerPage || 'Brak wyceny';
      
      // Extract pricing type (formatowe vs nieformatowe)
      const isPricing = w.pricing || {};
      const typ = isPricing.typ || 'unknown';
      const icon = typ === 'formatowe' ? '📋' : typ === 'nieformatowe' ? '📐' : '❓';

      console.log(`  📝 Calc ${idx + 1}: ${w.file} [${typ}] → ${obliczenie} = ${cenaCalkkowita}`);

      return `
        <div class="obliczenie-item">
          <strong>${icon} ${escHtml(w.file)}</strong>
          <div class="obliczenie-text">${escHtml(obliczenie)}</div>
          <div class="obliczenie-cena">${cenaCalkkowita}</div>
        </div>
      `;
    }).join('');

    // Add total summary
    const suma = wyniki.reduce((s, w) => s + (w.price || 0), 0);
    html += `
      <div style="margin-top:12px; padding-top:12px; border-top:2px solid #d0e8ff;">
        <div style="font-size:14px; color:#28a745; font-weight:bold; text-align:right;">
          💰 Razem: ${fmtPLN(suma)}
        </div>
      </div>
    `;

    lista.innerHTML = html;
    console.log(`✅ Explanations rendered: ${wyniki.length} items, total: ${fmtPLN(suma)}`);
  }

  function recalculateAll() {
    try {
      // ✅ Safe DOM access with fallbacks
      const safeTableBody = tableBody || document.querySelector('#results-body') || document.querySelector('#resultsTable tbody');
      const safeModeEl = modeEl || document.getElementById('printMode') || document.getElementById('cadMode');
      const safeZapEl = optZapEl || document.getElementById('optZapelnienie');
      const safePowEl = optPowEl || document.getElementById('optPowieksz');
      const safeEmailEl = optEmailEl || document.getElementById('optEmail');
      const safeGrandTotalEl = grandTotalEl || document.getElementById('results-total-live') || document.getElementById('grandTotal');
      
      const mode = safeModeEl?.value || 'color';
      let multiplier = 1;
      if (safeZapEl?.checked)  multiplier += 0.5;
      if (safePowEl?.checked)  multiplier += 0.5;
      const emailAddon = safeEmailEl?.checked ? 1 : 0;

      const skanInfo   = updateSkan();
      const skanTotal  = skanInfo.total;
      const skanCmTotal = skanInfo.cm;
      const skladTotal = updateSkladanie();

      const rows = files.map(f => {
        const drukCena = obliczPlik(f, mode) * multiplier;
        const fmt      = (f.wMm > 0 && f.hMm > 0) ? detectFormat(f.wMm, f.hMm) : '';
        const rozmiar  = fmt ? `${fmt} (${f.wMm}×${f.hMm} mm)` : '—';
        return { name: f.name, rozmiar, drukCena };
      });

      const drukTotal  = rows.reduce((s, r) => s + r.drukCena, 0);
      const grandTotal = drukTotal + skladTotal + skanTotal + emailAddon;

      // Render tabeli podsumowania
      if (safeTableBody) {
        if (rows.length === 0) {
          safeTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-secondary)">Brak plików</td></tr>';
        } else {
          let html = rows.map(r => `
            <tr>
              <td>${escHtml(r.name)}<br><small style="color:var(--text-secondary)">${r.rozmiar}</small></td>
              <td>${r.drukCena > 0 ? fmtPLN(r.drukCena) : '—'}</td>
              <td>—</td>
              <td>—</td>
              <td><strong>${r.drukCena > 0 ? fmtPLN(r.drukCena) : '—'}</strong></td>
            </tr>
          `).join('');
          if (skladTotal > 0) {
            html += `<tr><td>📐 Składanie</td><td>—</td><td>${fmtPLN(skladTotal)}</td><td>—</td><td>${fmtPLN(skladTotal)}</td></tr>`;
          }
          if (skanTotal > 0) {
            html += `<tr><td>🖨 Skan (${skanCmTotal} cm)</td><td>—</td><td>—</td><td>${fmtPLN(skanTotal)}</td><td>${fmtPLN(skanTotal)}</td></tr>`;
          }
          if (emailAddon > 0) {
            html += `<tr><td>📧 Email</td><td>—</td><td>—</td><td>—</td><td>1,00 zł</td></tr>`;
          }
          safeTableBody.innerHTML = html;
        }
      }

      if (safeGrandTotalEl) safeGrandTotalEl.textContent = fmtPLN(grandTotal);
      if (fileCountEl)  fileCountEl.textContent   = files.length;

      dispatchPrice(grandTotal);
      console.log(`✅ recalculateAll: ${files.length} files, total ${grandTotal.toFixed(2)}zł`);
    } catch (error) {
      console.error('❌ recalculateAll error:', error);
    }
  }

  // ── Dispatch price do globalnego systemu ──────────────────────────────────
  function dispatchPrice(total) {
    const n = files.length;
    if (n === 0) {
      window.dispatchEvent(new CustomEvent('priceRemove', { detail: { id: 'cad-upload' } }));
    } else {
      window.dispatchEvent(new CustomEvent('priceUpdate', {
        detail: {
          id:    'cad-upload',
          price: total,
          name:  `${n} plik${n === 1 ? '' : n < 5 ? 'i' : 'ów'}`,
          cat:   'CAD Upload',
        },
      }));
    }
  }
}

window.updatePrices = updatePrices;
window.exportCSV = exportCSV;
window.setPrintMode = setPrintMode;  // ✅ Export global mode setter

export function destroy() { /* no global listeners to remove */ }

// ──────────────────────────────────────────────────────────────────────────────
// INITIALIZATION
// ──────────────────────────────────────────────────────────────────────────────

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('📝 CAD Upload: DOMContentLoaded');
    init();
  });
} else {
  console.log('📝 CAD Upload: DOM already loaded');
  init();
}
