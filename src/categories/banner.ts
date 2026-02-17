import { calculatePrice } from "../core/pricing";
import { PriceTable, CalculationResult } from "../core/types";
import data from "../../data/normalized/banner.json";
import { priceStore } from "../core/price-store";

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

  const category = "Bannery";
  const prefix = `banner-${options.material}`;

  const dynamicTiers = priceStore.registerTiers(prefix, category, materialData.tiers);
  const dynamicModifiers = tableData.modifiers.map((mod: any) => ({
    ...mod,
    value: priceStore.register(`banner-mod-${mod.id}`, category, `Dopłata ${mod.name}`, mod.value)
  }));

  const priceTable: PriceTable = {
    id: tableData.id,
    title: tableData.title,
    unit: tableData.unit,
    pricing: tableData.pricing,
    tiers: dynamicTiers,
    modifiers: dynamicModifiers
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
