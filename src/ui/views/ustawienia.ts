import { View, ViewContext } from "../types";

const STORAGE_KEY = "razdwa_prices";

// Module-level cleanup so re-mounting removes the previous listener
let _cleanup: (() => void) | null = null;

interface PriceEntry {
  category: string;
  unitPrice: number;
}

function loadPrices(): PriceEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PriceEntry[];
  } catch {}
  return [];
}

function savePrices(entries: PriceEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export const UstawieniaView: View = {
  id: "ustawienia",
  name: "Ustawienia cen",

  mount(container: HTMLElement, _ctx: ViewContext) {
    // Remove any previous storage listener from an earlier mount
    if (_cleanup) { _cleanup(); _cleanup = null; }
    let entries = loadPrices();

    function render() {
      container.innerHTML = `
        <div style="padding: 20px;">
          <h2 style="margin: 0 0 16px; font-size: 20px;">⚙️ Ustawienia – Cennik</h2>
          <p style="margin: 0 0 16px; font-size: 13px; color: rgba(255,255,255,0.6);">
            Własne stawki bazowe zapisywane w przeglądarce (<code>razdwa_prices</code>). Zmiany widoczne we wszystkich kartach.
          </p>

          <table id="prices-table" style="width:100%; border-collapse:collapse; font-size:14px; margin-bottom:16px;">
            <thead>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.2);">
                <th style="text-align:left; padding:6px 8px;">Kategoria</th>
                <th style="text-align:right; padding:6px 8px; width:120px;">Cena jedn. (zł)</th>
                <th style="padding:4px; width:60px;"></th>
              </tr>
            </thead>
            <tbody>
              ${entries.map((e, i) => `
                <tr data-idx="${i}" style="border-bottom: 1px solid rgba(255,255,255,0.08);">
                  <td style="padding:4px 8px;">
                    <input data-field="category" value="${escapeHtml(e.category)}"
                      style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:4px;color:inherit;padding:4px 6px;width:100%;font-size:13px;">
                  </td>
                  <td style="padding:4px 8px;">
                    <input data-field="unitPrice" type="number" step="0.01" min="0" value="${e.unitPrice}"
                      style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:4px;color:inherit;padding:4px 6px;width:90px;font-size:13px;text-align:right;">
                  </td>
                  <td style="padding:4px; text-align:center;">
                    <button data-action="delete" data-idx="${i}"
                      style="background:rgba(220,50,50,0.7);border:none;border-radius:4px;color:#fff;cursor:pointer;padding:3px 8px;font-size:13px;">✕</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button id="btn-add-row"
              style="background:rgba(60,130,60,0.8);border:none;border-radius:6px;color:#fff;cursor:pointer;padding:8px 16px;font-size:14px;">
              + Dodaj wiersz
            </button>
            <button id="btn-save"
              style="background:rgba(40,100,200,0.85);border:none;border-radius:6px;color:#fff;cursor:pointer;padding:8px 16px;font-size:14px;">
              💾 Zapisz
            </button>
            <button id="btn-reset"
              style="background:rgba(100,100,100,0.7);border:none;border-radius:6px;color:#fff;cursor:pointer;padding:8px 16px;font-size:14px;">
              ↩ Resetuj
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
          const idx = parseInt((btn as HTMLElement).dataset.idx ?? "-1");
          if (idx >= 0) {
            entries.splice(idx, 1);
            render();
          }
        });
      });

      // Add row
      container.querySelector("#btn-add-row")?.addEventListener("click", () => {
        entries.push({ category: "", unitPrice: 0 });
        render();
        // Focus the last category input
        const rows = container.querySelectorAll<HTMLInputElement>("tbody tr input[data-field='category']");
        rows[rows.length - 1]?.focus();
      });

      // Save
      container.querySelector("#btn-save")?.addEventListener("click", () => {
        // Read current values from inputs
        const rows = container.querySelectorAll<HTMLTableRowElement>("tbody tr[data-idx]");
        const updated: PriceEntry[] = [];
        rows.forEach(row => {
          const catInput = row.querySelector<HTMLInputElement>("input[data-field='category']");
          const priceInput = row.querySelector<HTMLInputElement>("input[data-field='unitPrice']");
          if (catInput && priceInput) {
            updated.push({
              category: catInput.value.trim(),
              unitPrice: parseFloat(priceInput.value) || 0,
            });
          }
        });
        entries = updated.filter(e => e.category !== "");
        savePrices(entries);
        const msg = container.querySelector<HTMLElement>("#save-msg");
        if (msg) { msg.style.display = "block"; setTimeout(() => { msg.style.display = "none"; }, 3000); }
      });

      // Reset
      container.querySelector("#btn-reset")?.addEventListener("click", () => {
        if (confirm("Usunąć wszystkie zapisane stawki?")) {
          entries = [];
          savePrices(entries);
          render();
        }
      });
    }

    render();

    // Listen for changes from other tabs
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        entries = loadPrices();
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
