import { describe, it, expect, beforeEach } from 'vitest';
import { getPrice, setPrice, resetPrices, PRICES_STORAGE_KEY } from '../src/services/priceService';

describe('priceService', () => {
  beforeEach(() => {
    resetPrices();
  });

  it('getPrice returns top-level section', () => {
    const banner = getPrice('banner');
    expect(banner).toBeDefined();
    expect(banner).toHaveProperty('materials');
  });

  it('getPrice returns nested value using dot notation', () => {
    const tolerance = getPrice('drukCAD.tolerance');
    expect(typeof tolerance).toBe('number');
    expect(tolerance).toBeGreaterThan(0);
  });

  it('getPrice returns undefined for unknown path', () => {
    expect(getPrice('nonexistent.path')).toBeUndefined();
  });

  it('setPrice updates a nested value', () => {
    setPrice('drukCAD.tolerance', 99);
    expect(getPrice('drukCAD.tolerance')).toBe(99);
  });

  it('resetPrices restores original values after setPrice', () => {
    const original = getPrice('drukCAD.tolerance');
    setPrice('drukCAD.tolerance', 999);
    resetPrices();
    expect(getPrice('drukCAD.tolerance')).toBe(original);
  });

  it('setPrice creates intermediate objects if needed', () => {
    setPrice('newSection.subKey', 42);
    expect(getPrice('newSection.subKey')).toBe(42);
  });

  it('setPrice on defaultPrices persists to localStorage when available', () => {
    const stored: Record<string, string> = {};
    const mockLocalStorage = {
      getItem: (k: string) => stored[k] ?? null,
      setItem: (k: string, v: string) => { stored[k] = v; },
      removeItem: (k: string) => { delete stored[k]; },
    };
    (globalThis as any).localStorage = mockLocalStorage;

    setPrice('defaultPrices', { 'druk-bw-a4-1-5': 1.23 });
    const saved = JSON.parse(stored[PRICES_STORAGE_KEY] ?? '{}');
    expect(saved['druk-bw-a4-1-5']).toBe(1.23);

    // Cleanup
    delete (globalThis as any).localStorage;
    resetPrices();
  });

  it('resetPrices removes defaultPrices from localStorage when available', () => {
    const stored: Record<string, string> = { [PRICES_STORAGE_KEY]: '{"x":1}' };
    const mockLocalStorage = {
      getItem: (k: string) => stored[k] ?? null,
      setItem: (k: string, v: string) => { stored[k] = v; },
      removeItem: (k: string) => { delete stored[k]; },
    };
    (globalThis as any).localStorage = mockLocalStorage;

    resetPrices();
    expect(stored[PRICES_STORAGE_KEY]).toBeUndefined();

    // Cleanup
    delete (globalThis as any).localStorage;
  });

  it('setPrice on defaultPrices updates in-memory prices immediately', () => {
    const original = getPrice('defaultPrices');
    expect(original).toBeDefined();
    setPrice('defaultPrices', { 'test-key': 99.99 });
    expect(getPrice('defaultPrices')).toEqual({ 'test-key': 99.99 });
  });
});
