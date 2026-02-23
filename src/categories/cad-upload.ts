export const PRICE_PER_FILE = 5; // zł / plik

export interface CadUploadOptions {
  fileCount: number;
  qtyPerFile?: number; // default: 1
}

export interface CadUploadResult {
  totalPrice: number;
  pricePerFile: number;
  fileCount: number;
  qtyPerFile: number;
}

export function calculateCadUpload(options: CadUploadOptions): CadUploadResult {
  const { fileCount, qtyPerFile = 1 } = options;
  if (fileCount < 0) throw new Error("Liczba plików nie może być ujemna");
  if (qtyPerFile < 1) throw new Error("Ilość kopii na plik musi wynosić co najmniej 1");
  return {
    totalPrice: fileCount * qtyPerFile * PRICE_PER_FILE,
    pricePerFile: PRICE_PER_FILE,
    fileCount,
    qtyPerFile,
  };
}
