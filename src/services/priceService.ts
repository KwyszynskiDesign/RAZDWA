/**
 * priceService – warstwa pośrednia dostępu do danych cenowych.
 *
 * Wszystkie moduły kalkulacyjne muszą korzystać z getPrice() / setPrice()
 * zamiast importować docs/config/prices.json bezpośrednio.
 */
import _config from "../../docs/config/prices.json";

export const PRICES_STORAGE_KEY = "razdwa_prices";
export const PRICES_UPDATED_EVENT = "razdwa:prices-updated";

let _prices: any = JSON.parse(JSON.stringify(_config));

function getConfigRoot(): any {
  if (
    _prices &&
    typeof _prices === "object" &&
    _prices.default &&
    typeof _prices.default === "object" &&
    !_prices.defaultPrices &&
    !_prices.drukA4A3
  ) {
    return _prices.default;
  }
  return _prices;
}

function notifyPricesUpdated(path: string): void {
  try {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(PRICES_UPDATED_EVENT, { detail: { path } }));
    }
  } catch { /* ignore */ }
}

// On startup: merge user overrides from localStorage into defaultPrices.
(function _loadFromStorage() {
  try {
    if (typeof localStorage === "undefined") return;
    const raw = localStorage.getItem(PRICES_STORAGE_KEY);
    if (!raw) return;
    const overrides = JSON.parse(raw);
    if (overrides && typeof overrides === "object" && !Array.isArray(overrides)) {
      const validated: Record<string, number> = {};
      for (const [k, v] of Object.entries(overrides)) {
        if (k && typeof v === "number" && isFinite(v as number)) {
          validated[k] = v as number;
        }
      }
      if (Object.keys(validated).length > 0) {
        const root = getConfigRoot();
        root.defaultPrices = { ...(root.defaultPrices ?? {}), ...validated };
      }
    }
  } catch { /* ignore */ }
})();

/**
   * Pobierz wartość cennika po ścieżce z notacją kropkową,
   * np. getPrice("banner"), getPrice("drukCAD.price.color").
   * Zwraca undefined gdy ścieżka nie istnieje.
   */
  export function getPrice(path: string): any {
    const keys = path.split(".");
    let obj: any = getConfigRoot();
    for (const key of keys) {
      if (obj == null || typeof obj !== "object") return undefined;
      obj = obj[key];
    }
    return obj;
  }

  /**
   * Ustaw wartość cennika po ścieżce z notacją kropkową.
   * Tworzy pośrednie obiekty w razie potrzeby.
   * Gdy ścieżka dotyczy sekcji defaultPrices, zmiana jest automatycznie
   * utrwalana w localStorage.
   */
  export function setPrice(path: string, value: any): void {
    const keys = path.split(".");
    const root = getConfigRoot();
    let obj: any = root;
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (obj[key] == null || typeof obj[key] !== "object") {
        obj[key] = {};
      }
      obj = obj[key];
    }
    obj[keys[keys.length - 1]] = value;

    // Persist when defaultPrices section changes
    if (path === "defaultPrices" || path.startsWith("defaultPrices.")) {
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem(PRICES_STORAGE_KEY, JSON.stringify(root.defaultPrices ?? {}));
        }
      } catch { /* ignore */ }
      notifyPricesUpdated(path);
    }
  }

  /**
   * Przywróć wszystkie ceny do wartości domyślnych z pliku konfiguracyjnego
   * i usuń nadpisania z localStorage.
   */
  export function resetPrices(): void {
    _prices = JSON.parse(JSON.stringify(_config));
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(PRICES_STORAGE_KEY);
      }
    } catch { /* ignore */ }
    notifyPricesUpdated("defaultPrices");
  }
