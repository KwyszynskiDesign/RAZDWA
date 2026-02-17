import { describe, it, expect } from "vitest";
import { calculateDrukCAD } from "../src/categories/druk-cad";

describe("CAD Complete Pricing Fix Verification", () => {
  // 1. Formatowy A1 kolor = 12.00 zł
  it("Case 1: Formatowy A1 kolor = 12.00 zł", () => {
    const result = calculateDrukCAD({
      mode: "color",
      format: "A1",
      lengthMm: 841, // A1 base length
      qty: 1,
      express: false
    });
    expect(result.totalPrice).toBe(12.00);
  });

  // 2. Formatowy A0+ cz-b = 12.50 zł
  it("Case 2: Formatowy A0+ cz-b = 12.50 zł", () => {
    const result = calculateDrukCAD({
      mode: "bw",
      format: "A0p", // A0p maps to A0+
      lengthMm: 1292, // A0+ base length
      qty: 1,
      express: false
    });
    expect(result.totalPrice).toBe(12.50);
  });

  // 3. Nieformatowy A1 kolor × 2m = 29.00 zł
  it("Case 3: Nieformatowy A1 kolor x 2m = 29.00 zł", () => {
    const result = calculateDrukCAD({
      mode: "color",
      format: "A1",
      lengthMm: 2000, // 2 meters
      qty: 1,
      express: false
    });
    // Rate for A1 mb color is 14.50. 2 * 14.50 = 29.00
    expect(result.totalPrice).toBe(29.00);
  });

  // 4. Nieformatowy A0+ cz-b × 1.5m = 15.00 zł
  it("Case 4: Nieformatowy A0+ cz-b x 1.5m = 15.00 zł", () => {
    const result = calculateDrukCAD({
      mode: "bw",
      format: "A0p",
      lengthMm: 1500, // 1.5 meters
      qty: 1,
      express: false
    });
    // Rate for A0p mb bw is 10.00. 1.5 * 10.00 = 15.00
    expect(result.totalPrice).toBe(15.00);
  });

  // 5. Roll1067 kolor × 3m = 90.00 zł
  it("Case 5: Roll1067 kolor x 3m = 90.00 zł", () => {
    const result = calculateDrukCAD({
      mode: "color",
      format: "R1067",
      lengthMm: 3000, // 3 meters
      qty: 1,
      express: false
    });
    // Rate for R1067 mb color is 30.00. 3 * 30.00 = 90.00
    expect(result.totalPrice).toBe(90.00);
  });
});
