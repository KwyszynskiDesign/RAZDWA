import data from "../../data/normalized/roll-up.json";
import { calculatePrice } from "../core/pricing";
import { PriceTable, CalculationResult } from "../core/types";
import { priceStore } from "../core/price-store";

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

  const category = "Roll-up";
  let priceTable: PriceTable;

  if (options.isReplacement) {
    const area = formatData.width * formatData.height;

    const printPerM2 = priceStore.register('rollup-repl-m2', category, 'Wymiana: Druk za m2', data.replacement.print_per_m2);
    const labor = priceStore.register('rollup-repl-labor', category, 'Wymiana: Robocizna', data.replacement.labor);

    const pricePerSzt = (area * printPerM2) + labor;
    const express = priceStore.register('rollup-repl-express', category, 'Dopłata Express (wymiana)', 0.20);

    priceTable = {
      id: "roll-up-replacement",
      title: `Wymiana wkładu (${options.format})`,
      unit: "szt",
      pricing: "per_unit",
      tiers: [{ min: 1, max: null, price: pricePerSzt }],
      modifiers: [
        { id: "express", name: "EXPRESS", type: "percent", value: express }
      ]
    };
  } else {
    const prefix = `rollup-full-${options.format}`;
    const dynamicTiers = priceStore.registerTiers(prefix, category, formatData.tiers);
    const express = priceStore.register(`${prefix}-express`, category, `Dopłata Express (${options.format})`, 0.20);

    priceTable = {
      id: "roll-up-full",
      title: `Roll-up Komplet (${options.format})`,
      unit: "szt",
      pricing: "per_unit",
      tiers: dynamicTiers,
      modifiers: [
        { id: "express", name: "EXPRESS", type: "percent", value: express }
      ]
    };
  }

  const activeModifiers: string[] = [];
  if (options.express) {
    activeModifiers.push("express");
  }

  return calculatePrice(priceTable, options.qty, activeModifiers);
}
