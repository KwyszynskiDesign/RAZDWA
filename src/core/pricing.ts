import { PriceTable, PriceTier, PricingResult, Unit } from './types'
import {
  TierNotFoundError,
  IncompatibleUnitError,
  MinimumQuantityError,
} from './errors'

/**
 * /src/core/pricing.ts
 * Core pricing calculation engine
 */

// Cache for tier lookups (memoization)
const TIER_CACHE = new Map<string, Map<number, PriceTier>>()

function getCacheKey(tableId: string): string {
  return `tier_cache_${tableId}`
}

export function clearPricingCache(): void {
  TIER_CACHE.clear()
}

export function buildTierCache(table: PriceTable): void {
  const cacheKey = getCacheKey(table.id)
  const tierMap = new Map<number, PriceTier>()

  for (const tier of table.tiers) {
    tierMap.set(tier.min, tier)
  }

  TIER_CACHE.set(cacheKey, tierMap)
}

/**
 * Find applicable tier for given quantity
 * Tiers are matched as: quantity >= min AND (max === null OR quantity <= max)
 */
export function findTier(
  quantity: number,
  tiers: PriceTier[]
): PriceTier | null {
  return (
    tiers.find(
      (tier) => quantity >= tier.min && (tier.max === null || quantity <= tier.max)
    ) || null
  )
}

/**
 * Calculate base price before modifiers
 */
export function calculateBasePrice(
  quantity: number,
  priceTable: PriceTable,
  applyMinimum: boolean = true
): {
  success: boolean
  basePrice: number
  quantity: number
  appliedMinimum: boolean
  errors: string[]
} {
  const result = {
    success: true,
    basePrice: 0,
    quantity,
    appliedMinimum: false,
    errors: [] as string[],
  }

  // Handle minimum quantity for m²
  let effectiveQuantity = quantity
  if (
    applyMinimum &&
    priceTable.unit === 'm²' &&
    priceTable.minimumQuantity &&
    quantity < priceTable.minimumQuantity
  ) {
    effectiveQuantity = priceTable.minimumQuantity
    result.appliedMinimum = true
  }

  // Find tier
  const tier = findTier(effectiveQuantity, priceTable.tiers)
  if (!tier) {
    result.success = false
    result.errors.push(
      `Nie znaleziono tier'u dla ilości ${effectiveQuantity} ${priceTable.unit}`
    )
    return result
  }

  // Calculate price
  result.basePrice = effectiveQuantity * tier.pricePerUnit

  // Apply minimum price if set
  if (
    priceTable.minimumPrice &&
    result.basePrice < priceTable.minimumPrice
  ) {
    result.basePrice = priceTable.minimumPrice
  }

  result.basePrice = Math.round(result.basePrice * 100) / 100

  return result
}

/**
 * Validate unit compatibility
 */
export function validateUnit(
  expectedUnit: Unit,
  providedUnit: Unit
): { valid: boolean; error?: Error } {
  if (expectedUnit !== providedUnit) {
    return {
      valid: false,
      error: new IncompatibleUnitError(expectedUnit, providedUnit),
    }
  }
  return { valid: true }
}

/**
 * Get pricing statistics (min, max, avg prices across tiers)
 */
export function getPricingStats(tiers: PriceTier[]): {
  minPrice: number
  maxPrice: number
  avgPrice: number
  tierCount: number
} {
  if (tiers.length === 0) {
    return {
      minPrice: 0,
      maxPrice: 0,
      avgPrice: 0,
      tierCount: 0,
    }
  }

  const prices = tiers.map((t) => t.pricePerUnit)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length

  return {
    minPrice: Math.round(minPrice * 100) / 100,
    maxPrice: Math.round(maxPrice * 100) / 100,
    avgPrice: Math.round(avgPrice * 100) / 100,
    tierCount: tiers.length,
  }
}

/**
 * Format pricing tiers for display
 */
export function formatTierRange(tier: PriceTier, unit: Unit): string {
  const maxStr = tier.max === null ? '+' : `-${tier.max}`
  return `${tier.min}${maxStr} ${unit}: ${tier.pricePerUnit.toFixed(2)} zł/${unit}`
}

/**
 * Get all tier ranges for a price table
 */
export function formatAllTiers(table: PriceTable): string[] {
  return table.tiers
    .sort((a, b) => a.min - b.min)
    .map((tier) => formatTierRange(tier, table.unit))
}