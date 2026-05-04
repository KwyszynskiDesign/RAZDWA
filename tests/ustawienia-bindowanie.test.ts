import { describe, expect, it } from "vitest";
import { getBindowanieSubgroupTitle, sortLaminowanieCategoryKeys } from "../src/ui/views/ustawienia";

describe("Ustawienia bindowanie grouping", () => {
  it("maps bindowanie keys into the requested three subgroups", () => {
    expect(getBindowanieSubgroupTitle("laminowanie-bindowanie-plastik-1-50-do20-listwa")).toBe("PLASTIK DO 20 KART");
    expect(getBindowanieSubgroupTitle("laminowanie-bindowanie-plastik-1-50-do20-spirala")).toBe("PLASTIK DO 20 KART");
    expect(getBindowanieSubgroupTitle("laminowanie-bindowanie-plastik-51-100-do20")).toBe("PLASTIK DO 20 KART");
    expect(getBindowanieSubgroupTitle("laminowanie-bindowanie-plastik-51-100-21-100")).toBe("PLASTIK 21+ KART");
    expect(getBindowanieSubgroupTitle("laminowanie-bindowanie-metal-51-100-do80")).toBe("METAL SPIRALA");
  });

  it("sorts bindowanie keys in three subgroups and by quantity inside each subgroup", () => {
    const sorted = sortLaminowanieCategoryKeys([
      "laminowanie-bindowanie-metal-1-50-do40",
      "laminowanie-bindowanie-plastik-101-200-do20",
      "laminowanie-bindowanie-plastik-51-100-21-100",
      "laminowanie-bindowanie-plastik-1-50-do20-listwa",
      "laminowanie-bindowanie-plastik-1-50-do20-spirala",
      "laminowanie-bindowanie-plastik-51-100-do20",
    ]);

    expect(sorted).toEqual([
      "laminowanie-bindowanie-plastik-1-50-do20-listwa",
      "laminowanie-bindowanie-plastik-1-50-do20-spirala",
      "laminowanie-bindowanie-plastik-51-100-do20",
      "laminowanie-bindowanie-plastik-101-200-do20",
      "laminowanie-bindowanie-plastik-51-100-21-100",
      "laminowanie-bindowanie-metal-1-50-do40",
    ]);
  });
});