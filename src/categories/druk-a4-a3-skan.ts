import { calculateSimplePrint, calculateSimpleScan } from "../core/compat-logic";

export interface DrukA4A3SkanOptions {
  mode: "bw" | "color";
  format: "A4" | "A3";
  printQty: number;
  email: boolean;
  surcharge: boolean;
  surchargeQty: number;
  scanType: "none" | "auto" | "manual";
  scanQty: number;
  express: boolean;
}

export function calculateDrukA4A3Skan(options: DrukA4A3SkanOptions, pricing?: any) {
  // We use our compat logic instead of the passed pricing object (which was categories.json)
  const format = options.format.toUpperCase() as "A4" | "A3";
  const printResult = calculateSimplePrint({
    mode: options.mode,
    format: format,
    pages: options.printQty,
    email: options.email,
    ink25: options.surcharge,
    ink25Qty: options.surchargeQty
  });

  let scanResult = { total: 0, unitPrice: 0 };
  if (options.scanType !== "none" && options.scanQty > 0) {
    scanResult = calculateSimpleScan({
      type: options.scanType as "auto" | "manual",
      pages: options.scanQty
    });
  }

  const baseTotal = printResult.grandTotal + scanResult.total;
  let finalTotal = baseTotal;
  if (options.express) {
    finalTotal = baseTotal * 1.2;
  }

  return {
    totalPrice: parseFloat(finalTotal.toFixed(2)),
    unitPrintPrice: printResult.unitPrice,
    totalPrintPrice: printResult.printTotal,
    unitScanPrice: scanResult.unitPrice,
    totalScanPrice: scanResult.total,
    emailPrice: printResult.emailTotal,
    surchargePrice: printResult.inkTotal,
    baseTotal
  };
}
