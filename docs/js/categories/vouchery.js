// vouchery.js – kalkulator voucherów A4
import { vouchery as PRICING_FULL, modifiers } from '../prices.js';
import { formatPLN } from '../utils/common.js';

const VAT = 1 + modifiers.vat;

function getBasePrice(qty, isSingle) {
  let tier = PRICING_FULL[0];
  for (const t of PRICING_FULL) {
    if (qty >= t.qty) tier = t;
    else break;
  }
  return isSingle ? tier.single : tier.double;
}

export function init() {
  const calcBtn = document.getElementById('v-calculate');
  if (!calcBtn) return;

  const qtyInput    = document.getElementById('v-qty');
  const paperSelect = document.getElementById('v-paper');
  const addBtn      = document.getElementById('v-add-to-cart');
  const resultDisplay = document.getElementById('v-result-display');

  let lastBrutto = 0;

  const getSidesValue = () => {
    const radio = document.querySelector('input[name="v-sides"]:checked');
    return radio ? radio.value : 'single';
  };

  calcBtn.addEventListener('click', () => {
    const qty     = parseInt(qtyInput ? qtyInput.value : '1') || 1;
    const isSingle = getSidesValue() === 'single';
    const paper   = paperSelect ? paperSelect.value : 'kreda_200';
    const isSatin = paper.startsWith('satyna');

    let netto = getBasePrice(qty, isSingle);
    if (isSatin) netto = parseFloat((netto * (1 + modifiers.satyna)).toFixed(2));
    lastBrutto = parseFloat((netto * VAT).toFixed(2));

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    const show = (id, vis) => { const el = document.getElementById(id); if (el) el.style.display = vis ? '' : 'none'; };

    set('v-base-price', formatPLN(netto));
    set('v-netto-price', formatPLN(netto));
    set('v-total-price', formatPLN(lastBrutto));
    show('v-satin-hint', isSatin);

    if (resultDisplay) resultDisplay.style.display = 'block';
    if (addBtn) addBtn.disabled = false;
  });

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('razdwa:addToCart', { detail: { category: 'Vouchery', totalPrice: lastBrutto } }));
    });
  }
}

export function destroy() {}
