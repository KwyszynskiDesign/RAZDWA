import type { CategoryRegistry } from "../core/contracts/CategoryRegistry";
import type {
  CategoryInput,
  CategoryOutput,
  ModifierBreakdown,
} from "../core/contracts/CategoryRegistry";
import { calculateDyplomy } from "../categories/dyplomy";
import { calculateBanner } from "../categories/banner";

function stubModifiers(ids: string[]): Record<string, ModifierBreakdown> {
  const out: Record<string, ModifierBreakdown> = {};
  for (const id of ids) {
    out[id] = { id, name: id, basePrice: 0, appliedPrice: 0, percentageChange: 0, description: "" };
  }
  return out;
}

function wrapDyplomy(input: CategoryInput): CategoryOutput {
  const result = calculateDyplomy({
    qty: input.quantity,
    format: input.format as "A4" | "A5" | undefined,
    sides: typeof input.sides === "number" ? input.sides : undefined,
    isSatin: input.modifiers.includes("satin"),
    isModigliani: input.modifiers.includes("modigliani"),
    express: input.modifiers.includes("express"),
  });
  return {
    success: true,
    basePrice: result.basePrice,
    effectiveQuantity: input.quantity,
    modifiers: stubModifiers(result.appliedModifiers),
    totalPrice: result.totalPrice,
    warnings: [],
  };
}

function wrapBanner(input: CategoryInput): CategoryOutput {
  const result = calculateBanner({
    material: String(input.material ?? "standard"),
    areaM2: input.quantity,
    oczkowanie: input.modifiers.includes("oczkowanie"),
    express: input.modifiers.includes("express"),
  });
  return {
    success: true,
    basePrice: result.basePrice,
    effectiveQuantity: result.effectiveQuantity,
    modifiers: stubModifiers(result.appliedModifiers),
    totalPrice: result.totalPrice,
    warnings: [],
  };
}

export function registerBuiltinCategories(registry: CategoryRegistry): void {
  registry.register({
    id: "dyplomy",
    label: "Dyplomy",
    unit: "szt",
    calculate: wrapDyplomy,
  });

  registry.register({
    id: "banner",
    label: "Banner",
    unit: "m2",
    calculate: wrapBanner,
  });
}
