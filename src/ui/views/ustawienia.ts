import { View, ViewContext } from "../types";
import { getPrice, setPrice, resetPrices, PRICES_STORAGE_KEY } from "../../services/priceService";
import { getOrderExportConfig, setOrderExportConfig } from "../../services/orderExportService";

const STORAGE_KEY = PRICES_STORAGE_KEY;

type PriceCategory = {
  id: string;
  label: string;
  icon: string;
  prefixes: string[];
  description: string;
  newKeyPrefix?: string;
};

let _cleanup: (() => void) | null = null;

function loadPrices(): Record<string, number> {
  return { ...(getPrice("defaultPrices") as Record<string, number>) };
}

const BASE_PRICE_CATEGORIES: PriceCategory[] = [
  {
    id: "druk-a4-a3",
    label: "Druk A4/A3 + skan",
    icon: "🖨️",
    prefixes: ["druk-bw-", "druk-kolor-", "skan-", "druk-email", "modifier-druk-"],
    description: "Ceny druku czarno-białego, kolorowego, skanowania i dopłaty za duży zadruk.",
    newKeyPrefix: "druk-bw-a4-"
  },
  {
    id: "druk-cad",
    label: "CAD wielkoformatowy",
    icon: "📐",
    prefixes: ["druk-cad-"],
    description: "Stawki CAD formatowe i za metr bieżący.",
    newKeyPrefix: "druk-cad-bw-fmt-"
  },
  {
    id: "laminowanie",
    label: "Laminowanie",
    icon: "✨",
    prefixes: ["laminowanie-"],
    description: "Progi cenowe laminowania dla formatów A3–A6.",
    newKeyPrefix: "laminowanie-a4-"
  },
  {
    id: "solwent",
    label: "Solwent / plakaty",
    icon: "🎨",
    prefixes: ["solwent-"],
    description: "Cenniki solwentu dla papierów 115g, 150g i 200g.",
    newKeyPrefix: "solwent-150g-"
  },
  {
    id: "vouchery",
    label: "Vouchery",
    icon: "🎫",
    prefixes: ["vouchery-"],
    description: "Ceny voucherów jednostronnych i dwustronnych.",
    newKeyPrefix: "vouchery-1-jed"
  },
  {
    id: "banner",
    label: "Banner",
    icon: "🏁",
    prefixes: ["banner-"],
    description: "Materiały bannerowe i dopłata za oczkowanie.",
    newKeyPrefix: "banner-powlekany-"
  },
  {
    id: "rollup",
    label: "Roll-up",
    icon: "↕️",
    prefixes: ["rollup-"],
    description: "Komplety roll-up oraz wymiana wkładu.",
    newKeyPrefix: "rollup-85x200-"
  },
  {
    id: "folia",
    label: "Folia szroniona",
    icon: "❄️",
    prefixes: ["folia-szroniona-"],
    description: "Wydruk i oklejanie folii szronionej.",
    newKeyPrefix: "folia-szroniona-wydruk-"
  },
  {
    id: "wlepki",
    label: "Wlepki / naklejki",
    icon: "🏷️",
    prefixes: ["wlepki-"],
    description: "Naklejki standardowe, po obrysie, PP i dopłaty dodatkowe.",
    newKeyPrefix: "wlepki-standard-folia-"
  },
  {
    id: "wizytowki",
    label: "Wizytówki",
    icon: "📇",
    prefixes: ["wizytowki-"],
    description: "Ceny wizytówek standard i z folią dla obu formatów.",
    newKeyPrefix: "wizytowki-85x55-none-"
  },
  {
    id: "artykuly",
    label: "Artykuły biurowe",
    icon: "📎",
    prefixes: ["artykuly-"],
    description: "Ceny materiałów biurowych i akcesoriów.",
    newKeyPrefix: "artykuly-"
  },
  {
    id: "uslugi",
    label: "Usługi",
    icon: "🛠️",
    prefixes: ["uslugi-"],
    description: "Stawki usług dodatkowych, projektowych i archiwizacji.",
    newKeyPrefix: "uslugi-"
  },
  {
    id: "modifiers",
    label: "Dopłaty globalne",
    icon: "⚙️",
    prefixes: ["modifier-express", "modifier-satyna", "modifier-modigliani"],
    description: "Dopłaty procentowe współdzielone przez wiele kalkulatorów.",
    newKeyPrefix: "modifier-"
  }
];

function keyMatchesCategory(key: string, category: PriceCategory): boolean {
  return category.prefixes.some((prefix) => key.startsWith(prefix));
}

function getRenderedCategories(prices: Record<string, number>): PriceCategory[] {
  const categories = [...BASE_PRICE_CATEGORIES];
  const matchedKeys = new Set<string>();

  categories.forEach((category) => {
    Object.keys(prices).forEach((key) => {
      if (keyMatchesCategory(key, category)) {
        matchedKeys.add(key);
      }
    });
  });

  const unmatchedKeys = Object.keys(prices).filter((key) => !matchedKeys.has(key));
  if (unmatchedKeys.length > 0) {
    categories.push({
      id: "inne",
      label: "Pozostałe",
      icon: "🧩",
      prefixes: unmatchedKeys,
      description: "Klucze, które nie pasują do żadnej z głównych kategorii.",
      newKeyPrefix: "inne-"
    });
  }

  return categories;
}

function getCategoryKeys(prices: Record<string, number>, category: PriceCategory): string[] {
  if (category.id === "inne") {
    return Object.keys(prices).filter((key) => category.prefixes.includes(key)).sort();
  }
  return Object.keys(prices).filter((key) => keyMatchesCategory(key, category)).sort();
}

export const UstawieniaView: View = {
  id: "ustawienia",
  name: "Ustawienia cen",

  mount(container: HTMLElement, _ctx: ViewContext) {
    if (_cleanup) {
      _cleanup();
      _cleanup = null;
    }

    let prices = loadPrices();
    let exportCfg = getOrderExportConfig();
    let renderedCategories = getRenderedCategories(prices);
    let activeCategory = renderedCategories[0]?.id ?? "druk-a4-a3";

    function getActiveCategory(): PriceCategory {
      return renderedCategories.find((category) => category.id === activeCategory) ?? renderedCategories[0];
    }

    function showStatus(message: string, tone: "success" | "error" = "success") {
      const msg = container.querySelector<HTMLElement>("#save-msg");
      if (!msg) return;
      msg.textContent = message;
      msg.dataset.tone = tone;
      msg.style.display = "block";
      window.setTimeout(() => {
        msg.style.display = "none";
      }, 3200);
    }

    function flushInputs(): void {
      container.querySelectorAll<HTMLTableRowElement>("tbody tr[data-key]").forEach((row) => {
        const keyInput = row.querySelector<HTMLInputElement>("input[data-field='key']");
        const priceInput = row.querySelector<HTMLInputElement>("input[data-field='unitPrice']");
        const originalKey = row.dataset.key ?? "";
        const proposedKey = keyInput?.value.trim() || originalKey;
        const parsedPrice = Number.parseFloat(priceInput?.value ?? "0");
        const nextPrice = Number.isFinite(parsedPrice) ? parsedPrice : 0;

        if (originalKey && originalKey !== proposedKey) {
          delete prices[originalKey];
        }

        prices[proposedKey] = nextPrice;
        row.dataset.key = proposedKey;
        if (keyInput) {
          keyInput.value = proposedKey;
        }
      });
    }

    function renderTabs(): void {
      const tabsEl = container.querySelector<HTMLElement>("#category-tabs");
      if (!tabsEl) return;

      renderedCategories = getRenderedCategories(prices);
      if (!renderedCategories.some((category) => category.id === activeCategory)) {
        activeCategory = renderedCategories[0]?.id ?? activeCategory;
      }

      tabsEl.innerHTML = renderedCategories.map((category) => {
        const isActive = category.id === activeCategory;
        const count = getCategoryKeys(prices, category).length;
        return `<button type="button" data-cat="${category.id}" class="settings-tab${isActive ? " settings-tab--active" : ""}">
          <span class="settings-tab-icon">${category.icon}</span>
          <span class="settings-tab-label">${category.label}</span>
          <span class="settings-tab-count">${count}</span>
        </button>`;
      }).join("");

      tabsEl.querySelectorAll<HTMLButtonElement>("[data-cat]").forEach((button) => {
        button.addEventListener("click", () => {
          flushInputs();
          activeCategory = button.dataset.cat ?? activeCategory;
          renderTabs();
          renderTable();
        });
      });
    }

    function renderTable(): void {
      const active = getActiveCategory();
      const keys = getCategoryKeys(prices, active);
      const tbody = container.querySelector<HTMLElement>("#prices-tbody");
      const countEl = container.querySelector<HTMLElement>("#prices-count");
      const activeLabelEl = container.querySelector<HTMLElement>("#active-category-label");
      const activeDescEl = container.querySelector<HTMLElement>("#active-category-desc");
      const totalKeysEl = container.querySelector<HTMLElement>("#all-prices-count");

      if (activeLabelEl) {
        activeLabelEl.textContent = `${active.icon} ${active.label}`;
      }
      if (activeDescEl) {
        activeDescEl.textContent = active.description;
      }
      if (countEl) {
        countEl.textContent = String(keys.length);
      }
      if (totalKeysEl) {
        totalKeysEl.textContent = String(Object.keys(prices).length);
      }

      if (!tbody) return;

      if (keys.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="3" class="settings-empty-state">
              W tej kategorii nie ma jeszcze pozycji. Możesz dodać nową cenę przyciskiem poniżej.
            </td>
          </tr>
        `;
        return;
      }

      tbody.innerHTML = keys.map((key) => `
        <tr data-key="${escapeHtml(key)}">
          <td class="settings-td-key">
            <input data-field="key" value="${escapeHtml(key)}" class="settings-input settings-input--mono">
          </td>
          <td class="settings-td-price">
            <input data-field="unitPrice" type="number" step="0.01" min="0" value="${Number(prices[key]).toFixed(2)}" class="settings-input settings-input--price">
          </td>
          <td class="settings-td-del">
            <button type="button" data-action="delete" data-key="${escapeHtml(key)}" class="settings-btn-del" title="Usuń pozycję">✕</button>
          </td>
        </tr>
      `).join("");

      tbody.querySelectorAll<HTMLButtonElement>("[data-action='delete']").forEach((button) => {
        button.addEventListener("click", () => {
          const key = button.dataset.key ?? "";
          if (!key) return;
          delete prices[key];
          renderTabs();
          renderTable();
        });
      });
    }

    container.innerHTML = `
      <div class="settings-wrap">
        <div class="settings-header">
          <div>
            <h2 class="settings-title">⚙️ Ustawienia cen</h2>
            <p class="settings-subtitle">Cennik jest podzielony na kategorie. Wybierz sekcję i zmieniaj tylko te ceny, które do niej należą.</p>
          </div>
          <div class="settings-summary-card">
            <span class="settings-summary-label">Wszystkie pozycje</span>
            <strong id="all-prices-count" class="settings-summary-value">0</strong>
          </div>
        </div>

        <div id="category-tabs" class="settings-tabs"></div>

        <div class="settings-active-meta">
          <div>
            <div id="active-category-label" class="settings-active-label">—</div>
            <div id="active-category-desc" class="settings-active-desc"></div>
          </div>
          <div class="settings-count-badge">Pozycji: <span id="prices-count">0</span></div>
        </div>

        <div class="settings-table-wrap">
          <table class="settings-table">
            <thead>
              <tr>
                <th class="settings-th-key">Klucz cennika</th>
                <th class="settings-th-price">Cena (zł)</th>
                <th class="settings-th-del">Usuń</th>
              </tr>
            </thead>
            <tbody id="prices-tbody"></tbody>
          </table>
        </div>

        <div class="settings-apps-panel">
          <h3 class="settings-apps-title">🔗 Integracja Google Sheets (Apps Script)</h3>
          <p class="settings-apps-desc">Wklej URL Web App z Apps Script. Przycisk „Wyślij” zapisze zamówienie bezpośrednio do arkusza.</p>
          <div class="settings-apps-grid">
            <input id="apps-script-url" type="url" value="${escapeHtml(exportCfg.appsScriptUrl || "")}" placeholder="https://script.google.com/macros/s/.../exec" class="settings-input">
            <input id="apps-script-timeout" type="number" min="1000" step="500" value="${Number(exportCfg.timeoutMs || 15000)}" class="settings-input settings-input--price" placeholder="Timeout ms">
          </div>
          <label class="settings-apps-check">
            <input id="apps-script-enabled" type="checkbox" ${exportCfg.enabled ? "checked" : ""}>
            Aktywuj wysyłkę do Apps Script
          </label>
        </div>

        <div class="settings-actions">
          <button id="btn-add-row" type="button" class="btn-success settings-action-btn">+ Dodaj pozycję</button>
          <button id="btn-save" type="button" class="btn-primary settings-action-btn">💾 Zapisz zmiany</button>
          <button id="btn-reset" type="button" class="btn-secondary settings-action-btn">🔄 Przywróć domyślne</button>
        </div>

        <div id="save-msg" class="settings-save-msg" style="display:none;"></div>
      </div>
    `;

    renderTabs();
    renderTable();

    container.querySelector("#btn-add-row")?.addEventListener("click", () => {
      flushInputs();
      const active = getActiveCategory();
      const prefix = active.newKeyPrefix || active.prefixes[0] || "nowa-";
      const normalizedPrefix = prefix.endsWith("-") ? prefix : `${prefix}-`;
      const newKey = `${normalizedPrefix}nowa-${Date.now()}`;
      prices[newKey] = 0;
      renderTabs();
      renderTable();
      const keyInputs = container.querySelectorAll<HTMLInputElement>("tbody tr input[data-field='key']");
      keyInputs[keyInputs.length - 1]?.focus();
      keyInputs[keyInputs.length - 1]?.select();
    });

    container.querySelector("#btn-save")?.addEventListener("click", () => {
      flushInputs();
      setPrice("defaultPrices", prices);

      const appsScriptUrl = (container.querySelector("#apps-script-url") as HTMLInputElement | null)?.value?.trim() || "";
      const timeoutMs = Number.parseInt((container.querySelector("#apps-script-timeout") as HTMLInputElement | null)?.value || "15000", 10);
      const enabled = Boolean((container.querySelector("#apps-script-enabled") as HTMLInputElement | null)?.checked);

      exportCfg = setOrderExportConfig({
        appsScriptUrl,
        timeoutMs: Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 15000,
        enabled,
      });

      renderTabs();
      renderTable();
      showStatus("✓ Zapisano ustawienia cen i integracji Apps Script.");
    });

    container.querySelector("#btn-reset")?.addEventListener("click", () => {
      if (!confirm("Przywrócić domyślne ceny? Twoje zmiany zostaną utracone.")) {
        return;
      }

      resetPrices();
      prices = loadPrices();
      renderTabs();
      renderTable();
      showStatus("✓ Przywrócono domyślne ceny.");
    });

    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) {
        return;
      }

      prices = loadPrices();
      renderTabs();
      renderTable();
    };

    window.addEventListener("storage", onStorage);
    _cleanup = () => window.removeEventListener("storage", onStorage);
  },

  unmount() {
    if (_cleanup) {
      _cleanup();
      _cleanup = null;
    }
  },
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}