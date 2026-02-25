/**
 * priceService – warstwa pośrednia dostępu do danych cenowych.
 *
 * Wszystkie moduły kalkulacyjne muszą korzystać z getPrice() / setPrice()
 * zamiast importować config/prices.json bezpośrednio.
 */
import _config from "../../config/prices.json";

export const PRICES_STORAGE_KEY = "razdwa_prices";

let _prices: any = JSON.parse(JSON.stringify(_config));

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
        _prices.defaultPrices = { ..._prices.defaultPrices, ...validated };
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
  let obj: any = _prices;
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
  let obj: any = _prices;
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
        localStorage.setItem(PRICES_STORAGE_KEY, JSON.stringify(_prices.defaultPrices));
      }
    } catch { /* ignore */ }
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
}
