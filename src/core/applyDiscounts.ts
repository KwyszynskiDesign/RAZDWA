/**
 * /src/core/applyDiscounts.ts
 * Applies percentage and fixed modifiers (discounts/surcharges) to a base price.
 */

type SimpleModifier = { id: string; name: string; type: string; value: number };

export interface DiscountsResult {
  modifiersTotal: number;
  appliedModifiers: string[];
}

export function applyDiscounts(
  basePrice: number,
  effectiveQuantity: number,
  activeModifiers: string[],
  modifiers: SimpleModifier[]
): DiscountsResult {
  let modifiersTotal = 0;
  const appliedModifiers: string[] = [];

  for (const modId of activeModifiers) {
    const mod = modifiers.find(m => m.id === modId);
    if (mod) {
      appliedModifiers.push(mod.name);
      if (mod.type === 'percent') {
        modifiersTotal += basePrice * mod.value;
      } else if (mod.type === 'fixed_per_unit') {
        modifiersTotal += mod.value * effectiveQuantity;
      } else {
        modifiersTotal += mod.value;
      }
    }
  }

  return { modifiersTotal, appliedModifiers };
}
