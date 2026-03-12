import { describe, it, expect } from "vitest";
import { calculateCanvas } from "../src/categories/canvas";

describe("Canvas / Płótno", () => {
  it("should calculate framed format by qty", () => {
    const result = calculateCanvas({
      modeId: "framed",
      formatId: "70x50",
      quantity: 2,
      express: false
    });

    expect(result.totalPrice).toBe(240);
    expect(result.isCustom).toBe(false);
  });

  it("should calculate m2 unframed mode", () => {
    const result = calculateCanvas({
      modeId: "m2-unframed",
      quantity: 1,
      widthMm: 1000,
      heightMm: 500,
      express: false
    });

    // 0.5 m2 * 180
    expect(result.totalPrice).toBe(90);
    expect(result.areaM2).toBe(0.5);
  });

  it("should return custom flag for custom format", () => {
    const result = calculateCanvas({
      modeId: "unframed",
      formatId: "custom",
      quantity: 1,
      express: false
    });

    expect(result.isCustom).toBe(true);
    expect(result.totalPrice).toBe(0);
  });

  it("should apply express modifier", () => {
    const result = calculateCanvas({
      modeId: "unframed",
      formatId: "100x70",
      quantity: 1,
      express: true
    });

    // 120 * 1.2
    expect(result.totalPrice).toBe(144);
  });
});
