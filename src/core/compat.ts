/* Data and helpers from kalkulatorv2.html - cleaned up and synced with categories.json */
import { getPrice } from "../services/priceService";

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

const _PRICES_KEY = "razdwa_prices";

/** Read user-overridden prices from localStorage. Returns empty object on error or if not set. */
export function readStoredPrices(): Record<string, number> {
  try {
    if (typeof localStorage === "undefined") return {};
    const raw = localStorage.getItem(_PRICES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, number>;
    }
  } catch { /* ignore */ }
  return {};
}

/**
 * Resolve a single price from localStorage, falling back to defaultValue.
 * Use this for individual prices, modifiers and fixed fees.
 */
export function resolveStoredPrice(key: string, defaultValue: number): number {
  const stored = readStoredPrices();
  return typeof stored[key] === "number" ? stored[key] : defaultValue;
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

// ---------------------------------------------------------------------------
// DEFAULT_PRICES – single source of truth for all price defaults.
// Used by the admin panel (ustawienia.ts) as the initial/reset values.
// ---------------------------------------------------------------------------
export const DEFAULT_PRICES: Record<string, number> = getPrice("defaultPrices") as Record<string, number>;

export const BIZ: any = getPrice("wizytowki") as any;
