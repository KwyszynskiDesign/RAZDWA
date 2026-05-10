import { beforeEach, describe, expect, it, vi } from "vitest";
import { quoteJednostronne } from "../src/categories/ulotki-cyfrowe-jednostronne";
import { quoteWizytowki } from "../src/categories/wizytowki-druk-cyfrowy";
import { calculateWlepkiSzt } from "../src/categories/wlepki-naklejki";
import { resetPrices, setPrice } from "../src/services/priceService";

let storageData: Record<string, string> = {};

beforeEach(() => {
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
  storageData = {};
  resetPrices();
});

describe("custom dynamic tier rows", () => {
  it("picks a custom flyer tier added in settings", () => {
    setPrice("defaultPrices.ulotki-jed-a5-120", 155);

    const result = quoteJednostronne({
      format: "A5",
      qty: 120,
      express: false,
    });

    expect(result.totalPrice).toBe(155.00);
  });

  it("picks a custom business-card tier added in settings", () => {
    setPrice("defaultPrices.wizytowki-85x55-none-120szt", 145);

    const result = quoteWizytowki({
      format: "85x55",
      folia: "none",
      qty: 120,
      express: false,
    });

    expect(result.qtyBilled).toBe(120);
    expect(result.totalPrice).toBe(145.00);
  });

  it("picks a custom wlepki piece-table tier added in settings", () => {
    setPrice("defaultPrices.wlepki-szt-papier-sra3-12", 58);

    const result = calculateWlepkiSzt({
      tableId: "papier-sra3",
      qty: 11,
    });

    expect(result.chargedQty).toBe(12);
    expect(result.totalPrice).toBe(58.00);
  });
});
