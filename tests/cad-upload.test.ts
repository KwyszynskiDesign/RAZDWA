import { describe, it, expect } from "vitest";
import { calculateCadUpload, PRICE_PER_FILE } from "../src/categories/cad-upload";

describe("calculateCadUpload", () => {
  it("pojedynczy plik, qty=1 → 5.00 zł", () => {
    const result = calculateCadUpload({ fileCount: 1 });
    expect(result.totalPrice).toBe(5.0);
    expect(result.pricePerFile).toBe(PRICE_PER_FILE);
    expect(result.fileCount).toBe(1);
    expect(result.qtyPerFile).toBe(1);
  });

  it("10 plików, qty=1 → 50.00 zł", () => {
    const result = calculateCadUpload({ fileCount: 10 });
    expect(result.totalPrice).toBe(50.0);
  });

  it("3 pliki, qty=2 → 30.00 zł", () => {
    const result = calculateCadUpload({ fileCount: 3, qtyPerFile: 2 });
    expect(result.totalPrice).toBe(30.0);
    expect(result.qtyPerFile).toBe(2);
  });

  it("0 plików → 0.00 zł (edge case: pusta lista)", () => {
    const result = calculateCadUpload({ fileCount: 0 });
    expect(result.totalPrice).toBe(0.0);
  });

  it("ujemna liczba plików → błąd", () => {
    expect(() => calculateCadUpload({ fileCount: -1 })).toThrow();
  });

  it("qty < 1 → błąd", () => {
    expect(() => calculateCadUpload({ fileCount: 1, qtyPerFile: 0 })).toThrow();
  });
});
