import { calculatePrice } from "../core/pricing";
import { PriceTable, CalculationResult } from "../core/types";
import * as data from "../../data/normalized/banner.json";

export interface BannerInput {
  areaM2: number;
  material: string;
  oczkowanie: boolean;
  express?: boolean;
}

export function calculateBanner(input: BannerInput): CalculationResult {
  const tableData = data as any;
  const materialData = tableData.materials.find((m: any) => m.id === input.material);

  if (!materialData) {
    throw new Error(`Unknown material: ${input.material}`);
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
  if (input.oczkowanie) {
    activeModifiers.push("oczkowanie");
  }
  if (input.express) {
    activeModifiers.push("express");
  }

  return calculatePrice(priceTable, input.areaM2, activeModifiers);
}
