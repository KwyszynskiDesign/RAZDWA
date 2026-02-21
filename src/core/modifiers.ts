// src/core/modifiers.ts

import { z } from 'zod';

// Modifier definitions
export type Modifier = {
  name: string;
  value: number;
};

export const EXPRESS_MODIFIER: Modifier = {
  name: 'EXPRESS',
  value: 20, // Example value; adjust as needed.
};

// Additional RAZDWA modifiers can be defined here
export const ANOTHER_MODIFIER: Modifier = {
  name: 'ANOTHER_MODIFIER',
  value: 10,
};

// Zod validation schemas
const ModifierSchema = z.object({
  name: z.string(),
  value: z.number().nonnegative(),
});

// Apply Modifiers function
export type PricingResult = {
  total: number;
  breakdown: string[];
};

export function applyModifiers(basePrice: number, modifiers: Modifier[]): PricingResult {
  let total = basePrice;
  const breakdown: string[] = [];

  for (const modifier of modifiers) {
    const result = ModifierSchema.safeParse(modifier);
    if (!result.success) {
      throw new Error(`Invalid modifier: ${result.error.issues.map(issue => issue.message).join(', ')}`);
    }

    total += modifier.value;
    breakdown.push(`${modifier.name}: +${modifier.value}`);
  }

  return {
    total,
    breakdown,
  };
}
