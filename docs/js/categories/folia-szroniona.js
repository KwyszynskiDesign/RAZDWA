// folia-szroniona.js – kalkulator folii szronionej
import { foliaS as PRICES, modifiers } from '../prices.js';
import { formatPLN } from '../utils/common.js';

function getTierPrice(tiers, area) {
  for (const t of tiers) {
    if (area >= t.min && (t.max === null || area <= t.max)) return t.price;
  }
  return tiers[tiers.length - 1].price;
}

export function init() {
  const calcBtn = document.getElementById('fs-calculate');
  if (!calcBtn) return;

  const serviceSelect = document.getElementById('fs-service');
  const widthInput    = document.getElementById('fs-width');
  const heightInput   = document.getElementById('fs-height');
  const addBtn        = document.getElementById('fs-add-to-cart');
  const resultDisplay = document.getElementById('fs-result-display');
  const normalResult  = document.getElementById('fs-normal-result');
  const customQuote   = document.getElementById('fs-custom-quote');

  let lastTotal = 0;

  calcBtn.addEventListener('click', () => {
    const service = serviceSelect ? serviceSelect.value : 'material-only';
    const wMm     = parseFloat(widthInput ? widthInput.value : '1000') || 1000;
    const hMm     = parseFloat(heightInput ? heightInput.value : '1000') || 1000;
    const area    = parseFloat(((wMm / 1000) * (hMm / 1000)).toFixed(4));

    if (resultDisplay) resultDisplay.style.display = '';

    if (area > 20) {
      if (normalResult) normalResult.style.display = 'none';
      if (customQuote)  customQuote.style.display = '';
      return;
    }
    if (normalResult) normalResult.style.display = '';
    if (customQuote)  customQuote.style.display = 'none';

    const tiers = service === 'full-service' ? PRICES.oklejanie : PRICES.wydruk;
    const unitPrice = getTierPrice(tiers, area);
    lastTotal = parseFloat((unitPrice * area).toFixed(2));

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('fs-area-val', area.toFixed(2) + ' m²');
    set('fs-unit-price', formatPLN(unitPrice) + '/m²');
    set('fs-total-price', formatPLN(lastTotal));

    if (addBtn) addBtn.disabled = false;
  });

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('razdwa:addToCart', { detail: { category: 'Folia Szroniona', totalPrice: lastTotal } }));
    });
  }
}

export function destroy() {}
