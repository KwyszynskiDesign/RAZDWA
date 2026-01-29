import { describe, it, expect } from 'vitest';
import { quoteJednostronne } from '../src/categories/ulotki-cyfrowe-jednostronne';

describe('Ulotki Jednostronne', () => {
  it('should calculate A5 100szt correctly', () => {
    const result = quoteJednostronne({ format: 'A5', qty: 100, express: false });
    expect(result.totalPrice).toBe(95.00);
  });

  it('should calculate A6 1000szt correctly', () => {
    const result = quoteJednostronne({ format: 'A6', qty: 1000, express: false });
    expect(result.totalPrice).toBe(320.00);
  });

  it('should calculate DL 50szt correctly', () => {
    const result = quoteJednostronne({ format: 'DL', qty: 50, express: false });
    expect(result.totalPrice).toBe(55.00);
  });

  it('should apply EXPRESS +20% surcharge', () => {
    const result = quoteJednostronne({ format: 'DL', qty: 50, express: true });
    // 55.00 + 20% = 55.00 + 11.00 = 66.00
    expect(result.totalPrice).toBe(66.00);
    expect(result.appliedModifiers).toContain('TRYB EXPRESS');
  });
});
