import prices from "../../data/normalized/ulotki-cyfrowe-jednostronne.json";
import { calculatePrice } from "../core/pricing";
import { PriceTable, CalculationResult } from "../core/types";

export interface UlotkiJednostronneOptions {
  qty: number;
  format: string;
  mode: "jednostronne" | "dwustronne";
  express: boolean;
}

export function getUlotkiJednostronneTable(formatKey: string, mode: "jednostronne" | "dwustronne" = "jednostronne"): PriceTable {
  const modeData = (prices as any)[mode];
  if (!modeData) {
    throw new Error(`Invalid mode: ${mode}`);
  }
  const formatData = modeData[formatKey];
  if (!formatData) {
    throw new Error(`Invalid format: ${formatKey} for mode ${mode}`);
  }

  return {
    id: `ulotki-cyfrowe-${mode}-${formatKey.toLowerCase()}`,
    title: `Ulotki Cyfrowe ${mode === 'dwustronne' ? 'Dwustronne' : 'Jednostronne'} ${formatData.name}`,
    unit: "szt",
    pricing: "flat",
    tiers: formatData.tiers,
    modifiers: [
      { id: "express", name: "TRYB EXPRESS", type: "percent", value: 0.20 }
    ]
  };
}

export function quoteJednostronne(options: UlotkiJednostronneOptions): CalculationResult {
  const table = getUlotkiJednostronneTable(options.format, options.mode);
  const activeModifiers = [];
  if (options.express) activeModifiers.push("express");

  return calculatePrice(table, options.qty, activeModifiers);
}
