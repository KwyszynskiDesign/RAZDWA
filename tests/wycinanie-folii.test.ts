import { describe, it, expect } from "vitest";
import { calculateWycinanieFolii } from "../src/categories/wycinanie-folii";

describe("Wycinanie z folii", () => {
  it("should use below-1m2 rate for kolorowa", () => {
    const result = calculateWycinanieFolii({
      variantId: "kolorowa",
      widthMm: 500,
      heightMm: 1000,
      express: false
    });

    // 0.5 m2 * 200 = 100
    expect(result.totalPrice).toBe(100);
    expect(result.tierPrice).toBe(200);
  });

  it("should use >=1m2 rate for zloto-srebro", () => {
    const result = calculateWycinanieFolii({
      variantId: "zloto-srebro",
      widthMm: 1000,
      heightMm: 1000,
      express: false
    });

    // 1 m2 * 150 = 150
    expect(result.totalPrice).toBe(150);
    expect(result.tierPrice).toBe(150);
  });

  it("should apply minimum 30 PLN", () => {
    const result = calculateWycinanieFolii({
      variantId: "kolorowa",
      widthMm: 100,
      heightMm: 100,
      express: false
    });

    // 0.01 m2 * 200 = 2 => min 30
    expect(result.totalPrice).toBe(30);
  });

  it("should apply express modifier", () => {
    const result = calculateWycinanieFolii({
      variantId: "kolorowa",
      widthMm: 1000,
      heightMm: 1000,
      express: true
    });

    // 1 m2 * 125 = 125; +20% => 150
    expect(result.totalPrice).toBe(150);
  });
});
