import { PriceTable, CalculationResult, Tier, Modifier, Rule } from "./types";
export function calculatePrice(quantity: number, table: PriceTable, selectedModifiers: string[] = []): CalculationResult {
  let effectiveQuantity = quantity;
  if (table.rules) {
    for (const rule of table.rules) {
      if (rule.type === "minimum" && rule.unit === table.unit) {
        if (effectiveQuantity < rule.value) effectiveQuantity = rule.value;
      }
    }
  }
  const tier = table.tiers.find(t => effectiveQuantity >= t.min && (t.max === null || effectiveQuantity <= t.max));
  if (!tier) throw new Error(`No tier found for quantity ${effectiveQuantity}`);
  let basePrice = table.pricing === "per_unit" ? effectiveQuantity * tier.price : tier.price;
  let totalPrice = basePrice;
  const appliedModifiersList = [];
  if (table.modifiers) {
    for (const modId of selectedModifiers) {
      const modifier = table.modifiers.find(m => m.id === modId);
      if (modifier) {
        if (modifier.type === "percent") {
          const modValue = basePrice * (modifier.value / 100);
          totalPrice += modValue;
          appliedModifiersList.push({ id: modifier.id, value: modValue, type: "percent" });
        } else if (modifier.type === "fixed") {
          totalPrice += modifier.value;
          appliedModifiersList.push({ id: modifier.id, value: modifier.value, type: "fixed" });
        }
      }
    }
  }
  return { basePrice, totalPrice, appliedTiers: tier, appliedModifiers: appliedModifiersList, quantity, effectiveQuantity, unit: table.unit };
}
