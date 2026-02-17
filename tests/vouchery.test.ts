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
    expect(result.totalPrice).toBe(48.16);
  });

  it("should calculate 5 szt dwustronne with satin (+12%) and express (+20%)", () => {
    const result = quoteVouchery({ qty: 5, sides: 'double', satin: true, express: true });
    // 43 + (43 * 0.12) + (43 * 0.20) = 43 + 5.16 + 8.6 = 56.76
    expect(result.totalPrice).toBe(56.76);
  });

  it("should handle quantity ranges (e.g. 11 szt should be priced as 10 szt per latest requirements)", () => {
    // 10 szt single = 52
    // Our latest logic (qty >= tier.qty) picks tier 10 for qty 11.
    const result = quoteVouchery({ qty: 11, sides: 'single', satin: false, express: false });
    expect(result.totalPrice).toBe(52);
  });
});
