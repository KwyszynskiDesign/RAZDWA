import { calculateCadFold, calculateWfScan } from "../core/compat-logic";

export interface CadFoldOptions {
  format: string;
  qty: number;
}

export interface CadWfScanOptions {
  lengthMm: number;
  qty: number;
}

export function quoteCadFold(options: CadFoldOptions) {
  return calculateCadFold(options);
}

export function quoteCadWfScan(options: CadWfScanOptions) {
  return calculateWfScan(options);
}
