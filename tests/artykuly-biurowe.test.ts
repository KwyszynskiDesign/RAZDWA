import { describe, it, expect, beforeEach } from "vitest";
import { quoteArtykulyBiurowe } from "../src/categories/artykuly-biurowe";

describe("Artykuły Biurowe Category", () => {
  it("should calculate single item", () => {
    const result = quoteArtykulyBiurowe({
      selectedItems: [
        {
          categoryName: "TECZKI",
          itemId: "teczka-biala-gumka",
          itemName: "Teczka biała z gumką",
          quantity: 1,
          price: 4.00
        }
      ]
    });
    expect(result.itemsCount).toBe(1);
    expect(result.totalQuantity).toBe(1);
    expect(result.totalPrice).toBe(4.00);
  });

  it("should calculate multiple items with different quantities", () => {
    const result = quoteArtykulyBiurowe({
      selectedItems: [
        {
          categoryName: "TECZKI",
          itemId: "teczka-biala-gumka",
          itemName: "Teczka biała z gumką",
          quantity: 2,
          price: 4.00
        },
        {
          categoryName: "SKOROSZYT",
          itemId: "skoroszyt-durable",
          itemName: "Skoroszyt DURABLE",
          quantity: 1,
          price: 10.00
        }
      ]
    });
    expect(result.itemsCount).toBe(2);
    expect(result.totalQuantity).toBe(3);
    expect(result.totalPrice).toBe(18.00); // 2*4 + 1*10
  });

  it("should calculate multiple items with quantities", () => {
    const result = quoteArtykulyBiurowe({
      selectedItems: [
        {
          categoryName: "TECZKI",
          itemId: "teczka-niebieska-twarda",
          itemName: "Teczka niebieska twarda",
          quantity: 5,
          price: 15.00
        },
        {
          categoryName: "NOŚNIKI",
          itemId: "pendrive-32gb",
          itemName: "PENDRIVE 32GB",
          quantity: 3,
          price: 28.00
        },
        {
          categoryName: "KOPERTY",
          itemId: "koperta-zwykla",
          itemName: "KOPERTY zwykłe",
          quantity: 10,
          price: 0.65
        }
      ]
    });
    expect(result.itemsCount).toBe(3);
    expect(result.totalQuantity).toBe(18); // 5 + 3 + 10
    expect(result.totalPrice).toBe(165.50); // 5*15 + 3*28 + 10*0.65 = 75 + 84 + 6.5
  });

  it("should handle high-value items", () => {
    const result = quoteArtykulyBiurowe({
      selectedItems: [
        {
          categoryName: "NOŚNIKI",
          itemId: "pendrive-32gb",
          itemName: "PENDRIVE 32GB",
          quantity: 10,
          price: 28.00
        }
      ]
    });
    expect(result.itemsCount).toBe(1);
    expect(result.totalQuantity).toBe(10);
    expect(result.totalPrice).toBe(280.00);
  });

  it("should round prices correctly", () => {
    const result = quoteArtykulyBiurowe({
      selectedItems: [
        {
          categoryName: "SEGREGATORY",
          itemId: "segregator-7cm",
          itemName: "SEGREGATOR 7 cm",
          quantity: 3,
          price: 13.00
        },
        {
          categoryName: "ARTYKUŁY PISZCZE",
          itemId: "dugopis",
          itemName: "Długopis",
          quantity: 7,
          price: 6.00
        }
      ]
    });
    expect(result.itemsCount).toBe(2);
    expect(result.totalQuantity).toBe(10);
    expect(result.totalPrice).toBe(81.00); // 3*13 + 7*6
  });
});
