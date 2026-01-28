import { describe, it, expect } from "vitest";
import { calculateBanner } from "../src/categories/banner";

describe("Banner Calculations", () => {
  it("calculates Powlekany 10m2 correctly (530 PLN)", () => {
    const result = calculateBanner({
      material: "powlekany",
      areaM2: 10,
      oczkowanie: false,
      express: false
    });
    expect(result.totalPrice).toBe(530.00);
  });

  it("calculates Blockout 50m2 correctly (2950 PLN)", () => {
    // 50m2 * 59 = 2950
    const result = calculateBanner({
      material: "blockout",
      areaM2: 50,
      oczkowanie: false,
      express: false
    });
    expect(result.totalPrice).toBe(2950.00);
  });

  it("calculates Blockout 51m2 correctly (2805 PLN)", () => {
    // 51m2 * 55 = 2805
    const result = calculateBanner({
      material: "blockout",
      areaM2: 51,
      oczkowanie: false,
      express: false
    });
    expect(result.totalPrice).toBe(2805.00);
  });

  it("applies Oczkowanie +2.5zł/m2 correctly", () => {
    // 10m2 powlekany = 530.
    // Oczkowanie: 10 * 2.5 = 25.
    // Total = 555.
    const result = calculateBanner({
      material: "powlekany",
      areaM2: 10,
      oczkowanie: true,
      express: false
    });
    expect(result.totalPrice).toBe(555.00);
  });

  it("applies Express +20% correctly with Oczkowanie", () => {
    // 10m2 powlekany = 530.
    // Oczkowanie = 25.
    // Express: 530 * 0.2 = 106. (Express is calculated from basePrice)
    // Total = 530 + 106 + 25 = 661.00
    const result = calculateBanner({
      material: "powlekany",
      areaM2: 10,
      oczkowanie: true,
      express: true
    });
    expect(result.totalPrice).toBe(661.00);
  });
});
