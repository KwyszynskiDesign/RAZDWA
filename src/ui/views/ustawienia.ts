import { View, ViewContext } from "../types";
import { DEFAULT_PRICES } from "../../core/compat";

const STORAGE_KEY = "razdwa_prices";

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
