/**
 * /src/core/computeTotalPrice.ts
 * Main pricing entry point that chains calculateBasePrice → applyDiscounts
 * → computeShipping → addTaxes to produce a final CalculationResult.
 */

import { calculateBasePrice, BaseCalcTable } from './calculateBasePrice';
import { applyDiscounts } from './applyDiscounts';
import { addTaxes } from './addTaxes';
import { computeShipping } from './computeShipping';

type SimpleModifier = { id: string; name: string; type: string; value: number };
type SimpleRule = { type: string; unit: string; value: number };

export interface SimplePriceTable extends BaseCalcTable {
  modifiers?: SimpleModifier[];
  rules?: SimpleRule[];
}

export interface CalculationResult {
  basePrice: number;
  effectiveQuantity: number;
  tierPrice: number;
  modifiersTotal: number;
  totalPrice: number;
  appliedModifiers: string[];
}

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
    table.modifiers ?? []
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
