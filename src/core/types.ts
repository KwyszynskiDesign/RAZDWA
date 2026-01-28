export interface Tier { min: number; max: number | null; price: number; }
export interface Modifier { id: string; type: "percent" | "fixed"; value: number; }
export interface Rule { type: "minimum"; unit: "m2" | "pln"; value: number; }
export interface PriceTable { id: string; title: string; unit: "m2" | "szt" | "mb" | "strona" | "format" | "inna"; pricing: "per_unit" | "flat"; tiers: Tier[]; modifiers?: Modifier[]; rules?: Rule[]; notes?: string[]; }
export interface CalculationResult { basePrice: number; totalPrice: number; appliedTiers: Tier; appliedModifiers: { id: string; value: number; type: string }[]; quantity: number; effectiveQuantity: number; unit: string; }
