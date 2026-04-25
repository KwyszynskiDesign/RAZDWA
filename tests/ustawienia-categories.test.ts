import { describe, it, expect } from "vitest";
import { getRenderedCategories } from "../src/ui/views/ustawienia";

describe("Ustawienia category mapping", () => {
  it("assigns plakaty blockout keys to the Solwent / plakaty category", () => {
    const prices = {
      "plakaty-blockout200g-1-3": 80
    };

    const categories = getRenderedCategories(prices);
    const hasFallback = categories.some((category) => category.id === "inne");
    expect(hasFallback).toBe(false);

    const solwentCategory = categories.find((category) => category.id === "solwent");
    expect(solwentCategory).toBeDefined();
  });

  it("assigns CAD fold keys to the CAD wielkoformatowy category", () => {
    const prices = {
      "cad-fold-a0": 2.5
    };

    const categories = getRenderedCategories(prices);
    const hasFallback = categories.some((category) => category.id === "inne");
    expect(hasFallback).toBe(false);

    const cadCategory = categories.find((category) => category.id === "druk-cad");
    expect(cadCategory).toBeDefined();
  });
});
