import { describe, expect, it } from "vitest";
import { getUslugiSectionTitle, sortUslugiCategoryKeys } from "../src/ui/views/ustawienia";

describe("Ustawienia usługi grouping", () => {
  it("maps uslugi keys into 3 logical subgroups", () => {
    expect(getUslugiSectionTitle("uslugi-formatowanie")).toBe("FORMATOWANIE I ARCHIWIZACJA");
    expect(getUslugiSectionTitle("uslugi-archiwizacja-cd")).toBe("FORMATOWANIE I ARCHIWIZACJA");
    expect(getUslugiSectionTitle("uslugi-scalanie-20+")).toBe("SCALANIE I PRZETWARZANIE PLIKÓW");
    expect(getUslugiSectionTitle("uslugi-grafika-logotyp")).toBe("USŁUGI GRAFICZNE I PAKIETY");
    expect(getUslugiSectionTitle("uslugi-social-media-3-projekty")).toBe(
      "USŁUGI GRAFICZNE I PAKIETY"
    );
  });

  it("sorts uslugi keys by subgroup order", () => {
    const sorted = sortUslugiCategoryKeys([
      "uslugi-social-media-3-projekty",
      "uslugi-scalanie-1-9",
      "uslugi-formatowanie",
      "uslugi-grafika-logotyp",
      "uslugi-archiwizacja-cd",
    ]);

    expect(sorted).toEqual([
      "uslugi-archiwizacja-cd",
      "uslugi-formatowanie",
      "uslugi-scalanie-1-9",
      "uslugi-grafika-logotyp",
      "uslugi-social-media-3-projekty",
    ]);
  });
});
