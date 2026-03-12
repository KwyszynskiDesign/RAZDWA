import { getPrice } from "../services/priceService";
import { calculatePrice } from "../core/pricing";

import { PriceTable, CalculationResult } from "../core/types";
import { resolveStoredPrice } from "../core/compat";

const prices: any = getPrice("ulotkiDwustronne");

export interface UlotkiDwustronneOptions {
  qty: number;
  format: string;
  express: boolean;
}

export function getUlotkiDwustronneTable(formatKey: string): PriceTable {
  const prices = getPrice('ulotkiDwustronne');
  const formatData = (prices.formats as any)[formatKey];
  if (!formatData) {
    throw new Error(`Invalid format: ${formatKey}`);
  }

  const fk = formatKey.toLowerCase();
  const tiersWithOverrides = formatData.tiers.map((tier: any) => ({
    ...tier,
    price: resolveStoredPrice(`ulotki-dwu-${fk}-${tier.min}`, tier.price)
  }));

  return {
    id: `ulotki-cyfrowe-dwustronne-${formatKey.toLowerCase()}`,
    title: `Ulotki Cyfrowe Dwustronne ${formatData.name}`,
    unit: "szt",
    pricing: "flat",
    tiers: tiersWithOverrides,
    modifiers: [
      { id: "express", name: "TRYB EXPRESS", type: "percent", value: resolveStoredPrice("modifier-express", 0.20) }
    ]
  };
}

export function quoteUlotkiDwustronne(options: UlotkiDwustronneOptions): CalculationResult {
  const table = getUlotkiDwustronneTable(options.format);
  const activeModifiers = [];
  if (options.express) activeModifiers.push("express");

  return calculatePrice(table, options.qty, activeModifiers);
}
