export type Unit = "m2" | "szt" | "mb" | "strona" | "format" | "inna";
export type PricingType = "per_unit" | "flat";

export interface Tier {
  min: number;
  max: number | null;
  price: number;
}

export interface Modifier {
  id: string;
  name: string;
  type: "percent" | "fixed" | "fixed_per_unit";
  value: number; // e.g., 0.20 for 20%
}

export interface Rule {
  type: "minimum";
  unit: "m2" | "pln";
  value: number;
}

export interface PriceTable {
  id: string;
  title: string;
  unit: Unit;
  pricing: PricingType;
  tiers: Tier[];
  modifiers?: Modifier[];
  rules?: Rule[];
  notes?: string[];
}

export interface CalculationResult {
  basePrice: number;
  effectiveQuantity: number;
  tierPrice: number;
  modifiersTotal: number;
  totalPrice: number;
  appliedModifiers: string[];
}

export interface CartItem {
  id: string;
  category: string;
  name: string;
  quantity: number;
  unit: Unit;
  unitPrice: number;
  isExpress: boolean;
  totalPrice: number;
  optionsHint: string;
  payload: any;
}

export interface CustomerData {
  name: string;
  phone: string;
  email: string;
  priority: string;
}
