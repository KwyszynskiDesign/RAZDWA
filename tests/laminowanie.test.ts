import { describe, it, expect } from "vitest";
import { quoteLaminowanie, quoteIntroligatornia, quoteWydrukiSpecjalne } from "../src/categories/laminowanie";

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

  it("should calculate introligatornia: gilotyna", () => {
    const result = quoteIntroligatornia({
      serviceId: "gilotyna",
      qty: 10,
      express: false
    });
    expect(result.totalPrice).toBe(0.7);
  });

  it("should ignore express for introligatornia", () => {
    const result = quoteIntroligatornia({
      serviceId: "bigowanie",
      qty: 2,
      express: true
    });
    // 2 * 0.5 = 1.0 (bez dopłaty express)
    expect(result.totalPrice).toBe(1.0);
  });

  it("should throw for invalid introligatornia service", () => {
    expect(() => quoteIntroligatornia({
      serviceId: "invalid",
      qty: 1,
      express: false
    })).toThrow();
  });

  it("should calculate introligatornia: dziurkowanie powyzej 20 kartek", () => {
    const result = quoteIntroligatornia({
      serviceId: "dziurkowanie-powyzej-20",
      qty: 10,
      express: false,
    });
    expect(result.totalPrice).toBe(0.5);
  });

  it("should support legacy id for dziurkowanie service", () => {
    const result = quoteIntroligatornia({
      serviceId: "druk-powyzej-20",
      qty: 10,
      express: false,
    });
    expect(result.serviceId).toBe("dziurkowanie-powyzej-20");
    expect(result.totalPrice).toBe(0.5);
  });

  it("should calculate wydruki specjalne: Dyplom", () => {
    const result = quoteWydrukiSpecjalne({
      variantId: "dyplom",
      qty: 2,
      doubleSided: false,
      express: false,
    });

    expect(result.totalPrice).toBe(0);
  });

  it("should apply +50% for double-sided special print", () => {
    const result = quoteWydrukiSpecjalne({
      variantId: "zaproszenia-dodruk",
      qty: 2,
      doubleSided: true,
      express: false,
    });

    expect(result.totalPrice).toBe(0);
  });

  it("should apply express for special prints", () => {
    const result = quoteWydrukiSpecjalne({
      variantId: "koperty-nadruk",
      qty: 1,
      doubleSided: true,
      express: true,
    });

    expect(result.totalPrice).toBe(0);
  });
});
