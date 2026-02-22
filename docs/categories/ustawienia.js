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
  // Plakaty – Solwent m² (minimalka 1 m²)
  { category: 'Plakaty 200g Połysk 1-3 m²', unitPrice: 70 },
  { category: 'Plakaty 200g Połysk 4-9 m²', unitPrice: 65 },
  { category: 'Plakaty 200g Połysk 10-20 m²', unitPrice: 59 },
  { category: 'Plakaty 200g Połysk 21-40 m²', unitPrice: 53 },
  { category: 'Plakaty 200g Połysk 41+ m²', unitPrice: 45 },
  { category: 'Plakaty Blockout 200g 1-3 m²', unitPrice: 80 },
  { category: 'Plakaty Blockout 200g 4-9 m²', unitPrice: 75 },
  { category: 'Plakaty Blockout 200g 10-20 m²', unitPrice: 70 },
  { category: 'Plakaty Blockout 200g 21-40 m²', unitPrice: 65 },
  { category: 'Plakaty Blockout 200g 41+ m²', unitPrice: 60 },
  { category: 'Plakaty 150g Półmat 1-3 m²', unitPrice: 65 },
  { category: 'Plakaty 150g Półmat 4-9 m²', unitPrice: 60 },
  { category: 'Plakaty 150g Półmat 10-20 m²', unitPrice: 55 },
  { category: 'Plakaty 150g Półmat 21-40 m²', unitPrice: 50 },
  { category: 'Plakaty 150g Półmat 41+ m²', unitPrice: 42 },
  { category: 'Plakaty 115g Matowy 1-3 m²', unitPrice: 45 },
  { category: 'Plakaty 115g Matowy 4-19 m²', unitPrice: 40 },
  { category: 'Plakaty 115g Matowy 20+ m²', unitPrice: 35 },
  // Plakaty – 120g Formatowe (szt)
  { category: 'Plakaty 120g Formatowe A3 (297x420)', unitPrice: 9 },
  { category: 'Plakaty 120g Formatowe A2 (420x594)', unitPrice: 12 },
  { category: 'Plakaty 120g Formatowe A1 (594x841)', unitPrice: 18 },
  { category: 'Plakaty 120g Formatowe A0 (841x1189)', unitPrice: 28 },
  { category: 'Plakaty 120g Formatowe 914x1189', unitPrice: 34 },
  { category: 'Plakaty 120g Formatowe A0+ (914x1292)', unitPrice: 50 },
  { category: 'Plakaty 120g Formatowe Rolka 1067', unitPrice: 68 },
  // Plakaty – 120g Nieformatowe (szt)
  { category: 'Plakaty 120g Nieformatowe A3 (297x420)', unitPrice: 28 },
  { category: 'Plakaty 120g Nieformatowe A2 (420x594)', unitPrice: 30 },
  { category: 'Plakaty 120g Nieformatowe A1 (594x841)', unitPrice: 33 },
  { category: 'Plakaty 120g Nieformatowe A0 (841x1189)', unitPrice: 35 },
  { category: 'Plakaty 120g Nieformatowe A0+ (914x1292)', unitPrice: 50 },
  { category: 'Plakaty 120g Nieformatowe Rolka 1067', unitPrice: 63 },
  // Plakaty – 260g Satyna Formatowe (szt)
  { category: 'Plakaty 260g Satyna Formatowe A3 (297x420)', unitPrice: 23 },
  { category: 'Plakaty 260g Satyna Formatowe A2 (420x594)', unitPrice: 39 },
  { category: 'Plakaty 260g Satyna Formatowe A1 (594x841)', unitPrice: 50 },
  { category: 'Plakaty 260g Satyna Formatowe A0 (841x1189)', unitPrice: 80 },
  { category: 'Plakaty 260g Satyna Formatowe A0+ (914x1292)', unitPrice: 88 },
  // Plakaty – 260g Satyna Nieformatowe (szt)
  { category: 'Plakaty 260g Satyna Nieformatowe A3 (297x420)', unitPrice: 27 },
  { category: 'Plakaty 260g Satyna Nieformatowe A2 (420x594)', unitPrice: 36 },
  { category: 'Plakaty 260g Satyna Nieformatowe A1 (594x841)', unitPrice: 39.50 },
  { category: 'Plakaty 260g Satyna Nieformatowe A0 (841x1189)', unitPrice: 66.70 },
  { category: 'Plakaty 260g Satyna Nieformatowe A0+ (914x1292)', unitPrice: 75.30 },
  // Plakaty – 180g PP Formatowe (szt)
  { category: 'Plakaty 180g PP Formatowe A3 (297x420)', unitPrice: 18 },
  { category: 'Plakaty 180g PP Formatowe A2 (420x594)', unitPrice: 37 },
  { category: 'Plakaty 180g PP Formatowe 610x841', unitPrice: 45 },
  { category: 'Plakaty 180g PP Formatowe A0 (841x1189)', unitPrice: 70 },
  { category: 'Plakaty 180g PP Formatowe A0+ (914x1292)', unitPrice: 74 },
  // Plakaty – 180g PP Nieformatowe (szt)
  { category: 'Plakaty 180g PP Nieformatowe A3 (297x420)', unitPrice: 23 },
  { category: 'Plakaty 180g PP Nieformatowe A2 (420x594)', unitPrice: 31 },
  { category: 'Plakaty 180g PP Nieformatowe 610x841', unitPrice: 34 },
  { category: 'Plakaty 180g PP Nieformatowe A0 (841x1189)', unitPrice: 62 },
  { category: 'Plakaty 180g PP Nieformatowe A0+ (914x1292)', unitPrice: 70.50 },
  // Rabaty ilościowe Plakaty
  { category: 'Plakaty Rabat 120g 2-5 szt (%)', unitPrice: 5 },
  { category: 'Plakaty Rabat 120g 6-20 szt (%)', unitPrice: 8 },
  { category: 'Plakaty Rabat 120g 21-30 szt (%)', unitPrice: 13 },
  { category: 'Plakaty Rabat 260g 9-20 szt (%)', unitPrice: 7 },
  { category: 'Plakaty Rabat 260g 21-30 szt (%)', unitPrice: 12 },
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
