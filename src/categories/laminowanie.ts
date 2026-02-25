import { calculatePrice } from "../core/pricing";
import { priceService } from "../services/priceService";
import { PriceTable, CalculationResult } from "../core/types";

export interface LaminowanieOptions {
  qty: number;
  format: string;
  express: boolean;
}

export function getLaminowanieTable(formatKey: string): PriceTable {
  const prices = priceService.loadSync('laminowanie');
  const tiers = (prices.formats as any)[formatKey];
  if (!tiers) {
    throw new Error(`Invalid format: ${formatKey}`);
  }

  return {
    id: `laminowanie-${formatKey.toLowerCase()}`,
    title: `Laminowanie ${formatKey}`,
    unit: "szt",
    pricing: "per_unit",
    tiers: tiers,
    modifiers: [
      { id: "express", name: "TRYB EXPRESS", type: "percent", value: 0.20 }
    ]
  };
}

export function quoteLaminowanie(options: LaminowanieOptions): CalculationResult {
  const table = getLaminowanieTable(options.format);
  const activeModifiers = [];
  if (options.express) activeModifiers.push("express");

  return calculatePrice(table, options.qty, activeModifiers);
}
