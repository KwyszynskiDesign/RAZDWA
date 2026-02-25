import { calculatePrice } from "../core/pricing";
import { priceService } from "../services/priceService";
import { PriceTable, CalculationResult } from "../core/types";

export interface UlotkiJednostronneOptions {
  qty: number;
  format: string;
  express: boolean;
}

export function getUlotkiJednostronneTable(formatKey: string): PriceTable {
  const prices = priceService.loadSync('ulotki-cyfrowe-jednostronne');
  const formatData = (prices.formats as any)[formatKey];
  if (!formatData) {
    throw new Error(`Invalid format: ${formatKey}`);
  }

  return {
    id: `ulotki-cyfrowe-jednostronne-${formatKey.toLowerCase()}`,
    title: `Ulotki Cyfrowe Jednostronne ${formatData.name}`,
    unit: "szt",
    pricing: "flat",
    tiers: formatData.tiers,
    modifiers: [
      { id: "express", name: "TRYB EXPRESS", type: "percent", value: 0.20 }
    ]
  };
}

export function quoteJednostronne(options: UlotkiJednostronneOptions): CalculationResult {
  const table = getUlotkiJednostronneTable(options.format);
  const activeModifiers = [];
  if (options.express) activeModifiers.push("express");

  return calculatePrice(table, options.qty, activeModifiers);
}
