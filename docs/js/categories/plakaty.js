// plakaty.js – kalkulator plakatów (solwent + formatowe/nieformatowe)
// Konwertowany z docs/categories/plakaty.js na ES module
import { plakatyMaterialySolwent, plakatyMaterialyFormat, plakatyRabaty } from '../prices.js';
import { formatPLN } from '../utils/common.js';

const SOLWENT_IDS = new Set(Object.keys(plakatyMaterialySolwent));
const MIN_M2 = 1.0;

/** Znajdź próg cenowy dla m² (solwent) */
function findTierM2(tiers, area) {
  return tiers.find(t => area >= t.min && (t.max === null || area <= t.max)) || tiers[tiers.length - 1];
}

/** Znajdź współczynnik rabatu (formatowe) */
function findDiscount(group, qty) {
  const tiers = plakatyRabaty[group] || [];
  const t = tiers.find(d => qty >= d.min && (d.max === null || qty <= d.max));
  return t ? t.factor : 1.0;
}

export function init() {
  const materialSelect = document.getElementById('p-material');
  if (!materialSelect) return; // template not loaded

  const formatGroup   = document.getElementById('p-format-group');
  const m2Group       = document.getElementById('p-m2-group');
  const formatSelect  = document.getElementById('p-format');
  const qtyInput      = document.getElementById('p-qty');
  const areaInput     = document.getElementById('p-area');
  const calcBtn       = document.getElementById('p-calculate');
  const addBtn        = document.getElementById('p-add-to-cart');
  const resultBox     = document.getElementById('p-result-display');
  const unitPriceEl   = document.getElementById('p-unit-price');
  const totalPriceEl  = document.getElementById('p-total-price');

  // Populate material select
  const allEntries = [
    ...Object.entries(plakatyMaterialySolwent),
    ...Object.entries(plakatyMaterialyFormat),
  ];
  materialSelect.innerHTML = allEntries
    .map(([id, m]) => `<option value="${id}">${m.name}</option>`)
    .join('');

  function updateFormatOptions(matId) {
    const mat = plakatyMaterialyFormat[matId];
    if (!mat || !formatSelect) return;
    formatSelect.innerHTML = Object.keys(mat.prices)
      .map(k => `<option value="${k}">${k}</option>`)
      .join('');
  }

  function updateVisibility() {
    const matId = materialSelect.value;
    if (SOLWENT_IDS.has(matId)) {
      if (formatGroup) formatGroup.style.display = 'none';
      if (m2Group)     m2Group.style.display = '';
    } else {
      if (formatGroup) formatGroup.style.display = '';
      if (m2Group)     m2Group.style.display = 'none';
      updateFormatOptions(matId);
    }
  }

  materialSelect.addEventListener('change', updateVisibility);
  updateVisibility();

  let currentResult = null;

  if (calcBtn) {
    calcBtn.addEventListener('click', () => {
      const matId = materialSelect.value;
      try {
        if (SOLWENT_IDS.has(matId)) {
          const mat  = plakatyMaterialySolwent[matId];
          const area = parseFloat(areaInput ? areaInput.value : '1') || 1;
          const effectiveM2 = Math.max(area, MIN_M2);
          const tier = findTierM2(mat.tiers, effectiveM2);
          const totalPrice = parseFloat((effectiveM2 * tier.price).toFixed(2));
          currentResult = { type: 'm2', matId, area, effectiveM2, tierPrice: tier.price, totalPrice };
          if (unitPriceEl)  unitPriceEl.textContent  = formatPLN(tier.price) + '/m²';
          if (totalPriceEl) totalPriceEl.textContent = formatPLN(totalPrice);
        } else {
          const mat = plakatyMaterialyFormat[matId];
          const fmt = formatSelect ? formatSelect.value : '';
          const qty = parseInt(qtyInput ? qtyInput.value : '1') || 1;
          const unitPrice = mat.prices[fmt];
          if (unitPrice === undefined) throw new Error('Brak ceny dla formatu ' + fmt);
          const factor = findDiscount(mat.discountGroup, qty);
          const pricePerPiece = parseFloat((unitPrice * factor).toFixed(2));
          const totalPrice = parseFloat((pricePerPiece * qty).toFixed(2));
          currentResult = { type: 'format', matId, fmt, qty, unitPrice, factor, pricePerPiece, totalPrice };
          if (unitPriceEl)  unitPriceEl.textContent  = formatPLN(pricePerPiece);
          if (totalPriceEl) totalPriceEl.textContent = formatPLN(totalPrice);
        }
        if (resultBox) resultBox.style.display = 'block';
        if (addBtn)    addBtn.disabled = false;
      } catch (err) {
        alert('Błąd: ' + err.message);
      }
    });
  }

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      if (!currentResult) return;
      document.dispatchEvent(new CustomEvent('razdwa:addToCart', { detail: { category: 'Plakaty', ...currentResult } }));
    });
  }
}

export function destroy() {}
