import { calculatePrice } from "../core/pricing";
import { PriceTable, CalculationResult } from "../core/types";
import { getPrice } from "../services/priceService";
import { overrideTiersWithStoredPrices, resolveStoredPrice } from "../core/compat";

const data: any = getPrice("wlepkiNaklejki");

export interface WlepkiCalculation {
  groupId: string;
  area: number;
  modifiers: string[];
  express?: boolean;
}

export function calculateWlepki(input: WlepkiCalculation): CalculationResult {
  const tableData = priceService.loadSync('wlepki-naklejki') as any;
  const groupData = tableData.groups.find((g: any) => g.id === input.groupId);

  if (!groupData) {
    throw new Error(`Unknown group: ${input.groupId}`);
  }

  // Normalize storage prefix: JSON uses underscores (e.g. wlepki_obrys_folia),
  // while admin panel keys use hyphens (e.g. wlepki-obrys-folia).
  const storagePrefix = input.groupId.replace(/_/g, "-");

  const priceTable: PriceTable = {
    id: "wlepki",
    title: groupData.title,
    unit: groupData.unit,
    pricing: groupData.pricing || "per_unit",
    tiers: overrideTiersWithStoredPrices(storagePrefix, groupData.tiers),
    modifiers: tableData.modifiers.map((m: any) => {
      const modKey = `wlepki-modifier-${m.id.replace(/_/g, "-")}`;
      return { ...m, value: resolveStoredPrice(modKey, m.value) };
    }),
    rules: groupData.rules || [{ type: "minimum", unit: "m2", value: 1 }]
  };

  const activeModifiers = [...input.modifiers];
  if (input.express) {
    activeModifiers.push("express");
  }

  return calculatePrice(priceTable, input.area, activeModifiers);
}
