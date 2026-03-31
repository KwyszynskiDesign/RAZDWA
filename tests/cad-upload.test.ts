import { describe, it, expect } from "vitest";
import {
  calculateCadUpload,
  detectFormatFromDimensions,
  calculatePriceFromDimensions,
  calculateCadScanningPrice,
  calculateCadFoldingPrice,
  updateCadFileEntry,
} from "../src/categories/cad-upload";

// ─── detectFormatFromDimensions ───────────────────────────────────────────────
describe("detectFormatFromDimensions", () => {
  it("A0  841×1189 → A0",  () => expect(detectFormatFromDimensions(841, 1189)).toBe('A0'));
  it("A0+ 914×1292 → A0p (internal key)", () => expect(detectFormatFromDimensions(914, 1292)).toBe('A0p'));
  it("A1+ 610×914 → A1p (internal key)", () => expect(detectFormatFromDimensions(610, 914)).toBe('A1p'));
  it("A1  594× 841 → A1",  () => expect(detectFormatFromDimensions(594,  841)).toBe('A1'));
  it("A2  420× 594 → A2",  () => expect(detectFormatFromDimensions(420,  594)).toBe('A2'));
  it("A3  297× 420 → A3",  () => expect(detectFormatFromDimensions(297,  420)).toBe('A3'));
  it("200×300 → nieformatowy", () => expect(detectFormatFromDimensions(200, 300)).toBe('nieformatowy'));
  // orientation-independent
  it("landscape A1 841×594 → A1", () => expect(detectFormatFromDimensions(841, 594)).toBe('A1'));
});

// ─── calculatePriceFromDimensions ─────────────────────────────────────────────
describe("calculatePriceFromDimensions", () => {
  it("A0 kolor formatowy (841×1189) qty=1 → 24.00 zł", () =>
    expect(calculatePriceFromDimensions(841, 1189, 'color', 1)).toBe(24.00));

  it("A0+ cz-b formatowy (914×1292) qty=1 → 12.50 zł", () =>
    expect(calculatePriceFromDimensions(914, 1292, 'bw', 1)).toBe(12.50));

  it("A1+ kolor formatowy (610×914) qty=1 → 14.00 zł", () =>
    expect(calculatePriceFromDimensions(610, 914, 'color', 1)).toBe(14.00));

  it("A1+ cz-b nieformatowy (610×1000) qty=1 → 10.60 zł", () =>
    // 10.60 zł/mb × 1.000 m = 10.60
    expect(calculatePriceFromDimensions(610, 1000, 'bw', 1)).toBe(10.60));

  it("A1 kolor nieformatowy (594×2000) qty=1 → 29.00 zł", () =>
    // 14.50 zł/mb × 2.000 m = 29.00
    expect(calculatePriceFromDimensions(594, 2000, 'color', 1)).toBe(29.00));

  it("A3 kolor nieformatowy (297×1200) qty=1 → 14.40 zł", () =>
    // 12.00 zł/mb × 1.200 m = 14.40
    expect(calculatePriceFromDimensions(297, 1200, 'color', 1)).toBe(14.40));

  it("A0 kolor formatowy qty=2 → 48.00 zł", () =>
    expect(calculatePriceFromDimensions(841, 1189, 'color', 2)).toBe(48.00));

  it("zerowe wymiary → 0.00 zł", () =>
    expect(calculatePriceFromDimensions(0, 0, 'color', 1)).toBe(0));
});

// ─── calculateCadUpload ───────────────────────────────────────────────────────
describe("calculateCadUpload", () => {
  it("A0 kolor formatowy → 24.00 zł, format=A0", () => {
    const r = calculateCadUpload({ wMm: 841, hMm: 1189 });
    expect(r.totalPrice).toBe(24.00);
    expect(r.detectedFormat).toBe('A0');
    expect(r.mode).toBe('color');
    expect(r.qty).toBe(1);
  });

  it("A1 cz-b formatowy qty=2 → 12.00 zł", () => {
    const r = calculateCadUpload({ wMm: 594, hMm: 841, mode: 'bw', qty: 2 });
    expect(r.totalPrice).toBe(12.00); // 6.00 × 2
  });

  it("A0+ cz-b formatowy (914×1292) → 12.50 zł", () => {
    const r = calculateCadUpload({ wMm: 914, hMm: 1292, mode: 'bw' });
    expect(r.totalPrice).toBe(12.50);
    expect(r.detectedFormat).toBe('A0p');
  });

  it("0×0 → 0.00 zł (edge: brak wymiarów)", () => {
    const r = calculateCadUpload({ wMm: 0, hMm: 0 });
    expect(r.totalPrice).toBe(0);
  });

  it("ujemny wymiar → błąd", () => {
    expect(() => calculateCadUpload({ wMm: -1, hMm: 100 })).toThrow();
  });

  it("qty < 1 → błąd", () => {
    expect(() => calculateCadUpload({ wMm: 841, hMm: 1189, qty: 0 })).toThrow();
  });
});

// ─── calculateCadScanningPrice ────────────────────────────────────────────────
describe("calculateCadScanningPrice", () => {
  it("297×2519 scanning=true qty=1 → dłuższy bok 252cm * 0.08 = 20.16 zł", () => {
    // 2519mm / 10 = 251.9 → zaokrąglone 252cm; 252 * 0.08 = 20.16
    expect(calculateCadScanningPrice(297, 2519, true, 1)).toBeCloseTo(20.16, 2);
  });

  it("594×841 scanning=true qty=1 → dłuższy bok 84cm * 0.08 = 6.72 zł", () => {
    // 841mm / 10 = 84.1 → zaokrąglone 84cm; 84 * 0.08 = 6.72
    expect(calculateCadScanningPrice(594, 841, true, 1)).toBeCloseTo(6.72, 2);
  });

  it("841×297 (landscape) scanning=true qty=1 → dłuższy bok 84cm * 0.08 = 6.72 zł", () => {
    // szerszy bok to 841mm – powinien dać ten sam wynik co wyżej
    expect(calculateCadScanningPrice(841, 297, true, 1)).toBeCloseTo(6.72, 2);
  });

  it("scanning=false → 0 zł", () => {
    expect(calculateCadScanningPrice(297, 2519, false, 1)).toBe(0);
  });

  it("qty=3 → wynik × 3", () => {
    // 2519mm → 252cm; 252 * 0.08 * 3 = 60.48
    expect(calculateCadScanningPrice(297, 2519, true, 3)).toBeCloseTo(60.48, 2);
  });
});

// ─── calculateCadFoldingPrice / updateCadFileEntry ──────────────────────────
describe("CAD folding in upload", () => {
  it("formatowy dokument dostaje jedną cenę składania za dokument", () => {
    expect(calculateCadFoldingPrice("A1", true, 594, 841, true, 1)).toBe(2.0);
  });

  it("nieformatowy dokument używa jednej ceny składania z bucketu formatu", () => {
    expect(calculateCadFoldingPrice("A1", false, 594, 1200, true, 1)).toBe(2.0);
  });

  it("A1+ (A1p) ma własną stawkę składania 3.0 zł (A1 + 1 zł)", () => {
    expect(calculateCadFoldingPrice("A1p", true, 610, 914, true, 2)).toBe(6.0);
  });

  it("wielostronicowy PDF nalicza składanie za każdy dokument (stronę)", () => {
    const updated = updateCadFileEntry(
      {
        id: 1,
        name: "projekt.pdf",
        widthPx: 0,
        heightPx: 0,
        widthMm: 594,
        heightMm: 841,
        format: "A1",
        isFormatowy: true,
        isStandardWidth: true,
        pageCount: 5,
        mode: "color",
        folding: true,
        scanning: false,
      },
      "color"
    );

    expect(updated.foldingPrice).toBe(10.0);
  });

  it("bez składania cena składania wynosi 0", () => {
    expect(calculateCadFoldingPrice("A0", true, 841, 1189, false, 1)).toBe(0);
  });
});
