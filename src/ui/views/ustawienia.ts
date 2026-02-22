import { View, ViewContext } from "../types";

const STORAGE_KEY = "razdwa_prices";

// Key format: "kategoria-zakres" → unit price (zł)
const DEFAULT_PRICES: Record<string, number> = {
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

// Module-level cleanup so re-mounting removes the previous listener
let _cleanup: (() => void) | null = null;

function loadPrices(): Record<string, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Accept only plain objects (not arrays – legacy format)
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const validated: Record<string, number> = {};
        for (const [k, v] of Object.entries(parsed)) {
          if (k && typeof v === "number" && isFinite(v)) validated[k] = v;
        }
        if (Object.keys(validated).length > 0) return validated;
      }
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_PRICES };
}

function savePrices(entries: Record<string, number>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export const UstawieniaView: View = {
  id: "ustawienia",
  name: "Ustawienia cen",

  mount(container: HTMLElement, _ctx: ViewContext) {
    // Remove any previous storage listener from an earlier mount
    if (_cleanup) { _cleanup(); _cleanup = null; }
    let prices = loadPrices();

    function render() {
      const sortedKeys = Object.keys(prices).sort();
      const rowsHtml = sortedKeys.map(key => `
        <tr data-key="${escapeHtml(key)}" style="border-bottom: 1px solid rgba(255,255,255,0.08);">
          <td style="padding:4px 8px;">
            <input data-field="key" value="${escapeHtml(key)}"
              style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:4px;color:inherit;padding:4px 6px;width:100%;font-size:12px;font-family:monospace;">
          </td>
          <td style="padding:4px 8px;">
            <input data-field="unitPrice" type="number" step="0.01" min="0" value="${Number(prices[key]).toFixed(2)}"
              style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:4px;color:inherit;padding:4px 6px;width:90px;font-size:13px;text-align:right;">
          </td>
          <td style="padding:4px; text-align:center;">
            <button data-action="delete" data-key="${escapeHtml(key)}"
              style="background:rgba(220,50,50,0.7);border:none;border-radius:4px;color:#fff;cursor:pointer;padding:3px 8px;font-size:13px;">✕</button>
          </td>
        </tr>
      `).join("");

      container.innerHTML = `
        <div style="padding: 20px;">
          <h2 style="margin: 0 0 8px; font-size: 20px;">⚙️ Ustawienia – Cennik</h2>
          <p style="margin: 0 0 16px; font-size: 13px; color: rgba(255,255,255,0.6);">
            Ceny wszystkich zakresów/produktów zapisywane w przeglądarce (<code>razdwa_prices</code>).
            Klucz: <code>kategoria-zakres</code> (np. <code>druk-bw-a4-1-5</code>). Łącznie: <strong>${sortedKeys.length}</strong> pozycji.
          </p>

          <table id="prices-table" style="width:100%; border-collapse:collapse; font-size:14px; margin-bottom:16px;">
            <thead>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.2);">
                <th style="text-align:left; padding:6px 8px;">Klucz (kategoria-zakres)</th>
                <th style="text-align:right; padding:6px 8px; width:120px;">Cena jedn. (zł)</th>
                <th style="padding:4px; width:60px;"></th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button id="btn-add-row"
              style="background:rgba(60,130,60,0.8);border:none;border-radius:6px;color:#fff;cursor:pointer;padding:8px 16px;font-size:14px;">
              + Dodaj pozycję
            </button>
            <button id="btn-save"
              style="background:rgba(40,100,200,0.85);border:none;border-radius:6px;color:#fff;cursor:pointer;padding:8px 16px;font-size:14px;">
              💾 Zapisz i odśwież
            </button>
            <button id="btn-reset"
              style="background:rgba(100,100,100,0.7);border:none;border-radius:6px;color:#fff;cursor:pointer;padding:8px 16px;font-size:14px;">
              🔄 Przywróć domyślne
            </button>
          </div>

          <div id="save-msg" style="display:none; margin-top:12px; padding:8px 12px; background:rgba(50,180,50,0.25); border-radius:6px; font-size:13px;">
            ✓ Zapisano. Inne karty zostaną odświeżone automatycznie.
          </div>
        </div>
      `;

      // Delete row
      container.querySelectorAll("[data-action='delete']").forEach(btn => {
        btn.addEventListener("click", () => {
          const key = (btn as HTMLElement).dataset.key ?? "";
          if (key) {
            delete prices[key];
            render();
          }
        });
      });

      // Add row
      container.querySelector("#btn-add-row")?.addEventListener("click", () => {
        const newKey = "nowa-pozycja-" + Date.now();
        prices[newKey] = 0;
        render();
        // Focus the new key input (last row)
        const rows = container.querySelectorAll<HTMLInputElement>("tbody tr input[data-field='key']");
        rows[rows.length - 1]?.focus();
        rows[rows.length - 1]?.select();
      });

      // Save – read current input values before persisting
      container.querySelector("#btn-save")?.addEventListener("click", () => {
        const updated: Record<string, number> = {};
        container.querySelectorAll<HTMLTableRowElement>("tbody tr[data-key]").forEach(row => {
          const keyInput = row.querySelector<HTMLInputElement>("input[data-field='key']");
          const priceInput = row.querySelector<HTMLInputElement>("input[data-field='unitPrice']");
          const k = keyInput?.value.trim() ?? "";
          if (k) updated[k] = parseFloat(priceInput?.value ?? "0") || 0;
        });
        prices = updated;
        savePrices(prices);
        window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
        const msg = container.querySelector<HTMLElement>("#save-msg");
        if (msg) { msg.style.display = "block"; setTimeout(() => { msg.style.display = "none"; }, 3000); }
      });

      // Reset to defaults
      container.querySelector("#btn-reset")?.addEventListener("click", () => {
        if (confirm("Przywrócić domyślne ceny? Twoje zmiany zostaną utracone.")) {
          prices = { ...DEFAULT_PRICES };
          savePrices(prices);
          render();
        }
      });
    }

    render();

    // Listen for changes from other tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        prices = loadPrices();
        render();
      }
    };
    window.addEventListener("storage", onStorage);
    _cleanup = () => window.removeEventListener("storage", onStorage);
  },

  unmount() {
    if (_cleanup) { _cleanup(); _cleanup = null; }
  },
};

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
