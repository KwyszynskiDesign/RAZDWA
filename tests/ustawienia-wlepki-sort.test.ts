import { describe, it, expect } from "vitest";
import { sortWlepkiCategoryKeys } from "../src/ui/views/ustawienia";

describe("sortWlepkiCategoryKeys", () => {
  it("sorts wlepki keys by product group and quantity ascending", () => {
    const input = [
      "wlepki-szt-papier-sra3-10",
      "wlepki-obrys-folia-51+",
      "wlepki-szt-papier-sra3-2",
      "wlepki-standard-folia-6-25",
      "wlepki-polipropylen-11+",
      "wlepki-szt-folia-sra3-1",
      "wlepki-obrys-folia-1-5",
      "wlepki-modifier-pojedyncze",
      "wlepki-szt-plotowane-papier-20",
      "wlepki-szt-plotowane-papier-3",
      "wlepki-szt-plotowane-folia-30",
      "wlepki-szt-plotowane-folia-4",
      "wlepki-modifier-arkusze",
    ];

    expect(sortWlepkiCategoryKeys(input)).toEqual([
      "wlepki-obrys-folia-1-5",
      "wlepki-obrys-folia-51+",
      "wlepki-polipropylen-11+",
      "wlepki-standard-folia-6-25",
      "wlepki-szt-papier-sra3-2",
      "wlepki-szt-papier-sra3-10",
      "wlepki-szt-folia-sra3-1",
      "wlepki-szt-plotowane-papier-3",
      "wlepki-szt-plotowane-papier-20",
      "wlepki-szt-plotowane-folia-4",
      "wlepki-szt-plotowane-folia-30",
      "wlepki-modifier-arkusze",
      "wlepki-modifier-pojedyncze",
    ]);
  });
});
