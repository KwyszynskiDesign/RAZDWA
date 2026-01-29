import { describe, it, expect } from 'vitest';
import { calculateBanner } from '../src/categories/banner';

describe('Banner pricing', () => {
  it('should calculate Powlekany 10m2 correctly (53 PLN/m2)', () => {
    const result = calculateBanner({
      material: 'powlekany',
      areaM2: 10,
      oczkowanie: false
    });
    // Base: 10 * 53 = 530
    expect(result.tierPrice).toBe(53.0);
    expect(result.totalPrice).toBe(530.0);
  });

  it('should calculate Blockout 60m2 correctly (55 PLN/m2)', () => {
    const result = calculateBanner({
      material: 'blockout',
      areaM2: 60,
      oczkowanie: false
    });
    // Base: 60 * 55 = 3300
    expect(result.tierPrice).toBe(55.0);
    expect(result.totalPrice).toBe(3300.0);
  });

  it('should apply Oczkowanie surcharge (+2.50 PLN/m2)', () => {
    const result = calculateBanner({
      material: 'powlekany',
      areaM2: 10,
      oczkowanie: true
    });
    // Base: 10 * 53 = 530
    // Oczkowanie: 2.5 * 10 = 25
    // Total: 555
    expect(result.totalPrice).toBe(555.0);
    expect(result.appliedModifiers).toContain('Oczkowanie (+2.50 zł/m2)');
  });

  it('should apply Express +20% surcharge correctly', () => {
    const result = calculateBanner({
      material: 'powlekany',
      areaM2: 10,
      oczkowanie: false,
      express: true
    });
    // Base: 530
    // Express: 530 * 0.2 = 106
    // Total: 636
    expect(result.totalPrice).toBe(636.0);
    expect(result.appliedModifiers).toContain('TRYB EXPRESS (+20%)');
  });

  it('should apply both Oczkowanie and Express correctly', () => {
    const result = calculateBanner({
      material: 'powlekany',
      areaM2: 10,
      oczkowanie: true,
      express: true
    });
    // Base: 530
    // Oczkowanie: 25
    // Express: 530 * 0.2 = 106
    // Total: 530 + 25 + 106 = 661
    expect(result.totalPrice).toBe(661.0);
  });
});
