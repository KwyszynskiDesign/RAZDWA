import { calculatePrice } from "../core/pricing";
import { PriceTable, CalculationResult } from "../core/types";
import _config from "../../config/prices.json";
import { overrideTiersWithStoredPrices, resolveStoredPrice } from "../core/compat";

const data: any = _config.banner;

export interface BannerOptions {
  material: string;
  areaM2: number;
  oczkowanie: boolean;
  express?: boolean;
}

export function calculateBanner(options: BannerOptions): CalculationResult {
  const tableData = data as any;
  const materialData = tableData.materials.find((m: any) => m.id === options.material);

  if (!materialData) {
    throw new Error(`Unknown material: ${options.material}`);
  }

  const priceTable: PriceTable = {
    id: tableData.id,
    title: tableData.title,
    unit: tableData.unit,
    pricing: tableData.pricing,
    tiers: overrideTiersWithStoredPrices(`banner-${options.material}`, materialData.tiers),
    modifiers: tableData.modifiers.map((m: any) =>
      m.id === "oczkowanie"
        ? { ...m, value: resolveStoredPrice("banner-oczkowanie", m.value) }
        : m
    )
  };

  const activeModifiers: string[] = [];
  if (options.oczkowanie) {
    activeModifiers.push("oczkowanie");
  }
  if (options.express) {
    activeModifiers.push("express");
  }

  return calculatePrice(priceTable, options.areaM2, activeModifiers);
}
