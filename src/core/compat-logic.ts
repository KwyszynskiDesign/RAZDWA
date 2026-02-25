import {
  PRICE,
  CAD_PRICE,
  CAD_BASE,
  FORMAT_TOLERANCE_MM,
  FOLD_PRICE,
  WF_SCAN_PRICE_PER_CM,
  BIZ,
  pickTier,
  pickNearestCeilKey,
  money,
  readStoredPrices,
} from "./compat";

/** Returns a storage-range suffix: "1-5" or "5000+" (sentinel to > 50000). */
function tierRange(from: number, to: number): string {
  return to > 50000 ? `${from}+` : `${from}-${to}`;
}

/** Resolves price: stored value wins over hard-coded default. */
function storedPrice(key: string, defaultUnit: number): number {
  const stored = readStoredPrices();
  return typeof stored[key] === "number" ? stored[key] : defaultUnit;
}

/** A4/A3 Print calculation logic */
export function calculateSimplePrint(options: {
  mode: "bw" | "color";
  format: "A4" | "A3";
  pages: number;
  email: boolean;
  ink25: boolean;
  ink25Qty: number;
}) {
  if (options.pages <= 0) {
    return {
      unitPrice: 0,
      printTotal: 0,
      emailTotal: options.email ? PRICE.email_price : 0,
      inkTotal: 0,
      grandTotal: options.email ? PRICE.email_price : 0,
    };
  }
  const tiers = (PRICE.print as any)[options.mode][options.format];
  const tier = pickTier(tiers, options.pages);
  if (!tier) throw new Error("Brak progu cenowego dla druku.");

  // Map to storage key: druk-{bw|kolor}-{a4|a3}-{range}
  const modeKey = options.mode === "bw" ? "bw" : "kolor";
  const fmtKey = options.format.toLowerCase();
  const printStorageKey = `druk-${modeKey}-${fmtKey}-${tierRange(tier.from, tier.to)}`;
  const unitPrice = storedPrice(printStorageKey, tier.unit);
  let total = options.pages * unitPrice;

  let emailItemTotal = 0;
  if (options.email) {
    emailItemTotal = storedPrice("druk-email", PRICE.email_price);
  }

  let inkItemTotal = 0;
  if (options.ink25) {
    inkItemTotal = storedPrice("modifier-druk-zadruk25", 0.5) * unitPrice * options.ink25Qty;
  }

  return {
    unitPrice,
    printTotal: total,
    emailTotal: emailItemTotal,
    inkTotal: inkItemTotal,
    grandTotal: total + emailItemTotal + inkItemTotal,
  };
}

/** A4/A3 Scan calculation logic */
export function calculateSimpleScan(options: {
  type: "auto" | "manual";
  pages: number;
}) {
  if (options.pages <= 0) return { unitPrice: 0, total: 0 };
  const tiers = (PRICE.scan as any)[options.type];
  const tier = pickTier(tiers, options.pages);
  if (!tier) throw new Error("Brak progu cenowego dla skanowania.");

  // Map to storage key: skan-{auto|reczne}-{range}
  const scanTypeKey = options.type === "auto" ? "auto" : "reczne";
  const scanStorageKey = `skan-${scanTypeKey}-${tierRange(tier.from, tier.to)}`;
  const unitPrice = storedPrice(scanStorageKey, tier.unit);
  return {
    unitPrice,
    total: options.pages * unitPrice,
  };
}

/** CAD calculation logic */
export function calculateCad(options: {
  mode: "bw" | "color";
  format: string;
  lengthMm: number;
  qty: number;
}) {
  const base = CAD_BASE[options.format];
  if (!base) throw new Error("Nieznany format CAD.");

  const isFormatowe = Math.abs(options.lengthMm - base.l) <= FORMAT_TOLERANCE_MM;
  const detectedType = isFormatowe ? "formatowe" : "mb";

  const rate = CAD_PRICE[options.mode][detectedType][options.format];
  if (rate == null) throw new Error("Brak stawki w cenniku dla CAD.");

  // Map to storage key: druk-cad-{bw|kolor}-{fmt|mb}-{format}
  const cadModeKey = options.mode === "bw" ? "bw" : "kolor";
  const cadTypeKey = detectedType === "formatowe" ? "fmt" : "mb";
  const cadFmtKey = options.format.toLowerCase().replace("0p", "0plus").replace("r1067", "mb1067");
  const cadStorageKey = `druk-cad-${cadModeKey}-${cadTypeKey}-${cadFmtKey}`;
  const resolvedRate = storedPrice(cadStorageKey, rate);

  let total = 0;
  if (detectedType === "formatowe") {
    total = options.qty * resolvedRate;
  } else {
    const meters = options.lengthMm / 1000;
    total = options.qty * meters * resolvedRate;
  }

  return {
    detectedType,
    rate: resolvedRate,
    total: parseFloat(money(total)),
  };
}

/** CAD Folding logic */
export function calculateCadFold(options: { format: string; qty: number }) {
  const unit = FOLD_PRICE[options.format];
  if (unit == null) throw new Error("Brak stawki składania.");
  return {
    unit,
    total: options.qty * unit,
  };
}

/** WF Scan logic */
export function calculateWfScan(options: { lengthMm: number; qty: number }) {
  const cmRounded = Math.round(options.lengthMm / 10);
  const unitPrice = cmRounded * WF_SCAN_PRICE_PER_CM;
  return {
    cmRounded,
    unitPrice,
    total: options.qty * unitPrice,
  };
}

/** Business Cards logic */
export function calculateBusinessCards(options: {
  family: "standard" | "deluxe";
  finish?: "mat" | "blysk" | "softtouch";
  size?: "85x55" | "90x50";
  lam?: "noLam" | "lam";
  deluxeOpt?: "uv3d_softtouch" | "uv3d_gold_softtouch";
  qty: number;
}) {
  let table: any;
  if (options.family === "deluxe") {
    const optObj = BIZ.cyfrowe.deluxe.options[options.deluxeOpt!];
    table = optObj.prices;
  } else {
    const tablesByFinish =
      options.finish === "softtouch"
        ? BIZ.cyfrowe.softtouchPrices
        : BIZ.cyfrowe.standardPrices;
    table = tablesByFinish[options.size!][options.lam!];
  }

  const qtyBilled = pickNearestCeilKey(table, options.qty);
  if (qtyBilled == null) throw new Error("Brak progu cenowego dla takiej ilości.");

  // Check if admin panel has a stored override for this standard/softtouch run price.
  // Key format: wizytowki-{size}-{none|matt_gloss}-{qty}szt
  let total = table[qtyBilled];
  if (options.family !== "deluxe" && options.size) {
    const foliaKey = options.lam === "noLam" ? "none" : "matt_gloss";
    const storageKey = `wizytowki-${options.size}-${foliaKey}-${qtyBilled}szt`;
    total = storedPrice(storageKey, total);
  }

  return {
    qtyBilled,
    total,
  };
}
