import { describe, it, expect } from "vitest";
import { quoteLaminowanie } from "../src/categories/laminowanie";

describe("Laminowanie", () => {
  it("should calculate price for A3 (1-50szt) = 7 PLN/szt", () => {
    const result = quoteLaminowanie({
      format: "A3",
      qty: 10,
      express: false
    });
    // 10 * 7 = 70
    expect(result.totalPrice).toBe(70);
  });

  it("should calculate price for A3 (51-100szt) = 6 PLN/szt", () => {
    const result = quoteLaminowanie({
      format: "A3",
      qty: 60,
      express: false
    });
    // 60 * 6 = 360
    expect(result.totalPrice).toBe(360);
  });

  it("should calculate price for A4 (101-200szt) = 4 PLN/szt", () => {
    const result = quoteLaminowanie({
      format: "A4",
      qty: 150,
      express: false
    });
    // 150 * 4 = 600
    expect(result.totalPrice).toBe(600);
  });

  it("should calculate price for A6 (1-50szt) = 3 PLN/szt", () => {
    const result = quoteLaminowanie({
      format: "A6",
      qty: 1,
      express: false
    });
    expect(result.totalPrice).toBe(3);
  });

  it("should apply express surcharge (+20%)", () => {
    const result = quoteLaminowanie({
      format: "A3",
      qty: 10,
      express: true
    });
    // 70 * 1.2 = 84
    expect(result.totalPrice).toBe(84);
  });

  it("should throw error for invalid format", () => {
    expect(() => quoteLaminowanie({
        format: "INVALID",
        qty: 10,
        express: false
    })).toThrow("Invalid format: INVALID");
  });
});
