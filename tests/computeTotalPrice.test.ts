import { describe, it, expect } from "vitest";
import { computeTotalPrice } from "../src/core/computeTotalPrice";
import { calculatePrice } from "../src/core/pricing";

const mockTable = {
  id: "test",
  title: "Test Table",
  unit: "m2",
  pricing: "per_unit" as const,
  tiers: [
    { min: 0, max: 3, price: 100 },
    { min: 3, max: 10, price: 80 },
    { min: 10, max: null, price: 60 }
  ],
  rules: [
    { type: "minimum", unit: "m2", value: 1 }
  ],
  modifiers: [
    { id: "EXPRESS", name: "EXPRESS", type: "percent", value: 0.20 },
    { id: "FIXED", name: "FIXED", type: "fixed", value: 50 }
  ]
};

describe("computeTotalPrice", () => {
  it("produces same result as calculatePrice for base case", () => {
    expect(computeTotalPrice(mockTable, 2)).toEqual(calculatePrice(mockTable, 2));
  });

  it("produces same result as calculatePrice for middle tier", () => {
    expect(computeTotalPrice(mockTable, 5)).toEqual(calculatePrice(mockTable, 5));
  });

  it("produces same result as calculatePrice with minimum rule", () => {
    expect(computeTotalPrice(mockTable, 0.5)).toEqual(calculatePrice(mockTable, 0.5));
  });

  it("produces same result as calculatePrice with percent modifier", () => {
    expect(computeTotalPrice(mockTable, 2, ["EXPRESS"])).toEqual(calculatePrice(mockTable, 2, ["EXPRESS"]));
  });

  it("produces same result as calculatePrice with multiple modifiers", () => {
    expect(computeTotalPrice(mockTable, 2, ["EXPRESS", "FIXED"])).toEqual(calculatePrice(mockTable, 2, ["EXPRESS", "FIXED"]));
  });

  it("should select correct tier and compute total", () => {
    const res = computeTotalPrice(mockTable, 2);
    expect(res.tierPrice).toBe(100);
    expect(res.totalPrice).toBe(200);
  });

  it("should apply 1m2 minimum rule", () => {
    const res = computeTotalPrice(mockTable, 0.5);
    expect(res.effectiveQuantity).toBe(1);
    expect(res.totalPrice).toBe(100);
  });

  it("should apply percentage modifier (EXPRESS +20%)", () => {
    const res = computeTotalPrice(mockTable, 2, ["EXPRESS"]);
    // 2 * 100 = 200. 200 + 20% = 240.
    expect(res.totalPrice).toBe(240);
  });

  it("should apply multiple modifiers", () => {
    const res = computeTotalPrice(mockTable, 2, ["EXPRESS", "FIXED"]);
    // 2 * 100 = 200. 200 + 40 (20%) + 50 (fixed) = 290.
    expect(res.totalPrice).toBe(290);
  });

  it("should enforce minimum PLN rule", () => {
    const tableWithMinPln = {
      ...mockTable,
      rules: [
        { type: "minimum", unit: "pln", value: 50 }
      ]
    };
    // 0.1 * 100 = 10, less than 50 minimum
    const res = computeTotalPrice(tableWithMinPln, 0.1);
    expect(res.totalPrice).toBe(50);
  });
});
