import { describe, it, expect } from "vitest";
import { quoteVouchery } from "../src/categories/vouchery";

describe("Vouchery Category", () => {
  it("should calculate 5 szt dwustronne without modifiers", () => {
    const result = quoteVouchery({ qty: 5, sides: 'double', satin: false, express: false });
    expect(result.totalPrice).toBe(43);
  });

  it("should calculate 5 szt dwustronne with satin (+12%)", () => {
    const result = quoteVouchery({ qty: 5, sides: 'double', satin: true, express: false });
    // 43 * 1.12 = 48.16
    // Note: User prompt mentioned 47.16, but 43 * 1.12 = 48.16.
    // We will check what the engine produces.
    expect(result.totalPrice).toBe(48.16);
  });

  it("should calculate 5 szt dwustronne with satin (+12%) and express (+20%)", () => {
    const result = quoteVouchery({ qty: 5, sides: 'double', satin: true, express: true });
    // 43 + (43 * 0.12) + (43 * 0.20) = 43 + 5.16 + 8.6 = 56.76
    expect(result.totalPrice).toBe(56.76);
  });

  it("should handle quantity ranges (e.g. 11 szt should be priced as 15 szt)", () => {
    // 15 szt single = 60
    const result = quoteVouchery({ qty: 11, sides: 'single', satin: false, express: false });
    expect(result.totalPrice).toBe(60);
  });
});
