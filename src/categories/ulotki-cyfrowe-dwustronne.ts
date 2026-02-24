import _config from "../../config/prices.json";
import { calculatePrice } from "../core/pricing";
import { PriceTable, CalculationResult } from "../core/types";

const prices: any = _config.ulotkiDwustronne;

export interface UlotkiDwustronneOptions {
  qty: number;
  format: string;
  express: boolean;
}

export function getUlotkiDwustronneTable(formatKey: string): PriceTable {
  const formatData = (prices.formats as any)[formatKey];
  if (!formatData) {
    throw new Error(`Invalid format: ${formatKey}`);
  }

  return {
    id: `ulotki-cyfrowe-dwustronne-${formatKey.toLowerCase()}`,
    title: `Ulotki Cyfrowe Dwustronne ${formatData.name}`,
    unit: "szt",
    pricing: "flat",
    tiers: formatData.tiers,
    modifiers: [
      { id: "express", name: "TRYB EXPRESS", type: "percent", value: 0.20 }
    ]
  };
}

export function quoteUlotkiDwustronne(options: UlotkiDwustronneOptions): CalculationResult {
  const table = getUlotkiDwustronneTable(options.format);
  const activeModifiers = [];
  if (options.express) activeModifiers.push("express");

  return calculatePrice(table, options.qty, activeModifiers);
}
