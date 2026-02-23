// dyplomy.js – kalkulator dyplomów druk cyfrowy
import { dyplomy as PRICING, modifiers } from '../prices.js';
import { formatPLN } from '../utils/common.js';

const VAT = 1 + modifiers.vat;

/** Pobierz cenę netto dla danej ilości (interpolacja schodkowa) */
function getNettoPrice(qty) {
  let tier = PRICING[0];
  for (const t of PRICING) {
    if (qty >= t.qty) tier = t;
    else break;
  }
  return tier.price;
}

export function init() {
  const calcBtn = document.getElementById('calcBtn');
  if (!calcBtn) return; // template not loaded

  const sidesSelect  = document.getElementById('dypSides');
  const qtyInput     = document.getElementById('dypQty');
  const paperSelect  = document.getElementById('dypPaper');
  const addToCartBtn = document.getElementById('addToCartBtn');
  const resultArea   = document.getElementById('dypResult');

  let lastBrutto = 0;

  function calculate() {
    const qty    = parseInt(qtyInput ? qtyInput.value : '1') || 1;
    const paper  = paperSelect ? paperSelect.value : 'kreda_200';
    const isSatin = paper.startsWith('satyna');

    const base = getNettoPrice(qty);
    let netto = base;
    if (isSatin) netto = parseFloat((netto * (1 + modifiers.satyna)).toFixed(2));

    const unitNetto = parseFloat((netto / qty).toFixed(2));
    lastBrutto = parseFloat((netto * VAT).toFixed(2));

    if (resultArea) resultArea.style.display = 'block';

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    const show = (id, v) => { const el = document.getElementById(id); if (el) el.style.display = v ? '' : 'none'; };

    set('resNettoPrice', formatPLN(netto));
    set('resUnitPrice', formatPLN(unitNetto));
    set('resTotalPrice', formatPLN(lastBrutto));

    const tierHint = document.getElementById('resTierHint');
    if (tierHint) {
      tierHint.textContent = `Dla ${qty} szt → przedział ceny bazowej: ${base.toFixed(2)} zł netto`;
    }

    show('resDiscountHint', qty >= 6);
    show('resSatinHint', isSatin);

    if (addToCartBtn) addToCartBtn.disabled = false;
  }

  calcBtn.addEventListener('click', calculate);

  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      if (lastBrutto === 0) calculate();
      // Cart integration handled by the SPA; emit a custom event for standalone use
      document.dispatchEvent(new CustomEvent('razdwa:addToCart', {
        detail: {
          category: 'Dyplomy',
          qty: parseInt(qtyInput ? qtyInput.value : '1') || 1,
          totalPrice: lastBrutto,
        },
      }));
    });
  }
}

export function destroy() {}
