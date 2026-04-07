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

  setExpressForAll(enabled: boolean, expressRate = 0.2) {
    const rate = Number.isFinite(expressRate) && expressRate >= 0 ? expressRate : 0.2;
    const factor = 1 + rate;

    this.items = this.items.map((item) => {
      const shouldBeExpress = !!enabled;
      const isCurrentlyExpress = !!item.isExpress;

      if (shouldBeExpress === isCurrentlyExpress) {
        return item;
      }

      if (shouldBeExpress) {
        return {
          ...item,
          isExpress: true,
          unitPrice: parseFloat((item.unitPrice * factor).toFixed(2)),
          totalPrice: parseFloat((item.totalPrice * factor).toFixed(2)),
        };
      }

      return {
        ...item,
        isExpress: false,
        unitPrice: parseFloat((item.unitPrice / factor).toFixed(2)),
        totalPrice: parseFloat((item.totalPrice / factor).toFixed(2)),
      };
    });

    this.save();
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}
