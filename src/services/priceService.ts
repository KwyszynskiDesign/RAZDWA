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
      } catch {
        // ignore
      }
    }

    (function loadFromStorage() {
      try {
        if (typeof localStorage === "undefined") return;

        const raw = localStorage.getItem(PRICES_STORAGE_KEY);
        if (!raw) return;

        const overrides = JSON.parse(raw);
        if (!overrides || typeof overrides !== "object" || Array.isArray(overrides)) return;

        const validated: Record<string, number> = {};
        for (const [key, value] of Object.entries(overrides)) {
          if (!key) continue;
          const n = typeof value === "number" ? value : Number.parseFloat(String(value));
          if (Number.isFinite(n)) {
            validated[key] = n;
          }
        }

        if (Object.keys(validated).length > 0) {
          const root = getConfigRoot();
          root.defaultPrices = { ...(root.defaultPrices ?? {}), ...validated };
        }
      } catch {
        // ignore
      }
    })();

    export function getPrice(path: string): any {
      const keys = path.split(".");
      let obj: any = getConfigRoot();

      for (const key of keys) {
        if (obj == null || typeof obj !== "object") return undefined;
        obj = obj[key];
      }

      return obj;
    }

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

      if (path === "defaultPrices" || path.startsWith("defaultPrices.")) {
        try {
          if (typeof localStorage !== "undefined") {
            localStorage.setItem(PRICES_STORAGE_KEY, JSON.stringify(root.defaultPrices ?? {}));
          }
        } catch {
          // ignore
        }

        notifyPricesUpdated(path);
      }
    }

    export function resetPrices(): void {
      _prices = JSON.parse(JSON.stringify(_config));

      try {
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem(PRICES_STORAGE_KEY);
        }
      } catch {
        // ignore
      }

      notifyPricesUpdated("defaultPrices");
    }
