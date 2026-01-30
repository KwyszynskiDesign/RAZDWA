export interface Tier { min: number; max: number | null; price: number; }
export interface Modifier { id: string; type: "percent" | "fixed"; value: number; }
export interface Rule { type: "minimum"; unit: "m2" | "pln"; value: number; }
export interface PriceTable { id: string; title: string; unit: "m2" | "szt" | "mb" | "strona" | "format" | "inna"; pricing: "per_unit" | "flat"; tiers: Tier[]; modifiers?: Modifier[]; rules?: Rule[]; notes?: string[]; }
export interface CalculationResult {
  basePrice: number;
  totalPrice: number;
  effectiveQuantity: number;
  tierPrice: number;
  modifiersTotal: number;
  appliedModifiers: string[];
}

export interface CartItem {
  id: string;
  category: string;
  name: string;
  quantity: number;
  unit: string;
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
