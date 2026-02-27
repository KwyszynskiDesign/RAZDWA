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

function getTierForQty(tiers, qty) {
  let tier = tiers[0];
  for (const t of tiers) {
    if (qty >= t.qty) tier = t;
    else break;
  }
  return tier;
}

export function init() {
  const calcBtn = document.getElementById('u-calculate') || document.getElementById('calcBtn');
  if (!calcBtn) return;

  const qtyInput    = document.getElementById('u-qty');
  const formatSelect = document.getElementById('u-format');
  const paperSelect = document.getElementById('u-paper');
  const addBtn      = document.getElementById('u-add-to-cart') || document.getElementById('addToCartBtn');
  const resultDisplay = document.getElementById('u-result-display') || document.getElementById('result');
  const tierHint = document.getElementById('u-tier-hint');
  const expressHint = document.getElementById('u-express-hint');
  const satinHint = document.getElementById('u-satin-hint');

  const VAT = 1 + modifiers.vat;

  let lastTotal = 0;

  function getSides() {
    const checked = document.querySelector('input[name="sides"]:checked');
    return checked ? checked.value : 'jednostronne';
  }

  function calculate() {
    const sides = getSides();
    const qty   = parseInt(qtyInput ? qtyInput.value : '100') || 100;
    const format = formatSelect ? formatSelect.value : 'A6';
    const paper = paperSelect ? paperSelect.value : 'kreda_170';
    const isSatin = paper.startsWith('satyna');

    const tiers = PRICES[sides] || PRICES.jednostronne;
    const tier = getTierForQty(tiers, qty);
    const baseNetto = tier.price;
    const netto = isSatin ? parseFloat((baseNetto * (1 + modifiers.satyna)).toFixed(2)) : baseNetto;
    const brutto = parseFloat((netto * VAT).toFixed(2));
    lastTotal = brutto;

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('u-netto-price', formatPLN(netto));
    set('u-total-price', formatPLN(brutto));

    if (tierHint) {
      tierHint.textContent = `Wybrany próg: ${tier.qty} szt. → ${formatPLN(baseNetto)} netto (${sides}, ${format})`;
    }
    if (expressHint) expressHint.style.display = 'none';
    if (satinHint) satinHint.style.display = isSatin ? '' : 'none';

    if (resultDisplay) resultDisplay.style.display = '';
    if (addBtn) addBtn.disabled = false;
  }

  calcBtn.addEventListener('click', calculate);

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const qty = parseInt(qtyInput ? qtyInput.value : '100') || 100;
      const sides = getSides();
      const format = formatSelect ? formatSelect.value : 'A6';
      const paper = paperSelect ? paperSelect.value : 'kreda_170';
      document.dispatchEvent(new CustomEvent('razdwa:addToCart', {
        detail: {
          category: 'Ulotki Cyfrowe',
          qty,
          sides,
          format,
          paper,
          totalPrice: lastTotal,
        },
      }));
    });
  }

  // Render cenniki (always visible)
  const singleBody = document.querySelector('#u-table-single tbody');
  const doubleBody = document.querySelector('#u-table-double tbody');
  const renderTable = (tiers, body) => {
    if (!body) return;
    body.innerHTML = '';
    tiers.forEach(t => {
      const brutto = parseFloat((t.price * VAT).toFixed(2));
      const row = document.createElement('tr');
      row.innerHTML = `<td>${t.qty} szt</td><td>${formatPLN(t.price)}</td><td>${formatPLN(brutto)}</td>`;
      body.appendChild(row);
    });
  };
  renderTable(PRICES.jednostronne, singleBody);
  renderTable(PRICES.dwustronne, doubleBody);
}

export function destroy() {}
