/**
 * src/core/contracts/PriceDataSource.ts
 *
 * Adapter interface for all price data access.
 * Core and category logic must read prices through this interface,
 * never by importing src/config/prices.json or priceService directly.
 *
 * Implementations live in src/infrastructure/adapters/.
 */

export interface PriceDataSource {
  /**
   * Read a value by dot-notation path (e.g. "banner.materials.0.price").
   * Returns undefined if the path does not exist.
   * Must be synchronous — callers do not await.
   */
  getPrice(path: string): unknown;

  /**
   * Write a value. Optional — read-only sources may omit this.
   * Persists through whatever mechanism the implementation chooses.
   */
  setPrice?(path: string, value: unknown): void;

  /**
   * Subscribe to changes at a given path.
   * Returns an unsubscribe function.
   * Optional — polling-only sources may omit this.
   */
  onChanged?(path: string, callback: (value: unknown) => void): () => void;
}

/**
 * Convenience: resolve a numeric price with a fallback default.
 * Pure function — the side effect (if any) is inside `source.getPrice`.
 */
export function resolvePriceNumber(
  source: PriceDataSource,
  path: string,
  defaultValue: number,
): number {
  const raw = source.getPrice(path);
  const n = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(n) ? n : defaultValue;
}
