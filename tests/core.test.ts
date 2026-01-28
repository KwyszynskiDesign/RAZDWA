import { describe, it, expect } from "vitest";
import { calculatePrice } from "../src/core/pricing";
import { PriceTable } from "../src/core/types";

const mockTable: PriceTable = {
  id: "test",
  title: "Test Table",
  unit: "m2",
  pricing: "per_unit",
  tiers: [
    { min: 0, max: 3, price: 100 },
    { min: 3, max: 10, price: 80 },
    { min: 10, max: null, price: 60 }
  ],
  rules: [
    { type: "minimum", unit: "m2", value: 1 }
  ],
  modifiers: [
    { id: "EXPRESS", type: "percent", value: 20 },
    { id: "FIXED", type: "fixed", value: 50 }
  ]
};

describe("Pricing Core", () => {
  it("should select correct tier", () => {
    const res = calculatePrice(2, mockTable);
    expect(res.appliedTiers.price).toBe(100);
    expect(res.totalPrice).toBe(200);
  });

  it("should select middle tier", () => {
    const res = calculatePrice(5, mockTable);
    expect(res.appliedTiers.price).toBe(80);
    expect(res.totalPrice).toBe(400);
  });

  it("should apply 1m2 minimum rule", () => {
    const res = calculatePrice(0.5, mockTable);
    expect(res.effectiveQuantity).toBe(1);
    expect(res.totalPrice).toBe(100);
  });

  it("should apply percentage modifier (EXPRESS +20%)", () => {
    const res = calculatePrice(2, mockTable, ["EXPRESS"]);
    // 2 * 100 = 200. 200 + 20% = 240.
    expect(res.totalPrice).toBe(240);
  });

  it("should apply multiple modifiers", () => {
    const res = calculatePrice(2, mockTable, ["EXPRESS", "FIXED"]);
    // 2 * 100 = 200. 200 + 40 (20%) + 50 (fixed) = 290.
    expect(res.totalPrice).toBe(290);
  });
});
