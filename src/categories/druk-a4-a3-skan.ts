import { findTier } from "../core/pricing";

export interface DrukA4A3SkanOptions {
  mode: "bw" | "color";
  format: "a4" | "a3";
  printQty: number;
  email: boolean;
  surcharge: boolean;
  surchargeQty: number;
  scanType: "none" | "auto" | "manual";
  scanQty: number;
  express: boolean;
}

export function calculateDrukA4A3Skan(options: DrukA4A3SkanOptions, pricing: any) {
  let totalPrintPrice = 0;
  let unitPrintPrice = 0;

  if (options.printQty > 0) {
    const tiers = options.mode === "bw" ? pricing.print_bw : pricing.print_color;
    const tier = findTier(tiers, options.printQty);
    unitPrintPrice = options.format === "a4" ? tier.a4 : tier.a3;
    totalPrintPrice = options.printQty * unitPrintPrice;
  }

  let totalScanPrice = 0;
  let unitScanPrice = 0;
  if (options.scanQty > 0 && options.scanType !== "none") {
    const tiers = options.scanType === "auto" ? pricing.scan_auto : pricing.scan_manual;
    const tier = findTier(tiers, options.scanQty);
    unitScanPrice = tier.price;
    totalScanPrice = options.scanQty * unitScanPrice;
  }

  let emailPrice = options.email ? pricing.email_cost : 0;

  let surchargePrice = 0;
  if (options.surcharge && options.surchargeQty > 0) {
    // Dopłata +50% do ceny druku dla określonej liczby stron
    surchargePrice = options.surchargeQty * unitPrintPrice * pricing.surcharge_factor;
  }

  let baseTotal = totalPrintPrice + totalScanPrice + emailPrice + surchargePrice;

  // Express mode (+20% to the whole thing?)
  // Memory says: "The global 'Express +20%' flag is applied to individual items when added to the cart, modifying their specific total rather than the grand total of the order."
  // And "Percentage modifiers like Satin (+12%) and Express (+20%) are applied to the gross base price."

  let finalTotal = baseTotal;
  if (options.express) {
    finalTotal = baseTotal * 1.2;
  }

  return {
    totalPrice: parseFloat(finalTotal.toFixed(2)),
    unitPrintPrice,
    totalPrintPrice,
    unitScanPrice,
    totalScanPrice,
    emailPrice,
    surchargePrice,
    baseTotal
  };
}
