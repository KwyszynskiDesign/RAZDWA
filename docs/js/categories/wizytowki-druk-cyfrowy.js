// wizytowki-druk-cyfrowy.js – kalkulator wizytówek druk cyfrowy
import { wizytowki as PRICES, modifiers } from '../prices.js';
import { formatPLN } from '../utils/common.js';

const VAT = 1 + modifiers.vat;

const THRESHOLDS = [50, 100, 150, 200, 250, 300, 500, 1000];

/** Zaokrąglij do najbliższego (wyższego) progu */
function ceilToThreshold(qty) {
  for (const t of THRESHOLDS) {
    if (qty <= t) return t;
  }
  return THRESHOLDS[THRESHOLDS.length - 1];
}

export function init() {
  const calcBtn = document.getElementById('w-calculate');
  if (!calcBtn) return;

  const familySelect  = document.getElementById('w-family');
  const sizeSelect    = document.getElementById('w-size');
  const lamSelect     = document.getElementById('w-lam');
  const paperSelect   = document.getElementById('w-paper');
  const qtyInput      = document.getElementById('w-qty');
  const addBtn        = document.getElementById('w-add-to-cart');
  const resultDisplay = document.getElementById('w-result-display');
  const standardOpts  = document.getElementById('standard-options');
  const deluxeOpts    = document.getElementById('deluxe-options');

  if (familySelect) {
    familySelect.addEventListener('change', () => {
      const isDeluxe = familySelect.value === 'deluxe';
      if (standardOpts) standardOpts.style.display = isDeluxe ? 'none' : '';
      if (deluxeOpts)   deluxeOpts.style.display   = isDeluxe ? '' : 'none';
    });
  }

  let lastBrutto = 0;

  calcBtn.addEventListener('click', () => {
    const family = familySelect ? familySelect.value : 'standard';
    const size   = sizeSelect ? sizeSelect.value : '85x55';
    const lam    = lamSelect ? lamSelect.value : 'noLam';
    const paper  = paperSelect ? paperSelect.value : 'kreda_350';
    const qty    = parseInt(qtyInput ? qtyInput.value : '100') || 100;
    const isSatin = paper.startsWith('satyna');

    const billedQty = ceilToThreshold(qty);
    const lamKey = lam === 'lam' ? 'matt_gloss' : 'none';
    const priceTable = (PRICES[size] || PRICES['85x55'])[lamKey];
    const netto = priceTable[billedQty] || priceTable[THRESHOLDS[THRESHOLDS.length - 1]];
    let finalNetto = netto;
    if (isSatin) finalNetto = parseFloat((finalNetto * (1 + modifiers.satyna)).toFixed(2));
    lastBrutto = parseFloat((finalNetto * VAT).toFixed(2));

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('w-netto-price', formatPLN(finalNetto));
    set('w-total-price', formatPLN(lastBrutto));

    const billedHint = document.getElementById('w-billed-qty-hint');
    if (billedHint) billedHint.textContent = `Naliczono dla ${billedQty} szt (zaokrąglono w górę)`;

    const satin = document.getElementById('w-satin-hint');
    if (satin) satin.style.display = isSatin ? '' : 'none';

    if (resultDisplay) resultDisplay.style.display = 'block';
    if (addBtn) addBtn.disabled = false;
  });

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('razdwa:addToCart', { detail: { category: 'Wizytówki', totalPrice: lastBrutto } }));
    });
  }
}

export function destroy() {}
