import { calculateCad } from "../core/compat-logic";

export interface DrukCADOptions {
  mode: "bw" | "color";
  format: string;
  lengthMm: number;
  qty: number;
  express: boolean;
}

export function calculateDrukCAD(options: DrukCADOptions, pricing?: any) {
  const res = calculateCad({
    mode: options.mode,
    format: options.format,
    lengthMm: options.lengthMm,
    qty: options.qty || 1
  });

  let totalPrice = res.total;
  if (options.express) {
    totalPrice = res.total * 1.2;
  }

  return {
    totalPrice: parseFloat(totalPrice.toFixed(2)),
    basePrice: res.total, // In CAD, basePrice is qty * rate (format or mb)
    detectedType: res.detectedType,
    isMeter: res.detectedType === 'mb',
    rate: res.rate
  };
}
