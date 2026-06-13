import { CartItem } from "./types";
import { EXPRESS_RATE, getExpressRate } from "./modifiers";

export class Cart {
  private items: CartItem[] = [];
  private storageKey = "razdwa-cart-v1";
  private savedAt: number = 0;

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        // backward compat: old format without timestamp
        if (this.savedAt === 0) {
          this.items = parsed as CartItem[];
        }
      } else if (parsed && typeof parsed === "object") {
        const data = parsed as { items?: unknown; savedAt?: unknown };
        const storedAt = typeof data.savedAt === "number" ? data.savedAt : 0;
        if (storedAt >= this.savedAt && Array.isArray(data.items)) {
          this.items = data.items as CartItem[];
          this.savedAt = storedAt;
        }
      }
    } catch {
      this.items = [];
    }
  }

  private save() {
    try {
      this.savedAt = Date.now();
      localStorage.setItem(this.storageKey, JSON.stringify({ items: this.items, savedAt: this.savedAt }));
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
    const cents = this.items.reduce((sum, item) => sum + Math.round(item.totalPrice * 100), 0);
    return cents / 100;
  }

  setExpressForAll(enabled: boolean) {
    this.items = this.items.map((item) => {
      const shouldBeExpress = !!enabled;
      const isCurrentlyExpress = !!item.isExpress;

      if (shouldBeExpress === isCurrentlyExpress) {
        return item;
      }

      if (shouldBeExpress) {
        const applyRate = getExpressRate();
        const factor = 1 + applyRate;
        return {
          ...item,
          isExpress: true,
          expressRate: applyRate,
          unitPrice: parseFloat((item.unitPrice * factor).toFixed(2)),
          totalPrice: parseFloat((item.totalPrice * factor).toFixed(2)),
        };
      }

      const revertRate = Number.isFinite(item.expressRate) && (item.expressRate as number) >= 0
        ? (item.expressRate as number)
        : EXPRESS_RATE;
      const factor = 1 + revertRate;
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
