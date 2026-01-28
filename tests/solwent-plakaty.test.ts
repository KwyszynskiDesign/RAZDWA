import { describe, it, expect } from "vitest";
import { calculateSolwentPlakaty } from "../src/categories/solwent-plakaty";

describe("Solwent Plakaty Category", () => {
  const material = "Papier 200g połysk";

  it("should handle minimalka (input < 1m2 -> 1m2)", () => {
    const result = calculateSolwentPlakaty({ areaM2: 0.5, material });
    expect(result.effectiveQuantity).toBe(1);
    expect(result.totalPrice).toBe(65);
  });

  it("should handle threshold 3/4", () => {
    const res3 = calculateSolwentPlakaty({ areaM2: 3, material });
    expect(res3.tierPrice).toBe(65);
    expect(res3.totalPrice).toBe(3 * 65);

    const res4 = calculateSolwentPlakaty({ areaM2: 4, material });
    expect(res4.tierPrice).toBe(60);
    expect(res4.totalPrice).toBe(4 * 60);
  });

  it("should handle threshold 40/41", () => {
    const res40 = calculateSolwentPlakaty({ areaM2: 40, material });
    expect(res40.tierPrice).toBe(50);
    expect(res40.totalPrice).toBe(40 * 50);

    const res41 = calculateSolwentPlakaty({ areaM2: 41, material });
    expect(res41.tierPrice).toBe(42);
    expect(res41.totalPrice).toBe(41 * 42);
  });

  it("should apply express modifier (+20%)", () => {
    const result = calculateSolwentPlakaty({ areaM2: 10, material, express: true });
    expect(result.basePrice).toBe(550);
    expect(result.modifiersTotal).toBe(110);
    expect(result.totalPrice).toBe(660);
  });
});
