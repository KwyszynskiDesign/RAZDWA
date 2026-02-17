import { PriceTable, Tier, Rule, Modifier, CalculationResult } from "./types";
import { priceStore } from "./price-store";

export function findTier(tiers: Tier[], quantity: number): Tier {
  const sorted = [...tiers].sort((a, b) => a.min - b.min);

  // 1. Exact range match
  const tier = sorted.find(
    (t) => quantity >= t.min && (t.max === null || quantity <= t.max)
  );
  if (tier) return tier;

  // 2. "Point-based" tiers fallback: find first tier where min >= quantity
  const nextTier = sorted.find((t) => t.min >= quantity);
  if (nextTier) return nextTier;

  // 3. Last tier fallback
  return sorted[sorted.length - 1];
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

  // Dynamic pricing from PriceStore
  const dynamicTiers = priceStore.registerTiers(table.id, table.title, table.tiers);
  const tier = findTier(dynamicTiers, effectiveQuantity);

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
        const modValue = priceStore.register(`${table.id}-mod-${modifier.id}`, table.title, modifier.name, modifier.value);
        if (modifier.type === "percent") {
          modifiersTotal += basePrice * modValue;
        } else if (modifier.type === "fixed_per_unit") {
          modifiersTotal += modValue * effectiveQuantity;
        } else {
          modifiersTotal += modValue;
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

/**
 * Universal calculation logic requested by user:
 * finalPrice = (basePrice × multipliers) + additionalCosts
 */
export function calculateUniversal(
  productId: string,
  quantity: number,
  options: {
    sides?: number; // multiplier e.g. 1 or 1.8
    multipliers?: number[]; // other multipliers
    addons?: string[]; // IDs of addons to apply
  }
): CalculationResult {
  const rules = priceStore.getRules(productId);

  // 1. Find base price for quantity (threshold logic)
  const baseRules = rules.filter(r => r.type === "base").sort((a, b) => (a.threshold || 0) - (b.threshold || 0));
  let selectedBase = baseRules[0];
  for (const r of baseRules) {
    if (quantity >= (r.threshold || 0)) {
      selectedBase = r;
    }
  }

  const baseValue = selectedBase ? selectedBase.value : 0;

  // 2. Apply multipliers
  let combinedMultiplier = 1;
  if (options.sides) combinedMultiplier *= options.sides;
  if (options.multipliers) {
    for (const m of options.multipliers) combinedMultiplier *= m;
  }

  // Apply registered multiplier rules from store
  const multiplierRules = rules.filter(r => r.type === "multiplier");
  for (const r of multiplierRules) {
    // If name matches something in options... (simplified for now)
    // combinedMultiplier *= r.value;
  }

  const baseTotal = baseValue * combinedMultiplier;

  // 3. Add addons
  let addonsTotal = 0;
  const appliedModifiers: string[] = [];
  const addonRules = rules.filter(r => r.type === "addon");
  if (options.addons) {
    for (const addonId of options.addons) {
      const rule = addonRules.find(r => r.name === addonId);
      if (rule) {
        addonsTotal += rule.value;
        appliedModifiers.push(rule.name);
      }
    }
  }

  const totalPrice = baseTotal + addonsTotal;

  return {
    basePrice: baseValue,
    totalPrice: parseFloat(totalPrice.toFixed(2)),
    effectiveQuantity: quantity,
    tierPrice: baseValue / quantity, // approximate
    modifiersTotal: totalPrice - baseTotal,
    appliedModifiers
  };
}
