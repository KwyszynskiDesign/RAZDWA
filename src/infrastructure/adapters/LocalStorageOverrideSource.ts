import type { PriceDataSource } from '../../core/contracts/PriceDataSource';

const FORBIDDEN_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

function isSafe(key: string): boolean {
  return Boolean(key) && !FORBIDDEN_KEYS.has(key);
}

export class LocalStorageOverrideSource implements PriceDataSource {
  constructor(
    private readonly base: PriceDataSource,
    private readonly storageKey: string,
  ) {}

  getPrice(path: string): unknown {
    if (path.startsWith('defaultPrices.')) {
      const priceKey = path.slice('defaultPrices.'.length);
      if (isSafe(priceKey)) {
        const override = this.readOverride(priceKey);
        if (override !== undefined) return override;
      }
    }
    return this.base.getPrice(path);
  }

  setPrice(path: string, value: unknown): void {
    if (this.base.setPrice) this.base.setPrice(path, value);
  }

  private readOverride(key: string): number | undefined {
    try {
      if (typeof localStorage === 'undefined') return undefined;
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return undefined;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return undefined;
      const v = (parsed as Record<string, unknown>)[key];
      if (typeof v === 'number' && Number.isFinite(v)) return v;
      if (typeof v === 'string') {
        const n = Number.parseFloat(v);
        if (Number.isFinite(n)) return n;
      }
      return undefined;
    } catch {
      return undefined;
    }
  }
}
