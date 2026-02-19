import { CalculationResult, Modifier } from "../core/types";
import data from "../../data/normalized/zaproszenia-kreda.json";

export interface ZaproszeniaKredaOptions  {
  format: string; //  "A6", "A5", "DL"
  qty: number;
  sides: number; // 1 or 2
  isFolded: boolean;
  isSatin: boolean;
  express: boolean;
}

export function calculateZaproszeniaKreda(options: ZaproszeniaKredaOptions): CalculationResult {
  const { format, qty, sides, isFolded, isSatin, express } = options;

  const formatData = (data.formats as any)[format];
  if (!formatData) {
    throw new Error(`Invalid format: ${format}`);
  }

  const sidesKey = sides === 1 ? "single" : "double";
  const typeKey = isFolded ? "folded" : "normal";
  const priceTable = formatData[sidesKey][typeKey];

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
  if (isSatin) {
    modifiers.push({
      id: "satin",
      name: "Papier satynowy  (+12%)",
      type: "percentage",
      value: data.modifiers.satin
    });
  }
  if (express) {
    modifiers.push({
      id: "express",
      name: "EXPRESS  (+20%)",<｜begin▁of▁sentence｜>",
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
