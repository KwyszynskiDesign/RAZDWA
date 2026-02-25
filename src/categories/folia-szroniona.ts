import { calculatePrice } from "../core/pricing";
import { PriceTable, CalculationResult } from "../core/types";
import { getPrice } from "../services/priceService";
import { overrideTiersWithStoredPrices } from "../core/compat";

const data: any = getPrice("foliaSzroniona");

export interface FoliaSzronionaOptions {
  widthMm: number;
  heightMm: number;
  serviceId: string;
  express: boolean;
}

export function calculateFoliaSzroniona(options: FoliaSzronionaOptions): CalculationResult & { isCustom: boolean } {
  const tableData = priceService.loadSync('folia-szroniona') as any;
  const materialData = tableData.materials.find((m: any) => m.id === options.serviceId);

  if (!materialData) {
    throw new Error(`Unknown service: ${options.serviceId}`);
  }

  const areaM2 = (options.widthMm * options.heightMm) / 1000000;

  const priceTable: PriceTable = {
    id: tableData.id,
    title: tableData.title,
    unit: tableData.unit,
    pricing: tableData.pricing,
    rules: tableData.rules,
    tiers: overrideTiersWithStoredPrices(
      `folia-szroniona-${materialData.storageId ?? materialData.id}`,
      materialData.tiers
    ),
    modifiers: tableData.modifiers
  };

  const activeModifiers: string[] = [];
  if (options.express) {
    activeModifiers.push("express");
  }

  const result = calculatePrice(priceTable, areaM2, activeModifiers);
  const isCustom = options.serviceId === "full-service" && areaM2 > 20;

  return {
    ...result,
    isCustom
  };
}
