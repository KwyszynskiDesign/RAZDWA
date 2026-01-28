import { describe, it, expect } from 'vitest';
import { calculateWlepki } from '../src/categories/wlepki-naklejki';

describe('Wlepki / Naklejki Category', () => {
  it('should calculate Folia biała po obrysie 1-5m2 at 67zł/m2', () => {
    const result = calculateWlepki({
      groupId: 'wlepki_obrys_folia',
      area: 2,
      modifiers: []
    });
    expect(result.tierPrice).toBe(67);
    expect(result.totalPrice).toBe(134);
  });

  it('should apply mocny klej +12%', () => {
    const result = calculateWlepki({
      groupId: 'wlepki_obrys_folia',
      area: 1,
      modifiers: ['mocny_klej']
    });
    // 67 * 1.12 = 75.04
    expect(result.totalPrice).toBeCloseTo(75.04);
  });

  it('should handle express +20%', () => {
    const result = calculateWlepki({
      groupId: 'wlepki_obrys_folia',
      area: 1,
      modifiers: [],
      express: true
    });
    // 67 * 1.20 = 80.40
    expect(result.totalPrice).toBeCloseTo(80.40);
  });

  it('should apply fixed modifiers (arkusze +2zł/m2)', () => {
    const result = calculateWlepki({
      groupId: 'wlepki_obrys_folia',
      area: 1,
      modifiers: ['arkusze']
    });
    // 67 + 2 = 69
    expect(result.totalPrice).toBe(69);
  });

  it('should apply both percent and fixed modifiers correctly', () => {
    const result = calculateWlepki({
      groupId: 'wlepki_obrys_folia',
      area: 1,
      modifiers: ['mocny_klej', 'pojedyncze']
    });
    // (67 * 1.12) + 10 = 75.04 + 10 = 85.04
    expect(result.totalPrice).toBeCloseTo(85.04);
  });

  it('should enforce minimalka 1m2', () => {
    const result = calculateWlepki({
      groupId: 'wlepki_obrys_folia',
      area: 0.5,
      modifiers: []
    });
    // 1m2 * 67 = 67
    expect(result.totalPrice).toBe(67);
  });

  it('should handle Polipropylen tiers', () => {
    const result = calculateWlepki({
      groupId: 'wlepki_polipropylen',
      area: 12,
      modifiers: []
    });
    // 12m2 * 42 = 504
    expect(result.tierPrice).toBe(42);
    expect(result.totalPrice).toBe(504);
  });
});
