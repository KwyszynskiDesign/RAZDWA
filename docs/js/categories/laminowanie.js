// laminowanie.js – kalkulator laminowania
import { laminowanie as PRICES } from '../prices.js';
import { formatPLN } from '../utils/common.js';

function getUnitPrice(format, qty) {
  const tiers = PRICES[format];
  if (!tiers) return 0;
  for (const [maxQty, price] of tiers) {
    if (qty <= maxQty) return price;
  }
  return tiers[tiers.length - 1][1];
}

export function init() {
  const calcBtn = document.getElementById('lam-calculate');
  if (!calcBtn) return;

  const formatSelect = document.getElementById('lam-format');
  const qtyInput     = document.getElementById('lam-qty');
  const addBtn       = document.getElementById('lam-add-to-cart');
  const resultDisplay = document.getElementById('lam-result-display');

  let lastTotal = 0;

  calcBtn.addEventListener('click', () => {
    const format = formatSelect ? formatSelect.value : 'A4';
    const qty    = parseInt(qtyInput ? qtyInput.value : '1') || 1;
    const unitPrice = getUnitPrice(format, qty);
    lastTotal = parseFloat((unitPrice * qty).toFixed(2));

    const el = document.getElementById('lam-total-price');
    if (el) el.textContent = formatPLN(lastTotal);
    if (resultDisplay) resultDisplay.style.display = '';
    if (addBtn) addBtn.disabled = false;
  });

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('razdwa:addToCart', { detail: { category: 'Laminowanie', totalPrice: lastTotal } }));
    });
  }
}

export function destroy() {}
