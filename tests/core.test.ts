import { describe, it, expect } from "vitest";
import { findTier, applyMinimumRule, calculatePrice } from "../src/core/pricing";
import { PriceTable, Tier, Rule } from "../src/core/types";

describe("Core Pricing Logic", () => {
  const tiers: Tier[] = [
    { min: 1, max: 3, price: 10 },
    { min: 4, max: 10, price: 8 },
    { min: 11, max: null, price: 6 }
  ];

  const rules: Rule[] = [
    { type: "minimum", unit: "m2", value: 1 }
  ];

  it("should find correct tier", () => {
    expect(findTier(tiers, 2).price).toBe(10);
    expect(findTier(tiers, 4).price).toBe(8);
    expect(findTier(tiers, 15).price).toBe(6);
  });

  it("should apply minimum rule for m2", () => {
    expect(applyMinimumRule(0.5, rules)).toBe(1);
    expect(applyMinimumRule(2, rules)).toBe(2);
  });

  it("should calculate base price correctly", () => {
    const table: PriceTable = {
      id: "test",
      title: "Test",
      unit: "m2",
      pricing: "per_unit",
      tiers,
      rules
    };

    expect(calculatePrice(table, 0.5).totalPrice).toBe(10); // 1m2 * 10
    expect(calculatePrice(table, 5).totalPrice).toBe(40); // 5m2 * 8
  });

  it("should apply percent modifiers correctly", () => {
    const table: PriceTable = {
      id: "test",
      title: "Test",
      unit: "m2",
      pricing: "per_unit",
      tiers,
      modifiers: [
        { id: "express", name: "EXPRESS", type: "percent", value: 0.2 }
      ]
    };

    const result = calculatePrice(table, 5, ["express"]);
    expect(result.basePrice).toBe(40);
    expect(result.modifiersTotal).toBe(8);
    expect(result.totalPrice).toBe(48);
  });
});
