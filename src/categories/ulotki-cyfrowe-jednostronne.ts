import { getPrice } from "../services/priceService";
import { calculatePrice } from "../core/pricing";

import { PriceTable, CalculationResult } from "../core/types";
import { resolveStoredPrice } from "../core/compat";

const prices: any = getPrice("ulotkiJednostronne");

export interface UlotkiJednostronneOptions {
  qty: number;
  format: string;
  express: boolean;
}

export function getUlotkiJednostronneTable(formatKey: string): PriceTable {
  const prices = getPrice("ulotkiJednostronne") as any;
  const formatData = (prices?.formats as any)?.[formatKey];
  if (!formatData) {
    throw new Error(`Invalid format: ${formatKey}`);
  }

  const fk = formatKey.toLowerCase();
  const tiersWithOverrides = formatData.tiers.map((tier: any) => ({
    ...tier,
    price: resolveStoredPrice(`ulotki-jed-${fk}-${tier.min}`, tier.price)
  }));

  return {
    id: `ulotki-cyfrowe-jednostronne-${formatKey.toLowerCase()}`,
    title: `Ulotki Cyfrowe Jednostronne ${formatData.name}`,
    unit: "szt",
    pricing: "flat",
    tiers: tiersWithOverrides,
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
