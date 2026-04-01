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

  const variantId = options.variantId;
  const data = getPrice("defaultPrices") as any;

  // Dwie stawki per wariant: powyżej/równe 1m2 (tańsza) i poniżej 1m2 (droższa)
  const defaultAbove = variantId === "zloto-srebro" ? 150 : 125;
  const defaultBelow = variantId === "zloto-srebro" ? 220 : 200;
  const rateAbove = data?.[`wycinanie-folii-${variantId}`] ?? defaultAbove;
  const rateBelow = data?.[`wycinanie-folii-${variantId}-ponizej`] ?? defaultBelow;

  // Wybieramy stawkę przed zbudowaniem tabeli, żeby uniknąć problemów z float granicą 1m2
  const activeRate = areaM2 < 1 ? rateBelow : rateAbove;

  const table: PriceTable = {
    id: `wycinanie-folii-${variantId}`,
    title: "Wycinanie z folii",
    unit: "m2",
    pricing: "per_unit",
    tiers: [{ min: 0, max: null, price: activeRate }],
    rules: [{ type: "minimum" as const, unit: "pln", value: 30 }],
    modifiers: [{ id: "express", type: "percent" as const, name: "EXPRESS", value: 0.20 }]
  };

  const activeModifiers: string[] = [];
  if (options.express) activeModifiers.push("express");

  return calculatePrice(table, areaM2, activeModifiers);
}
