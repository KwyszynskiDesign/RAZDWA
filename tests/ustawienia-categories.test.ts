import { describe, it, expect } from "vitest";
import { getRenderedCategories, isLaminowanieEmphasizedRow } from "../src/ui/views/ustawienia";

describe("Ustawienia category mapping", () => {
  it("assigns plakaty blockout keys to the Solwent / plakaty category", () => {
    const prices = {
      "plakaty-blockout200g-1-3": 80,
    };

    const categories = getRenderedCategories(prices);
    const hasFallback = categories.some((category) => category.id === "inne");
    expect(hasFallback).toBe(false);

    const solwentCategory = categories.find((category) => category.id === "solwent");
    expect(solwentCategory).toBeDefined();
  });

  it("assigns CAD fold keys to the CAD wielkoformatowy category", () => {
    const prices = {
      "cad-fold-a0": 2.5,
    };

    const categories = getRenderedCategories(prices);
    const hasFallback = categories.some((category) => category.id === "inne");
    expect(hasFallback).toBe(false);

    const cadCategory = categories.find((category) => category.id === "druk-cad");
    expect(cadCategory).toBeDefined();
  });

  it("assigns CAD scanning key to the CAD wielkoformatowy category", () => {
    const prices = {
      "cad-skanowanie": 0.08,
    };

    const categories = getRenderedCategories(prices);
    const hasFallback = categories.some((category) => category.id === "inne");
    expect(hasFallback).toBe(false);

    const cadCategory = categories.find((category) => category.id === "druk-cad");
    expect(cadCategory).toBeDefined();
  });

  it("assigns Canvas keys to the Canvas / Płótno category", () => {
    const prices = {
      "canvas-m2-unframed": 180,
      "canvas-unframed-custom-m2": 190,
    };

    const categories = getRenderedCategories(prices);
    const hasFallback = categories.some((category) => category.id === "inne");
    expect(hasFallback).toBe(false);

    const canvasCategory = categories.find((category) => category.id === "canvas");
    expect(canvasCategory).toBeDefined();
    expect(canvasCategory?.label).toBe("Canvas / Płótno");
  });

  it("emphasizes A3 and A5 rows in laminowanie", () => {
    expect(isLaminowanieEmphasizedRow("laminowanie-a3-1-50")).toBe(true);
    expect(isLaminowanieEmphasizedRow("laminowanie-a5-1-50")).toBe(true);
    expect(isLaminowanieEmphasizedRow("laminowanie-a4-1-50")).toBe(false);
    expect(isLaminowanieEmphasizedRow("laminowanie-a6-1-50")).toBe(false);
  });
});
