import { getPrice } from "../services/priceService";
import { calculatePrice } from "../core/pricing";
import { PriceTable, CalculationResult } from "../core/types";
import { overrideTiersWithStoredPrices, resolveStoredPrice } from "../core/compat";

const prices: any = getPrice("laminowanie");

export interface LaminowanieOptions {
  qty: number;
  format: string;
  express: boolean;
}

export function getLaminowanieTable(formatKey: string): PriceTable {
  const tiers = (prices.formats as any)[formatKey];
  if (!tiers) {
    throw new Error(`Invalid format: ${formatKey}`);
  }

  return {
    id: `laminowanie-${formatKey.toLowerCase()}`,
    title: `Laminowanie ${formatKey}`,
    unit: "szt",
    pricing: "per_unit",
    tiers: overrideTiersWithStoredPrices(`laminowanie-${formatKey.toLowerCase()}`, tiers),
    modifiers: [
      { id: "express", name: "TRYB EXPRESS", type: "percent", value: resolveStoredPrice("modifier-express", 0.20) }
    ]
  };
}

export function quoteLaminowanie(options: LaminowanieOptions): CalculationResult {
  const table = getLaminowanieTable(options.format);
  const activeModifiers = [];
  if (options.express) activeModifiers.push("express");

  return calculatePrice(table, options.qty, activeModifiers);
}
