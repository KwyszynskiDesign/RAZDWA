// druk-a4-a3-skan.js – kalkulator druku A4/A3 + skanowanie
import { drukA4A3 } from '../prices.js';
import { formatPLN } from '../utils/common.js';

/** Pobierz cenę jednostkową dla danego trybu, formatu i ilości stron */
function getUnitPrice(mode, format, qty) {
  const tiers = drukA4A3[mode][format];
  if (!tiers) return 0;
  for (const [maxQty, price] of tiers) {
    if (qty <= maxQty) return price;
  }
  return tiers[tiers.length - 1][1];
}

/** Pobierz cenę skanowania za stronę */
function getScanUnitPrice(type, qty) {
  const tiers = type === 'auto' ? drukA4A3.skanAuto : drukA4A3.skanReczne;
  for (const [maxQty, price] of tiers) {
    if (qty <= maxQty) return price;
  }
  return tiers[tiers.length - 1][1];
}

export function init() {
  const calcBtn       = document.getElementById('d-calculate');
  if (!calcBtn) return; // template not loaded

  const modeSelect    = document.getElementById('d-mode');
  const formatSelect  = document.getElementById('d-format');
  const printQtyInput = document.getElementById('d-print-qty');
  const emailCard     = document.getElementById('d-email-card');
  const emailChk      = document.getElementById('d-email');
  const surchargeCard = document.getElementById('d-surcharge-card');
  const surchargeChk  = document.getElementById('d-surcharge');
  const surchargeRow  = document.getElementById('surcharge-qty-row');
  const surchargeQtyInput = document.getElementById('d-surcharge-qty');
  const scanTypeSelect = document.getElementById('d-scan-type');
  const scanQtyRow    = document.getElementById('scan-qty-row');
  const scanQtyInput  = document.getElementById('d-scan-qty');
  const addToCartBtn  = document.getElementById('d-add-to-cart');
  const resultDisplay = document.getElementById('d-result-display');

  // Toggle option cards
  [
    { card: emailCard,     chk: emailChk },
    { card: surchargeCard, chk: surchargeChk },
  ].forEach(({ card, chk }) => {
    if (!card || !chk) return;
    card.addEventListener('click', () => {
      chk.checked = !chk.checked;
      card.dataset.checked = String(chk.checked);
      card.setAttribute('aria-checked', String(chk.checked));
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // Show/hide surcharge qty input
  if (surchargeChk && surchargeRow) {
    surchargeChk.addEventListener('change', () => {
      surchargeRow.style.display = surchargeChk.checked ? '' : 'none';
    });
  }

  // Show/hide scan qty input
  if (scanTypeSelect && scanQtyRow) {
    scanTypeSelect.addEventListener('change', () => {
      scanQtyRow.style.display = scanTypeSelect.value !== 'none' ? '' : 'none';
    });
  }

  // Calculate
  calcBtn.addEventListener('click', () => {
    const mode      = modeSelect ? modeSelect.value : 'bw';
    const format    = formatSelect ? formatSelect.value : 'A4';
    const printQty  = parseInt(printQtyInput ? printQtyInput.value : '0') || 0;

    const unitPrintPrice = printQty > 0 ? getUnitPrice(mode, format, printQty) : 0;
    const totalPrintPrice = unitPrintPrice * printQty;

    const surchargeChecked = surchargeChk ? surchargeChk.checked : false;
    const surchargeQty = surchargeChecked && surchargeQtyInput
      ? (parseInt(surchargeQtyInput.value) || 0) : 0;
    const surchargePrice = unitPrintPrice * 0.5 * surchargeQty;

    const scanType = scanTypeSelect ? scanTypeSelect.value : 'none';
    const scanQty  = (scanType !== 'none' && scanQtyInput) ? (parseInt(scanQtyInput.value) || 0) : 0;
    const unitScanPrice = scanQty > 0 ? getScanUnitPrice(scanType, scanQty) : 0;
    const totalScanPrice = unitScanPrice * scanQty;

    const emailChecked = emailChk ? emailChk.checked : false;
    const emailPrice = emailChecked ? drukA4A3.email : 0;

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
    show('d-surcharge-row', surchargeChecked);

    if (resultDisplay) resultDisplay.style.display = 'block';
    if (addToCartBtn)  addToCartBtn.disabled = (totalPrintPrice === 0);
  });
}

export function destroy() {}
