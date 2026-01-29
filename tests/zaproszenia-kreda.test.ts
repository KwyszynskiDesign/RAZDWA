import { describe, it, expect } from "vitest";
import { calculateZaproszeniaKreda } from "../src/categories/zaproszenia-kreda";

describe("Zaproszenia KREDA logic", () => {
  it("should calculate A6 Double-sided 10szt correctly", () => {
    // A6 Double-sided Normal 10szt = 35.00
    const result = calculateZaproszeniaKreda({
      format: "A6",
      qty: 10,
      sides: 2,
      isFolded: false,
      isSatin: false,
      express: false
    });
    expect(result.totalPrice).toBe(35.00);
  });

  it("should calculate A5 Folded Double-sided 50szt correctly", () => {
    // A5 Double-sided Folded 50szt = 149.00
    const result = calculateZaproszeniaKreda({
      format: "A5",
      qty: 50,
      sides: 2,
      isFolded: true,
      isSatin: false,
      express: false
    });
    expect(result.totalPrice).toBe(149.00);
  });

  it("should calculate A5 Normal Double-sided 50szt correctly", () => {
    // A5 Double-sided Normal 50szt = 79.00
    const result = calculateZaproszeniaKreda({
      format: "A5",
      qty: 50,
      sides: 2,
      isFolded: false,
      isSatin: false,
      express: false
    });
    expect(result.totalPrice).toBe(79.00);
  });

  it("should apply Satin modifier (+12%)", () => {
    // A6 Double-sided Normal 10szt = 35.00. 35 + 12% = 39.20
    const result = calculateZaproszeniaKreda({
      format: "A6",
      qty: 10,
      sides: 2,
      isFolded: false,
      isSatin: true,
      express: false
    });
    expect(result.totalPrice).toBe(39.20);
  });

  it("should apply Express modifier (+20%)", () => {
    // A6 Double-sided Normal 10szt = 35.00. 35 + 20% = 42.00
    const result = calculateZaproszeniaKreda({
      format: "A6",
      qty: 10,
      sides: 2,
      isFolded: false,
      isSatin: false,
      express: true
    });
    expect(result.totalPrice).toBe(42.00);
  });

  it("should apply both Satin and Express modifiers", () => {
    // 35 + 12% + 20% = 35 + 4.2 + 7.0 = 46.20
    const result = calculateZaproszeniaKreda({
      format: "A6",
      qty: 10,
      sides: 2,
      isFolded: false,
      isSatin: true,
      express: true
    });
    expect(result.totalPrice).toBe(46.20);
  });
});
