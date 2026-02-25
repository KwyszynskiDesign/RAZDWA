import { describe, it, expect } from "vitest";
import { calculatePlakatyM2, calculatePlakatyFormat } from "../src/categories/plakaty";

describe("calculatePlakatyM2 – solwent m² materials", () => {
  it("applies minimalka: 0.5 m² → 1 m²  @ 70 zł (200g Połysk, tier 1-3)", () => {
    const res = calculatePlakatyM2({ materialId: "200g-polysk", areaM2: 0.5 });
    expect(res.effectiveM2).toBe(1);
    expect(res.tierPrice).toBe(70);
    expect(res.totalPrice).toBe(70);
  });

  it("200g Połysk 3 m² → 3 × 70 = 210 zł", () => {
    const res = calculatePlakatyM2({ materialId: "200g-polysk", areaM2: 3 });
    expect(res.tierPrice).toBe(70);
    expect(res.totalPrice).toBe(210);
  });

  it("200g Połysk 4 m² → tier changes to 65 zł/m²", () => {
    const res = calculatePlakatyM2({ materialId: "200g-polysk", areaM2: 4 });
    expect(res.tierPrice).toBe(65);
    expect(res.totalPrice).toBe(260);
  });

  it("150g Półmat 10 m² → 10 × 55 = 550 zł", () => {
    const res = calculatePlakatyM2({ materialId: "150g-polmat", areaM2: 10 });
    expect(res.tierPrice).toBe(55);
    expect(res.totalPrice).toBe(550);
  });

  it("115g Matowy 20 m² → tier 20+ @ 35 zł", () => {
    const res = calculatePlakatyM2({ materialId: "115g-mat", areaM2: 20 });
    expect(res.tierPrice).toBe(35);
    expect(res.totalPrice).toBe(700);
  });

  it("applies express +20%: 200g Połysk 1 m² → 70 + 14 = 84 zł", () => {
    const res = calculatePlakatyM2({ materialId: "200g-polysk", areaM2: 1, express: true });
    expect(res.totalPrice).toBe(84);
    expect(res.appliedModifiers).toContain("TRYB EXPRESS (+20%)");
  });
});

describe("calculatePlakatyFormat – per-format szt materials", () => {
  it("120g formatowe A0 (841x1189) × 1 szt → 28 zł (no discount)", () => {
    const res = calculatePlakatyFormat({ materialId: "120g-formatowe", formatKey: "841x1189", qty: 1 });
    expect(res.unitPrice).toBe(28);
    expect(res.discountFactor).toBe(1.0);
    expect(res.pricePerPiece).toBe(28);
    expect(res.totalPrice).toBe(28);
  });

  it("120g formatowe A0 × 3 szt → rabat 2-5 szt = 0.95 → 28 × 0.95 = 26.60 zł/szt", () => {
    const res = calculatePlakatyFormat({ materialId: "120g-formatowe", formatKey: "841x1189", qty: 3 });
    expect(res.discountFactor).toBe(0.95);
    expect(res.pricePerPiece).toBe(26.60);
    expect(res.totalPrice).toBe(parseFloat((26.60 * 3).toFixed(2)));
  });

  it("120g formatowe A0 × 6 szt → rabat 6-20 szt = 0.92 → 28 × 0.92 = 25.76 zł/szt", () => {
    const res = calculatePlakatyFormat({ materialId: "120g-formatowe", formatKey: "841x1189", qty: 6 });
    expect(res.discountFactor).toBe(0.92);
    expect(res.pricePerPiece).toBe(25.76);
    expect(res.totalPrice).toBe(parseFloat((25.76 * 6).toFixed(2)));
  });

  it("120g formatowe A3 (297x420) × 21 szt → rabat 21-30 = 0.87 → 9 × 0.87 = 7.83 zł/szt", () => {
    const res = calculatePlakatyFormat({ materialId: "120g-formatowe", formatKey: "297x420", qty: 21 });
    expect(res.discountFactor).toBe(0.87);
    expect(res.pricePerPiece).toBe(7.83);
  });

  it("260g satyna formatowe A0 (841x1189) × 9 szt → rabat 9-20 = 0.93 → 80 × 0.93 = 74.40 zł/szt", () => {
    const res = calculatePlakatyFormat({ materialId: "260g-satyna-formatowe", formatKey: "841x1189", qty: 9 });
    expect(res.discountFactor).toBe(0.93);
    expect(res.pricePerPiece).toBe(74.40);
    expect(res.totalPrice).toBe(parseFloat((74.40 * 9).toFixed(2)));
  });

  it("260g satyna nieformatowe A0 (841x1189) × 1 → 66.70 zł (no discount)", () => {
    const res = calculatePlakatyFormat({ materialId: "260g-satyna-nieformatowe", formatKey: "841x1189", qty: 1 });
    expect(res.unitPrice).toBe(66.70);
    expect(res.discountFactor).toBe(1.0);
    expect(res.totalPrice).toBe(66.70);
  });

  it("180g PP formatowe A0 (841x1189) × 6 → rabat 120g 6-20 = 0.92 → 70 × 0.92 = 64.40 zł/szt", () => {
    const res = calculatePlakatyFormat({ materialId: "180g-pp-formatowe", formatKey: "841x1189", qty: 6 });
    expect(res.discountFactor).toBe(0.92);
    expect(res.pricePerPiece).toBe(64.40);
  });

  it("applies express +20%: 120g formatowe A0 × 1 → 28 × 1.20 = 33.60 zł", () => {
    const res = calculatePlakatyFormat({ materialId: "120g-formatowe", formatKey: "841x1189", qty: 1, express: true });
    expect(res.basePrice).toBe(28);
    expect(res.totalPrice).toBe(33.60);
    expect(res.appliedModifiers).toContain("TRYB EXPRESS (+20%)");
  });

  it("throws for unknown material", () => {
    expect(() => calculatePlakatyFormat({ materialId: "bogus", formatKey: "841x1189", qty: 1 })).toThrow();
  });

  it("throws for unknown format key", () => {
    expect(() => calculatePlakatyFormat({ materialId: "120g-formatowe", formatKey: "bogus", qty: 1 })).toThrow();
  });
});
