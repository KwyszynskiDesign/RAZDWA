// roll-up.js – kalkulator roll-up jednostronny
import { rollUp as PRICES, modifiers } from '../prices.js';
import { formatPLN } from '../utils/common.js';

function getFullUnitPrice(format, qty) {
  const tiers = PRICES.full[format];
  if (!tiers) return 0;
  for (const [maxQty, price] of tiers) {
    if (qty <= maxQty) return price;
  }
  return tiers[tiers.length - 1][1];
}

export function init() {
  const calcBtn = document.getElementById('calcBtn');
  if (!calcBtn) return;

  const typeSelect   = document.getElementById('rollUpType');
  const formatSelect = document.getElementById('rollUpFormat');
  const qtyInput     = document.getElementById('rollUpQty');
  const addBtn       = document.getElementById('addToCartBtn');
  const resultArea   = document.getElementById('rollUpResult');

  let lastTotal = 0;

  calcBtn.addEventListener('click', () => {
    const type   = typeSelect ? typeSelect.value : 'full';
    const format = formatSelect ? formatSelect.value : '85x200';
    const qty    = parseInt(qtyInput ? qtyInput.value : '1') || 1;

    let unitPrice, total;
    if (type === 'full') {
      unitPrice = getFullUnitPrice(format, qty);
      total = parseFloat((unitPrice * qty).toFixed(2));
    } else {
      // Wymiana wkładu: robocizna stała + m² materiału
      const dims   = format.split('x').map(Number);
      const widthM = (dims[0] || 85) / 100;
      const heightM = (dims[1] || 200) / 100;
      const areaM2 = widthM * heightM;
      unitPrice = PRICES.replacement.labor + PRICES.replacement.m2 * areaM2;
      total = parseFloat((unitPrice * qty).toFixed(2));
    }
    lastTotal = total;

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('resUnitPrice', formatPLN(unitPrice));
    set('resTotalPrice', formatPLN(total));
    if (resultArea) resultArea.style.display = '';
  });

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('razdwa:addToCart', { detail: { category: 'Roll-up', totalPrice: lastTotal } }));
    });
  }
}

export function destroy() {}
