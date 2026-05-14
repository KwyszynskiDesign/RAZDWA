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

  it("ignores mojibake duplicate uslugi keys and applies their price to canonical services", () => {
    const brokenBannerId = "grafika-baner-z\u00C5\u201Ao\u00C5\u00BCony";
    const brokenPakietId = "pakiet-z\u00C5\u201Ao\u00C5\u00BCony";

    setPrice(`defaultPrices.uslugi-${brokenBannerId}`, 251);
    setPrice(`defaultPrices.uslugi-${brokenPakietId}`, 450);

    const categories = getRenderedUslugiCategories();
    const allItems = categories.flatMap((category) => category.items);

    expect(allItems.find((item) => item.id === "grafika-baner-zlozony")?.price).toBe(250);
    expect(allItems.find((item) => item.id === "pakiet-zlozony")?.price).toBe(449);
    expect(allItems.some((item) => item.id === brokenBannerId)).toBe(false);
    expect(allItems.some((item) => item.id === brokenPakietId)).toBe(false);
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
