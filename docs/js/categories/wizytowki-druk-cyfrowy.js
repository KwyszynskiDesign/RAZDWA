// wizytowki-druk-cyfrowy.js – kalkulator wizytówek druk cyfrowy
// Ceny BRUTTO (z VAT) – nie mnożymy przez VAT
import { wizytowki as PRICES } from '../prices.js';
import { formatPLN } from '../utils/common.js';

/** Zaokrąglij do najbliższego (wyższego) progu z tabeli */
function ceilToTableKey(table, qty) {
  if (!table || typeof table !== 'object') return null;
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
  if (!keys.length) return null;
  const found = keys.find(k => qty <= k);
  return found != null ? found : keys[keys.length - 1];
}

export function init() {
  const calcBtn = document.getElementById('w-calculate');
  if (!calcBtn) return;

  const familySelect  = document.getElementById('w-family');
  const finishSelect  = document.getElementById('w-finish');
  const sizeSelect    = document.getElementById('w-size');
  const lamSelect     = document.getElementById('w-lam');
  const deluxeSelect  = document.getElementById('w-deluxe-opt');
  const qtyInput      = document.getElementById('w-qty');
  const addBtn        = document.getElementById('w-add-to-cart');
  const resultDisplay = document.getElementById('w-result-display');
  const standardOpts  = document.getElementById('standard-options');
  const deluxeOpts    = document.getElementById('deluxe-options');
  const lamGroup      = document.getElementById('w-lam-group');

  function updateVisibility() {
    const isDeluxe = familySelect && familySelect.value === 'deluxe';
    const isSofttouch = finishSelect && finishSelect.value === 'softtouch';
    if (standardOpts) standardOpts.style.display = isDeluxe ? 'none' : '';
    if (deluxeOpts)   deluxeOpts.style.display   = isDeluxe ? '' : 'none';
    if (lamGroup)     lamGroup.style.display      = (!isDeluxe && !isSofttouch) ? '' : 'none';
  }

  if (familySelect) familySelect.addEventListener('change', updateVisibility);
  if (finishSelect) finishSelect.addEventListener('change', updateVisibility);
  updateVisibility();

  let lastBrutto = 0;

  calcBtn.addEventListener('click', () => {
    const family     = familySelect ? familySelect.value : 'standard';
    const finish     = finishSelect ? finishSelect.value : 'mat';
    const size       = sizeSelect ? sizeSelect.value : '85x55';
    const lam        = lamSelect ? lamSelect.value : 'noLam';
    const deluxeOpt  = deluxeSelect ? deluxeSelect.value : 'uv3d_softtouch';
    const qty        = parseInt(qtyInput ? qtyInput.value : '100') || 100;

    let priceTable;
    if (family === 'deluxe') {
      const deluxePrices = PRICES.deluxe || {};
      priceTable = deluxePrices[deluxeOpt] || deluxePrices['uv3d_softtouch'];
    } else if (finish === 'softtouch') {
      const softtouchPrices = PRICES.softtouch || {};
      priceTable = softtouchPrices[size] || softtouchPrices['85x55'];
    } else {
      const lamKey = lam === 'lam' ? 'matt_gloss' : 'none';
      priceTable = (PRICES[size] || PRICES['85x55'])[lamKey];
    }

    const billedQty = ceilToTableKey(priceTable, qty);
    if (billedQty == null || !priceTable) return;
    lastBrutto = priceTable[billedQty];

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('w-total-price', formatPLN(lastBrutto));

    const billedHint = document.getElementById('w-billed-qty-hint');
    if (billedHint) billedHint.textContent = `Naliczono dla ${billedQty} szt (zaokrąglono w górę)`;

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
