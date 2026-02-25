import _config from "../../config/prices.json";
import { calculatePrice } from "../core/pricing";
import { PriceTable, CalculationResult } from "../core/types";
import { resolveStoredPrice } from "../core/compat";

const prices: any = _config.ulotkiJednostronne;

export interface UlotkiJednostronneOptions {
  qty: number;
  format: string;
  express: boolean;
}

export function getUlotkiJednostronneTable(formatKey: string): PriceTable {
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
      { id: "express", name: "TRYB EXPRESS", type: "percent", value: resolveStoredPrice("modifier-express", 0.20) }
    ]
  };
}

export function quoteJednostronne(options: UlotkiJednostronneOptions): CalculationResult {
  const table = getUlotkiJednostronneTable(options.format);
  const activeModifiers = [];
  if (options.express) activeModifiers.push("express");

  return calculatePrice(table, options.qty, activeModifiers);
}
