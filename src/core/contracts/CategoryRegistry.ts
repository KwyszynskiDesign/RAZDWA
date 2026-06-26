/**
 * src/core/contracts/CategoryRegistry.ts
 *
 * Single source of truth for all category definitions.
 * UI discovers categories through this registry; it never hard-codes imports.
 *
 * Stage 1: interfaces only.
 * Implementation (DefaultCategoryRegistry) lives in src/domain/CategoryRegistry.ts (Stage 3).
 */

import type { Unit, ModifierBreakdown, CategoryInput } from '../types';

export type { ModifierBreakdown, CategoryInput };

export interface CategoryOutput {
  success: boolean;
  basePrice: number;
  effectiveQuantity: number;
  modifiers: Record<string, ModifierBreakdown>;
  totalPrice: number;
  warnings: string[];
}

/**
 * Every category module must satisfy this contract.
 * The `calculate` function must be pure — no DOM, no localStorage.
 */
export interface CategoryDefinition {
  id: string;
  label: string;
  unit: Unit;
  calculate(input: CategoryInput): CategoryOutput;
}

export interface CategoryRegistry {
  register(def: CategoryDefinition): void;
  getById(id: string): CategoryDefinition | null;
  listAll(): CategoryDefinition[];
  has(id: string): boolean;
}
