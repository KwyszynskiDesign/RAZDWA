import { describe, it, expect } from "vitest";
import { calculateFoliaSzroniona } from "../src/categories/folia-szroniona";

describe("Folia Szroniona Category", () => {
  it("should calculate material-only for 1m2 (min. rule)", () => {
    // 1000x1000 mm = 1m2
    const result = calculateFoliaSzroniona({
      widthMm: 1000,
      heightMm: 1000,
      serviceId: "material-only",
      express: false
    });
    // 1m2 -> tier 1-5 -> 65 zł/m2
    expect(result.totalPrice).toBe(65);
  });

  it("should calculate material-only for 0.5m2 (min. rule applies)", () => {
    const result = calculateFoliaSzroniona({
      widthMm: 500,
      heightMm: 1000,
      serviceId: "material-only",
      express: false
    });
    // 0.5m2 -> effectively 1m2 -> 65
    expect(result.totalPrice).toBe(65);
    expect(result.effectiveQuantity).toBe(1);
  });

  it("should calculate full-service for 1m2", () => {
    const result = calculateFoliaSzroniona({
      widthMm: 1000,
      heightMm: 1000,
      serviceId: "full-service",
      express: false
    });
    // 1m2 -> tier 1-5 -> 140 zł/m2
    expect(result.totalPrice).toBe(140);
  });

  it("should calculate material-only for 10m2 (tiered)", () => {
    const result = calculateFoliaSzroniona({
      widthMm: 2000,
      heightMm: 5000,
      serviceId: "material-only",
      express: false
    });
    // 10m2 -> tier 6-25 -> 60 zł/m2
    // 10 * 60 = 600
    expect(result.totalPrice).toBe(600);
  });

  it("should calculate full-service for 10m2 (tiered)", () => {
    const result = calculateFoliaSzroniona({
      widthMm: 2000,
      heightMm: 5000,
      serviceId: "full-service",
      express: false
    });
    // 10m2 -> tier 6-10 -> 130 zł/m2
    // 10 * 130 = 1300
    expect(result.totalPrice).toBe(1300);
  });

  it("should mark as custom for >20m2 full-service", () => {
    const result = calculateFoliaSzroniona({
      widthMm: 5000,
      heightMm: 5000,
      serviceId: "full-service",
      express: false
    });
    // 25m2
    expect(result.isCustom).toBe(true);
  });

  it("should apply express modifier (+20%)", () => {
    const result = calculateFoliaSzroniona({
      widthMm: 1000,
      heightMm: 1000,
      serviceId: "material-only",
      express: true
    });
    // 65 * 1.2 = 78
    expect(result.totalPrice).toBe(78);
  });
});
