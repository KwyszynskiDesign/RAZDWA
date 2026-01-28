import { PriceTable, Tier, Rule, Modifier, CalculationResult } from "./types";

export function findTier(tiers: Tier[], quantity: number): Tier {
  const tier = tiers.find(
    (t) => quantity >= t.min && (t.max === null || quantity <= t.max)
  );
  if (!tier) {
    return tiers[tiers.length - 1];
  }
  return tier;
}

export function applyMinimumRule(quantity: number, rules?: Rule[]): number {
  if (!rules) return quantity;

  const m2Rule = rules.find(r => r.type === "minimum" && r.unit === "m2");
  if (m2Rule && quantity < m2Rule.value) {
    return m2Rule.value;
  }

  return quantity;
}

export function calculatePrice(
  table: PriceTable,
  quantity: number,
  activeModifierIds: string[] = []
): CalculationResult {
  const effectiveQuantity = applyMinimumRule(quantity, table.rules);
  const tier = findTier(table.tiers, effectiveQuantity);

  let basePrice = 0;
  if (table.pricing === "per_unit") {
    basePrice = effectiveQuantity * tier.price;
  } else {
    basePrice = tier.price;
  }

  let modifiersTotal = 0;
  const appliedModifiers: string[] = [];

  if (table.modifiers) {
    for (const modId of activeModifierIds) {
      const modifier = table.modifiers.find(m => m.id === modId);
      if (modifier) {
        appliedModifiers.push(modifier.name);
        if (modifier.type === "percent") {
          modifiersTotal += basePrice * modifier.value;
        } else if (modifier.type === "fixed_per_unit") {
          modifiersTotal += modifier.value * effectiveQuantity;
        } else {
          modifiersTotal += modifier.value;
        }
      }
    }
  }

  let totalPrice = basePrice + modifiersTotal;

  const plnRule = table.rules?.find(r => r.type === "minimum" && r.unit === "pln");
  if (plnRule && totalPrice < plnRule.value) {
    totalPrice = plnRule.value;
  }

  return {
    basePrice,
    effectiveQuantity,
    tierPrice: tier.price,
    modifiersTotal,
    totalPrice: parseFloat(totalPrice.toFixed(2)),
    appliedModifiers
  };
}
