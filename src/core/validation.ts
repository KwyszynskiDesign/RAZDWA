import { z } from 'zod'
import { Unit } from './types'

// ============================================================================
// DOMAIN SCHEMAS
// ============================================================================

export const UnitSchema = z.enum(['m²', 'szt', 'mb'])

export const PriceTierSchema = z.object({
  min: z.number().nonnegative('Min musi być >= 0'),
  max: z.number().nullable().default(null),
  pricePerUnit: z.number().positive('Cena musi być > 0'),
})

export const PriceTableSchema = z.object({
  id: z.string().min(1, 'ID nie może być puste'),
  name: z.string().min(1, 'Nazwa nie może być pusta'),
  unit: UnitSchema,
  tiers: z.array(PriceTierSchema).min(1, 'Musi być co najmniej jeden tier'),
  minimumQuantity: z.number().nonnegative().optional(),
  minimumPrice: z.number().nonnegative().optional(),
})

export const CategoryInputSchema = z.object({
  quantity: z
    .number()
    .positive('Ilość musi być > 0')
    .finite('Ilość musi być skończona'),
  modifiers: z.array(z.string()).default([]),
  unit: UnitSchema,
})

// ============================================================================
// CSV/JSON IMPORT SCHEMAS
// ============================================================================

export const CSVRowSchema = z.record(z.any())

export const NormalizedDataSchema = z.object({
  categories: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().optional(),
      priceTables: z.array(PriceTableSchema),
    })
  ),
  metadata: z.object({
    version: z.string(),
    lastUpdated: z.string().datetime(),
    currency: z.literal('PLN'),
  }),
})

// ============================================================================
// ERROR VALIDATION
// ============================================================================

export function validatePriceTable(data: unknown): {
  success: boolean
  data?: z.infer<typeof PriceTableSchema>
  errors?: z.ZodError['errors']
} {
  const result = PriceTableSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, errors: result.error.errors }
}

export function validateCategoryInput(data: unknown): {
  success: boolean
  data?: z.infer<typeof CategoryInputSchema>
  errors?: string[]
} {
  const result = CategoryInputSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return {
    success: false,
    errors: result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
  }
}