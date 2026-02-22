// Plakaty – standalone calculator (loaded as HTML category fallback)
(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Pricing data
  // ---------------------------------------------------------------------------
  const SOLWENT_MATERIALS = {
    '200g-polysk': {
      name: '200g Połysk (solwent)',
      tiers: [
        { min: 1,  max: 3,    price: 70 },
        { min: 4,  max: 9,    price: 65 },
        { min: 10, max: 20,   price: 59 },
        { min: 21, max: 40,   price: 53 },
        { min: 41, max: null, price: 45 },
      ],
    },
    'blockout200g': {
      name: 'Blockout 200g Satyna (solwent)',
      tiers: [
        { min: 1,  max: 3,    price: 80 },
        { min: 4,  max: 9,    price: 75 },
        { min: 10, max: 20,   price: 70 },
        { min: 21, max: 40,   price: 65 },
        { min: 41, max: null, price: 60 },
      ],
    },
    '150g-polmat': {
      name: '150g Półmat (solwent)',
      tiers: [
        { min: 1,  max: 3,    price: 65 },
        { min: 4,  max: 9,    price: 60 },
        { min: 10, max: 20,   price: 55 },
        { min: 21, max: 40,   price: 50 },
        { min: 41, max: null, price: 42 },
      ],
    },
    '115g-mat': {
      name: '115g Matowy (solwent)',
      tiers: [
        { min: 1,  max: 3,    price: 45 },
        { min: 4,  max: 19,   price: 40 },
        { min: 20, max: null, price: 35 },
      ],
    },
  };

  const FORMAT_MATERIALS = {
    '120g-formatowe': {
      name: '120g Formatowe',
      discountGroup: '120g',
      prices: { '297x420': 9, '420x594': 12, '594x841': 18, '841x1189': 28, '914x1189': 34, '914x1292': 50, 'rolka1067': 68 },
    },
    '120g-nieformatowe': {
      name: '120g Nieformatowe',
      discountGroup: '120g',
      prices: { '297x420': 28, '420x594': 30, '594x841': 33, '841x1189': 35, '914x1292': 50, 'rolka1067': 63 },
    },
    '260g-satyna-formatowe': {
      name: '260g Satyna Formatowe (fotoplakaty)',
      discountGroup: '260g',
      prices: { '297x420': 23, '420x594': 39, '594x841': 50, '841x1189': 80, '914x1292': 88 },
    },
    '260g-satyna-nieformatowe': {
      name: '260g Satyna Nieformatowe (fotoplakaty)',
      discountGroup: '260g',
      prices: { '297x420': 27, '420x594': 36, '594x841': 39.50, '841x1189': 66.70, '914x1292': 75.30 },
    },
    '180g-pp-formatowe': {
      name: '180g PP Formatowe',
      discountGroup: '120g',
      prices: { '297x420': 18, '420x594': 37, '610x841': 45, '841x1189': 70, '914x1292': 74 },
    },
    '180g-pp-nieformatowe': {
      name: '180g PP Nieformatowe',
      discountGroup: '120g',
      prices: { '297x420': 23, '420x594': 31, '610x841': 34, '841x1189': 62, '914x1292': 70.50 },
    },
  };

  const DISCOUNTS = {
    '120g': [
      { min: 2,  max: 5,    factor: 0.95 },
      { min: 6,  max: 20,   factor: 0.92 },
      { min: 21, max: 30,   factor: 0.87 },
    ],
    '260g': [
      { min: 9,  max: 20,   factor: 0.93 },
      { min: 21, max: 30,   factor: 0.88 },
    ],
  };

  const SOLWENT_IDS = new Set(Object.keys(SOLWENT_MATERIALS));
  const MIN_M2 = 1.0;

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  function findTier(tiers, qty) {
    return tiers.find(t => qty >= t.min && (t.max === null || qty <= t.max)) || tiers[tiers.length - 1];
  }

  function findDiscount(group, qty) {
    const tiers = DISCOUNTS[group] || [];
    const t = tiers.find(d => qty >= d.min && (d.max === null || qty <= d.max));
    return t ? t.factor : 1.0;
  }

  function fmtPLN(val) {
    return val.toFixed(2).replace('.', ',') + ' zł';
  }

  // ---------------------------------------------------------------------------
  // DOM init
  // ---------------------------------------------------------------------------
  function init() {
    const materialSelect = document.getElementById('p-material');
    const formatGroup    = document.getElementById('p-format-group');
    const m2Group        = document.getElementById('p-m2-group');
    const formatSelect   = document.getElementById('p-format');
    const qtyInput       = document.getElementById('p-qty');
    const areaInput      = document.getElementById('p-area');
    const calcBtn        = document.getElementById('p-calculate');
    const addBtn         = document.getElementById('p-add-to-cart');
    const resultBox      = document.getElementById('p-result-display');
    const unitPriceEl    = document.getElementById('p-unit-price');
    const totalPriceEl   = document.getElementById('p-total-price');

    if (!materialSelect) return; // Template not loaded yet

    // Populate material select
    const allEntries = [
      ...Object.entries(SOLWENT_MATERIALS),
      ...Object.entries(FORMAT_MATERIALS),
    ];
    materialSelect.innerHTML = allEntries.map(([id, m]) =>
      `<option value="${id}">${m.name}</option>`
    ).join('');

    function updateFormatOptions(matId) {
      const mat = FORMAT_MATERIALS[matId];
      if (!mat) return;
      formatSelect.innerHTML = Object.keys(mat.prices)
        .map(k => `<option value="${k}">${k}</option>`)
        .join('');
    }

    function updateVisibility() {
      const matId = materialSelect.value;
      if (SOLWENT_IDS.has(matId)) {
        formatGroup.style.display = 'none';
        m2Group.style.display = '';
      } else {
        formatGroup.style.display = '';
        m2Group.style.display = 'none';
        updateFormatOptions(matId);
      }
    }

    materialSelect.addEventListener('change', updateVisibility);
    updateVisibility();

    let currentResult = null;

    calcBtn.addEventListener('click', function () {
      const matId = materialSelect.value;
      try {
        if (SOLWENT_IDS.has(matId)) {
          const mat = SOLWENT_MATERIALS[matId];
          const area = parseFloat(areaInput.value) || 1;
          const effectiveM2 = Math.max(area, MIN_M2);
          const tier = findTier(mat.tiers, effectiveM2);
          const basePrice = parseFloat((effectiveM2 * tier.price).toFixed(2));
          currentResult = { type: 'm2', matId, area, effectiveM2, tierPrice: tier.price, totalPrice: basePrice };
          unitPriceEl.textContent = fmtPLN(tier.price);
          totalPriceEl.textContent = fmtPLN(basePrice);
        } else {
          const mat = FORMAT_MATERIALS[matId];
          const fmt = formatSelect.value;
          const qty = parseInt(qtyInput.value, 10) || 1;
          const unitPrice = mat.prices[fmt];
          if (unitPrice === undefined) throw new Error('Brak ceny dla formatu ' + fmt);
          const factor = findDiscount(mat.discountGroup, qty);
          const pricePerPiece = parseFloat((unitPrice * factor).toFixed(2));
          const totalPrice = parseFloat((pricePerPiece * qty).toFixed(2));
          currentResult = { type: 'format', matId, fmt, qty, unitPrice, factor, pricePerPiece, totalPrice };
          unitPriceEl.textContent = fmtPLN(pricePerPiece);
          totalPriceEl.textContent = fmtPLN(totalPrice);
        }
        resultBox.style.display = 'block';
        if (addBtn) addBtn.disabled = false;
      } catch (err) {
        alert('Błąd: ' + err.message);
      }
    });
  }

  // Run after DOM is ready (script is injected into the container div)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
