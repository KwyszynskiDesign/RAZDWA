/**
 * Test: Sprawdzenie czy ceny zmieniane w ustawieniach (localStorage) 
 * propagują się do kategorii artykułów biurowych i usług
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { quoteArtykulyBiurowe } from "../src/categories/artykuly-biurowe";
import { quoteUslugi } from "../src/categories/uslugi";
import { setPrice, resetPrices, PRICES_STORAGE_KEY } from "../src/services/priceService";

// Mock localStorage
let storageData: Record<string, string> = {};

beforeEach(() => {
  storageData = {};
  resetPrices();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storageData[key] || null,
    setItem: (key: string, value: string) => { storageData[key] = value; },
    removeItem: (key: string) => { delete storageData[key]; },
    clear: () => { storageData = {}; }
  });
});

afterEach(() => {
  storageData = {};
});

describe("Price Persistence", () => {
  
  describe("Artykuły Biurowe", () => {
    it("should use default price when no override is set", () => {
      const result = quoteArtykulyBiurowe({
        selectedItems: [
          {
            categoryName: "Papier",
            itemId: "papier-a4-80g",
            itemName: "Papier A4 80g",
            quantity: 10,
            price: 25.00 // Default price from JSON
          }
        ]
      });

      expect(result.totalPrice).toBe(250.00); // 25 * 10
      expect(result.itemsCount).toBe(1);
      expect(result.totalQuantity).toBe(10);
    });

    it("should override price from localStorage", () => {
      // Set override price in localStorage
      setPrice("defaultPrices.artykuly-papier-a4-80g", 30.00);

      const result = quoteArtykulyBiurowe({
        selectedItems: [
          {
            categoryName: "Papier",
            itemId: "papier-a4-80g",
            itemName: "Papier A4 80g",
            quantity: 10,
            price: 25.00 // Original price from JSON
          }
        ]
      });

      expect(result.totalPrice).toBe(300.00); // 30 * 10 (overridden price)
      expect(result.itemsCount).toBe(1);
      expect(result.totalQuantity).toBe(10);
    });

    it("should handle multiple items with mixed overrides", () => {
      // Set some prices, leave others as default
      setPrice("defaultPrices.artykuly-segregator-7cm", 15.00);
      // Don't set dugopis price - it stays at default 6.00

      const result = quoteArtykulyBiurowe({
        selectedItems: [
          {
            categoryName: "Segregatory",
            itemId: "segregator-7cm",
            itemName: "SEGREGATOR 7 cm",
            quantity: 10,
            price: 13.00 // Original price from JSON
          },
          {
            categoryName: "Artykuły piszcze",
            itemId: "dugopis",
            itemName: "Długopis",
            quantity: 5,
            price: 6.00 // Default price (no override, stays 6.00)
          }
        ]
      });

      // 15 * 10 + 6.00 * 5 = 150 + 30 = 180
      expect(result.totalPrice).toBe(180.00);
      expect(result.itemsCount).toBe(2);
      expect(result.totalQuantity).toBe(15);
    });

    it("localStorage data should persist after setPrice", () => {
      setPrice("defaultPrices.artykuly-papier-a4-80g", 35.00);
      
      // Check that localStorage contains the data
      const stored = storageData[PRICES_STORAGE_KEY];
      expect(stored).toBeDefined();
      
      const parsed = JSON.parse(stored);
      expect(parsed["artykuly-papier-a4-80g"]).toBe(35.00);
    });
  });

  describe("Usługi", () => {
    it("should use default price when no override is set", () => {
      const result = quoteUslugi({
        selectedServices: [
          {
            serviceId: "formatowanie",
            serviceName: "Formatowanie",
            price: 50.00,
            quantity: 1,
            hours: 1
          }
        ]
      });

      expect(result.totalPrice).toBe(50.00); // 50 * 1 * 1
      expect(result.servicesCount).toBe(1);
    });

    it("should override price from localStorage for flat services", () => {
      setPrice("defaultPrices.uslugi-archiwizacja", 25.00);

      const result = quoteUslugi({
        selectedServices: [
          {
            serviceId: "archiwizacja",
            serviceName: "Archiwizacja",
            price: 20.00,
            quantity: 2,
            hours: 1
          }
        ]
      });

      expect(result.totalPrice).toBe(50.00); // 25 * 2 * 1 (overridden price)
      expect(result.servicesCount).toBe(1);
    });

    it("should handle time-based services with price override", () => {
      setPrice("defaultPrices.uslugi-formatowanie", 60.00);

      const result = quoteUslugi({
        selectedServices: [
          {
            serviceId: "formatowanie",
            serviceName: "Formatowanie",
            price: 50.00,
            quantity: 1,
            hours: 2.5 // Time-based
          }
        ]
      });

      expect(result.totalPrice).toBe(150.00); // 60 * 1 * 2.5 (overridden price with hours)
      expect(result.servicesCount).toBe(1);
    });

    it("should handle multiple services with mixed overrides", () => {
      setPrice("defaultPrices.uslugi-formatowanie", 60.00);
      setPrice("defaultPrices.uslugi-poprawki-graficzne", 80.00);

      const result = quoteUslugi({
        selectedServices: [
          {
            serviceId: "formatowanie",
            serviceName: "Formatowanie",
            price: 50.00,
            quantity: 1,
            hours: 2
          },
          {
            serviceId: "poprawki-graficzne",
            serviceName: "Poprawki graficzne",
            price: 70.00,
            quantity: 2,
            hours: 1.5
          }
        ]
      });

      // 60 * 1 * 2 + 80 * 2 * 1.5 = 120 + 240 = 360
      expect(result.totalPrice).toBe(360.00);
      expect(result.servicesCount).toBe(2);
    });

    it("localStorage data should persist after setPrice", () => {
      setPrice("defaultPrices.uslugi-formatowanie", 65.00);
      
      const stored = storageData[PRICES_STORAGE_KEY];
      expect(stored).toBeDefined();
      
      const parsed = JSON.parse(stored);
      expect(parsed["uslugi-formatowanie"]).toBe(65.00);
    });
  });

  describe("Cross-Category Price Consistency", () => {
    it("should maintain separate namespaces for artykuly and uslugi prices", () => {
      setPrice("defaultPrices.artykuly-papier-a4-80g", 30.00);
      setPrice("defaultPrices.uslugi-formatowanie", 60.00);

      const artykulyResult = quoteArtykulyBiurowe({
        selectedItems: [
          {
            categoryName: "Papier",
            itemId: "papier-a4-80g",
            itemName: "Papier A4 80g",
            quantity: 1,
            price: 25.00
          }
        ]
      });

      const uslugiResult = quoteUslugi({
        selectedServices: [
          {
            serviceId: "formatowanie",
            serviceName: "Formatowanie",
            price: 50.00,
            quantity: 1,
            hours: 1
          }
        ]
      });

      expect(artykulyResult.totalPrice).toBe(30.00);
      expect(uslugiResult.totalPrice).toBe(60.00);
    });

    it("resetting prices should clear all overrides", () => {
      setPrice("defaultPrices.artykuly-papier-a4-80g", 30.00);
      setPrice("defaultPrices.uslugi-formatowanie", 60.00);
      
      resetPrices();

      const artykulyResult = quoteArtykulyBiurowe({
        selectedItems: [
          {
            categoryName: "Papier",
            itemId: "papier-a4-80g",
            itemName: "Papier A4 80g",
            quantity: 1,
            price: 25.00
          }
        ]
      });

      const uslugiResult = quoteUslugi({
        selectedServices: [
          {
            serviceId: "formatowanie",
            serviceName: "Formatowanie",
            price: 50.00,
            quantity: 1,
            hours: 1
          }
        ]
      });

      expect(artykulyResult.totalPrice).toBe(25.00); // Back to default
      expect(uslugiResult.totalPrice).toBe(50.00); // Back to default
    });
  });
});
