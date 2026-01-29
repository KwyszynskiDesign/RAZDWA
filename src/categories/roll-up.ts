import data from "../../data/normalized/roll-up.json";
import { calculatePrice } from "../core/pricing";
import { PriceTable, CalculationResult } from "../core/types";

export interface RollUpOptions {
  format: string;
  qty: number;
  isReplacement: boolean;
  express: boolean;
}

export function calculateRollUp(options: RollUpOptions): CalculationResult {
  const formatData = (data.formats as any)[options.format];
  if (!formatData) {
    throw new Error(`Unknown format: ${options.format}`);
  }

  let priceTable: PriceTable;

  if (options.isReplacement) {
    const area = formatData.width * formatData.height;
    const pricePerSzt = (area * data.replacement.print_per_m2) + data.replacement.labor;

    priceTable = {
      id: "roll-up-replacement",
      title: `Wymiana wkładu (${options.format})`,
      unit: "szt",
      pricing: "per_unit",
      tiers: [{ min: 1, max: null, price: pricePerSzt }],
      modifiers: [
        { id: "express", name: "EXPRESS", type: "percent", value: 0.20 }
      ]
    };
  } else {
    priceTable = {
      id: "roll-up-full",
      title: `Roll-up Komplet (${options.format})`,
      unit: "szt",
      pricing: "per_unit",
      tiers: formatData.tiers,
      modifiers: [
        { id: "express", name: "EXPRESS", type: "percent", value: 0.20 }
      ]
    };
  }

  const activeModifiers: string[] = [];
  if (options.express) {
    activeModifiers.push("express");
  }

  return calculatePrice(priceTable, options.qty, activeModifiers);
}
