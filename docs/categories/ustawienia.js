// Ustawienia – dynamic price CRUD backed by localStorage
// Key format: "kategoria-zakres" (np. "druk-bw-a4-1-5", "skan-auto-1-9")
const STORAGE_KEY = 'razdwa_prices';

<<<<<<< copilot/add-auto-scan-defaults
const DEFAULT_PRICES = {
  // === DRUK CZARNO-BIAŁY A4 ===
  "druk-bw-a4-1-5": 0.90,
  "druk-bw-a4-6-20": 0.60,
  "druk-bw-a4-21-100": 0.35,
  "druk-bw-a4-101-500": 0.30,
  "druk-bw-a4-501-999": 0.23,
  "druk-bw-a4-1000-4999": 0.19,
  "druk-bw-a4-5000+": 0.15,
  // === DRUK CZARNO-BIAŁY A3 ===
  "druk-bw-a3-1-5": 1.70,
  "druk-bw-a3-6-20": 1.10,
  "druk-bw-a3-21-100": 0.70,
  "druk-bw-a3-101-500": 0.60,
  "druk-bw-a3-501-999": 0.45,
  "druk-bw-a3-1000-4999": 0.33,
  "druk-bw-a3-5000+": 0.30,
  // === DRUK KOLOROWY A4 ===
  "druk-kolor-a4-1-10": 2.40,
  "druk-kolor-a4-11-40": 2.20,
  "druk-kolor-a4-41-100": 2.00,
  "druk-kolor-a4-101-250": 1.80,
  "druk-kolor-a4-251-500": 1.60,
  "druk-kolor-a4-501-999": 1.40,
  "druk-kolor-a4-1000+": 1.10,
  // === DRUK KOLOROWY A3 ===
  "druk-kolor-a3-1-10": 4.80,
  "druk-kolor-a3-11-40": 4.20,
  "druk-kolor-a3-41-100": 3.80,
  "druk-kolor-a3-101-250": 3.00,
  "druk-kolor-a3-251-500": 2.50,
  "druk-kolor-a3-501-999": 1.90,
  "druk-kolor-a3-1000+": 1.60,
  // === SKANOWANIE AUTOMATYCZNE ===
  "skan-auto-1-9": 1.00,
  "skan-auto-10-49": 0.50,
  "skan-auto-50-99": 0.40,
  "skan-auto-100+": 0.25,
  // === SKANOWANIE RĘCZNE Z SZYBY ===
  "skan-reczne-1-4": 2.00,
  "skan-reczne-5+": 1.00,
  // === DOPŁATY DRUK ===
  "druk-email": 1.00,
  "modifier-druk-zadruk25": 0.50,
  // === DRUK CAD – KOLOROWY (formatowy) ===
  "druk-cad-kolor-fmt-a3": 5.30,
  "druk-cad-kolor-fmt-a2": 8.50,
  "druk-cad-kolor-fmt-a1": 12.00,
  "druk-cad-kolor-fmt-a0": 24.00,
  "druk-cad-kolor-fmt-a0plus": 26.00,
  // === DRUK CAD – KOLOROWY (metr bieżący) ===
  "druk-cad-kolor-mb-a3": 12.00,
  "druk-cad-kolor-mb-a2": 13.90,
  "druk-cad-kolor-mb-a1": 14.50,
  "druk-cad-kolor-mb-a0": 20.00,
  "druk-cad-kolor-mb-a0plus": 21.00,
  "druk-cad-kolor-mb-mb1067": 30.00,
  // === DRUK CAD – CZARNO-BIAŁY (formatowy) ===
  "druk-cad-bw-fmt-a3": 2.50,
  "druk-cad-bw-fmt-a2": 4.00,
  "druk-cad-bw-fmt-a1": 6.00,
  "druk-cad-bw-fmt-a0": 11.00,
  "druk-cad-bw-fmt-a0plus": 12.50,
  // === DRUK CAD – CZARNO-BIAŁY (metr bieżący) ===
  "druk-cad-bw-mb-a3": 3.50,
  "druk-cad-bw-mb-a2": 4.50,
  "druk-cad-bw-mb-a1": 5.00,
  "druk-cad-bw-mb-a0": 9.00,
  "druk-cad-bw-mb-a0plus": 10.00,
  "druk-cad-bw-mb-mb1067": 12.50,
  // === LAMINOWANIE A3 ===
  "laminowanie-a3-1-50": 7.00,
  "laminowanie-a3-51-100": 6.00,
  "laminowanie-a3-101-200": 5.00,
  // === LAMINOWANIE A4 ===
  "laminowanie-a4-1-50": 5.00,
  "laminowanie-a4-51-100": 4.50,
  "laminowanie-a4-101-200": 4.00,
  // === LAMINOWANIE A5 ===
  "laminowanie-a5-1-50": 4.00,
  "laminowanie-a5-51-100": 3.50,
  "laminowanie-a5-101-200": 3.00,
  // === LAMINOWANIE A6 ===
  "laminowanie-a6-1-50": 3.00,
  "laminowanie-a6-51-100": 2.50,
  "laminowanie-a6-101-200": 2.00,
  // === SOLWENT – PAPIER 150G PÓŁMAT ===
  "solwent-150g-1-3": 65.00,
  "solwent-150g-4-9": 60.00,
  "solwent-150g-10-20": 55.00,
  "solwent-150g-21-40": 50.00,
  "solwent-150g-41+": 42.00,
  // === SOLWENT – PAPIER 200G POŁYSK ===
  "solwent-200g-1-3": 70.00,
  "solwent-200g-4-9": 65.00,
  "solwent-200g-10-20": 59.00,
  "solwent-200g-21-40": 53.00,
  "solwent-200g-41+": 45.00,
  // === VOUCHERY A4 ===
  "vouchery-a4-base": 2.50,
  // === BANNER – POWLEKANY ===
  "banner-powlekany-1-25": 53.00,
  "banner-powlekany-26-50": 49.00,
  "banner-powlekany-51+": 45.00,
  // === BANNER – BLOCKOUT ===
  "banner-blockout-1-25": 64.00,
  "banner-blockout-26-50": 59.00,
  "banner-blockout-51+": 55.00,
  "banner-oczkowanie": 2.50,
  // === ROLL-UP ===
  "rollup-85x200-1-5": 290.00,
  "rollup-85x200-6-10": 275.00,
  "rollup-100x200-1-5": 305.00,
  "rollup-100x200-6-10": 285.00,
  "rollup-120x200-1-5": 330.00,
  "rollup-120x200-6-10": 310.00,
  "rollup-150x200-1-5": 440.00,
  "rollup-150x200-6-10": 425.00,
  "rollup-wymiana-labor": 50.00,
  "rollup-wymiana-m2": 80.00,
  // === FOLIA SZRONIONA ===
  "folia-szroniona-wydruk-1-5": 65.00,
  "folia-szroniona-wydruk-6-25": 60.00,
  "folia-szroniona-wydruk-26-50": 56.00,
  "folia-szroniona-wydruk-51+": 51.00,
  "folia-szroniona-oklejanie-1-5": 140.00,
  "folia-szroniona-oklejanie-6-10": 130.00,
  "folia-szroniona-oklejanie-11-20": 120.00,
  // === WLEPKI – PO OBRYSIE (FOLIA) ===
  "wlepki-obrys-folia-1-5": 67.00,
  "wlepki-obrys-folia-6-25": 60.00,
  "wlepki-obrys-folia-26-50": 52.00,
  "wlepki-obrys-folia-51+": 48.00,
  // === WLEPKI – POLIPROPYLEN ===
  "wlepki-polipropylen-1-10": 50.00,
  "wlepki-polipropylen-11+": 42.00,
  // === WLEPKI – STANDARD FOLIA ===
  "wlepki-standard-folia-1-5": 54.00,
  "wlepki-standard-folia-6-25": 50.00,
  "wlepki-standard-folia-26-50": 46.00,
  "wlepki-standard-folia-51+": 42.00,
  "wlepki-modifier-arkusze": 2.00,
  "wlepki-modifier-pojedyncze": 10.00,
  "wlepki-modifier-mocny-klej": 0.12,
  // === WIZYTÓWKI 85×55 (CENA ZA NAKŁAD) ===
  "wizytowki-85x55-none-50szt": 65.00,
  "wizytowki-85x55-none-100szt": 75.00,
  "wizytowki-85x55-none-250szt": 110.00,
  "wizytowki-85x55-none-500szt": 170.00,
  "wizytowki-85x55-none-1000szt": 290.00,
  "wizytowki-85x55-matt_gloss-50szt": 160.00,
  "wizytowki-85x55-matt_gloss-100szt": 170.00,
  "wizytowki-85x55-matt_gloss-250szt": 200.00,
  "wizytowki-85x55-matt_gloss-500szt": 250.00,
  "wizytowki-85x55-matt_gloss-1000szt": 335.00,
  // === WIZYTÓWKI 90×50 (CENA ZA NAKŁAD) ===
  "wizytowki-90x50-none-50szt": 70.00,
  "wizytowki-90x50-none-100szt": 79.00,
  "wizytowki-90x50-none-250szt": 120.00,
  "wizytowki-90x50-none-500szt": 175.00,
  "wizytowki-90x50-none-1000szt": 300.00,
  "wizytowki-90x50-matt_gloss-50szt": 170.00,
  "wizytowki-90x50-matt_gloss-100szt": 180.00,
  "wizytowki-90x50-matt_gloss-250szt": 210.00,
  "wizytowki-90x50-matt_gloss-500szt": 260.00,
  "wizytowki-90x50-matt_gloss-1000szt": 345.00,
  // === MODYFIKATORY (procent jako ułamek dziesiętny) ===
  "modifier-satyna": 0.12,
  "modifier-express": 0.20,
  "modifier-express-vouchery": 0.30,
  "modifier-vouchery-dwustronne": 0.80,
  "modifier-vouchery-300g": 0.25,
};
=======
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
>>>>>>> main

let prices = (function() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const validated = {};
        for (const [k, v] of Object.entries(parsed)) {
          if (k && typeof v === 'number' && isFinite(v)) validated[k] = v;
        }
        if (Object.keys(validated).length > 0) return validated;
      }
    }
  } catch { /* ignore */ }
  return Object.assign({}, DEFAULT_PRICES);
})();

function escAttr(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function updateTable() {
  const tbody = document.querySelector('#pricesTable tbody');
  if (!tbody) return;
  const sortedKeys = Object.keys(prices).sort();
  tbody.innerHTML = sortedKeys.map(key => `
    <tr style="border-bottom: 1px solid var(--border);">
      <td style="padding: 6px 10px;">
        <input value="${escAttr(key)}" data-key="${escAttr(key)}" data-field="key"
          style="width: 100%; border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px; font-size: 13px; font-family: monospace; background: var(--surface); color: var(--text-primary);">
      </td>
      <td style="padding: 6px 10px;">
        <input type="number" value="${Number(prices[key]).toFixed(2)}" step="0.01" min="0"
          data-key="${escAttr(key)}" data-field="unitPrice"
          style="width: 120px; border: 1px solid var(--border); border-radius: 6px; padding: 6px 8px; font-size: 14px; background: var(--surface); color: var(--text-primary);">
      </td>
      <td style="padding: 6px 10px; text-align: center;">
        <button data-remove="${escAttr(key)}" title="Usuń" style="background: none; border: none; cursor: pointer; font-size: 18px; line-height: 1;">🗑️</button>
      </td>
    </tr>
  `).join('');

  // Inline edit listeners
  tbody.querySelectorAll('input[data-key]').forEach(input => {
    input.addEventListener('change', () => {
      const oldKey = input.dataset.key;
      const field = input.dataset.field;
      if (field === 'unitPrice') {
        prices[oldKey] = parseFloat(input.value) || 0;
      } else {
        const newKey = input.value.trim();
        if (newKey && newKey !== oldKey) {
          prices[newKey] = prices[oldKey];
          delete prices[oldKey];
          updateTable();
        }
      }
    });
  });

  // Remove listeners
  tbody.querySelectorAll('button[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      delete prices[btn.dataset.remove];
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
  const newKey = 'nowa-pozycja-' + Date.now();
  prices[newKey] = 0;
  updateTable();
  // Scroll to new row (last after sort – find by key)
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
  prices = Object.assign({}, DEFAULT_PRICES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prices));
  updateTable();
  showMsg('🔄 Przywrócono domyślne ceny.');
});

// Initial render
updateTable();
