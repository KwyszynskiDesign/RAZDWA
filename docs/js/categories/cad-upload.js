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
/** Wykryj format po KRÓTSZYM boku (szerokość rolki), identycznie jak w druk-cad. */
function detectFormat(wMm, hMm) {
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
  // A-FORMATY z tolerancją ±15mm
  if (inRange(short, 210, 297)) result = classifyA4(long);
  else if (inRange(short, 297, 420)) result = classifyA3(long);
  else if (inRange(short, 420, 594)) result = classifyA2(long);
  else if (inRange(short, 594, 841)) result = classifyA1(long);
  else if (inRange(short, 841, 1189)) result = classifyA0(long);
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
      const viewport = page.getViewport({ scale: 1.0 });
      
      // Convert from PDF points (1/72 inch) to mm (300 DPI)
      const widthMm = Math.round((viewport.width / 72) * 25.4);
      const heightMm = Math.round((viewport.height / 72) * 25.4);
      const format = detectFormat(widthMm, heightMm);

      console.log(`  Page ${i}: ${widthMm}×${heightMm}mm → ${format}`);
      
      pages.push({
        page: i,
        widthMm,
        heightMm,
        format
      });
    }

    // Calculate total price
    const totalPrice = pages.reduce((sum, p) => sum + calculatePagePrice(p.format, 'color'), 0);
    
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
 * Calculate price for single format (using drukCad prices)
 * @param {string} format - e.g., 'A4', 'A3', 'nieformatowy'
 * @param {string} mode - 'bw' or 'color'
 * @returns {number} price
 */
export function calculatePagePrice(format, mode = 'color') {
  const prices = {
    color: {
      'A4': 1.5, 'A3': 3.5, 'A2': 8.5, 'A1': 12, 'A0': 24, 'A0+': 26,
      'A4-custom': 1.5, 'A3-custom': 3.5, 'A2-custom': 8.5,
      'nieformatowy': 2.5
    },
    bw: {
      'A4': 0.9, 'A3': 1.7, 'A2': 4, 'A1': 6, 'A0': 11, 'A0+': 12.5,
      'A4-custom': 0.9, 'A3-custom': 1.7, 'A2-custom': 4,
      'nieformatowy': 1.5
    }
  };
  
  const modeData = prices[mode] || prices.color;
  return modeData[format] || modeData['nieformatowy'] || 2.5;
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
    
    if (fileName.endsWith('.pdf')) {
      // Analyze PDF multi-page
      const pdfData = await analyzePdf(file);
      if (pdfData.pages.length > 0) {
        total += pdfData.totalPrice;
        const pagesInfo = pdfData.pages.map(p => `${p.format}`).join(', ');
        details.push({
          idx: fileIdx++,
          file: file.name,
          type: 'PDF',
          pagesCount: pdfData.pages.length,
          pagesFormats: pagesInfo,
          price: pdfData.totalPrice
        });
        console.log(`  ✅ PDF: ${pdfData.totalPrice.toFixed(2)} zł (${pdfData.pages.length} pages)`);
      }
    } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png')) {
      // Single image file
      try {
        const dims = await detectImageDimensions(file);
        const format = detectFormat(dims.widthMm, dims.heightMm);
        const price = calculatePagePrice(format, 'color');
        total += price;
        details.push({
          idx: fileIdx++,
          file: file.name,
          type: 'Image',
          format: format,
          dimensions: `${dims.widthMm}×${dims.heightMm}mm`,
          price: price
        });
        console.log(`  ✅ Image: ${price.toFixed(2)} zł (${format})`);
      } catch (err) {
        console.warn(`  ⚠️ Could not read image: ${file.name}`);
      }
    }
  }

  console.log(`✅ Total: ${total.toFixed(2)} zł (${details.length} files)`);
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

  if (!container || !tbody || !totalPriceEl) {
    console.warn('⚠️ Results table elements not found');
    return;
  }

  if (details.length === 0) {
    container.style.display = 'none';
    return;
  }

  // Render table rows
  tbody.innerHTML = details.map(d => {
    const formatOrPages = d.type === 'PDF'
      ? `${d.pagesCount} str. (${d.pagesFormats})`
      : d.format;
    
    return `
      <tr>
        <td><strong>${escHtml(d.file)}</strong></td>
        <td>${d.type}</td>
        <td>${formatOrPages}</td>
        <td style="text-align:right;"><strong>${fmtPLN(d.price)}</strong></td>
      </tr>
    `;
  }).join('');

  // Update total
  totalPriceEl.textContent = fmtPLN(total);
  container.style.display = '';

  console.log(`✅ Results table rendered: ${details.length} entries, total ${fmtPLN(total)}`);
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
   * NEW: Analyze dropped files and render results table
   * Handles PDF multi-page + single images
   */
  async function analyzeAndRenderResults(fileList) {
    if (!fileList || fileList.length === 0) return;
    
    console.log(`🔄 Analyzing ${fileList.length} dropped files for results table...`);
    
    try {
      const result = await analyzeAllFiles(Array.from(fileList));
      renderResultsTable(result.details, result.total);
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
