// cad-upload.js – kalkulator uploadowania plików CAD z pełnym cennikiem
// LEGACY JS (nie TypeScript) – docs/js/categories/cad-upload.js

import { drukCad } from '../prices.js';

console.log('✅ PRODUCTION READY');

// ─── CENY (z prices.js – identyczne jak w druk-cad) ─────────────────────────
const BASE_LENGTHS  = drukCad.baseLengthMm;          // { A3:420, A2:594, A1:841, A0:1189, 'A0+':1292 }
const WIDTHS        = drukCad.widths;                 // { A3:297, A2:420, A1:594, A0:841, 'A0+':914 }
const SKLAD_CENY    = { ...drukCad.skladanie, 'nieformat': 2.5 };
const SCAN_PER_CM   = drukCad.skanowanie;             // 0.08 zł/cm (identycznie jak w druk-cad.js)
const MAX_FILES_SOFT = 50;

/** Tolerancja (mm) przy sprawdzaniu długości formatowej – identyczna jak w druk-cad.js */
const TOLERANCE_MM = 5;

const CAD_FORMATS = ['A4', 'A3', 'A2', 'A1', 'A0', 'A0+'];

function getPricesFromCadFile(mode = 'bw') {
  const result = {};
  CAD_FORMATS.forEach(fmt => {
    const price = drukCad.formatowe?.[mode]?.[fmt];
    if (price != null) result[fmt] = price;
  });
  console.log(`💰 CAD prices (${mode}):`, result);
  return result;
}

// Załaduj ceny z drukCad (domyślnie bw)
const cenyCad = getPricesFromCadFile('bw');
console.log('🔧 CAD ceny załadowane:', cenyCad);
console.log('📊 drukCad.formatowe:', drukCad.formatowe);

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
/** Wykryj format z tolerancją ±15mm. A3: 297±15 × 420±15 = 282-312 × 405-435mm. */
function detectFormat(wMm, hMm) {
  const short = Math.min(wMm, hMm);
  const long = Math.max(wMm, hMm);
  const TOLERANCE = 15;

  // A3: 297×420 ±15mm → 282-312 × 405-435mm (mapuj 597×842 na A3!)
  if (Math.abs(short - 297) <= TOLERANCE && Math.abs(long - 420) <= TOLERANCE) return 'A3';
  // A2: 420×594 ±15mm
  if (Math.abs(short - 420) <= TOLERANCE && Math.abs(long - 594) <= TOLERANCE) return 'A2';
  // A1: 594×841 ±15mm
  if (Math.abs(short - 594) <= TOLERANCE && Math.abs(long - 841) <= TOLERANCE) return 'A1';
  // A0: 841×1189 ±15mm
  if (Math.abs(short - 841) <= TOLERANCE && Math.abs(long - 1189) <= TOLERANCE) return 'A0';
  // A0+: 914×1292 ±15mm
  if (Math.abs(short - 914) <= TOLERANCE && Math.abs(long - 1292) <= TOLERANCE) return 'A0+';

  const shorter = Math.min(wMm, hMm);
  if (shorter >= WIDTHS['A0+']) return 'A0+';
  if (shorter >= WIDTHS['A0'])  return 'A0';
  if (shorter >= WIDTHS['A1'])  return 'A1';
  if (shorter >= WIDTHS['A2'])  return 'A2';
  if (shorter >= WIDTHS['A3'])  return 'A3';
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

  const fmt    = detectFormat(wMm, hMm);
  const longer = Math.max(wMm, hMm);

  let unitPrice;

  if (fmt === 'nieformatowy') {
    // Format nierozpoznany (krótszy bok poniżej A3) → cena mb rolki A3
    const width = WIDTHS['A3'];
    unitPrice = (drukCad.metrBiezacy[mode][width] || 0) * (longer / 1000);
  } else {
    const baseLen = BASE_LENGTHS[fmt];
    if (Math.abs(longer - baseLen) <= TOLERANCE_MM) {
      // Format standardowy → cena formatowa
      unitPrice = drukCad.formatowe[mode][fmt] || 0;
    } else {
      // Nieformatowy → długość(m) × cena mb dla danej szerokości rolki
      const width = WIDTHS[fmt];
      unitPrice = (drukCad.metrBiezacy[mode][width] || 0) * (longer / 1000);
    }
  }

  return unitPrice * qty;
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
  const el = document.getElementById('skanCm');
  return (parseFloat(el?.value || 0) || 0) * SCAN_PER_CM;
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

      console.log(`  Page ${i}: ${format} (${mm})`);
      
      pages.push({
        page: i,
        widthMm,
        heightMm,
        format,
        mm
      });
    }

    // Calculate total price
    const totalPrice = pages.reduce((sum, p) => sum + parseFloat(calculateCadPriceByDims(p.widthMm, p.heightMm, 'color', 1, true)), 0);
    
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
 * Calculate CAD price from format (fallback when no dimensions available).
 */
export function calculateCadPrice(format, strony = 1, vat = true, mode = 'bw') {
  const map = getPricesFromCadFile(mode);
  const base = map[format] ?? map.A4 ?? 0;
  const netto = base * strony;
  const brutto = vat ? netto * 1.23 : netto;
  console.log(`💲 CAD: ${format} × ${strony} = ${base} × ${strony} = ${netto.toFixed(2)} zł (netto), ${brutto.toFixed(2)} zł (brutto)`);
  return brutto.toFixed(2);
}

/**
 * Calculate CAD price from dimensions using CAD logic.
 */
export function calculateCadPriceByDims(widthMm, heightMm, mode = 'bw', qty = 1, vat = true) {
  const netto = obliczPlik({ wMm: widthMm, hMm: heightMm, qty }, mode);
  const brutto = vat ? netto * 1.23 : netto;
  console.log(`📐 CAD dims: ${widthMm}x${heightMm}mm, mode=${mode}, netto=${netto.toFixed(2)}, brutto=${brutto.toFixed(2)}`);
  return brutto.toFixed(2);
}

export function updatePrices() {
  const modeEl = document.getElementById('printMode');
  const vatEl = document.getElementById('vatToggle');
  const totalPriceEl = document.getElementById('results-total-price');
  const totalLiveEl = document.getElementById('results-total-live');
  const sumaEl = document.querySelector('.suma');

  if (!modeEl || !vatEl) return;

  const mode = modeEl.value;
  const vat = vatEl.checked;
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
        return calculateCadPriceByDims(w, h, mode, 1, vat);
      });
      pricePerPageText = prices.map(p => `${p} zł`).join(', ');
      rowTotal = prices.reduce((sum, p) => sum + parseFloat(p), 0);
    } else if (formatsCsv) {
      const formats = formatsCsv.split(',').map(f => f.trim()).filter(Boolean);
      const prices = formats.map(f => calculateCadPrice(f, 1, vat, mode));
      pricePerPageText = prices.map(p => `${p} zł`).join(', ');
      rowTotal = prices.reduce((sum, p) => sum + parseFloat(p), 0);
    } else if (format) {
      const price = calculateCadPrice(format, 1, vat, mode);
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
        const pagesPrices = pdfData.pages.map(p => `${calculateCadPriceByDims(p.widthMm, p.heightMm, 'color', 1, true)} zł`).join(', ');
        details.push({
          idx: fileIdx++,
          file: file.name,
          type: 'PDF',
          pagesCount: pdfData.pages.length,
          pagesFormats: pagesInfo,
          dimensions: pagesSizes,
          dimsCsv: pagesDimsCsv,
          formatsCsv: pdfData.pages.map(p => p.format).join(', '),
          pricePerPage: pagesPrices,
          price: pdfData.totalPrice
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
        const price = parseFloat(calculateCadPriceByDims(dims.widthMm, dims.heightMm, 'color', 1, true));
        total += price;
        details.push({
          idx: fileIdx++,
          file: file.name,
          type: 'Image',
          format: format,
          dimensions: `${dims.widthMm}x${dims.heightMm}mm`,
          dimsCsv: `${dims.widthMm}x${dims.heightMm}`,
          pricePerPage: `${calculateCadPriceByDims(dims.widthMm, dims.heightMm, 'color', 1, true)} zł`,
          price: price
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

// ─── INIT ────────────────────────────────────────────────────────────────────
export function init() {
  const dropZone    = document.getElementById('cadDropZone');
  if (!dropZone) return;

  const fileInput   = document.getElementById('cadFileInput');
  const fileListEl  = document.getElementById('cadFileList');
  const summaryEl   = document.getElementById('cadSummary');
  const fileCountEl = document.getElementById('cadFileCount');
  const totalEl     = document.getElementById('cadTotal');
  const warningEl   = document.getElementById('cadWarning');
  const przeliczBtn = document.getElementById('cadPrzelicz');
  const tableBody   = document.getElementById('cadTableBody');
  const grandTotalEl = document.getElementById('grandTotal');
  const modeEl      = document.getElementById('cadMode');
  const printModeEl = document.getElementById('printMode');
  const vatToggleEl = document.getElementById('vatToggle');

  if (printModeEl) printModeEl.onchange = updatePrices;
  if (vatToggleEl) vatToggleEl.onchange = updatePrices;
  const optZapEl    = document.getElementById('optZapelnienie');
  const optPowEl    = document.getElementById('optPowieksz');
  const optEmailEl  = document.getElementById('optEmail');

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
    console.log('🗑️ Wszystkie wyniki wyczyszczone, table hidden');
    
    const container = document.getElementById('results-container');
    if (container) container.style.display = 'none';
  });

  przeliczBtn?.addEventListener('click', () => recalculateAll());

  // ── Global options triggers (.cad-options) ──────────────────────────────────
  const debouncedRecalc = debounce(recalculateAll, 200);
  [modeEl, optZapEl, optPowEl, optEmailEl].forEach(el => el?.addEventListener('change', debouncedRecalc));
  document.getElementById('skanCm')?.addEventListener('input', debouncedRecalc);

  // ── File list event delegation ──────────────────────────────────────────────
  if (fileListEl) {
    fileListEl.addEventListener('click', e => {
      const delBtn = e.target.closest('[data-delete]');
      if (delBtn) { deleteFile(delBtn.dataset.delete); return; }
    });

    fileListEl.addEventListener('input', e => {
      const el = e.target;
      const byId = id => files.find(f => String(f.id) === id);

      if (el.classList.contains('cad-qty-input') && el.dataset.qtyid) {
        const entry = byId(el.dataset.qtyid);
        if (!entry) return;
        const v = parseInt(el.value, 10);
        if (isNaN(v) || v < 1) { el.value = entry.qty; return; }
        entry.qty = Math.min(999, v);
      } else if (el.classList.contains('sklad-qty')) {
        const entry = byId(el.dataset.skladid);
        if (entry) entry.skladanieQty = Math.max(0, parseInt(el.value, 10) || 0);
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
      if (tableBody)     tableBody.innerHTML       = '';
      if (grandTotalEl)  grandTotalEl.textContent  = '0,00 zł';
      dispatchPrice(0);
      return;
    }
    if (summaryEl) summaryEl.style.display = '';

    fileListEl.innerHTML = files.map(f => {
      const fmt      = (f.wMm > 0 && f.hMm > 0) ? detectFormat(f.wMm, f.hMm) : '';
      const skladFmt = (!fmt || fmt === 'nieformatowy') ? 'nieformat' : fmt;
      const dimsLabel = (f.wMm > 0 && f.hMm > 0)
        ? `${f.wMm}×${f.hMm} mm`
        : (f.blob?.type?.startsWith('image/') ? '⏳ wykrywanie…' : '— brak danych —');
      return `
        <div class="cad-file-item" data-fileid="${f.id}">
          <button class="cad-delete-x" data-delete="${f.id}"
                  aria-label="Usuń ${escHtml(f.name)}" title="Usuń plik">✕</button>
          <span class="cad-file-name" title="${escHtml(f.name)}">${escHtml(f.name)}</span>
          <span class="cad-file-size">${f.sizeMB} MB</span>
          <span class="cad-dims-label" style="color:var(--text-secondary);font-size:0.85rem;white-space:nowrap;">${escHtml(dimsLabel)}</span>
          ${fmt ? `<span class="cad-format-badge" data-badgeid="${f.id}">${escHtml(fmt)}</span>` : ''}
          <label class="cad-qty-label">
            Kop.:
            <input type="number" class="cad-qty-input" data-qtyid="${f.id}"
                   value="${f.qty}" min="1" max="999"
                   aria-label="Ilość kopii dla ${escHtml(f.name)}" />
          </label>
          <label class="cad-qty-label">
            Skład.:
            <input type="number" class="sklad-qty cad-qty-input" data-skladid="${f.id}" data-format="${escHtml(skladFmt)}"
                   value="${f.skladanieQty}" min="0" max="999" style="width:56px;"
                   aria-label="Ilość składań dla ${escHtml(f.name)}" />
          </label>
        </div>
      `;
    }).join('');

    recalculateAll();
  }

  // ── Główna kalkulacja ─────────────────────────────────────────────────────
  
  /**
   * NEW: Analyze dropped files and render results table (CUMULATIVE)
   * Handles PDF multi-page + single images
   * IMPORTANT: KUMULUJE do wszystkieWyniki (nie nadpisuje!)
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
      
      // KUMULUJ: PUSH do globalnego array zamiast nadpisywać!
      wszystkieWyniki = wszystkieWyniki.concat(result.details);
      console.log(`📦 AFTER: wszystkieWyniki.length = ${wszystkieWyniki.length}`);
      console.log(`📋 ALL RESULTS SO FAR:`, wszystkieWyniki);
      
      // Renderuj WSZYSTKIE wyniki (nie tylko nowe!)
      const totalAll = wszystkieWyniki.reduce((sum, d) => sum + d.price, 0);
      renderResultsTable(wszystkieWyniki, totalAll);
    } catch (err) {
      console.error('❌ Failed to analyze files:', err);
    }
  }

  function recalculateAll() {
    const mode = modeEl?.value || 'color';
    let multiplier = 1;
    if (optZapEl?.checked)  multiplier += 0.5;
    if (optPowEl?.checked)  multiplier += 0.5;
    const emailAddon = optEmailEl?.checked ? 1 : 0;

    const skanTotal  = updateSkan();
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
    if (tableBody) {
      if (rows.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-secondary)">Brak plików</td></tr>';
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
          const cm = parseFloat(document.getElementById('skanCm')?.value || 0);
          html += `<tr><td>🖨 Skan (${cm} cm)</td><td>—</td><td>—</td><td>${fmtPLN(skanTotal)}</td><td>${fmtPLN(skanTotal)}</td></tr>`;
        }
        if (emailAddon > 0) {
          html += `<tr><td>📧 Email</td><td>—</td><td>—</td><td>—</td><td>1,00 zł</td></tr>`;
        }
        tableBody.innerHTML = html;
      }
    }

    if (grandTotalEl) grandTotalEl.textContent = fmtPLN(grandTotal);
    if (totalEl)      totalEl.textContent       = fmtPLN(grandTotal);
    if (fileCountEl)  fileCountEl.textContent   = files.length;

    dispatchPrice(grandTotal);
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
