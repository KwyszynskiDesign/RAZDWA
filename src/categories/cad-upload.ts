import { CAD_PRICE, CAD_BASE, FORMAT_TOLERANCE_MM } from "../core/compat";

/** Detect CAD paper format from image/file dimensions (mm).
 *  Detection is based on the SHORTER side (= roll/paper width). */
export function detectFormatFromDimensions(wMm: number, hMm: number): string {
  const shorter = Math.min(wMm, hMm);
  if (shorter >= CAD_BASE['A0p'].w) return 'A0p';
  if (shorter >= CAD_BASE['A0'].w)  return 'A0';
  if (shorter >= CAD_BASE['A1'].w)  return 'A1';
  if (shorter >= CAD_BASE['A2'].w)  return 'A2';
  if (shorter >= CAD_BASE['A3'].w)  return 'A3';
  return 'nieformatowy';
}

/** Calculate print price for a single file based on auto-detected dimensions.
 *  Uses the same pricing logic as druk-cad: formatowe vs metr-bieżący. */
export function calculatePriceFromDimensions(
  wMm: number,
  hMm: number,
  mode: 'bw' | 'color',
  qty: number
): number {
  if (wMm <= 0 || hMm <= 0) return 0;

  const fmtKey = detectFormatFromDimensions(wMm, hMm);
  const longer  = Math.max(wMm, hMm);

  if (fmtKey === 'nieformatowy') {
    // Fall back to A3 roll pricing for any non-standard format smaller than A3
    const rate = CAD_PRICE[mode].mb['A3'];
    return parseFloat((longer / 1000 * rate * qty).toFixed(2));
  }

  const base = CAD_BASE[fmtKey];
  const isFormatowe = Math.abs(longer - base.l) <= FORMAT_TOLERANCE_MM;

  if (isFormatowe) {
    const rate = CAD_PRICE[mode].formatowe[fmtKey];
    return parseFloat((rate * qty).toFixed(2));
  } else {
    const rate = CAD_PRICE[mode].mb[fmtKey];
    return parseFloat((longer / 1000 * rate * qty).toFixed(2));
  }
}

export interface CadUploadFileInput {
  wMm: number;
  hMm: number;
  qty?: number; // default: 1
  mode?: 'bw' | 'color'; // default: 'color'
}

export interface CadUploadResult {
  totalPrice: number;
  detectedFormat: string;
  wMm: number;
  hMm: number;
  qty: number;
  mode: 'bw' | 'color';
}

export function calculateCadUpload(options: CadUploadFileInput): CadUploadResult {
  const { wMm, hMm, qty = 1, mode = 'color' } = options;
  if (wMm < 0 || hMm < 0) throw new Error("Wymiary nie mogą być ujemne");
  if (qty < 1) throw new Error("Ilość kopii musi wynosić co najmniej 1");
  const totalPrice = calculatePriceFromDimensions(wMm, hMm, mode, qty);
  return {
    totalPrice,
    detectedFormat: detectFormatFromDimensions(wMm, hMm),
    wMm,
    hMm,
    qty,
    mode,
  };
}
