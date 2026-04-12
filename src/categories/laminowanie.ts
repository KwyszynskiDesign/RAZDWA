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

export interface WydrukiSpecjalneOptions {
  variantId: string;
  qty: number;
  doubleSided: boolean;
  express: boolean;
}

export interface WydrukiSpecjalneResult {
  variantId: string;
  variantName: string;
  qty: number;
  unitPrice: number;
  doubleSided: boolean;
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
  const requestedId = options.serviceId === "druk-powyzej-20"
    ? "dziurkowanie-powyzej-20"
    : options.serviceId;
  const item = laminowanieData?.introligatornia?.items?.find((i: any) => i.id === requestedId);

  if (!item) {
    throw new Error(`Invalid introligatornia service: ${options.serviceId}`);
  }

  const qty = Math.max(1, Math.floor(options.qty));
  const normalizedId = item.id === "druk-powyzej-20" ? "dziurkowanie-powyzej-20" : item.id;
  const unitPrice = normalizedId === "dziurkowanie-powyzej-20"
    ? resolveStoredPrice(
      "laminowanie-intro-dziurkowanie-powyzej-20",
      resolveStoredPrice("laminowanie-intro-druk-powyzej-20", item.price)
    )
    : resolveStoredPrice(`laminowanie-intro-${normalizedId}`, item.price);
  const basePrice = unitPrice * qty;
  const totalPrice = parseFloat(basePrice.toFixed(2));

  return {
    serviceId: normalizedId,
    serviceName: item.name,
    qty,
    unitPrice,
    totalPrice,
  };
}

export function quoteWydrukiSpecjalne(options: WydrukiSpecjalneOptions): WydrukiSpecjalneResult {
  const laminowanieData = getPrice('laminowanie') as any;
  const variant = laminowanieData?.specialPrints?.items?.find((i: any) => i.id === options.variantId);

  if (!variant) {
    throw new Error(`Invalid special print variant: ${options.variantId}`);
  }

  const qty = Math.max(1, Math.floor(options.qty));
  const unitPrice = resolveStoredPrice(`laminowanie-special-${variant.id}`, variant.price);
  const doubleSidedFactor = resolveStoredPrice("laminowanie-special-double-sided-factor", 0.5);

  let totalPrice = unitPrice * qty;
  if (options.doubleSided) {
    totalPrice *= (1 + doubleSidedFactor);
  }
  if (options.express) {
    totalPrice *= 1.2;
  }

  return {
    variantId: variant.id,
    variantName: variant.name,
    qty,
    unitPrice,
    doubleSided: options.doubleSided,
    totalPrice: parseFloat(totalPrice.toFixed(2)),
  };
}
