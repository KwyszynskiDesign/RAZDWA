import { calculatePrice } from "../core/pricing";
import { CalculationResult, PriceTable } from "../core/types";
import { getPrice } from "../services/priceService";
import { resolveStoredPrice } from "../core/compat";

export interface CanvasOptions {
  modeId: "framed" | "unframed" | "m2-unframed";
  formatId?: string;
  quantity: number;
  widthMm?: number;
  heightMm?: number;
  express: boolean;
}

export type CanvasResult = CalculationResult & {
  isCustom: boolean;
  modeLabel: string;
  formatLabel: string;
  areaM2?: number;
};

export function calculateCanvas(options: CanvasOptions): CanvasResult {
  const data = getPrice("canvas") as any;
  const mode = data?.modes?.find((m: any) => m.id === options.modeId);

  if (!mode) {
    throw new Error(`Unknown canvas mode: ${options.modeId}`);
  }

  let table: PriceTable;
  let formatLabel = "";
  let qtyForCalc = Math.max(1, options.quantity || 1);
  let isCustom = false;
  let areaM2: number | undefined;

  if (options.modeId === "m2-unframed") {
    const width = Number(options.widthMm) || 0;
    const height = Number(options.heightMm) || 0;
    areaM2 = (width * height) / 1_000_000;
    if (!isFinite(areaM2) || areaM2 <= 0) {
      throw new Error("Podaj poprawne wymiary dla trybu m2");
    }

    const rate = resolveStoredPrice("canvas-m2-unframed", mode.pricePerM2);
    table = {
      id: "canvas-m2-unframed",
      title: data?.title ?? "Canvas",
      unit: "m2",
      pricing: "per_unit",
      tiers: [{ min: 0, max: null, price: rate }],
      modifiers: data?.modifiers
    };
    qtyForCalc = areaM2 * qtyForCalc;
    formatLabel = "Sam wydruk (m2)";
  } else {
    const selectedFormat = mode?.formats?.find((f: any) => f.id === options.formatId);
    if (!selectedFormat) {
      throw new Error("Wybierz format canvas");
    }

    if (selectedFormat.customQuote) {
      isCustom = true;
      table = {
        id: `canvas-${options.modeId}-custom`,
        title: data?.title ?? "Canvas",
        unit: "szt",
        pricing: "flat",
        tiers: [{ min: 1, max: null, price: 0 }],
        modifiers: []
      };
    } else {
      const key = `canvas-${options.modeId}-${selectedFormat.id}`;
      const unitPrice = resolveStoredPrice(key, selectedFormat.price);
      table = {
        id: key,
        title: data?.title ?? "Canvas",
        unit: "szt",
        pricing: "per_unit",
        tiers: [{ min: 1, max: null, price: unitPrice }],
        modifiers: data?.modifiers
      };
    }

    formatLabel = selectedFormat.label;
  }

  const activeModifiers: string[] = [];
  if (options.express && !isCustom) activeModifiers.push("express");

  const result = calculatePrice(table, qtyForCalc, activeModifiers);

  return {
    ...result,
    isCustom,
    modeLabel: mode.name,
    formatLabel,
    areaM2
  };
}
