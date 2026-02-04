import { describe, it, expect } from "vitest";
import { calculateDrukA4A3Skan } from "../src/categories/druk-a4-a3-skan";
import { calculateDrukCAD } from "../src/categories/druk-cad";
import categories from "../data/categories.json";

describe("Druk A4/A3 + skan", () => {
  const pricing = categories.find(c => c.id === "druk-a4-a3")?.pricing;

  it("should calculate simple B&W A4 print", () => {
    const result = calculateDrukA4A3Skan({
      mode: "bw",
      format: "a4",
      printQty: 1,
      email: false,
      surcharge: false,
      surchargeQty: 0,
      scanType: "none",
      scanQty: 0,
      express: false
    }, pricing);
    expect(result.totalPrice).toBe(0.90);
  });

  it("should calculate tiered pricing for B&W A4", () => {
    // 10 str -> tier 6-20 -> 0.60
    const result = calculateDrukA4A3Skan({
      mode: "bw",
      format: "a4",
      printQty: 10,
      email: false,
      surcharge: false,
      surchargeQty: 0,
      scanType: "none",
      scanQty: 0,
      express: false
    }, pricing);
    expect(result.totalPrice).toBe(6.00);
  });

  it("should calculate color A3 print", () => {
    // 1 str A3 color -> 4.80
    const result = calculateDrukA4A3Skan({
      mode: "color",
      format: "a3",
      printQty: 1,
      email: false,
      surcharge: false,
      surchargeQty: 0,
      scanType: "none",
      scanQty: 0,
      express: false
    }, pricing);
    expect(result.totalPrice).toBe(4.80);
  });

  it("should handle e-mail surcharge", () => {
    const result = calculateDrukA4A3Skan({
      mode: "bw",
      format: "a4",
      printQty: 1,
      email: true,
      surcharge: false,
      surchargeQty: 0,
      scanType: "none",
      scanQty: 0,
      express: false
    }, pricing);
    expect(result.totalPrice).toBe(1.90); // 0.90 + 1.00
  });

  it("should handle zadruk >25% surcharge (+50% of unit print price)", () => {
    const result = calculateDrukA4A3Skan({
      mode: "bw",
      format: "a4",
      printQty: 10,
      email: false,
      surcharge: true,
      surchargeQty: 5,
      scanType: "none",
      scanQty: 0,
      express: false
    }, pricing);
    // 10 * 0.60 = 6.00
    // Surcharge: 5 * 0.60 * 0.5 = 1.50
    // Total: 7.50
    expect(result.totalPrice).toBe(7.50);
  });

  it("should handle scanning", () => {
    const result = calculateDrukA4A3Skan({
      mode: "bw",
      format: "a4",
      printQty: 0,
      email: false,
      surcharge: false,
      surchargeQty: 0,
      scanType: "auto",
      scanQty: 10,
      express: false
    }, pricing);
    // scan_auto 10 str -> 0.50 per str
    expect(result.totalPrice).toBe(5.00);
  });

  it("should apply express surcharge (+20%)", () => {
    const result = calculateDrukA4A3Skan({
      mode: "bw",
      format: "a4",
      printQty: 10,
      email: false,
      surcharge: false,
      surchargeQty: 0,
      scanType: "none",
      scanQty: 0,
      express: true
    }, pricing);
    // 6.00 * 1.2 = 7.20
    expect(result.totalPrice).toBe(7.20);
  });
});

describe("Druk CAD", () => {
  const pricing = categories.find(c => c.id === "druk-cad") as any;

  it("should calculate base format price for A1 B&W", () => {
    const result = calculateDrukCAD({
      mode: "bw",
      format: "A1",
      lengthMm: 841, // base length for A1
      express: false
    }, pricing);
    expect(result.totalPrice).toBe(6.00);
    expect(result.isMeter).toBe(false);
  });

  it("should calculate meter price when length is different for A1 B&W", () => {
    const result = calculateDrukCAD({
      mode: "bw",
      format: "A1",
      lengthMm: 1000,
      express: false
    }, pricing);
    // meter price for A1 BW is 5.00. 1000mm = 1mb. 1 * 5 = 5.00
    expect(result.totalPrice).toBe(5.00);
    expect(result.isMeter).toBe(true);
  });

  it("should calculate meter price for longer A1 B&W", () => {
    const result = calculateDrukCAD({
      mode: "bw",
      format: "A1",
      lengthMm: 2000,
      express: false
    }, pricing);
    // 2 * 5.00 = 10.00
    expect(result.totalPrice).toBe(10.00);
  });

  it("should apply express for CAD", () => {
    const result = calculateDrukCAD({
      mode: "bw",
      format: "A1",
      lengthMm: 841,
      express: true
    }, pricing);
    // 6.00 * 1.2 = 7.20
    expect(result.totalPrice).toBe(7.20);
  });
});
