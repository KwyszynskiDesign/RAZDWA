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
function calculateCadCennik(format, dlugosc_mm, strony = 1, mode = 'bw') {
  if (!format || !CAD_CENNIK.formatowe.kolor[format]) {
    console.warn(`⚠️ Nieznany format: ${format}`);
    return { cena: 0, typ: 'unknown', wyjasnenie: 'Nieznany format', format, dlugosc_mm, strony };
  }

  // Normalizuj mode
  if (mode !== 'bw' && mode !== 'color') {
    console.warn(`⚠️ Nieznany tryb: ${mode}, używam BW`);
    mode = 'bw';
  }

  // Wybierz tryb druku (KOLOR lub B/W)
  const modeKey = mode === 'color' ? 'kolor' : 'bw';
  const baseLength = CAD_CENNIK.baseLengthMm[format];
  const isFormatowy = Math.abs(dlugosc_mm - baseLength) <= TOLERANCE_MM;

  let cena, wyjasnenie;

  if (isFormatowy) {
    // FORMATOWE: cena stała za arkusz
    const cenaNetto = CAD_CENNIK.formatowe[modeKey][format];
    cena = cenaNetto * strony;
    const modeLabel = mode === 'color' ? 'kolor' : 'cz-b';
    wyjasnenie = `Formatowe ${format} ${modeLabel} = ${cenaNetto}zł × ${strony}str`;
    console.log(`💲 FORMATOWE: ${format} (${dlugosc_mm}mm ≈ ${baseLength}mm base) ${modeLabel} × ${strony}str = ${cena.toFixed(2)}zł`);
  } else {
    // NIEFORMATOWE: cena za metr bieżący
    // Znajdź szerokość rolki dla tego formatu
    let rollWidth = format; // Domyślnie użyj klucza formatu
    
    // Sprawdź czy to rolka 1067
    const szerokosc = WIDTHS[format];
    if (szerokosc >= 1000) {
      rollWidth = '1067'; // Użyj klucza dla rolki 1067
    }
    
    const cenaMb = CAD_CENNIK.nieformatowe_mb[modeKey][rollWidth];
    if (!cenaMb) {
      console.warn(`⚠️ Brak ceny mb dla ${rollWidth} w trybie ${modeKey}`);
      return { cena: 0, typ: 'error', wyjasnenie: `Brak ceny dla ${format}`, format, dlugosc_mm, strony };
    }
    
    const metryBiezace = dlugosc_mm / 1000;
    cena = parseFloat((cenaMb * metryBiezace * strony).toFixed(2));
    const modeLabel = mode === 'color' ? 'kolor' : 'cz-b';
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
 * @param {string} mode - tryb ('bw' lub 'color')
 * @returns {string} - cena formatowana (zł)
 */
function calculateCadFull(format, strony = 1, mode = 'bw') {
  // Use new cennik system
  const result = calculateCadCennik(format, BASE_LENGTHS[format], strony, mode);
  return result.cena.toFixed(2);
}

/**
 * Oblicz cenę CAD z wymiarów – używa nowego systemu cennikowego
 * LOGIKA: Jeden bok = szerokość (identyfikuje format), drugi bok = długość do obliczenia
 * KLASYFIKACJA: Zaciąg do najmniejszej wystarczającej rolki na podstawie szerokości
 * @param {number} widthMm - szerokość (mm)
 * @param {number} heightMm - wysokość (mm)
 * @param {number} qty - ilość stron/arkuszy
 * @param {string} mode - tryb ('bw' lub 'color')
 * @returns {object} - { cena, typ, wyjasnenie }
 */
function calculateCadByDims(widthMm, heightMm, qty = 1, mode = 'bw') {
  if (!widthMm || !heightMm || widthMm <= 0 || heightMm <= 0) {
    return { cena: 0, typ: 'error', wyjasnenie: 'Błędne wymiary' };
  }
  
  const TOLERANCE = 15;
  const standardWidths = [297, 420, 594, 841, 914, 1067];
  const formatMap = { 297: 'A3', 420: 'A2', 594: 'A1', 841: 'A0', 914: 'A0+', 1067: 'A0+' }; // 1067 też A0+ ale inna cena
  
  // Znajdź który bok jest szerokością, która identyfikuje format
  let workingWidth = null;
  let workingLength = null;
  
  // ─── KROK 1: Spróbuj dokładne dopasowanie (+/- tolerancja) ─────────────────
  for (let std of standardWidths) {
    if (Math.abs(widthMm - std) <= TOLERANCE) {
      workingWidth = std;
      workingLength = heightMm;
      break;
    }
    if (Math.abs(heightMm - std) <= TOLERANCE) {
      workingWidth = std;
      workingLength = widthMm;
      break;
    }
  }
  
  // ─── KROK 2: Jeśli nie ma dokładnego dopasowania, zaciągnij do najmniejszej wystarczającej rolki ────
  if (!workingWidth) {
    // Weź mniejszy bok (to będzie szerokość papieru)
    const candidateWidth = Math.min(widthMm, heightMm);
    const candidateLength = Math.max(widthMm, heightMm);
    
    // Znajdź najmniejszą rolkę, która zmieści tę szerokość
    for (let std of standardWidths) {
      if (candidateWidth <= std) {
        workingWidth = std;
        workingLength = candidateLength;
        break;
      }
    }
    
    if (!workingWidth) {
      console.warn(`📐 Format zbyt szeroki: ${widthMm}×${heightMm}mm (maksymalnie 1067mm)`);
      return { cena: 0, typ: 'error', wyjasnenie: 'Wymiar zbyt szeroki dla dostępnych rolek' };
    }
  }
  
  // Określ format
  const format = formatMap[workingWidth] || 'A0+';
  
  console.log(`📐 WYMIARY IDENTYFIKACJA: ${widthMm}×${heightMm}mm → Wybranie rolki: ${workingWidth}mm (${format}), długość: ${workingLength}mm`);
  
  // Oblicz cenę z użyciem wybranej szerokości i długości
  const result = calculateCadCennik(format, workingLength, qty, mode);
  
  // Dodaj informację diagnostyczną
  result.dimensions = { widthMm, heightMm, workingWidth, workingLength, format };
  
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

// ── SKANOWANIE ────────────────────────────────────────────────────────────────
function updateSkan() {
  // Use per-file scanCm values from files array
  let totalCm = 0;
  let scanExplanations = [];
  files.forEach(f => {
    if (f.scanCm > 0) {
      totalCm += f.scanCm;
      if (f.scanExpl) scanExplanations.push(f.scanExpl);
    }
  });
  lastScanExpl = scanExplanations;
  return { 
    total: totalCm * SCAN_PER_CM, 
    cm: totalCm,
    explanations: scanExplanations
  };
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

function isPdfFile(file) {
  const name = String(file?.name || '').toLowerCase();
  const type = String(file?.type || '').toLowerCase();
  return name.endsWith('.pdf') || type === 'application/pdf';
}

function isImageFile(file) {
  const name = String(file?.name || '').toLowerCase();
  const type = String(file?.type || '').toLowerCase();
  // Obsługiwane: JPG, PNG, TIFF (rozszerzenie lub MIME type image/*)
  const supportedExt = /\.(jpg|jpeg|png|tiff|tif)$/i.test(name);
  const supportedMime = type.startsWith('image/') && !/\.(webp|bmp|gif|svg)$/i.test(name);
  return supportedExt || supportedMime;
}

function showUploadStatus(message, type = 'warn') {
  const statusEl = document.getElementById('cadUploadStatus');
  if (!statusEl) return;

  if (!message) {
    statusEl.style.display = 'none';
    statusEl.textContent = '';
    return;
  }

  statusEl.style.display = '';
  statusEl.textContent = message;
  if (type === 'error') {
    statusEl.style.background = '#ffe8e8';
    statusEl.style.borderColor = '#ef4444';
    statusEl.style.color = '#7f1d1d';
  } else {
    statusEl.style.background = '#fff3cd';
    statusEl.style.borderColor = '#ffc107';
    statusEl.style.color = '#856404';
  }
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
  const unsupported = [];
  let fileIdx = 1;

  for (const file of fileEntries) {
    const fileName = file.name.toLowerCase();
    console.log(`  📄 Processing: ${file.name} (${fileName})`);
    
    if (isPdfFile(file)) {
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
    } else if (isImageFile(file)) {
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
      unsupported.push(file.name);
    }
  }

  console.log(`✅ Total: ${total.toFixed(2)} zł (${details.length} files)`);
  console.log('📋 FINAL DETAILS:', details);
  return { total, details, count: details.length, unsupported };
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
  const totalColorEl = document.getElementById('results-total-color');
  const totalBwEl = document.getElementById('results-total-bw');
  const totalLiveEl = document.getElementById('results-total-live');

  if (!container || !tbody || !totalColorEl || !totalBwEl) {
    console.warn('⚠️ Results table elements not found');
    return;
  }

  console.log(`🎨 RENDER TABLE: ${details.length} entries (CUMULATIVE)`);
  console.log('📋 Details:', details);

  if (details.length === 0) {
    container.style.display = 'none';
    console.warn('⚠️ No details to render, hiding table');
    return;
  }

  // Render table rows – WSZYSTKIE elementy z array (z kolumnami X, MB, Skan, Składanie)
  tbody.innerHTML = details.map((d, idx) => {
    const formatOrPages = d.type === 'PDF'
      ? `${d.pagesCount} str. (${d.pagesFormats})`
      : d.format;
    const pricePerPage = d.pricePerPage || '-';
    
    // Znajdź powiązany entry w files array
    const fileEntry = files.find(f => f.name === d.file);
    const fileSizeMB = fileEntry?.sizeMB || d.sizeMB || '-';
    const fileId = fileEntry?.id || d.id || idx;
    
    // Skanowanie
    const scanChecked = fileEntry?.scanCm ? 'checked' : '';
    const scanCm = fileEntry?.scanCm || 0;
    const scanPrice = scanCm * SCAN_PER_CM;
    
    // Składanie
    const skladChecked = fileEntry?.skladanieQty ? 'checked' : '';
    const skladFormat = d.format || 'nieformat';
    const skladPrice = (fileEntry?.skladanieQty || 0) * (SKLAD_CENY[skladFormat] || SKLAD_CENY['nieformat']);
    
    const totalWithExtras = d.price + scanPrice + skladPrice;
    
    console.log(`  📝 Row ${idx}: ${d.file} | ${formatOrPages} | ${d.dimensions} | ${pricePerPage}`);
    
    return `
      <tr class="data-row" data-format="${escHtml(d.format || '')}" data-formats="${escHtml(d.formatsCsv || '')}" data-dims="${escHtml(d.dimsCsv || '')}" data-file="${escHtml(d.file)}" data-size="${escHtml(d.dimensions || '')}" data-fileid="${fileId}">
        <td>
          <button class="cad-delete-x" data-delete="${fileId}" aria-label="Usuń ${escHtml(d.file)}" title="Usuń plik">✕</button>
        </td>
        <td>${fileSizeMB} ${typeof fileSizeMB === 'number' || !isNaN(fileSizeMB) ? 'MB' : ''}</td>
        <td>
          <input type="checkbox" class="cad-scan-check" data-scanid="${fileId}" data-filename="${escHtml(d.file)}" ${scanChecked} />
        </td>
        <td>
          <input type="checkbox" class="cad-sklad-check" data-skladid="${fileId}" data-filename="${escHtml(d.file)}" data-format="${skladFormat}" ${skladChecked} />
        </td>
        <td><strong>${escHtml(d.file)}</strong></td>
        <td>${d.type}</td>
        <td>${formatOrPages}</td>
        <td>${d.dimensions || '-'}</td>
        <td data-price-cell>${pricePerPage}</td>
        <td data-total-cell style="text-align:right;"><strong>${fmtPLN(totalWithExtras)}</strong></td>
      </tr>
    `;
  }).join('');

  // Oblicz obie sumy jednocześnie - KOLOR i CZARNO-BIAŁE (+ skanowanie + składanie)
  let totalColor = 0;
  let totalBw = 0;
  
  details.forEach(d => {
    const fileEntry = files.find(f => f.name === d.file);
    const scanPrice = fileEntry?.scanCm ? fileEntry.scanCm * SCAN_PER_CM : 0;
    const skladFormat = d.format || 'nieformat';
    const skladPrice = (fileEntry?.skladanieQty || 0) * (SKLAD_CENY[skladFormat] || SKLAD_CENY['nieformat']);
    
    // Oblicz cenę dla koloru i B&W na podstawie wymiarów
    if (d.dimsCsv && d.dimsCsv.includes('x')) {
      const dims = d.dimsCsv.split(',')[0].trim().split('x');
      const widthMm = parseFloat(dims[0]);
      const heightMm = parseFloat(dims[1]);
      
      if (widthMm > 0 && heightMm > 0) {
        const pricingColor = calculateCadByDims(widthMm, heightMm, d.pagesCount || 1, 'color');
        const pricingBw = calculateCadByDims(widthMm, heightMm, d.pagesCount || 1, 'bw');
        
        totalColor += pricingColor.cena + scanPrice + skladPrice;
        totalBw += pricingBw.cena + scanPrice + skladPrice;
      } else {
        // Fallback - użyj aktualnej ceny z d.price
        totalColor += d.price + scanPrice + skladPrice;
        totalBw += d.price + scanPrice + skladPrice;
      }
    } else {
      // Fallback - użyj aktualnej ceny z d.price
      totalColor += d.price + scanPrice + skladPrice;
      totalBw += d.price + scanPrice + skladPrice;
    }
  });

  // Wyświetl obie sumy
  totalColorEl.textContent = fmtPLN(totalColor);
  totalBwEl.textContent = fmtPLN(totalBw);
  
  if (totalLiveEl) {
    totalLiveEl.innerHTML = `
      <div><strong>🎨 KOLOR:</strong> ${fmtPLN(totalColor)}</div>
      <div><strong>⚫ CZARNO-BIAŁE:</strong> ${fmtPLN(totalBw)}</div>
    `;
  }
  container.style.display = '';

  updatePrices();

  console.log(`✅ Results table rendered: ${details.length} ALL entries`);
  console.log(`   💰 KOLOR: ${fmtPLN(totalColor)} | B&W: ${fmtPLN(totalBw)}`);
}

// ─── MODULE-LEVEL DOM REFS (accessible to nested functions) ──────────────────
let modeEl = null;
let optZapEl = null;
let optPowEl = null;
let optEmailEl = null;
let tableBody = null;
let grandTotalEl = null;
let fileCountEl = null;
let files = []; // [{ id, name, sizeMB, qty, wMm, hMm, skladanieQty, scanCm, ... }]
let lastScanExpl = [];

// ─── INIT ────────────────────────────────────────────────────────────────────
export function init() {
  const dropZone    = document.getElementById('cadDropZone');
  if (!dropZone) return;
  if (dropZone.dataset.cadInitDone === '1') return;
  dropZone.dataset.cadInitDone = '1';

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
  showUploadStatus('');

  // ✅ DEPRECATED: printMode jest teraz ukryty - pokazujemy obie ceny jednocześnie
  if (printModeEl) {
    printModeEl.style.display = 'none';  // HIDE
    console.log('⚠️ Print mode selector is deprecated - showing both prices simultaneously');
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
  
  // NO mode/VAT listeners for results table (direct CAD pricing)

  // ── Results table event delegation (X, MB, Skan) ───────────────────────────
  const resultsContainer = document.getElementById('results-container');
  if (resultsContainer) {
    resultsContainer.addEventListener('click', e => {
      const delBtn = e.target.closest('[data-delete]');
      if (delBtn) {
        const fileId = delBtn.dataset.delete;
        deleteFileById(fileId);
        return;
      }
    });

    resultsContainer.addEventListener('change', e => {
      const el = e.target;
      
      // Per-row scan checkbox
      if (el.classList.contains('cad-scan-check')) {
        const fileId = el.dataset.scanid;
        const fileName = el.dataset.filename;
        const fileEntry = files.find(f => String(f.id) === String(fileId) || f.name === fileName);
        
        if (fileEntry) {
          if (el.checked && fileEntry.wMm > 0 && fileEntry.hMm > 0) {
            // Algorytm skanowania: mm -> cm, x 0.08 zl/cm
            const hosszDmm = Math.max(fileEntry.wMm, fileEntry.hMm);
            const hosszCm = Math.round(hosszDmm / 10);
            fileEntry.scanCm = hosszCm;
            fileEntry.scanPrice = hosszCm * SCAN_PER_CM;
            fileEntry.scanExpl = `Skan: ${hosszDmm}mm = ${hosszCm}cm x ${SCAN_PER_CM}zl/cm = ${fmtPLN(fileEntry.scanPrice)}`;
            console.log(`🖨 Skan ${fileEntry.name}: ${fileEntry.scanExpl}`);
          } else if (!el.checked) {
            fileEntry.scanCm = 0;
            fileEntry.scanPrice = 0;
            fileEntry.scanExpl = '';
          }
          
          // Przelicz obie sumy (kolor + B&W) i odśwież tabelę
          let totalColor = 0;
          let totalBw = 0;
          
          wszystkieWyniki.forEach(d => {
            const fe = files.find(f => f.name === d.file);
            const scanPrice = fe?.scanCm ? fe.scanCm * SCAN_PER_CM : 0;
            const skladFormat = d.format || 'nieformat';
            const skladPrice = (fe?.skladanieQty || 0) * (SKLAD_CENY[skladFormat] || SKLAD_CENY['nieformat']);
            
            // Oblicz cenę dla koloru i B&W
            if (d.dimsCsv && d.dimsCsv.includes('x')) {
              const dims = d.dimsCsv.split(',')[0].trim().split('x');
              const widthMm = parseFloat(dims[0]);
              const heightMm = parseFloat(dims[1]);
              
              if (widthMm > 0 && heightMm > 0) {
                const pricingColor = calculateCadByDims(widthMm, heightMm, d.pagesCount || 1, 'color');
                const pricingBw = calculateCadByDims(widthMm, heightMm, d.pagesCount || 1, 'bw');
                
                totalColor += pricingColor.cena + scanPrice + skladPrice;
                totalBw += pricingBw.cena + scanPrice + skladPrice;
              }
            }
          });
          
          renderResultsTable(wszystkieWyniki, totalColor); // total jest ignorowany, ale zachowujemy sygnaturę
          renderObliczen(wszystkieWyniki);
        }
      }
      
      // Per-row składanie checkbox
      if (el.classList.contains('cad-sklad-check')) {
        const fileId = el.dataset.skladid;
        const fileName = el.dataset.filename;
        const format = el.dataset.format || 'nieformat';
        const fileEntry = files.find(f => String(f.id) === String(fileId) || f.name === fileName);
        
        if (fileEntry) {
          if (el.checked) {
            // Algorytm składania: 1 składanie × cena formatu
            const pagesCount = fileEntry.pagesCount || 1;
            fileEntry.skladanieQty = pagesCount;
            const cena = SKLAD_CENY[format] || SKLAD_CENY['nieformat'];
            fileEntry.skladPrice = pagesCount * cena;
            fileEntry.skladExpl = `Składanie ${format}: ${pagesCount} × ${fmtPLN(cena)} = ${fmtPLN(fileEntry.skladPrice)}`;
            console.log(`📐 Składanie ${fileEntry.name}: ${fileEntry.skladExpl}`);
          } else if (!el.checked) {
            fileEntry.skladanieQty = 0;
            fileEntry.skladPrice = 0;
            fileEntry.skladExpl = '';
          }
          
          // Przelicz obie sumy (kolor + B&W) i odśwież tabelę
          let totalColor = 0;
          let totalBw = 0;
          
          wszystkieWyniki.forEach(d => {
            const fe = files.find(f => f.name === d.file);
            const scanPrice = fe?.scanCm ? fe.scanCm * SCAN_PER_CM : 0;
            const skladFormat = d.format || 'nieformat';
            const skladPrice = (fe?.skladanieQty || 0) * (SKLAD_CENY[skladFormat] || SKLAD_CENY['nieformat']);
            
            // Oblicz cenę dla koloru i B&W
            if (d.dimsCsv && d.dimsCsv.includes('x')) {
              const dims = d.dimsCsv.split(',')[0].trim().split('x');
              const widthMm = parseFloat(dims[0]);
              const heightMm = parseFloat(dims[1]);
              
              if (widthMm > 0 && heightMm > 0) {
                const pricingColor = calculateCadByDims(widthMm, heightMm, d.pagesCount || 1, 'color');
                const pricingBw = calculateCadByDims(widthMm, heightMm, d.pagesCount || 1, 'bw');
                
                totalColor += pricingColor.cena + scanPrice + skladPrice;
                totalBw += pricingBw.cena + scanPrice + skladPrice;
              }
            }
          });
          
          renderResultsTable(wszystkieWyniki, totalColor); // total jest ignorowany, ale zachowujemy sygnaturę
          renderObliczen(wszystkieWyniki);
        }
      }
    });
  }

  // ── File list event delegation ──────────────────────────────────────────────
  // DEPRECATED: fileListEl nie jest już używany - wszystkie interakcje są w resultsTable
  // Te listenery są tutaj dla zachowania kompatybilności wstecznej
  if (fileListEl) {
    fileListEl.addEventListener('click', e => {
      const delBtn = e.target.closest('[data-delete]');
      if (delBtn) { deleteFile(delBtn.dataset.delete); return; }
    });

    fileListEl.addEventListener('input', e => {
      const el = e.target;
      const byId = id => files.find(f => String(f.id) === id);

      // Bulk inputs (deprecated - już nie używamy)
      if (el.id === 'cadBulkScan') {
        console.log('⚠️ cadBulkScan is deprecated');
        return;
      }

      // Per-row inputs (deprecated - obsługiwane w resultsTable)
      if (el.classList.contains('cad-scan-check')) {
        console.log('⚠️ cad-scan-check in fileListEl is deprecated');
      }
      debouncedRecalc();
    });
  }

  // Aktualizuj data-format na sklad-qty po zmianie wymiarów
  function updateSkladFormat(entry) {
    // DEPRECATED: fileListEl już nie istnieje
    console.log('⚠️ updateSkladFormat is deprecated');
  }

  // ── File management ──────────────────────────────────────────────────────────
  function addFiles(fileList) {
    if (!fileList || fileList.length === 0) return;

    const unsupportedNames = [];

    for (const f of fileList) {
      if (!isPdfFile(f) && !isImageFile(f)) {
        unsupportedNames.push(f.name);
        continue;
      }

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
      if (isImageFile(f)) autoDetectDims(entry);
    }

    if (unsupportedNames.length > 0) {
      showUploadStatus(`Pominięto nieobsługiwane pliki (${unsupportedNames.length}): ${unsupportedNames.join(', ')}. Obsługiwane: PDF, JPG, PNG, TIFF.`);
    } else {
      showUploadStatus('');
    }

    if (warningEl) warningEl.style.display = files.length > MAX_FILES_SOFT ? '' : 'none';
    renderFileList();
  }

  function deleteFile(id) {
    files = files.filter(f => String(f.id) !== String(id));
    if (warningEl) warningEl.style.display = files.length > MAX_FILES_SOFT ? '' : 'none';
    renderFileList();
  }

  function deleteFileById(id) {
    // Znajdź nazwę pliku przed usunięciem
    const fileEntry = files.find(f => String(f.id) === String(id));
    const fileName = fileEntry?.name;
    
    // Usuń z files array
    files = files.filter(f => String(f.id) !== String(id));
    
    // Usuń z wszystkieWyniki array
    if (fileName) {
      wszystkieWyniki = wszystkieWyniki.filter(w => w.file !== fileName);
      console.log(`🗑️ Usunięto plik: ${fileName} (id: ${id})`);
      console.log(`📦 Pozostało wyników: ${wszystkieWyniki.length}`);
    }
    
    // renderResultsTable() obliczy obie sumy automatycznie
    if (wszystkieWyniki.length === 0) {
      const container = document.getElementById('results-container');
      if (container) container.style.display = 'none';
    } else {
      renderResultsTable(wszystkieWyniki, 0); // total jest obliczany w funkcji
    }
    
    renderObliczen(wszystkieWyniki);
    
    if (warningEl) warningEl.style.display = files.length > MAX_FILES_SOFT ? '' : 'none';
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
    // Ta funkcja jest już deprecated - wszystkie dane są w resultsTable
    // Pozostawiona dla zachowania kompatybilności z starym kodem
    console.log('⚠️ renderFileList() is deprecated - using renderResultsTable() instead');
    
    if (files.length === 0) {
      if (summaryEl) summaryEl.style.display = 'none';
      dispatchPrice(0);
      return;
    }
    
    // Nie renderuj dolnej tabeli - wszystko jest już w górnej resultsTable
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
    
      // Renderuj WSZYSTKIE tabele z nowymi cenami (funkcja obliczy obie sumy)
      renderResultsTable(wszystkieWyniki, 0);
      renderObliczen(wszystkieWyniki);
    
      console.log(`✅ Recalculated: showing both COLOR and B&W prices`);
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

      if (result.unsupported?.length) {
        showUploadStatus(`Pominięto nieobsługiwane pliki (${result.unsupported.length}): ${result.unsupported.join(', ')}. Obsługiwane: PDF, JPG, PNG, TIFF.`);
      } else {
        showUploadStatus('');
      }

      if (!result.details.length) {
        console.warn('⚠️ No analyzable files in this batch');
        return;
      }

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
        entry.totalPrice = d.price || 0;

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
      
      // Renderuj WSZYSTKIE wyniki (nie tylko nowe!) - funkcja obliczy obie sumy
      renderResultsTable(wszystkieWyniki, 0);
      
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

    // Add scan explanations if any
    if (lastScanExpl && lastScanExpl.length > 0) {
      html += `
        <div style="margin-top:10px; padding-top:10px; border-top:1px dashed #d0e8ff;">
          <div style="font-weight:600; margin-bottom:6px;">🖨 Skanowanie:</div>
          ${lastScanExpl.map(e => `<div class="obliczenie-text">${escHtml(e)}</div>`).join('')}
        </div>
      `;
    }

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

      // ✅ Odśwież ekran obliczeń (w tym skanowanie)
      if (typeof renderObliczen === 'function') {
        renderObliczen(wszystkieWyniki);
      }

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

// Uwaga: inicjalizacja jest sterowana przez router (app.js -> initCategory)
// żeby uniknąć podwójnego bindowania listenerów.


