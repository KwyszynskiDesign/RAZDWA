import data from "../../data/normalized/vouchery.json";
import { CalculationResult } from "../core/types";

export interface VoucheryOptions {
  qty: number;
  sides: "single" | "double";
  satin: boolean;
  express: boolean;
}

export function quoteVouchery(options: VoucheryOptions): any {
  const tiers = data as any[];

  // Find the exact tier or the next one
  let tier = tiers.find(t => t.qty === options.qty);
  if (!tier) {
    // If not exact, find the first tier where t.qty >= options.qty
    tier = tiers.find(t => t.qty >= options.qty);
  }
  if (!tier) {
    tier = tiers[tiers.length - 1];
  }

  const basePrice = tier[options.sides];
  let percentageSum = 0;

  if (options.satin) {
    percentageSum += 0.12;
  }
  if (options.express) {
    percentageSum += 0.20;
  }

  const modifiersTotal = basePrice * (options.satin ? 0.12 : 0);
  const total = basePrice * (1 + percentageSum);

  return {
    basePrice,
    modifiersTotal: parseFloat(modifiersTotal.toFixed(2)),
    totalPrice: parseFloat(total.toFixed(2))
  };
}

// Keep the old export for compatibility if needed elsewhere
export const voucheryCategory: any = {
    id: "vouchery",
    name: "Vouchery"
};
