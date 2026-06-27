import { describe, it, expect } from "vitest";
import {
  BASE_PRICE_CATEGORIES,
  findOrCreateCategory,
  type PriceCategory,
} from "../src/core/productCat";

describe("BASE_PRICE_CATEGORIES", () => {
  it("contains expected category IDs", () => {
    const ids = BASE_PRICE_CATEGORIES.map((c) => c.id);
    expect(ids).toContain("druk-a4-a3");
    expect(ids).toContain("laminowanie");
    expect(ids).toContain("solwent");
    expect(ids).toContain("ulotki");
    expect(ids).toContain("wizytowki");
    expect(ids).toContain("vouchery");
    expect(ids).toContain("dyplomy");
    expect(ids).toContain("broszury-katalogi");
  });

  it("has no duplicate IDs", () => {
    const ids = BASE_PRICE_CATEGORIES.map((c) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it("every category has at least one prefix", () => {
    for (const cat of BASE_PRICE_CATEGORIES) {
      expect(cat.prefixes.length).toBeGreaterThan(0);
    }
  });

  it("every category has non-empty label", () => {
    for (const cat of BASE_PRICE_CATEGORIES) {
      expect(cat.label.trim()).not.toBe("");
    }
  });

  it('does not contain "inne" (dynamically created at runtime)', () => {
    const ids = BASE_PRICE_CATEGORIES.map((c) => c.id);
    expect(ids).not.toContain("inne");
  });
});

describe("findOrCreateCategory", () => {
  const cats: PriceCategory[] = [
    { id: "aaa", label: "AAA", icon: "", prefixes: ["aaa-"], description: "" },
    { id: "bbb", label: "BBB", icon: "", prefixes: ["bbb-"], description: "" },
  ];

  it("returns the matching category when found", () => {
    const result = findOrCreateCategory(cats, "aaa");
    expect(result.id).toBe("aaa");
    expect(result.label).toBe("AAA");
  });

  it("returns fallback when ID not found and fallback provided", () => {
    const fallback = cats[1];
    const result = findOrCreateCategory(cats, "zzz", fallback);
    expect(result).toBe(fallback);
  });

  it("synthesizes a minimal category when ID not found and no fallback", () => {
    const result = findOrCreateCategory(cats, "unknown-id");
    expect(result.id).toBe("unknown-id");
    expect(result.prefixes).toEqual(["unknown-id-"]);
  });

  it("works with BASE_PRICE_CATEGORIES for known IDs", () => {
    const result = findOrCreateCategory(BASE_PRICE_CATEGORIES, "druk-a4-a3");
    expect(result.id).toBe("druk-a4-a3");
  });

  it("returns fallback for unknown ID when searching BASE_PRICE_CATEGORIES", () => {
    const fallback = BASE_PRICE_CATEGORIES[0];
    const result = findOrCreateCategory(BASE_PRICE_CATEGORIES, "nieznana-kategoria", fallback);
    expect(result).toBe(fallback);
  });

  it("is deterministic — same inputs yield same result", () => {
    const r1 = findOrCreateCategory(cats, "aaa");
    const r2 = findOrCreateCategory(cats, "aaa");
    expect(r1).toBe(r2);
  });
});
