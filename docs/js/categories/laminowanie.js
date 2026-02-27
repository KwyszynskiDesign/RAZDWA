// laminowanie.js – kalkulator laminowania, bindowania, opraw
import { laminowanie as PRICES, bindowanie, oprawy } from '../prices.js';
import { formatPLN } from '../utils/common.js';

function getUnitPrice(format, qty) {
  const tiers = PRICES[format];
  if (!tiers) return 0;
  for (const [maxQty, price] of tiers) {
    if (qty <= maxQty) return price;
  }
  return tiers[tiers.length - 1][1];
}

function getBindingPrice(type, qty, pages) {
  const data = bindowanie[type];
  if (!data) return 0;
  
  let tier = '1-50';
  if (qty >= 101) tier = '101-200';
  else if (qty >= 51) tier = '51-100';
  
  if (type === 'plastik') {
    if (pages <= 20) return data[tier].do20;
    if (pages <= 100) return data[tier]['21-100'];
    return data[tier]['100+'];
  } else { // metal
    if (!data[tier]) return 0;
    if (pages <= 40) return data[tier].do40;
    if (pages <= 80) return data[tier].do80;
    return data[tier].do120;
  }
}

function getOprPrice(type, format, pages, color) {
  if (type === 'grzbietowa') {
    if (pages <= 50) return oprawy.grzbietowa.do50[format];
    if (pages <= 60) return oprawy.grzbietowa.do60[format];
    if (pages <= 90) return oprawy.grzbietowa.do90[format];
    return oprawy.grzbietowa.do150[format];
  } else if (type === 'kanałowa') {
    if (color === 'pozostale') return oprawy.kanałowa.kolory.price;
    return oprawy.kanałowa.standard.price;
  } else if (type === 'zaciskowa') {
    return oprawy.zaciskowa.miękka;
  }
  return 0;
}

export function init() {
  // TABS
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const calcBox = document.getElementById('lam-calc-breakdown');
  const calcDetails = document.getElementById('lam-calc-details');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;
      
      // Update buttons
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.style.borderBottom = '3px solid transparent';
      });
      btn.classList.add('active');
      btn.style.borderBottom = '3px solid #2B8A3E';
      
      // Update content
      tabContents.forEach(content => {
        content.style.display = content.id === `tab-${targetTab}` ? 'block' : 'none';
      });
    });
  });

  // === LAMINOWANIE ===
  const lamCalcBtn = document.getElementById('lam-calculate');
  if (lamCalcBtn) {
    const formatSelect = document.getElementById('lam-format');
    const qtyInput = document.getElementById('lam-qty');
    const addBtn = document.getElementById('lam-add-to-cart');
    const resultDisplay = document.getElementById('lam-result-display');
    let lastTotal = 0;

    lamCalcBtn.addEventListener('click', () => {
      const format = formatSelect?.value || 'A4';
      const qty = parseInt(qtyInput?.value || '1') || 1;
      const unitPrice = getUnitPrice(format, qty);
      lastTotal = parseFloat((unitPrice * qty).toFixed(2));

      const el = document.getElementById('lam-total-price');
      if (el) el.textContent = formatPLN(lastTotal);
      if (resultDisplay) resultDisplay.style.display = '';
      if (addBtn) addBtn.disabled = false;
      if (calcBox && calcDetails) {
        calcDetails.innerHTML = `Cena jednostkowa (${format}): ${formatPLN(unitPrice)} × ${qty} szt. = <strong>${formatPLN(lastTotal)}</strong>`;
        calcBox.style.display = '';
      }
    });

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('priceUpdate', {
          detail: { id: 'laminowanie', price: lastTotal, name: 'Laminowanie', cat: 'Laminowanie' }
        }));
      });
    }
  }

  // === BINDOWANIE ===
  const bindCalcBtn = document.getElementById('bind-calculate');
  if (bindCalcBtn) {
    const typeSelect = document.getElementById('bind-type');
    const qtyInput = document.getElementById('bind-qty');
    const pagesInput = document.getElementById('bind-pages');
    const addBtn = document.getElementById('bind-add-to-cart');
    const resultDisplay = document.getElementById('bind-result-display');
    let lastTotal = 0;

    bindCalcBtn.addEventListener('click', () => {
      const type = typeSelect?.value || 'plastik';
      const qty = parseInt(qtyInput?.value || '1') || 1;
      const pages = parseInt(pagesInput?.value || '20') || 20;
      const unitPrice = getBindingPrice(type, qty, pages);
      lastTotal = parseFloat((unitPrice * qty).toFixed(2));

      const unitEl = document.getElementById('bind-unit-price');
      const totalEl = document.getElementById('bind-total-price');
      if (unitEl) unitEl.textContent = formatPLN(unitPrice);
      if (totalEl) totalEl.textContent = formatPLN(lastTotal);
      if (resultDisplay) resultDisplay.style.display = '';
      if (addBtn) addBtn.disabled = false;
      if (calcBox && calcDetails) {
        const typeLabel = type === 'plastik' ? 'Plastik' : 'Metal';
        calcDetails.innerHTML = `Bindowanie (${typeLabel}), ${pages} kartek: ${formatPLN(unitPrice)} × ${qty} szt. = <strong>${formatPLN(lastTotal)}</strong>`;
        calcBox.style.display = '';
      }
    });

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('priceUpdate', {
          detail: { id: 'bindowanie', price: lastTotal, name: 'Bindowanie', cat: 'Laminowanie' }
        }));
      });
    }
  }

  // === OPRAWY ===
  const oprCalcBtn = document.getElementById('opr-calculate');
  if (oprCalcBtn) {
    const typeSelect = document.getElementById('opr-type');
    const formatSelect = document.getElementById('opr-format');
    const pagesInput = document.getElementById('opr-pages');
    const qtyInput = document.getElementById('opr-qty');
    const colorSelect = document.getElementById('opr-color');
    const addBtn = document.getElementById('opr-add-to-cart');
    const resultDisplay = document.getElementById('opr-result-display');
    const formatRow = document.getElementById('opr-format-row');
    const pagesRow = document.getElementById('opr-pages-row');
    const colorRow = document.getElementById('opr-color-row');
    let lastTotal = 0;

    // Toggle fields based on type
    typeSelect?.addEventListener('change', () => {
      const type = typeSelect.value;
      if (type === 'grzbietowa') {
        formatRow.style.display = '';
        pagesRow.style.display = '';
        colorRow.style.display = 'none';
      } else {
        formatRow.style.display = 'none';
        pagesRow.style.display = 'none';
        colorRow.style.display = type === 'kanałowa' ? '' : 'none';
      }
    });

    oprCalcBtn.addEventListener('click', () => {
      const type = typeSelect?.value || 'grzbietowa';
      const format = formatSelect?.value || 'A4';
      const pages = parseInt(pagesInput?.value || '50') || 50;
      const qty = parseInt(qtyInput?.value || '1') || 1;
      const color = colorSelect?.value || 'czarny';
      const unitPrice = getOprPrice(type, format, pages, color);
      lastTotal = parseFloat((unitPrice * qty).toFixed(2));

      const unitEl = document.getElementById('opr-unit-price');
      const totalEl = document.getElementById('opr-total-price');
      if (unitEl) unitEl.textContent = formatPLN(unitPrice);
      if (totalEl) totalEl.textContent = formatPLN(lastTotal);
      if (resultDisplay) resultDisplay.style.display = '';
      if (addBtn) addBtn.disabled = false;
      if (calcBox && calcDetails) {
        let details = '';
        if (type === 'grzbietowa') {
          details = `Oprawa grzbietowa (${format}, ${pages} str.): ${formatPLN(unitPrice)} × ${qty} szt. = <strong>${formatPLN(lastTotal)}</strong>`;
        } else if (type === 'kanałowa') {
          const colorLabel = color === 'pozostale' ? 'Pozostałe kolory' : color;
          details = `Oprawa kanałowa (${colorLabel}): ${formatPLN(unitPrice)} × ${qty} szt. = <strong>${formatPLN(lastTotal)}</strong>`;
        } else {
          details = `Oprawa zaciskowa: ${formatPLN(unitPrice)} × ${qty} szt. = <strong>${formatPLN(lastTotal)}</strong>`;
        }
        calcDetails.innerHTML = details;
        calcBox.style.display = '';
      }
    });

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('priceUpdate', {
          detail: { id: 'oprawy', price: lastTotal, name: 'Oprawy', cat: 'Laminowanie' }
        }));
      });
    }
  }
}

export function destroy() {}
