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

  it("should track satin in appliedModifiers", () => {
    const result = calculateDyplomy({ qty: 1, isSatin: true, express: false });
    expect(result.appliedModifiers).toContain("satin");
    expect(result.appliedModifiers).not.toContain("express");
  });

  it("should track express in appliedModifiers", () => {
    const result = calculateDyplomy({ qty: 1, isSatin: false, express: true });
    expect(result.appliedModifiers).toContain("express");
    expect(result.appliedModifiers).not.toContain("satin");
  });

  it("should apply Modigliani as Satin +20% from satin subtotal", () => {
    // baza 20.00
    // satyna +12% = 2.40 -> 22.40
    // modigliani +20% od satyny = 4.48
    // razem dopłaty = 6.88, suma = 26.88
    const result = calculateDyplomy({
      qty: 1,
      isSatin: false,
      isModigliani: true,
      express: false
    });
    expect(result.modifiersTotal).toBe(6.88);
    expect(result.totalPrice).toBe(26.88);
    expect(result.appliedModifiers).toContain("satin");
    expect(result.appliedModifiers).toContain("modigliani");
  });

  it("should apply Modigliani and Express with express on base price", () => {
    // baza 20.00
    // modigliani (satyna+20%) = 6.88
    // express +20% od bazy = 4.00
    // razem = 30.88
    const result = calculateDyplomy({
      qty: 1,
      isSatin: false,
      isModigliani: true,
      express: true
    });
    expect(result.modifiersTotal).toBe(10.88);
    expect(result.totalPrice).toBe(30.88);
    expect(result.appliedModifiers).toContain("express");
  });

  it("should have empty appliedModifiers when no modifiers active", () => {
    const result = calculateDyplomy({ qty: 1, isSatin: false, express: false });
    expect(result.appliedModifiers).toEqual([]);
  });
});

