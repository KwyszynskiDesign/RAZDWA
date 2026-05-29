import { describe, it, expect, afterEach } from 'vitest';
import { quoteWizytowki } from '../src/categories/wizytowki';
import { resetPrices } from '../src/services/priceService';

// 85x55 noLam: 50→65, 100→75, 150→85, 200→96, 250→110, 300→125, 400→145, 500→170, 1000→290
// 90x50 noLam: 50→70, 100→79, 150→89, 200→99, 250→120, 300→135, 400→155, 500→175, 1000→300

afterEach(() => {
  resetPrices();
});

describe('quoteWizytowki – exact tier', () => {
  it('qty=50 (85x55) → 65 zł', () => {
    expect(quoteWizytowki({ format: '85x55', qty: 50, folia: 'none', express: false }).totalPrice).toBe(65);
  });

  it('qty=300 (85x55) → 125 zł', () => {
    expect(quoteWizytowki({ format: '85x55', qty: 300, folia: 'none', express: false }).totalPrice).toBe(125);
  });

  it('qty=1000 (85x55) → 290 zł', () => {
    expect(quoteWizytowki({ format: '85x55', qty: 1000, folia: 'none', express: false }).totalPrice).toBe(290);
  });
});

describe('quoteWizytowki – between tiers', () => {
  it('qty=75 (85x55): między 50→65 a 100→75, t=0.5 → 70 zł', () => {
    // t = (75-50)/(100-50) = 0.5 → 65 + 0.5*10 = 70
    expect(quoteWizytowki({ format: '85x55', qty: 75, folia: 'none', express: false }).totalPrice).toBe(70);
  });

  it('qty=350 (85x55): między 300→125 a 400→145, t=0.5 → 135 zł', () => {
    // t = (350-300)/(400-300) = 0.5 → 125 + 0.5*20 = 135
    expect(quoteWizytowki({ format: '85x55', qty: 350, folia: 'none', express: false }).totalPrice).toBe(135);
  });

  it('qty=600 (90x50): między 500→175 a 1000→300, t=0.2 → 200 zł', () => {
    // t = (600-500)/(1000-500) = 0.2 → 175 + 0.2*125 = 200
    expect(quoteWizytowki({ format: '90x50', qty: 600, folia: 'none', express: false }).totalPrice).toBe(200);
  });
});

describe('quoteWizytowki – below min', () => {
  it('qty=25 (85x55): poniżej min progu (50→65) → clamp do 65 zł', () => {
    expect(quoteWizytowki({ format: '85x55', qty: 25, folia: 'none', express: false }).totalPrice).toBe(65);
  });

  it('qty=0 (85x55): poniżej min progu (50→65) → clamp do 65 zł', () => {
    expect(quoteWizytowki({ format: '85x55', qty: 0, folia: 'none', express: false }).totalPrice).toBe(65);
  });
});

describe('quoteWizytowki – above max', () => {
  it('qty=2000 (85x55): powyżej max progu (1000→290) → flat 290 zł', () => {
    expect(quoteWizytowki({ format: '85x55', qty: 2000, folia: 'none', express: false }).totalPrice).toBe(290);
  });

  it('qty=1500 (90x50): powyżej max progu (1000→300) → flat 300 zł', () => {
    expect(quoteWizytowki({ format: '90x50', qty: 1500, folia: 'none', express: false }).totalPrice).toBe(300);
  });
});
