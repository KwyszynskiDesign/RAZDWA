import { describe, it, expect } from "vitest";
import { calculateDyplomy } from "../src/categories/dyplomy";

describe("Dyplomy logic", () => {
  it("should calculate 1szt correctly", () => {
    const result = calculateDyplomy({
      qty: 1,
      isSatin: false,
      express: false
    });
    expect(result.totalPrice).toBe(20.00);
  });

  it("should use tier 6 price for 6szt (35.00)", () => {
    const result = calculateDyplomy({
      qty: 6,
      isSatin: false,
      express: false
    });
    expect(result.totalPrice).toBe(35.00);
  });

  it("should apply Satin modifier (+12%) to base price", () => {
    // 1szt = 20.00. 20 + 12% = 22.40
    const result = calculateDyplomy({
      qty: 1,
      isSatin: true,
      express: false
    });
    expect(result.totalPrice).toBe(22.40);
  });

  it("should apply both tier price and Satin correctly", () => {
    // 6szt base = 35.00
    // Satin +12% = +4.20
    // Total = 39.20
    const result = calculateDyplomy({
      qty: 6,
      isSatin: true,
      express: false
    });
    expect(result.totalPrice).toBe(39.20);
  });

  it("should apply Express modifier (+20%)", () => {
    // 1szt = 20.00. 20 + 20% = 24.00
    const result = calculateDyplomy({
      qty: 1,
      isSatin: false,
      express: true
    });
    expect(result.totalPrice).toBe(24.00);
  });
});
