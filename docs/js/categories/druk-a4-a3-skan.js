// druk-a4-a3-skan.js – kalkulator druku A4/A3 + skanowanie
import priceManager from '../price-manager.js';
import { formatPLN } from '../utils/common.js';

/** Pobierz cenę jednostkową dla danego trybu, formatu i ilości stron */
function getUnitPrice(mode, format, qty) {
  const path = `drukA4A3.print.${mode}.${format}`;
  const tiers = priceManager.getPrice(path);
  if (!tiers || !Array.isArray(tiers)) return 0;
  
  for (const tier of tiers) {
    if (qty >= tier.from && qty <= tier.to) {
      return tier.unit;
    }
  }
  // Fallback do ostatniego tier
  return tiers.length > 0 ? tiers[tiers.length - 1].unit : 0;
}

/** Pobierz cenę skanowania za stronę */
function getScanUnitPrice(type, qty) {
  const path = type === 'auto' ? 'drukA4A3.scan.auto' : 'drukA4A3.scan.manual';
  const tiers = priceManager.getPrice(path);
  if (!tiers || !Array.isArray(tiers)) return 0;
  
  for (const tier of tiers) {
    if (qty >= tier.from && qty <= tier.to) {
      return tier.unit;
    }
  }
  return tiers.length > 0 ? tiers[tiers.length - 1].unit : 0;
}

export function init() {
  const calcBtn       = document.getElementById('d-calculate');
  if (!calcBtn) return; // template not loaded

  const modeSelect    = document.getElementById('d-mode');
  const formatSelect  = document.getElementById('d-format');
  const printQtyInput = document.getElementById('d-print-qty');
  const emailChk      = document.getElementById('d-email');
  const surchargeQtyInput = document.getElementById('d-surcharge-qty');
  const scanTypeSelect = document.getElementById('d-scan-type');
  const scanQtyRow    = document.getElementById('scan-qty-row');
  const scanQtyInput  = document.getElementById('d-scan-qty');
  const addToCartBtn  = document.getElementById('d-add-to-cart');
  const resultDisplay = document.getElementById('d-result-display');

  // Show/hide scan qty input
  if (scanTypeSelect && scanQtyRow) {
    scanTypeSelect.addEventListener('change', () => {
      scanQtyRow.style.display = scanTypeSelect.value !== 'none' ? '' : 'none';
    });
  }

  /** Core calculation – called on button click and on qty input changes */
  function calculate() {
    const mode      = modeSelect ? modeSelect.value : 'bw';
    const format    = formatSelect ? formatSelect.value : 'A4';
    const printQty  = parseInt(printQtyInput ? printQtyInput.value : '0') || 0;

    const unitPrintPrice = printQty > 0 ? getUnitPrice(mode, format, printQty) : 0;
    const totalPrintPrice = unitPrintPrice * printQty;

    const rawSurchargeQty = surchargeQtyInput ? (parseInt(surchargeQtyInput.value) || 0) : 0;
    const surchargeQty = Math.min(rawSurchargeQty, printQty);
    const surchargePrice = unitPrintPrice * 0.5 * surchargeQty;

    const scanType = scanTypeSelect ? scanTypeSelect.value : 'none';
    const scanQty  = (scanType !== 'none' && scanQtyInput) ? (parseInt(scanQtyInput.value) || 0) : 0;
    const unitScanPrice = scanQty > 0 ? getScanUnitPrice(scanType, scanQty) : 0;
    const totalScanPrice = unitScanPrice * scanQty;

    const emailChecked = emailChk ? emailChk.checked : false;
    const emailPrice = emailChecked ? (priceManager.getPrice('drukA4A3.email_price') || 1.0) : 0;

    const total = totalPrintPrice + surchargePrice + totalScanPrice + emailPrice;

    // Display results
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const show = (id, visible) => { const el = document.getElementById(id); if (el) el.style.display = visible ? '' : 'none'; };

    set('d-unit-print-price', formatPLN(unitPrintPrice));
    set('d-total-print-price', formatPLN(totalPrintPrice));
    set('d-total-scan-price', formatPLN(totalScanPrice));
    set('d-email-price', formatPLN(emailPrice));
    set('d-surcharge-price', formatPLN(surchargePrice));
    set('d-total-price', formatPLN(total));

    show('d-scan-row', scanType !== 'none' && scanQty > 0);
    show('d-email-row', emailChecked);
    show('d-surcharge-row', surchargeQty > 0);

    if (resultDisplay) resultDisplay.style.display = 'block';
    if (addToCartBtn)  addToCartBtn.disabled = (totalPrintPrice === 0);

    // Send monitor update event
    const modeLabel = mode === 'bw' ? 'Czarnobiały' : 'Kolorowy';
    const scanLabel = scanType === 'auto' ? 'Automatyczne' : scanType === 'manual' ? 'Ręczne z szyby' : 'Brak';
    const params = {
      'Tryb': modeLabel,
      'Format': format,
      'Ilość stron': printQty,
      'E-mail': emailChecked ? 'Tak' : 'Nie',
      'Zadruk >25%': surchargeQty > 0 ? `${surchargeQty} stron` : 'Nie',
      'Skanowanie': scanLabel + (scanQty > 0 ? ` (${scanQty} stron)` : ''),
    };
    const results = [];
    if (totalPrintPrice > 0) results.push(`Druk: ${formatPLN(totalPrintPrice)}`);
    if (surchargePrice > 0) results.push(`Dopłata zadruk: ${formatPLN(surchargePrice)}`);
    if (totalScanPrice > 0) results.push(`Skanowanie: ${formatPLN(totalScanPrice)}`);
    if (emailPrice > 0) results.push(`E-mail: ${formatPLN(emailPrice)}`);
    results.push(`Razem: ${formatPLN(total)}`);

    document.dispatchEvent(new CustomEvent('calcMonitorUpdate', { detail: { params, results } }));
  }

  calcBtn.addEventListener('click', calculate);

  // Dispatch priceUpdate when "Dodaj do listy" is clicked
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const mode   = modeSelect   ? modeSelect.value   : 'bw';
      const format = formatSelect ? formatSelect.value : 'A4';
      const totalEl = document.getElementById('d-total-price');
      const price = totalEl ? parseFloat(totalEl.textContent?.replace(',', '.').replace(/[^\d.]/g, '') || '0') : 0;
      const name = `Druk ${format} ${mode === 'color' ? 'Kolor' : 'C/B'}`;
      window.dispatchEvent(new CustomEvent('priceUpdate', {
        detail: { id: `druk-a4-a3-${mode}-${format}`, price, name, cat: 'Druk A4/A3' }
      }));
    });
  }

  // Live update when qty inputs change
  [printQtyInput, surchargeQtyInput, scanQtyInput].forEach(input => {
    if (!input) return;
    input.addEventListener('input', calculate);
  });

  if (emailChk) {
    emailChk.addEventListener('change', calculate);
  }

  if (scanTypeSelect) {
    scanTypeSelect.addEventListener('change', calculate);
  }

  // ✅ Wyeksportuj calculate globalnie
  window.recalculateDrukA4A3 = calculate;
}

// ─── 🔄 NASŁUCHIWANIE NA ZMIANY CEN ──────────────────────────────
window.addEventListener('razdwa:pricesUpdated', () => {
  console.log('🔄 Ceny zmienione! Odświeżam druk A4/A3...');
  if (window.recalculateDrukA4A3) {
    window.recalculateDrukA4A3();
  }
});

export function destroy() {}


