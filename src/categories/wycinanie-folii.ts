import { calculatePrice } from "../core/pricing";
import { CalculationResult, PriceTable } from "../core/types";
import { getPrice } from "../services/priceService";
import { resolveStoredPrice } from "../core/compat";

export interface WycinanieFoliiOptions {
  variantId: "kolorowa" | "zloto-srebro";
  widthMm: number;
  heightMm: number;
  express: boolean;
}

export function calculateWycinanieFolii(options: WycinanieFoliiOptions): CalculationResult {
  const data = getPrice("wycinanieFolii") as any;
  const variant = data?.variants?.find((v: any) => v.id === options.variantId);

  if (!variant) {
    throw new Error(`Unknown folia variant: ${options.variantId}`);
  }

  const areaM2 = (options.widthMm * options.heightMm) / 1_000_000;
  if (!isFinite(areaM2) || areaM2 <= 0) {
    throw new Error("Nieprawidłowa powierzchnia");
  }

  const areaBracket = areaM2 < 1 ? "ponizej-1m2" : "powyzej-1m2";
  const baseRate = areaM2 < 1
    ? variant.rates.below1m2
    : variant.rates.aboveOrEqual1m2;

  const storedKey = `wycinanie-folii-${options.variantId}-${areaBracket}`;
  const tierRate = resolveStoredPrice(storedKey, baseRate);

  const table: PriceTable = {
    id: `${data?.id ?? "wycinanie-folii"}-${options.variantId}-${areaBracket}`,
    title: data?.title ?? "Wycinanie z folii",
    unit: "m2",
    pricing: "per_unit",
    tiers: [{ min: 0, max: null, price: tierRate }],
    rules: data?.rules,
    modifiers: data?.modifiers
  };

  const activeModifiers: string[] = [];
  if (options.express) activeModifiers.push("express");

  return calculatePrice(table, areaM2, activeModifiers);
}
