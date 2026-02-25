import { describe, it, expect, beforeEach } from 'vitest';
import { getPrice, setPrice, resetPrices } from '../src/services/priceService';

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
});
