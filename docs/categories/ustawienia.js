// Ustawienia – dynamic price CRUD backed by localStorage
const STORAGE_KEY = 'razdwa_prices';

const DEFAULT_PRICES = [
  { category: 'Druk A4/A3 – B&W', unitPrice: 0.5 },
  { category: 'Druk A4/A3 – Kolor', unitPrice: 2.0 },
  { category: 'CAD B&W (m2)', unitPrice: 4.0 },
  { category: 'CAD Kolor (m2)', unitPrice: 12.0 },
  { category: 'Laminowanie A4', unitPrice: 3.0 },
  { category: 'Banner (m2)', unitPrice: 53.0 },
  { category: 'Roll-up 85x200', unitPrice: 129.0 },
];

let prices = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? DEFAULT_PRICES;

function escAttr(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function updateTable() {
  const tbody = document.querySelector('#pricesTable tbody');
  if (!tbody) return;
  tbody.innerHTML = prices.map((p, i) => `
    <tr style="border-bottom: 1px solid var(--border);">
      <td style="padding: 6px 10px;">
        <input value="${escAttr(p.category)}" data-idx="${i}" data-field="category"
          style="width: 100%; border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px; font-size: 14px; background: var(--surface); color: var(--text-primary);">
      </td>
      <td style="padding: 6px 10px;">
        <input type="number" value="${Number(p.unitPrice).toFixed(2)}" step="0.01" min="0"
          data-idx="${i}" data-field="unitPrice"
          style="width: 120px; border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px; font-size: 14px; background: var(--surface); color: var(--text-primary);">
      </td>
      <td style="padding: 6px 10px; text-align: center;">
        <button data-remove="${i}" title="Usuń" style="background: none; border: none; cursor: pointer; font-size: 18px; line-height: 1;">🗑️</button>
      </td>
    </tr>
  `).join('');

  // Inline edit listeners
  tbody.querySelectorAll('input[data-idx]').forEach(input => {
    input.addEventListener('change', () => {
      const idx = Number(input.dataset.idx);
      const field = input.dataset.field;
      if (field === 'unitPrice') {
        prices[idx].unitPrice = parseFloat(input.value) || 0;
      } else {
        prices[idx].category = input.value;
      }
    });
  });

  // Remove listeners
  tbody.querySelectorAll('button[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      prices.splice(Number(btn.dataset.remove), 1);
      updateTable();
    });
  });
}

function showMsg(text, isError = false) {
  const el = document.getElementById('ustawienia-msg');
  if (!el) return;
  el.textContent = text;
  el.style.display = 'block';
  el.style.background = isError ? 'rgba(201,42,42,0.1)' : 'rgba(43,138,62,0.1)';
  el.style.color = isError ? 'var(--danger)' : 'var(--success)';
  el.style.border = isError ? '1px solid var(--danger)' : '1px solid var(--success)';
  setTimeout(() => { el.style.display = 'none'; }, 3000);
}

document.getElementById('addPriceBtn').addEventListener('click', () => {
  prices.push({ category: 'Nowa pozycja', unitPrice: 0 });
  updateTable();
  // Scroll to new row
  const tbody = document.querySelector('#pricesTable tbody');
  if (tbody) tbody.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

document.getElementById('saveAllBtn').addEventListener('click', () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prices));
  showMsg('✅ Zapisano! Ceny zaktualizowane.');
  // Notify other calculators via storage event
  window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
});

document.getElementById('resetPricesBtn').addEventListener('click', () => {
  if (!confirm('Przywrócić domyślne ceny? Twoje zmiany zostaną utracone.')) return;
  prices = [...DEFAULT_PRICES];
  localStorage.removeItem(STORAGE_KEY);
  updateTable();
  showMsg('🔄 Przywrócono domyślne ceny.');
});

// Initial render
updateTable();
