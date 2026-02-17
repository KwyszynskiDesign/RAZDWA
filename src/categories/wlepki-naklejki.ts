import { calculatePrice } from "../core/pricing";
import { PriceTable, CalculationResult } from "../core/types";
import * as data from "../../data/normalized/wlepki-naklejki.json";

export interface WlepkiCalculation {
  groupId: string;
  area: number;
  modifiers: string[];
  express?: boolean;
}

export function calculateWlepki(input: WlepkiCalculation): CalculationResult {
  const tableData = data as any;
  const groupData = tableData.groups.find((g: any) => g.id === input.groupId);

  if (!groupData) {
    throw new Error(`Unknown group: ${input.groupId}`);
  }

  const priceTable: PriceTable = {
    id: `wlepki-${groupData.id}`,
    title: groupData.title,
    unit: groupData.unit,
    pricing: groupData.pricing || "per_unit",
    tiers: groupData.tiers,
    modifiers: tableData.modifiers,
    rules: groupData.rules || [{ type: "minimum", unit: "m2", value: 1 }]
  };

  const activeModifiers = [...input.modifiers];
  if (input.express) {
    activeModifiers.push("express");
  }

  return calculatePrice(priceTable, input.area, activeModifiers);
}
