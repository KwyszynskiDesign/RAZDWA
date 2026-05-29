import { describe, it, expect, afterEach } from 'vitest';
import { quoteWizytowki } from '../src/categories/wizytowki';
import { resetPrices } from '../src/services/priceService';

// Price table 85x55 noLam: 50→65, 100→75, 150→85, 200→96, 250→110, 300→125, 400→145, 500→170, 1000→290

afterEach(() => {
  resetPrices();
});

describe('quoteWizytowki – exact tier values', () => {
  it('qty=50 → 65 zł', () => {
    expect(quoteWizytowki({ format: '85x55', qty: 50, folia: 'none', express: false }).totalPrice).toBe(65);
  });

  it('qty=300 → 125 zł', () => {
    expect(quoteWizytowki({ format: '85x55', qty: 300, folia: 'none', express: false }).totalPrice).toBe(125);
  });
});

describe('quoteWizytowki – interpolacja liniowa', () => {
  it('qty=75: między 50→65 a 100→75, t=0.5 → 70 zł', () => {
    // t = (75-50)/(100-50) = 0.5 → 65 + 0.5*10 = 70
    expect(quoteWizytowki({ format: '85x55', qty: 75, folia: 'none', express: false }).totalPrice).toBe(70);
  });

  it('qty=350: między 300→125 a 400→145, t=0.5 → 135 zł', () => {
    // t = (350-300)/(400-300) = 0.5 → 125 + 0.5*20 = 135
    expect(quoteWizytowki({ format: '85x55', qty: 350, folia: 'none', express: false }).totalPrice).toBe(135);
  });

  it('qty=25: poniżej min (50) → clamp do 65 zł', () => {
    expect(quoteWizytowki({ format: '85x55', qty: 25, folia: 'none', express: false }).totalPrice).toBe(65);
  });

  it('qty=600 (90x50): między 500→175 a 1000→300, t=0.2 → 200 zł', () => {
    // t = (600-500)/(1000-500) = 0.2 → 175 + 0.2*125 = 200
    expect(quoteWizytowki({ format: '90x50', qty: 600, folia: 'none', express: false }).totalPrice).toBe(200);
  });
});
