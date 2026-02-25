// ulotki-cyfrowe.js – kalkulator ulotek cyfrowych
import { ulotki as PRICES, modifiers } from '../prices.js';
import { formatPLN } from '../utils/common.js';

/** Znajdź cenę dla danego nakładu (najbliższy próg ≤ qty) */
function getPriceForQty(tiers, qty) {
  let tier = tiers[0];
  for (const t of tiers) {
    if (qty >= t.qty) tier = t;
    else break;
  }
  return tier.price;
}

export function init() {
  const calcBtn = document.getElementById('ul-calculate') || document.getElementById('calcBtn');
  if (!calcBtn) return;

  const sidesSelect = document.getElementById('ul-sides');
  const qtyInput    = document.getElementById('ul-qty');
  const addBtn      = document.getElementById('ul-add-to-cart') || document.getElementById('addToCartBtn');
  const resultDisplay = document.getElementById('ul-result-display') || document.getElementById('result');

  let lastTotal = 0;

  calcBtn.addEventListener('click', () => {
    const sides = sidesSelect ? sidesSelect.value : 'jednostronne';
    const qty   = parseInt(qtyInput ? qtyInput.value : '100') || 100;
    const tiers = PRICES[sides] || PRICES.jednostronne;
    lastTotal = getPriceForQty(tiers, qty);

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('ul-total-price', formatPLN(lastTotal));

    if (resultDisplay) resultDisplay.style.display = '';
    if (addBtn) addBtn.disabled = false;
  });

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('razdwa:addToCart', { detail: { category: 'Ulotki Cyfrowe', totalPrice: lastTotal } }));
    });
  }
}

export function destroy() {}
