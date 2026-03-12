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

export interface WlepkiSztCalculation {
  tableId: string;
  qty: number;
  express?: boolean;
}

export interface WlepkiSztResult {
  tableTitle: string;
  requestedQty: number;
  chargedQty: number;
  unitPrice: number;
  basePrice: number;
  modifiersTotal: number;
  totalPrice: number;
  appliedModifiers: string[];
}

export function calculateWlepki(input: WlepkiCalculation): CalculationResult {
  const tableData = getPrice('wlepkiNaklejki') as any;
  const groupData = tableData?.groups?.find((g: any) => g.id === input.groupId);

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

export function calculateWlepkiSzt(input: WlepkiSztCalculation): WlepkiSztResult {
  const tableData = getPrice('wlepkiNaklejki') as any;
  const table = tableData?.pieceTables?.find((t: any) => t.id === input.tableId);

  if (!table) {
    throw new Error(`Unknown piece table: ${input.tableId}`);
  }

  const requestedQty = Math.max(1, Math.floor(input.qty || 1));
  const sortedTiers = [...(table.tiers ?? [])].sort((a: any, b: any) => a.qty - b.qty);
  const chargedTier = sortedTiers.find((t: any) => requestedQty <= t.qty) ?? sortedTiers[sortedTiers.length - 1];

  if (!chargedTier) {
    throw new Error(`No tiers configured for table: ${input.tableId}`);
  }

  const unitPrice = resolveStoredPrice(`wlepki-szt-${input.tableId}-${chargedTier.qty}`, chargedTier.price);
  const basePrice = unitPrice;

  let modifiersTotal = 0;
  const appliedModifiers: string[] = [];
  if (input.express) {
    const expressMod = (tableData.modifiers ?? []).find((m: any) => m.id === "express");
    if (expressMod) {
      const expressValue = resolveStoredPrice("modifier-express", expressMod.value);
      modifiersTotal = parseFloat((basePrice * expressValue).toFixed(2));
      appliedModifiers.push("EXPRESS");
    }
  }

  return {
    tableTitle: table.title,
    requestedQty,
    chargedQty: chargedTier.qty,
    unitPrice,
    basePrice,
    modifiersTotal,
    totalPrice: parseFloat((basePrice + modifiersTotal).toFixed(2)),
    appliedModifiers,
  };
}
