import prices from "../../data/normalized/wizytowki-druk-cyfrowy.json";
import { calculatePrice } from "../core/pricing";
import { PriceTable, CalculationResult } from "../core/types";

export interface WizytowkiOptions {
  format: '85x55' | '90x50';
  folia: 'none' | 'matt_gloss';
  qty: number;
  express: boolean;
}

export function getWizytowkiTable(format: '85x55' | '90x50', folia: 'none' | 'matt_gloss'): PriceTable {
  const formatData = (prices as any)[format];
  const tierData = formatData[folia];

  const tiers = tierData.map((t: any, index: number) => {
    const prevQty = index === 0 ? 0 : tierData[index - 1].qty;
    return {
      min: prevQty + 1,
      max: t.qty,
      price: t.price
    };
  });

  return {
    id: `wizytowki-${format}-${folia}`,
    title: `Wizytówki ${format} ${folia === 'none' ? '(bez foliowania)' : '(foliowane)'}`,
    unit: "szt",
    pricing: "flat",
    tiers,
    modifiers: [
      { id: "express", name: "TRYB EXPRESS", type: "percent", value: 0.20 }
    ]
  };
}

export function quoteWizytowki(options: WizytowkiOptions): CalculationResult {
  const table = getWizytowkiTable(options.format, options.folia);
  const activeModifiers = [];
  if (options.express) activeModifiers.push("express");

  return calculatePrice(table, options.qty, activeModifiers);
}
