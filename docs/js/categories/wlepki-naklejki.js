// wlepki-naklejki.js – kalkulator wlepek / naklejek
import { wlepki as PRICES, modifiers } from '../prices.js';
import { formatPLN } from '../utils/common.js';

function getTierPrice(tiers, area) {
  for (const t of tiers) {
    if (area >= t.min && (t.max === null || area <= t.max)) return t.price;
  }
  return tiers[tiers.length - 1].price;
}

export function init() {
  const calcBtn = document.getElementById('btn-calculate');
  if (!calcBtn) return;

  const groupSelect  = document.getElementById('wlepki-group');
  const areaInput    = document.getElementById('wlepki-area');
  const modCheckboxes = document.querySelectorAll('.wlepki-mod');
  const addBtn       = document.getElementById('btn-add-to-cart');
  const resultDisplay = document.getElementById('wlepki-result');

  let lastTotal = 0;

  calcBtn.addEventListener('click', () => {
    const group   = groupSelect ? groupSelect.value : 'wlepki_obrys_folia';
    const area    = parseFloat(areaInput ? areaInput.value : '1') || 1;
    const effArea = Math.max(area, 1.0); // minimalka 1 m²

    const tiers = PRICES[group] || PRICES.wlepki_obrys_folia;
    let unitPrice = getTierPrice(tiers, effArea);

    // Apply modifiers
    const selectedMods = [...modCheckboxes].filter(cb => cb.checked).map(cb => cb.value);
    let additive = 0;
    for (const mod of selectedMods) {
      if (mod === 'mocny_klej') {
        unitPrice = parseFloat((unitPrice * (1 + PRICES.modifiers.mocnyKlej)).toFixed(4));
      } else if (mod === 'arkusze') {
        additive += PRICES.modifiers.arkusze;
      } else if (mod === 'pojedyncze') {
        additive += PRICES.modifiers.pojedyncze;
      }
    }
    const totalUnitPrice = unitPrice + additive;
    lastTotal = parseFloat((totalUnitPrice * effArea).toFixed(2));

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('unit-price', formatPLN(totalUnitPrice) + '/m²');
    set('total-price', formatPLN(lastTotal));

    if (resultDisplay) resultDisplay.style.display = 'block';
  });

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('razdwa:addToCart', { detail: { category: 'Wlepki/Naklejki', totalPrice: lastTotal } }));
    });
  }
}

export function destroy() {}
