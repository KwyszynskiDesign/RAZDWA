import { describe, it, expect } from 'vitest';
import { quoteWizytowki } from '../src/categories/wizytowki-druk-cyfrowy';

describe('Wizytówki - druk cyfrowy', () => {
  it('should calculate price for 85x55mm, none folia, 50 szt', () => {
    const result = quoteWizytowki({
      format: '85x55',
      folia: 'none',
      qty: 50,
      express: false
    });
    expect(result.totalPrice).toBe(65.00);
  });

  it('should calculate price for 90x50mm, matt_gloss folia, 100 szt', () => {
    const result = quoteWizytowki({
      format: '90x50',
      folia: 'matt_gloss',
      qty: 100,
      express: false
    });
    expect(result.totalPrice).toBe(180.00);
  });

  it('should use corrected CSV price for 85x55mm, matt_gloss folia, 1000 szt', () => {
    const result = quoteWizytowki({
      format: '85x55',
      folia: 'matt_gloss',
      qty: 1000,
      express: false
    });
    expect(result.totalPrice).toBe(355.00);
  });

  it('should use corrected CSV price for 90x50mm, none folia, 300 szt', () => {
    const result = quoteWizytowki({
      format: '90x50',
      folia: 'none',
      qty: 300,
      express: false
    });
    expect(result.totalPrice).toBe(135.00);
  });

  it('should use corrected CSV deluxe gold price for 500 szt', () => {
    const result = quoteWizytowki({
      family: 'deluxe',
      deluxeOpt: 'uv3d_gold_softtouch',
      qty: 500,
      express: false
    });
    expect(result.totalPrice).toBe(950.00);
  });

  it('should apply express surcharge (+20%)', () => {
    const result = quoteWizytowki({
      format: '85x55',
      folia: 'none',
      qty: 50,
      express: true
    });
    // 65.00 * 1.2 = 78.00
    expect(result.totalPrice).toBe(78.00);
  });
});
