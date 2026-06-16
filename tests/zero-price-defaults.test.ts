import { describe, it, expect } from "vitest";
import { getZeroPriceDefaults } from "../src/core/compat";
import { getConfigRoot } from "../src/services/priceService";

describe("getZeroPriceDefaults", () => {
  it("excludes folia 'wycena ind.' sentinels (full-service / owv-full-service price 0)", () => {
    const labels = getZeroPriceDefaults();
    const folia = labels.filter((l) => /szroniona|owv/i.test(l));
    expect(folia).toEqual([]);
  });

  it("does not flag the default config (no real 0/null tiers besides sentinels)", () => {
    expect(getZeroPriceDefaults()).toEqual([]);
  });

  it("detects an injected zero-price tier in a non-sentinel material", () => {
    const root = getConfigRoot();
    const folia = root.foliaSzroniona;
    const materialOnly = folia.materials.find((m: any) => m.id === "material-only");
    const original = materialOnly.tiers[0].price;
    materialOnly.tiers[0].price = 0;
    try {
      const labels = getZeroPriceDefaults();
      expect(labels.length).toBeGreaterThan(0);
      expect(labels.some((l) => /tylko wydruk/i.test(l))).toBe(true);
    } finally {
      materialOnly.tiers[0].price = original;
    }
  });
});
