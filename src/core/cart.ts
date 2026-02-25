import { CartItem } from "./types";

export class Cart {
  private items: CartItem[] = [];
  private storageKey = "razdwa-cart-v1";

  constructor() {
    this.load();
  }

  private load() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.items = JSON.parse(saved);
      }
    } catch {
      this.items = [];
    }
  }

  private save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch {
      // storage write failed — cart state is still in memory
    }
  }

  addItem(item: CartItem) {
    this.items.push(item);
    this.save();
  }

  removeItem(index: number) {
    if (index >= 0 && index < this.items.length) {
      this.items.splice(index, 1);
      this.save();
    }
  }

  clear() {
    this.items = [];
    this.save();
  }

  getItems(): CartItem[] {
    return [...this.items];
  }

  getGrandTotal(): number {
    return this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}
