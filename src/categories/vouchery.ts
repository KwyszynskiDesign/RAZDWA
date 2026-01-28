import prices from "../../data/normalized/vouchery.json";
import { calculatePrice } from "../core/pricing";
import { PriceTable, CalculationResult } from "../core/types";

export interface VoucheryOptions {
  qty: number;
  sides: 'single' | 'double';
  satin: boolean;
  express: boolean;
}

export function getVoucheryTable(sides: 'single' | 'double'): PriceTable {
  const tiers = prices.map((p, index) => {
    const prevQty = index === 0 ? 0 : prices[index - 1].qty;
    return {
      min: prevQty + 1,
      max: p.qty,
      price: sides === 'single' ? p.single : p.double
    };
  });

  return {
    id: `vouchery-${sides}`,
    title: `Vouchery A4 ${sides === 'single' ? 'jednostronne' : 'dwustronne'}`,
    unit: "szt",
    pricing: "flat",
    tiers,
    modifiers: [
      { id: "satin", name: "Papier satynowy", type: "percent", value: 0.12 },
      { id: "express", name: "TRYB EXPRESS", type: "percent", value: 0.20 }
    ]
  };
}

export function quoteVouchery(options: VoucheryOptions): CalculationResult {
  const table = getVoucheryTable(options.sides);
  const activeModifiers = [];
  if (options.satin) activeModifiers.push("satin");
  if (options.express) activeModifiers.push("express");

  return calculatePrice(table, options.qty, activeModifiers);
}
