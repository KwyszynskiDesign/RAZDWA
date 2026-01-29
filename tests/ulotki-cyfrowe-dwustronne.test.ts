import { describe, it, expect } from "vitest";
import { quoteUlotkiDwustronne } from "../src/categories/ulotki-cyfrowe-dwustronne";

describe("Ulotki - Cyfrowe Dwustronne", () => {
  it("calculates A5 100szt correctly (140 PLN)", () => {
    const result = quoteUlotkiDwustronne({
      format: "A5",
      qty: 100,
      express: false
    });
    expect(result.totalPrice).toBe(140.00);
  });

  it("calculates A6 1000szt correctly (476 PLN)", () => {
    const result = quoteUlotkiDwustronne({
      format: "A6",
      qty: 1000,
      express: false
    });
    expect(result.totalPrice).toBe(476.00);
  });

  it("applies Express +20% correctly", () => {
    // A5 100szt = 140, 140 * 1.2 = 168
    const result = quoteUlotkiDwustronne({
      format: "A5",
      qty: 100,
      express: true
    });
    expect(result.totalPrice).toBe(168.00);
  });

  it("handles A6 10szt (40 PLN)", () => {
    const result = quoteUlotkiDwustronne({
      format: "A6",
      qty: 10,
      express: false
    });
    expect(result.totalPrice).toBe(40.00);
  });

  it("handles DL 50szt (70 PLN)", () => {
    const result = quoteUlotkiDwustronne({
      format: "DL",
      qty: 50,
      express: false
    });
    expect(result.totalPrice).toBe(70.00);
  });
});
