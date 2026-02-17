/**
 * PriceStore manages all pricing data in the application.
 * It supports default values and overrides stored in localStorage.
 */
import { Product, PricingRule } from "./types";

export interface PriceEntry {
  id: string;
  category: string;
  name: string;
  defaultValue: number;
  currentValue: number;
}

export class PriceStore {
  private static instance: PriceStore;
  private overrides: Record<string, number> = {};
  private registry: Map<string, PriceEntry> = new Map();

  // New structured database
  private products: Product[] = [];
  private rules: PricingRule[] = [];

  private constructor() {
    this.loadOverrides();
    this.loadStructuredData();
  }

  public static getInstance(): PriceStore {
    if (!PriceStore.instance) {
      PriceStore.instance = new PriceStore();
    }
    return PriceStore.instance;
  }

  private loadOverrides() {
    if (typeof localStorage === 'undefined') return;
    try {
      const stored = localStorage.getItem("price_overrides");
      if (stored) {
        this.overrides = JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to load price overrides", e);
    }
  }

  private saveOverrides() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem("price_overrides", JSON.stringify(this.overrides));
    } catch (e) {
      console.error("Failed to save price overrides", e);
    }
  }

  private loadStructuredData() {
    if (typeof localStorage === 'undefined') return;
    try {
      const p = localStorage.getItem("price_products");
      const r = localStorage.getItem("price_rules");
      if (p) this.products = JSON.parse(p);
      if (r) this.rules = JSON.parse(r);
    } catch (e) {}
  }

  private saveStructuredData() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem("price_products", JSON.stringify(this.products));
      localStorage.setItem("price_rules", JSON.stringify(this.rules));
    } catch (e) {}
  }

  /**
   * Registers a price point with a default value.
   * If an override exists, it will be used.
   */
  public register(id: string, category: string, name: string, defaultValue: number): number {
    const currentValue = this.overrides[id] !== undefined ? this.overrides[id] : defaultValue;
    this.registry.set(id, { id, category, name, defaultValue, currentValue });
    return currentValue;
  }

  /**
   * Gets the current value for a price ID.
   */
  public get(id: string, defaultValue: number): number {
    return this.overrides[id] !== undefined ? this.overrides[id] : defaultValue;
  }

  /**
   * Bulk updates multiple prices.
   */
  public updatePrices(updates: Record<string, number>) {
    for (const [id, value] of Object.entries(updates)) {
      this.overrides[id] = value;
      const entry = this.registry.get(id);
      if (entry) {
        entry.currentValue = value;
      }
    }
    this.saveOverrides();
  }

  /**
   * Returns all registered price entries for the UI.
   */
  public getAllEntries(): PriceEntry[] {
    return Array.from(this.registry.values());
  }

  public getProducts(): Product[] {
    return this.products;
  }

  public getRules(productId?: string): PricingRule[] {
    if (productId) return this.rules.filter(r => r.product_id === productId);
    return this.rules;
  }

  public addProduct(p: Product) {
    if (!this.products.find(x => x.id === p.id)) {
      this.products.push(p);
      this.saveStructuredData();
    }
  }

  public addRule(r: PricingRule) {
    const idx = this.rules.findIndex(x => x.product_id === r.product_id && x.name === r.name && x.threshold === r.threshold);
    if (idx >= 0) {
      this.rules[idx] = r;
    } else {
      this.rules.push(r);
    }
    this.saveStructuredData();
  }

  /**
   * Helper to register a list of tiers.
   */
  public registerTiers(prefix: string, category: string, tiers: any[]): any[] {
    return tiers.map((tier, idx) => {
      const id = `${prefix}-tier-${idx}`;
      const name = tier.from !== undefined
        ? `${tier.from}-${tier.to || '∞'} szt`
        : `${tier.min}-${tier.max || '∞'} szt`;

      const priceKey = tier.unit !== undefined ? 'unit' : 'price';
      const defaultValue = tier[priceKey];
      const currentValue = this.register(id, category, name, defaultValue);

      return { ...tier, [priceKey]: currentValue };
    });
  }
}

export const priceStore = PriceStore.getInstance();
