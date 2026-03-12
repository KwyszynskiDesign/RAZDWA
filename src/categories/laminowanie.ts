import { getPrice } from "../services/priceService";
import { calculatePrice } from "../core/pricing";
import { PriceTable, CalculationResult } from "../core/types";
import { overrideTiersWithStoredPrices, resolveStoredPrice } from "../core/compat";

const prices: any = getPrice("laminowanie");

export interface LaminowanieOptions {
  qty: number;
  format: string;
  express: boolean;
}

export interface IntroligatorniaOptions {
  serviceId: string;
  qty: number;
  express: boolean;
}

export interface IntroligatorniaResult {
  serviceId: string;
  serviceName: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
}

export function getLaminowanieTable(formatKey: string): PriceTable {
  const prices = getPrice('laminowanie');
  const tiers = (prices.formats as any)[formatKey];
  if (!tiers) {
    throw new Error(`Invalid format: ${formatKey}`);
  }

  return {
    id: `laminowanie-${formatKey.toLowerCase()}`,
    title: `Laminowanie ${formatKey}`,
    unit: "szt",
    pricing: "per_unit",
    tiers: overrideTiersWithStoredPrices(`laminowanie-${formatKey.toLowerCase()}`, tiers),
    modifiers: [
      { id: "express", name: "TRYB EXPRESS", type: "percent", value: resolveStoredPrice("modifier-express", 0.20) }
    ]
  };
}

export function quoteLaminowanie(options: LaminowanieOptions): CalculationResult {
  const table = getLaminowanieTable(options.format);
  const activeModifiers = [];
  if (options.express) activeModifiers.push("express");

  return calculatePrice(table, options.qty, activeModifiers);
}

export function quoteIntroligatornia(options: IntroligatorniaOptions): IntroligatorniaResult {
  const laminowanieData = getPrice('laminowanie') as any;
  const item = laminowanieData?.introligatornia?.items?.find((i: any) => i.id === options.serviceId);

  if (!item) {
    throw new Error(`Invalid introligatornia service: ${options.serviceId}`);
  }

  const qty = Math.max(1, Math.floor(options.qty));
  const unitPrice = resolveStoredPrice(`laminowanie-intro-${item.id}`, item.price);
  const basePrice = unitPrice * qty;
  const totalPrice = parseFloat((basePrice * (options.express ? 1.2 : 1)).toFixed(2));

  return {
    serviceId: item.id,
    serviceName: item.name,
    qty,
    unitPrice,
    totalPrice,
  };
}
