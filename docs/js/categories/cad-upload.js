// cad-upload.js – kalkulator uploadowania plików CAD z pełnym cennikiem
// LEGACY JS (nie TypeScript) – docs/js/categories/cad-upload.js

import priceManager from '../price-manager.js';

console.log('✅ CAD WIELKOFORMATOWE FULL SYSTEM IMPORTED');

// ─── Pobierz ceny z centralizowanego price-manager ──────────────────────────────
let CAD_CENNIK = null;

async function initCadPrices() {
  CAD_CENNIK = {
    formatowe: {
      kolor: {
        'A3': priceManager.getPrice('drukCAD.price.color.formatowe.A3'),
        'A2': priceManager.getPrice('drukCAD.price.color.formatowe.A2'),
        'A1': priceManager.getPrice('drukCAD.price.color.formatowe.A1'),
        'A0': priceManager.getPrice('drukCAD.price.color.formatowe.A0'),
        'A0+': priceManager.getPrice('drukCAD.price.color.formatowe.A0p')
      },
      bw: {
        'A3': priceManager.getPrice('drukCAD.price.bw.formatowe.A3'),
        'A2': priceManager.getPrice('drukCAD.price.bw.formatowe.A2'),
        'A1': priceManager.getPrice('drukCAD.price.bw.formatowe.A1'),
        'A0': priceManager.getPrice('drukCAD.price.bw.formatowe.A0'),
        'A0+': priceManager.getPrice('drukCAD.price.bw.formatowe.A0p')
      }
    },
    nieformatowe_mb: {
      kolor: {
        'A3': priceManager.getPrice('drukCAD.price.color.mb.A3'),
        'A2': priceManager.getPrice('drukCAD.price.color.mb.A2'),
        'A1': priceManager.getPrice('drukCAD.price.color.mb.A1'),
        'A0': priceManager.getPrice('drukCAD.price.color.mb.A0'),
        'A0+': priceManager.getPrice('drukCAD.price.color.mb.A0p'),
        '1067': priceManager.getPrice('drukCAD.price.color.mb.R1067')
      },
      bw: {
        'A3': priceManager.getPrice('drukCAD.price.bw.mb.A3'),
        'A2': priceManager.getPrice('drukCAD.price.bw.mb.A2'),
        'A1': priceManager.getPrice('drukCAD.price.bw.mb.A1'),
        'A0': priceManager.getPrice('drukCAD.price.bw.mb.A0'),
        'A0+': priceManager.getPrice('drukCAD.price.bw.mb.A0p'),
        '1067': priceManager.getPrice('drukCAD.price.bw.mb.R1067')
      }
    },
    formatToWidth: {
      'A3': 297,
      'A2': 420,
      'A1': 594,
      'A0': 841,
      'A0+': 914
    },
    baseLengthMm: {
      'A3': 420,
      'A2': 594,
      'A1': 841,
      'A0': 1189,
      'A0+': 1292
    }
  };

  console.log('💎 CENNIK CAD załadowany z price-manager:', CAD_CENNIK);
}

// Zainicjalizuj ceny zaraz
await initCadPrices();

// ─── 🎯 WSZYSTKIE GLOBALNE STAŁE – ZERO UNDEFINED! ──────────────────────────────

/** Cena skanowania: 0,08 zł/cm */
const SCAN_PER_CM = priceManager.getPrice('drukCAD.wfScanPerCm') || 0.08;

/** Tolerancja (mm) przy sprawdzaniu długości formatowej */
const TOLERANCJA_MM = 5;

/** Ceny składania (złożenie) dla różnych formatów */
const SKLAD_CENY = {
  'A0+': priceManager.getPrice('drukCAD.fold.A0p') || 4.0,
  'A0': priceManager.getPrice('drukCAD.fold.A0') || 3.0,
  'A1': priceManager.getPrice('drukCAD.fold.A1') || 2.0,
  'A2': priceManager.getPrice('drukCAD.fold.A2') || 1.5,
  'A3': priceManager.getPrice('drukCAD.fold.A3') || 1.0,
  'A4': priceManager.getPrice('drukCAD.fold.A3L') || 0.7,
  'nieformat': 0.50
};

/** Global array do kumulacji wszystkich wyników */
let globalneWyniki = [];

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
  const totalColorElLocal = document.getElementById('results-total-color');
  const totalBwElLocal = document.getElementById('results-total-bw');
  const totalLiveEl = document.getElementById('results-total-live');

  if (!container || !tbody || !totalColorElLocal || !totalBwElLocal) {
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
  totalColorElLocal.textContent = fmtPLN(totalColor);
  totalBwElLocal.textContent = fmtPLN(totalBw);
  
  if (totalLiveEl) {
    totalLiveEl.innerHTML = `
      <div><strong>🎨 KOLOR:</strong> ${fmtPLN(totalColor)}</div>
      <div><strong>⚫ CZARNO-BIAŁE:</strong> ${fmtPLN(totalBw)}</div>
    `;
  }
  container.style.display = '';

  updatePrices();
  
  // ✅ BEZPOŚREDNIO aktualizuj ceny w checkboxach
  const selectColorPriceEl = document.getElementById('selectColorPrice');
  const selectBwPriceEl = document.getElementById('selectBwPrice');
  if (selectColorPriceEl) selectColorPriceEl.textContent = fmtPLN(totalColor);
  if (selectBwPriceEl) selectBwPriceEl.textContent = fmtPLN(totalBw);

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

  // ── Price selection checkboxes ─────────────────────────────────────────────
  const selectColorCheckbox = document.getElementById('selectColor');
  const selectBwCheckbox = document.getElementById('selectBw');
  const cadAddToCartBtn = document.getElementById('cadAddToCart');

  function updatePriceSelection() {
    const colorChecked = selectColorCheckbox?.checked;
    const bwChecked = selectBwCheckbox?.checked;
    
    // Pokaż przycisk tylko jeśli coś zaznaczono
    if (cadAddToCartBtn) {
      cadAddToCartBtn.style.display = (colorChecked || bwChecked) ? '' : 'none';
    }
    
    console.log(`📍 Price selection: color=${colorChecked}, bw=${bwChecked}`);
  }


  if (selectColorCheckbox) {
    selectColorCheckbox.addEventListener('change', updatePriceSelection);
  }
  if (selectBwCheckbox) {
    selectBwCheckbox.addEventListener('change', updatePriceSelection);
  }

  if (cadAddToCartBtn) {
    cadAddToCartBtn.addEventListener('click', () => {
      const colorChecked = selectColorCheckbox?.checked;
      const bwChecked = selectBwCheckbox?.checked;
      
      if (!colorChecked && !bwChecked) {
        alert('Wybierz conajmniej jedną opcję (kolor lub czarno-białe)');
        return;
      }

      // Wyślij do koszyka
      const itemsToAdd = [];
      
      if (colorChecked && selectColorPrice) {
        const price = parseFloat(selectColorPrice.textContent.replace(/[^\d.,]/g, '').replace(',', '.'));
        itemsToAdd.push({
          id: 'cad-upload-color-' + Date.now(),
          price: price,
          name: `CAD Upload - 🎨 Kolor (${files.length} plik${files.length !== 1 ? 'i/ów' : ''})`,
          cat: 'CAD Upload'
        });
      }

      if (bwChecked && selectBwPrice) {
        const price = parseFloat(selectBwPrice.textContent.replace(/[^\d.,]/g, '').replace(',', '.'));
        itemsToAdd.push({
          id: 'cad-upload-bw-' + Date.now(),
          price: price,
          name: `CAD Upload - ⚫ Czarno-białe (${files.length} plik${files.length !== 1 ? 'i/ów' : ''})`,
          cat: 'CAD Upload'
        });
      }

      itemsToAdd.forEach(item => {
        if (window.kalkulatorCore) {
          window.kalkulatorCore.addItem(item);
          console.log(`✅ Added to cart:`, item);
        } else {
          window.dispatchEvent(new CustomEvent('razdwa:addToCart', { detail: item }));
        }
      });

      console.log(`✅ Dodano ${itemsToAdd.length} pozycj${itemsToAdd.length === 1 ? 'ę' : 'e'} do koszyka`);
    });
  }

  // ── Submit button ──────────────────────────────────────────────────────────
  document.getElementById('submitBtn')?.addEventListener('click', () => {
    const colorChecked = selectColorCheckbox?.checked;
    const bwChecked = selectBwCheckbox?.checked;

    if (!colorChecked && !bwChecked) {
      alert('Wybierz opcję do wysłania');
      return;
    }

    // Przygotuj dane do wysłania
    const submitData = {
      timestamp: new Date().toISOString(),
      files: files.map(f => ({ name: f.name, size: f.sizeMB, format: f.formatLabel })),
      selectedOptions: {
        color: colorChecked ? selectColorPrice?.textContent : null,
        bw: bwChecked ? selectBwPrice?.textContent : null
      }
    };

    console.log('📧 Submitting:', submitData);
    alert(`Wysłano${colorChecked ? ' (Kolor)' : ''}${bwChecked ? ' (Czarno-białe)' : ''}`);
  })

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

    // Render each calculation with BOTH color and B&W
    let html = wyniki.map((w, idx) => {
      // Extract dimensions
      let widthMm = 0, heightMm = 0;
      if (w.dimsCsv && w.dimsCsv.includes('x')) {
        const dims = w.dimsCsv.split(',')[0].trim().split('x');
        widthMm = parseFloat(dims[0]);
        heightMm = parseFloat(dims[1]);
      }

      // Calculate both color and B&W prices
      let pricingColor = null;
      let pricingBw = null;
      if (widthMm > 0 && heightMm > 0) {
        pricingColor = calculateCadByDims(widthMm, heightMm, w.pagesCount || 1, 'color');
        pricingBw = calculateCadByDims(widthMm, heightMm, w.pagesCount || 1, 'bw');
      }

      const cenaColor = pricingColor ? fmtPLN(pricingColor.cena) : '—';
      const cenaBw = pricingBw ? fmtPLN(pricingBw.cena) : '—';
      const wyjasnColor = pricingColor ? pricingColor.wyjasnienie : 'Brak wyceny';
      const wyjasnBw = pricingBw ? pricingBw.wyjasnienie : 'Brak wyceny';

      console.log(`  📝 Calc ${idx + 1}: ${w.file}`);
      console.log(`     🎨 Kolor: ${cenaColor}`);
      console.log(`     ⚫ B&W: ${cenaBw}`);

      return `
        <div class="obliczenie-item">
          <strong>📄 ${escHtml(w.file)}</strong>
          <div style="margin-top:8px; display:flex; flex-direction:column; gap:6px;">
            <div style="padding:6px; background:#fff3cd; border-radius:4px; border-left:3px solid #ffc107;">
              <div style="font-weight:600; color:#856404;">🎨 Kolor: ${cenaColor}</div>
              <div class="obliczenie-text" style="font-size:0.75rem; color:#666; margin-top:2px;">${escHtml(wyjasnColor)}</div>
            </div>
            <div style="padding:6px; background:#f5f5f5; border-radius:4px; border-left:3px solid #424242;">
              <div style="font-weight:600; color:#424242;">⚫ Czarno-białe: ${cenaBw}</div>
              <div class="obliczenie-text" style="font-size:0.75rem; color:#666; margin-top:2px;">${escHtml(wyjasnBw)}</div>
            </div>
          </div>
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

    // Add total summary (both colors)
    let sumaColor = 0;
    let sumaBw = 0;
    wyniki.forEach(w => {
      let widthMm = 0, heightMm = 0;
      if (w.dimsCsv && w.dimsCsv.includes('x')) {
        const dims = w.dimsCsv.split(',')[0].trim().split('x');
        widthMm = parseFloat(dims[0]);
        heightMm = parseFloat(dims[1]);
      }
      if (widthMm > 0 && heightMm > 0) {
        const pColor = calculateCadByDims(widthMm, heightMm, w.pagesCount || 1, 'color');
        const pBw = calculateCadByDims(widthMm, heightMm, w.pagesCount || 1, 'bw');
        sumaColor += pColor?.cena || 0;
        sumaBw += pBw?.cena || 0;
      }
    });

    html += `
      <div style="margin-top:12px; padding-top:12px; border-top:2px solid #d0e8ff;">
        <div style="display:flex; justify-content:space-between; gap:12px;">
          <div style="flex:1; text-align:center; padding:8px; background:#fff3cd; border-radius:4px;">
            <div style="font-size:12px; color:#856404;">🎨 Razem Kolor</div>
            <div style="font-size:16px; color:#ffc107; font-weight:bold;">${fmtPLN(sumaColor)}</div>
          </div>
          <div style="flex:1; text-align:center; padding:8px; background:#f5f5f5; border-radius:4px;">
            <div style="font-size:12px; color:#424242;">⚫ Razem B&W</div>
            <div style="font-size:16px; color:#424242; font-weight:bold;">${fmtPLN(sumaBw)}</div>
          </div>
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

  // ✅ Wyeksportuj recalculateAll globalnie
  window.recalculateAllCAD = recalculateAll;
  window.cadUploadFiles = files;
}

// ─── 🔄 NASŁUCHIWANIE NA ZMIANY CEN Z PRICE-MANAGER ──────────────────────────────
window.addEventListener('razdwa:pricesUpdated', async () => {
  console.log('🔄 Ceny zmienione! Reinicjalizuję CAD cennik...');
  await initCadPrices();
  // Odświeź obliczenia jeśli są aktywne pliki
  const files = window.cadUploadFiles || [];
  if (files.length > 0 && window.recalculateAllCAD) {
    window.recalculateAllCAD();
  }
});

window.updatePrices = updatePrices;
window.exportCSV = exportCSV;
window.setPrintMode = setPrintMode;  // ✅ Export global mode setter

export function destroy() { /* no global listeners to remove */ }

// Uwaga: inicjalizacja jest sterowana przez router (app.js -> initCategory)
// żeby uniknąć podwójnego bindowania listenerów.


