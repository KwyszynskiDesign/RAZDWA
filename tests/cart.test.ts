import { describe, it, expect, beforeEach, vi } from "vitest";
import { Cart } from "../src/core/cart";
import { CartItem } from "../src/core/types";

describe("Cart", () => {
  beforeEach(() => {
    // Mock localStorage
    const store: Record<string, string> = {};
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); }
    });
  });

  const mockItem: CartItem = {
    id: "1",
    category: "Test",
    name: "Item 1",
    quantity: 2,
    unit: "szt",
    unitPrice: 10,
    isExpress: false,
    totalPrice: 20,
    optionsHint: "None",
    payload: {}
  };

  it("should add an item", () => {
    const cart = new Cart();
    cart.addItem(mockItem);
    expect(cart.getItems().length).toBe(1);
    expect(cart.getGrandTotal()).toBe(20);
  });

  it("should remove an item", () => {
    const cart = new Cart();
    cart.addItem(mockItem);
    cart.removeItem(0);
    expect(cart.getItems().length).toBe(0);
  });

  it("should persist to localStorage", () => {
    const cart1 = new Cart();
    cart1.addItem(mockItem);

    const cart2 = new Cart();
    expect(cart2.getItems().length).toBe(1);
    expect(cart2.getGrandTotal()).toBe(20);
  });

  it("should clear items", () => {
    const cart = new Cart();
    cart.addItem(mockItem);
    cart.clear();
    expect(cart.isEmpty()).toBe(true);
  });
});
