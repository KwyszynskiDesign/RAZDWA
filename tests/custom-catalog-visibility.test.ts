import { beforeEach, describe, expect, it, vi } from "vitest";
import { getRenderedArtykulyBiuroweCategories } from "../src/categories/artykuly-biurowe";
import { getRenderedUslugiCategories } from "../src/categories/uslugi";
import { resetPrices, setPrice, setPriceLabels } from "../src/services/priceService";

let storageData: Record<string, string> = {};

beforeEach(() => {
  storageData = {};
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storageData[key] || null,
    setItem: (key: string, value: string) => {
      storageData[key] = value;
    },
    removeItem: (key: string) => {
      delete storageData[key];
    },
    clear: () => {
      storageData = {};
    },
  });
  resetPrices();
});

describe("custom catalog visibility", () => {
  it("shows a newly added service in the uslugi catalog", () => {
    setPrice("defaultPrices.uslugi-nowa-usluga", 123);
    setPriceLabels({
      "uslugi-nowa-usluga": "Nowa usługa",
    });

    const categories = getRenderedUslugiCategories();
    const customCategory = categories.find((category) => category.name === "DODANE RĘCZNIE");

    expect(customCategory).toBeDefined();
    expect(customCategory?.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "nowa-usluga",
          name: "Nowa usługa",
          price: 123,
        }),
      ])
    );
  });

  it("shows a newly added office article in the artykuly catalog", () => {
    setPrice("defaultPrices.artykuly-nowy-archiwizer", 19.5);
    setPriceLabels({
      "artykuly-nowy-archiwizer": "Nowy archiwizer",
    });

    const categories = getRenderedArtykulyBiuroweCategories();
    const customCategory = categories.find((category) => category.name === "DODANE RĘCZNIE");

    expect(customCategory).toBeDefined();
    expect(customCategory?.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "nowy-archiwizer",
          name: "Nowy archiwizer",
          price: 19.5,
        }),
      ])
    );
  });
});
