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
      gramMod: 1.0,
      finishMod: 1.0,
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
      gramMod: 1.0,
      finishMod: 1.0,
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
      gramMod: 1.0,
      finishMod: 1.0,
      express: false
    });
    expect(result.totalPrice).toBe(79.00);
  });

  it("should apply Finish modifier (+15%)", () => {
    // A6 Double-sided Normal 10szt = 35.00. 35 + 15% = 40.25
    const result = calculateZaproszeniaKreda({
      format: "A6",
      qty: 10,
      sides: 2,
      isFolded: false,
      gramMod: 1.0,
      finishMod: 1.15,
      express: false
    });
    expect(result.totalPrice).toBe(40.25);
  });

  it("should apply Express modifier (+20%)", () => {
    // A6 Double-sided Normal 10szt = 35.00. 35 + 20% = 42.00
    const result = calculateZaproszeniaKreda({
      format: "A6",
      qty: 10,
      sides: 2,
      isFolded: false,
      gramMod: 1.0,
      finishMod: 1.0,
      express: true
    });
    expect(result.totalPrice).toBe(42.00);
  });

  it("should apply both Gramature and Express modifiers", () => {
    // 35 + 10% (160g) + 20% = 35 + 3.5 + 7.0 = 45.50
    const result = calculateZaproszeniaKreda({
      format: "A6",
      qty: 10,
      sides: 2,
      isFolded: false,
      gramMod: 1.1,
      finishMod: 1.0,
      express: true
    });
    expect(result.totalPrice).toBe(45.50);
  });
});
