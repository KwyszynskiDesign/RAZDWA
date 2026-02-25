import { calculatePrice } from "../core/pricing";
import { PriceTable, CalculationResult } from "../core/types";
import { priceService } from "../services/priceService";

export interface BannerOptions {
  material: string;
  areaM2: number;
  oczkowanie: boolean;
  express?: boolean;
}

export function calculateBanner(options: BannerOptions): CalculationResult {
  const tableData = priceService.loadSync('banner') as any;
  const materialData = tableData.materials.find((m: any) => m.id === options.material);

  if (!materialData) {
    throw new Error(`Unknown material: ${options.material}`);
  }

  const priceTable: PriceTable = {
    id: tableData.id,
    title: tableData.title,
    unit: tableData.unit,
    pricing: tableData.pricing,
    tiers: materialData.tiers,
    modifiers: tableData.modifiers
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
