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

  it('should use corrected CSV price for 90x50mm, none folia, 300 szt', () => {
    const result = quoteWizytowki({
      format: '90x50',
      folia: 'none',
      qty: 300,
      express: false
    });
    expect(result.totalPrice).toBe(135.00);
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
