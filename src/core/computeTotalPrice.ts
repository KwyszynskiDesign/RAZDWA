/**
 * /src/core/computeTotalPrice.ts
 * Main pricing entry point that chains calculateBasePrice → applyDiscounts
 * → computeShipping → addTaxes to produce a final CalculationResult.
 */

import { calculateBasePrice, BaseCalcTable } from './calculateBasePrice';
import { applyDiscounts } from './applyDiscounts';
import { addTaxes } from './addTaxes';
import { computeShipping } from './computeShipping';
import type { CalculationResult as CoreCalculationResult } from './types';

type SimpleModifier = { id: string; name?: string; type: string; value: number };
type SimpleRule = { type: string; unit: string; value: number };

export interface SimplePriceTable extends BaseCalcTable {
  modifiers?: SimpleModifier[];
  rules?: SimpleRule[];
}

export type CalculationResult = CoreCalculationResult;

export function computeTotalPrice(
  table: SimplePriceTable,
  qty: number,
  activeModifiers: string[] = []
): CalculationResult {
  const { basePrice, effectiveQuantity, tierPrice } = calculateBasePrice(table, qty);
  const { modifiersTotal, appliedModifiers } = applyDiscounts(
    basePrice,
    effectiveQuantity,
    activeModifiers,
    (table.modifiers ?? []).map(modifier => ({
      ...modifier,
      name: modifier.name ?? modifier.id,
    }))
  );

  let totalPrice = basePrice + modifiersTotal;
  totalPrice += computeShipping(totalPrice);
  totalPrice = addTaxes(totalPrice);

  const minPLNRule = (table.rules ?? []).find(r => r.type === 'minimum' && r.unit === 'pln');
  if (minPLNRule && totalPrice < minPLNRule.value) totalPrice = minPLNRule.value;

  return {
    basePrice,
    effectiveQuantity,
    tierPrice,
    modifiersTotal,
    totalPrice: parseFloat(totalPrice.toFixed(2)),
    appliedModifiers,
  };
}
