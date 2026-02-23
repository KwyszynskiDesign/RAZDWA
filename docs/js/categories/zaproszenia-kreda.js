// zaproszenia-kreda.js – kalkulator zaproszeń kreda
import { zaproszeniaKreda as PRICES, modifiers } from '../prices.js';
import { formatPLN } from '../utils/common.js';

const VAT = 1 + modifiers.vat;

/** Pobierz cenę netto dla formatu, strony i ilości (schodkowa interpolacja) */
function getNettoPrice(format, sides, qty) {
  const key = sides === '2' ? 'dwu' : 'jedno';
  const tiers = (PRICES[format] || PRICES.A6)[key];
  if (!tiers) return 0;
  let price = tiers[0][1];
  for (const [maxQty, p] of tiers) {
    if (qty >= maxQty) price = p;
    else break;
  }
  return price;
}

export function init() {
  const calcBtn = document.getElementById('calcBtn');
  if (!calcBtn) return;

  const formatSelect  = document.getElementById('zapFormat');
  const sidesSelect   = document.getElementById('zapSides');
  const foldedChk     = document.getElementById('zapFolded');
  const qtyInput      = document.getElementById('zapQty');
  const paperSelect   = document.getElementById('zapPaper');
  const addBtn        = document.getElementById('addToCartBtn');
  const resultArea    = document.getElementById('zapResult');

  let lastBrutto = 0;

  calcBtn.addEventListener('click', () => {
    const format  = formatSelect ? formatSelect.value : 'A6';
    const sides   = sidesSelect ? sidesSelect.value : '1';
    const qty     = parseInt(qtyInput ? qtyInput.value : '10') || 10;
    const paper   = paperSelect ? paperSelect.value : 'kreda_200';
    const isSatin = paper.startsWith('satyna');

    let netto = getNettoPrice(format, sides, qty);
    if (isSatin) netto = parseFloat((netto * (1 + modifiers.satyna)).toFixed(2));
    const unitNetto = parseFloat((netto / qty).toFixed(2));
    lastBrutto = parseFloat((netto * VAT).toFixed(2));

    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    const show = (id, vis) => { const el = document.getElementById(id); if (el) el.style.display = vis ? '' : 'none'; };

    set('resNettoPrice', formatPLN(netto));
    set('resUnitPrice', formatPLN(unitNetto));
    set('resTotalPrice', formatPLN(lastBrutto));
    show('resSatinHint', isSatin);

    if (resultArea) resultArea.style.display = '';
  });

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      document.dispatchEvent(new CustomEvent('razdwa:addToCart', { detail: { category: 'Zaproszenia Kreda', totalPrice: lastBrutto } }));
    });
  }
}

export function destroy() {}
