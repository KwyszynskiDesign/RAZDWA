import { describe, it, expect } from 'vitest';
import { quoteJednostronne } from '../src/categories/ulotki-cyfrowe-jednostronne';

describe('Ulotki Cyfrowe', () => {
  it('should calculate Jednostronne A5 100szt correctly', () => {
    const result = quoteJednostronne({ mode: 'jednostronne', format: 'A5', qty: 100, express: false });
    expect(result.totalPrice).toBe(95.00);
  });

  it('should calculate Dwustronne A5 100szt correctly', () => {
    const result = quoteJednostronne({ mode: 'dwustronne', format: 'A5', qty: 100, express: false });
    expect(result.totalPrice).toBe(140.00);
  });

  it('should calculate Dwustronne A6 1000szt correctly', () => {
    const result = quoteJednostronne({ mode: 'dwustronne', format: 'A6', qty: 1000, express: false });
    expect(result.totalPrice).toBe(476.00);
  });

  it('should calculate DL 50szt Dwustronne correctly', () => {
    const result = quoteJednostronne({ mode: 'dwustronne', format: 'DL', qty: 50, express: false });
    expect(result.totalPrice).toBe(70.00);
  });

  it('should apply EXPRESS +20% surcharge to Dwustronne', () => {
    const result = quoteJednostronne({ mode: 'dwustronne', format: 'DL', qty: 50, express: true });
    // 70.00 + 20% = 70.00 + 14.00 = 84.00
    expect(result.totalPrice).toBe(84.00);
    expect(result.appliedModifiers).toContain('TRYB EXPRESS');
  });

  it('should pick nearest higher tier (e.g. 15 -> 20)', () => {
    // Jednostronne A6 20szt = 35.00. 15szt should pick 20szt tier.
    const result = quoteJednostronne({ mode: 'jednostronne', format: 'A6', qty: 15, express: false });
    expect(result.totalPrice).toBe(35.00);
  });
});
