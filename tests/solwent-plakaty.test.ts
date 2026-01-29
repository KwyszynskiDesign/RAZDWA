import { describe, it, expect } from "vitest";
import { calculateSolwentPlakaty } from "../src/categories/solwent-plakaty";

describe("Solwent Plakaty Category E2E", () => {
  const material = "Papier 150g półmat";

  it("should handle minimalka (0.5m2 -> 1m2@65zł)", () => {
    const result = calculateSolwentPlakaty({ areaM2: 0.5, material });
    expect(result.effectiveQuantity).toBe(1);
    expect(result.tierPrice).toBe(65);
    expect(result.totalPrice).toBe(65);
  });

  it("should handle 3m2 -> 3@65zł", () => {
    const result = calculateSolwentPlakaty({ areaM2: 3, material });
    expect(result.effectiveQuantity).toBe(3);
    expect(result.tierPrice).toBe(65);
    expect(result.totalPrice).toBe(195);
  });

  it("should handle 4m2 -> 4@60zł", () => {
    const result = calculateSolwentPlakaty({ areaM2: 4, material });
    expect(result.effectiveQuantity).toBe(4);
    expect(result.tierPrice).toBe(60);
    expect(result.totalPrice).toBe(240);
  });

  it("should apply express modifier (+20%)", () => {
    const result = calculateSolwentPlakaty({ areaM2: 1, material, express: true });
    expect(result.totalPrice).toBe(78); // 65 * 1.2
  });
});
