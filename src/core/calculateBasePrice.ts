/**
 * /src/core/calculateBasePrice.ts
 * Calculates the base price from a price table and quantity,
 * applying minimum-quantity rules and selecting the correct tier.
 */

type SimpleTier = { min: number; max: number | null; price: number };
type SimpleRule = { type: string; unit: string; value: number };

export interface BaseCalcTable {
  pricing: 'per_unit' | 'flat';
  tiers: SimpleTier[];
  rules?: SimpleRule[];
}

export interface BasePriceResult {
  basePrice: number;
  effectiveQuantity: number;
  tierPrice: number;
}

function findSimpleTier(tiers: SimpleTier[], qty: number): SimpleTier {
  const sorted = [...tiers].sort((a, b) => a.min - b.min);
  const tier = sorted.find(t => qty >= t.min && (t.max === null || qty <= t.max));
  if (tier) return tier;
  const first = sorted.find(t => t.min >= qty);
  return first ?? sorted[sorted.length - 1];
}

export function calculateBasePrice(table: BaseCalcTable, qty: number): BasePriceResult {
  const minQtyRule = (table.rules ?? []).find(r => r.type === 'minimum' && r.unit === 'm2');
  const effectiveQty = (minQtyRule && qty < minQtyRule.value) ? minQtyRule.value : qty;

  const tier = findSimpleTier(table.tiers, effectiveQty);
  const basePrice = table.pricing === 'per_unit' ? effectiveQty * tier.price : tier.price;

  return {
    basePrice,
    effectiveQuantity: effectiveQty,
    tierPrice: tier.price,
  };
}
