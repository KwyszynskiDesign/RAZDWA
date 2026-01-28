import { calculatePrice } from "../core/pricing";
import { PriceTable, CalculationResult } from "../core/types";
import * as data from "../../data/normalized/solwent-plakaty.json";

export interface SolwentPlakatyInput {
  areaM2: number;
  material: string;
  express?: boolean;
}

export function calculateSolwentPlakaty(input: SolwentPlakatyInput): CalculationResult {
  const tableData = data as any;

  // Find material by name in the list
  const materialData = tableData.materials.find((m: any) => m.name === input.material);

  if (!materialData) {
    throw new Error(`Unknown material: ${input.material}`);
  }

  const priceTable: PriceTable = {
    id: tableData.id,
    title: tableData.title,
    unit: tableData.unit,
    pricing: tableData.pricing,
    tiers: materialData.tiers,
    rules: tableData.rules,
    modifiers: tableData.modifiers
  };

  const activeModifiers: string[] = [];
  if (input.express) {
    activeModifiers.push("express");
  }

  return calculatePrice(priceTable, input.areaM2, activeModifiers);
}
