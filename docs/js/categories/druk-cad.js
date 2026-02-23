// druk-cad.js – kalkulator druku CAD wielkoformatowego
import { drukCad } from '../prices.js';
import { formatPLN } from '../utils/common.js';

/** Bazowe długości formatów (mm) dla wykrywania trybu formatowy/nieformatowy */
const BASE_LENGTHS = drukCad.baseLengthMm;

/** Tolerancja (mm) przy sprawdzaniu długości formatowej */
const TOLERANCE_MM = 5;

/** Sprawdź czy podana długość jest formatową dla danego formatu */
function isFormatLength(format, lengthMm) {
  const base = BASE_LENGTHS[format];
  if (base === undefined) return false;
  return Math.abs(lengthMm - base) <= TOLERANCE_MM;
}

/** Pobierz cenę formatową */
function getFormatowyPrice(mode, format) {
  return drukCad.formatowe[mode][format] || 0;
}

/** Pobierz cenę nieformatową (metr bieżący) */
function getMetrPrice(mode, format) {
  const width = drukCad.widths[format] || drukCad.widths['A0+'];
  return drukCad.metrBiezacy[mode][width] || 0;
}

export function init() {
  const calcBtn = document.getElementById('cad-calculate');
  if (!calcBtn) return; // template not loaded

  const modeSelect    = document.getElementById('cad-mode');
  const formatSelect  = document.getElementById('cad-format');
  const lengthInput   = document.getElementById('cad-length');
  const useBaseBtn    = document.getElementById('cad-use-base');
  const baseInfoEl    = document.getElementById('cad-base-info');
  const qtySheetsInput = document.getElementById('qty-sheets');
  const resultDisplay = document.getElementById('cad-result-display');
  const priceTypeEl   = document.getElementById('cad-price-type');
  const totalPriceEl  = document.getElementById('cad-total-price');
  const addToCartBtn  = document.getElementById('cad-add-to-cart');

  let lastResult = null;

  /** Aktualizuj widoczny wymiar bazowy formatu */
  function updateBaseInfo() {
    if (!formatSelect || !baseInfoEl) return;
    const fmt = formatSelect.value;
    const base = BASE_LENGTHS[fmt];
    if (base && lengthInput) {
      baseInfoEl.textContent = `Wymiar bazowy: ${base} mm`;
    }
  }

  if (formatSelect) formatSelect.addEventListener('change', updateBaseInfo);
  if (useBaseBtn && formatSelect && lengthInput) {
    useBaseBtn.addEventListener('click', () => {
      const base = BASE_LENGTHS[formatSelect.value];
      if (base) lengthInput.value = base;
    });
  }

  updateBaseInfo();

  calcBtn.addEventListener('click', () => {
    const mode    = modeSelect ? modeSelect.value : 'bw';
    const format  = formatSelect ? formatSelect.value : 'A0p';
    // Normalize format key: 'A0p' in HTML → 'A0+' in prices
    const fmtKey  = format === 'A0p' ? 'A0+' : format;
    const lengthMm = lengthInput ? (parseFloat(lengthInput.value) || 0) : 0;
    const qty     = qtySheetsInput ? (parseInt(qtySheetsInput.value) || 1) : 1;

    const formatowy = isFormatLength(fmtKey, lengthMm);
    let unitPrice, label;

    if (formatowy) {
      unitPrice = getFormatowyPrice(mode, fmtKey);
      label = `Cena formatowa ${fmtKey} (${mode === 'bw' ? 'Cz-B' : 'Kolor'}):`;
    } else {
      const pricePerMb = getMetrPrice(mode, fmtKey);
      unitPrice = pricePerMb * (lengthMm / 1000);
      label = `Cena nieformatowa ${fmtKey} × ${(lengthMm / 1000).toFixed(3)} m (${mode === 'bw' ? 'Cz-B' : 'Kolor'}):`;
    }

    const totalPrice = parseFloat((unitPrice * qty).toFixed(2));
    lastResult = { totalPrice, label };

    if (priceTypeEl) priceTypeEl.textContent = label;
    if (totalPriceEl) totalPriceEl.textContent = formatPLN(totalPrice);
    if (resultDisplay) resultDisplay.style.display = '';
    if (addToCartBtn)  addToCartBtn.disabled = false;
  });

  // ── CAD Ops ───────────────────────────────────────────────────────────────
  const opsItems     = [];
  const opsListEl    = document.getElementById('cad-ops-list');
  const opsListItemsEl = document.getElementById('cad-ops-list-items');
  const opsTotalEl   = document.getElementById('cad-ops-total');

  function renderOpsList() {
    if (!opsListEl) return;
    if (opsItems.length === 0) { opsListEl.style.display = 'none'; return; }
    opsListEl.style.display = 'block';
    if (opsListItemsEl) {
      opsListItemsEl.innerHTML = opsItems.map((item, i) =>
        `<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid rgba(34,197,94,0.2)">
          <span>${item.label}</span>
          <span>${formatPLN(item.price)}</span>
          <button data-remove-ops="${i}" style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:16px;">✕</button>
        </div>`
      ).join('');
    }
    if (opsTotalEl) opsTotalEl.textContent = formatPLN(opsItems.reduce((s, x) => s + x.price, 0));
  }

  if (opsListItemsEl) {
    opsListItemsEl.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-remove-ops]');
      if (btn) {
        const idx = parseInt(btn.getAttribute('data-remove-ops') || '-1');
        if (idx >= 0) { opsItems.splice(idx, 1); renderOpsList(); }
      }
    });
  }

  const foldAddBtn = document.getElementById('cad-fold-add');
  if (foldAddBtn) {
    foldAddBtn.addEventListener('click', () => {
      const fmt  = document.getElementById('cad-fold-format').value;
      const qty  = parseInt(document.getElementById('cad-fold-qty').value) || 1;
      const price = (drukCad.skladanie[fmt] || 0) * qty;
      opsItems.push({ label: `Składanie ${fmt} × ${qty} szt`, price });
      renderOpsList();
    });
  }

  const wfScanAddBtn = document.getElementById('cad-wf-scan-add');
  if (wfScanAddBtn) {
    wfScanAddBtn.addEventListener('click', () => {
      const mm  = parseFloat(document.getElementById('cad-wf-scan-mm').value) || 0;
      const qty = parseInt(document.getElementById('cad-wf-scan-qty').value) || 1;
      if (mm <= 0) { alert('Podaj długość w mm'); return; }
      opsItems.push({ label: `Skan wielkoformat ${mm}mm × ${qty} szt`, price: drukCad.skanowanie * mm * qty });
      renderOpsList();
    });
  }
}

export function destroy() {}
