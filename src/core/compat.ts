/* Data and helpers from kalkulatorv2.html - cleaned up and synced with categories.json */
import { getPrice, getPriceLabels, PRICES_STORAGE_KEY } from "../services/priceService";

export function money(n: any) {
  return (Math.round((Number(n) || 0) * 100) / 100).toFixed(2);
}

export function pickTier(tiers: any[], qty: number) {
  return tiers.find((t) => qty >= t.from && qty <= t.to) || null;
}

export function pickNearestCeilKey(table: any, qty: number) {
  const keys = Object.keys(table || {})
    .map(Number)
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  if (!keys.length) return null;
  const k = keys.find((x) => qty <= x);
  return k == null ? null : k;
}

export const PRICE: any = getPrice("drukA4A3") as any;

export const CAD_PRICE: any = getPrice("drukCAD.price") as any;

export const CAD_BASE: any = getPrice("drukCAD.base") as any;

export const FORMAT_TOLERANCE_MM = getPrice("drukCAD.tolerance") as number;

export const FOLD_PRICE: any = getPrice("drukCAD.fold") as any;

export const WF_SCAN_PRICE_PER_CM = getPrice("drukCAD.wfScanPerCm") as number;

/** Read user-overridden prices from localStorage. Returns empty object on error or if not set. */
export function readStoredPrices(): Record<string, number> {
  try {
    if (typeof localStorage === "undefined") return {};
    const raw = localStorage.getItem(PRICES_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, number>;
    }
  } catch { /* ignore */ }
  return {};
}

export function getDefaultPricesMap(): Record<string, number | null> {
  const prices = getPrice("defaultPrices") as Record<string, number | null> | undefined;
  if (!prices || typeof prices !== "object" || Array.isArray(prices)) {
    return {};
  }

  return prices;
}

export function getStoredPriceLabel(key: string): string {
  const labels = getPriceLabels();
  return labels[key] ?? key;
}

export function extractQuantityFromText(text: string): number | null {
  const value = String(text ?? "");
  const matchers = [
    /qty\s*[-:]?\s*(\d+(?:[.,]\d+)?)/i,
    /(\d+(?:[.,]\d+)?)\s*(?:szt\.?|sztuk|sztuki|pcs\.?|pieces?)\b/i,
  ];

  for (const matcher of matchers) {
    const match = value.match(matcher);
    if (!match) continue;
    const parsed = Number.parseFloat(String(match[1]).replace(",", "."));
    if (Number.isFinite(parsed)) return parsed;
  }

  return null;
}

export function extractVoucherSide(text: string): "jed" | "dwu" | null {
  const value = String(text ?? "").toLowerCase();
  if (/(^|[^a-z])(dwu|dwustron|double)/i.test(value)) return "dwu";
  if (/(^|[^a-z])(jed|jednostron|single)/i.test(value)) return "jed";
  return null;
}

/**
 * Resolve a single price from localStorage, falling back to defaultValue.
 * Use this for individual prices, modifiers and fixed fees.
 */
export function resolveStoredPrice(key: string, defaultValue: number): number {
  const stored = readStoredPrices();
  if (typeof stored[key] === "number") return stored[key];

  const aliases: Record<string, string> = {
    "plakaty-format-120g-formatowe-610x841": "plakaty-format-120g-formatowe-594x841",
    "plakaty-format-120g-formatowe-594x841": "plakaty-format-120g-formatowe-610x841",
    "plakaty-format-120g-nieformatowe-610x841": "plakaty-format-120g-nieformatowe-594x841",
    "plakaty-format-120g-nieformatowe-594x841": "plakaty-format-120g-nieformatowe-610x841"
  };

  const aliasKey = aliases[key];
  if (aliasKey && typeof stored[aliasKey] === "number") return stored[aliasKey];

  return defaultValue;
}

/**
 * Override tier prices from localStorage using the naming convention
 *   `{prefix}-{min}-{max}` or `{prefix}-{min}+` for open-ended tiers.
 * Returns a new array with overridden prices; original is not mutated.
 */
export function overrideTiersWithStoredPrices(
  prefix: string,
  tiers: Array<{ min: number; max: number | null; price: number }>
): Array<{ min: number; max: number | null; price: number }> {
  const stored = readStoredPrices();
  return tiers.map(tier => {
    const suffix = tier.max === null || tier.max > 50000
      ? `${tier.min}+`
      : `${tier.min}-${tier.max}`;
    const key = `${prefix}-${suffix}`;
    return typeof stored[key] === "number" ? { ...tier, price: stored[key] } : tier;
  });
}

export function mergeStoredNumericTiers<T extends { price: number }>(
  prefix: string,
  tiers: T[],
  parseQuantityFromKey: (key: string) => number | null,
  getQuantity: (tier: T) => number,
  createTier: (quantity: number, price: number) => T
): T[] {
  const stored = readStoredPrices();
  const merged = tiers.map((tier) => ({ ...tier }));

  for (const [key, value] of Object.entries(stored)) {
    if (!key.startsWith(prefix)) continue;
    if (typeof value !== "number") continue;

    const quantity = parseQuantityFromKey(key);
    if (!Number.isFinite(quantity)) continue;

    const existingIndex = merged.findIndex((tier) => getQuantity(tier) === quantity);
    if (existingIndex >= 0) {
      merged[existingIndex] = { ...merged[existingIndex], price: value };
    } else {
      merged.push(createTier(quantity, value));
    }
  }

  return merged.sort((left, right) => getQuantity(left) - getQuantity(right));
}

export function mergeStoredQuantityTable(
  prefix: string,
  table: Record<number, number>,
  parseQuantityFromKey: (key: string) => number | null
): Record<number, number> {
  const stored = readStoredPrices();
  const merged: Record<number, number> = { ...table };

  for (const [key, value] of Object.entries(stored)) {
    if (!key.startsWith(prefix)) continue;
    if (typeof value !== "number") continue;

    const quantity = parseQuantityFromKey(key);
    if (!Number.isFinite(quantity)) continue;
    merged[quantity] = value;
  }

  return merged;
}

// ---------------------------------------------------------------------------
// DEFAULT_PRICES – snapshot of default prices from priceService at module load.
// NOTE: do not use for reset logic; call resetPrices() from priceService instead.
// ---------------------------------------------------------------------------
export const DEFAULT_PRICES: Record<string, number> = getPrice("defaultPrices") as Record<string, number>;

export const BIZ: any = getPrice("wizytowki") as any;
