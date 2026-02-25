// solwent-plakaty.js – kalkulator plakatów solwentowych
import { solwent as PRICES, modifiers } from '../prices.js';
import { formatPLN } from '../utils/common.js';

function getTierPrice(tiers, area) {
  for (const t of tiers) {
    if (area >= t.min && (t.max === null || area <= t.max)) return t.price;
  }
  return tiers[tiers.length - 1].price;
}

export function init() {
  const calcBtn = document.getElementById('sp-calculate') || document.getElementById('calcBtn');
  if (!calcBtn) return;

  const materialSelect = document.getElementById('sp-material') || document.getElementById('material');
  const areaInput      = document.getElementById('sp-area') || document.getElementById('area');
  const addBtn         = document.getElementById('sp-add-to-cart') || document.getElementById('addToCartBtn');
  const resultDisplay  = document.getElementById('sp-result-display') || document.getElementById('result');

  let lastTotal = 0;

  calcBtn.addEventListener('click', () => {
    const matId  = materialSelect ? materialSelect.value : '200g';
    const area   = parseFloat(areaInput ? areaInput.value : '1') || 1;
    const effArea = Math.max(area, 1.0); // minimalka 1 m²

    const tiers = PRICES[matId] || PRICES['200g'];
    const unitPrice = getTierPrice(tiers, effArea);
    lastTotal = parseFloat((unitPrice * effArea).toFixed(2));

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('sp-unit-price', formatPLN(unitPrice) + '/m²');
    set('sp-total-price', formatPLN(lastTotal));

    if (resultDisplay) resultDisplay.style.display = '';
    if (addBtn) addBtn.disabled = false;
  });

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('razdwa:addToCart', { detail: { category: 'Solwent Plakaty', totalPrice: lastTotal } }));
    });
  }
}

export function destroy() {}
