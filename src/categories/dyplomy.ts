import { CalculationResult, Modifier } from "../core/types";
import data from "../../data/normalized/dyplomy.json";

export interface DyplomyOptions {
  qty: number;
  sides: number; // 1 or 2
  isSatin: boolean;
  express: boolean;
}

export function calculateDyplomy(options: DyplomyOptions): CalculationResult {
  const { qty, sides, isSatin, express } = options;

  const formatData = data.formats.DL;
  const sidesKey = sides === 1 ? "single" : "double";
  const priceTable = (formatData as any)[sidesKey];

  // Tier selection
  const sortedTiers = Object.keys(priceTable)
    .map(Number)
    .sort((a, b) => a - b);

  let selectedTier = sortedTiers[0];
  for (const tier of sortedTiers) {
    if (qty >= tier) {
      selectedTier = tier;
    }
  }

  const basePrice = priceTable[selectedTier.toString()];

  const modifiers: Modifier[] = [];

  // Bulk discount for qty >= 6
  if (qty >= data.modifiers.bulkDiscountThreshold) {
    modifiers.push({
      id: "bulk-discount",
      name: `Rabat -${data.modifiers.bulkDiscount * 100}% (od ${data.modifiers.bulkDiscountThreshold} szt)`,
      type: "percentage",
      value: -data.modifiers.bulkDiscount
    });
  }

  if (isSatin) {
    modifiers.push({
      id: "satin",
      name: "Papier satynowy (+12%)",
      type: "percentage",
      value: data.modifiers.satin
    });
  }
  if (express) {
    modifiers.push({
      id: "express",
      name: "EXPRESS (+20%)",
      type: "percentage",
      value: data.modifiers.express
    });
  }

  let modifiersTotal = 0;
  const appliedModifiers: string[] = [];

  for (const mod of modifiers) {
    if (mod.type === "percent" || (mod.type as any) === "percentage") {
      modifiersTotal += basePrice * mod.value;
      appliedModifiers.push(mod.name);
    }
  }

  const totalPrice = basePrice + modifiersTotal;

  return {
    basePrice,
    effectiveQuantity: qty,
    tierPrice: basePrice / qty,
    modifiersTotal,
    totalPrice: Math.round(totalPrice * 100) / 100,
    appliedModifiers
  };
}
