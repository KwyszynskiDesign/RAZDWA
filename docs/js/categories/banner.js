// banner.js – kalkulator banerów
import { banner as PRICES, modifiers } from '../prices.js';
import { formatPLN } from '../utils/common.js';

function getTierPrice(tiers, area) {
  for (const t of tiers) {
    if (area >= t.min && (t.max === null || area <= t.max)) return t.price;
  }
  return tiers[tiers.length - 1].price;
}

export function init() {
  const calcBtn = document.getElementById('b-calculate');
  if (!calcBtn) return;

  const materialSelect = document.getElementById('b-material');
  const areaInput      = document.getElementById('b-area');
  const oczkowanieChk  = document.getElementById('b-oczkowanie');
  const addBtn         = document.getElementById('b-add-to-cart');
  const resultDisplay  = document.getElementById('b-result-display');

  let lastTotal = 0;

  calcBtn.addEventListener('click', () => {
    const material = materialSelect ? materialSelect.value : 'powlekany';
    const area     = parseFloat(areaInput ? areaInput.value : '1') || 1;
    const oczk     = oczkowanieChk ? oczkowanieChk.checked : false;

    const tiers    = PRICES[material] || PRICES.powlekany;
    const tierPrice = getTierPrice(tiers, area);
    let total      = parseFloat((tierPrice * area).toFixed(2));
    if (oczk) total = parseFloat((total + PRICES.oczkowanie * area).toFixed(2));
    lastTotal = total;

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('b-unit-price', formatPLN(tierPrice) + '/m²');
    set('b-total-price', formatPLN(total));

    if (resultDisplay) resultDisplay.style.display = 'block';
    if (addBtn) addBtn.disabled = false;
  });

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('razdwa:addToCart', { detail: { category: 'Banner', totalPrice: lastTotal } }));
    });
  }
}

export function destroy() {}
