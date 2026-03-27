import { calculatePrice } from "../core/pricing";
import { CalculationResult, PriceTable } from "../core/types";
import { getPrice } from "../services/priceService";

export interface WycinanieFoliiOptions {
  variantId: "kolorowa" | "zloto-srebro";
  widthMm: number;
  heightMm: number;
  express: boolean;
}

export function calculateWycinanieFolii(options: WycinanieFoliiOptions): CalculationResult {
  const areaM2 = (options.widthMm * options.heightMm) / 1_000_000;
  if (!isFinite(areaM2) || areaM2 <= 0) {
    throw new Error("Nieprawidłowa powierzchnia");
  }

  const areaBracket = areaM2 < 1 ? "ponizej-1m2" : "powyzej-1m2";
  const variantId = options.variantId;
  const storedKey = `wycinanie-folii-${variantId}-${areaBracket}`;
  
  const data = getPrice("defaultPrices") as any;
  const tierRate = data?.[storedKey] ?? 125;

  const table: PriceTable = {
    id: `wycinanie-folii-${variantId}-${areaBracket}`,
    title: "Wycinanie z folii",
    unit: "m2",
    pricing: "per_unit",
    tiers: [{ min: 0, max: null, price: tierRate }],
    rules: [{ type: "minimum" as const, unit: "pln", value: 30 }],
    modifiers: [{ id: "express", type: "percent" as const, name: "EXPRESS", value: 0.20 }]
  };

  const activeModifiers: string[] = [];
  if (options.express) activeModifiers.push("express");

  return calculatePrice(table, areaM2, activeModifiers);
}
