/**
 * /src/core/money.ts
 * Currency formatting for PLN
 */

export const CURRENCY = 'PLN' as const
export const LOCALE = 'pl-PL' as const

export interface Money {
  amount: number
  currency: typeof CURRENCY
}

/**
 * Format price as Polish currency (1234.56 -> "1 234,56 zł")
 */
export function formatPrice(amount: number, currency: string = CURRENCY): string {
  const formatted = new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: currency === 'PLN' ? 'PLN' : 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

  return formatted
}

/**
 * Format price for display (alternative format)
 */
export function formatPriceAlternative(amount: number): string {
  const parts = amount.toFixed(2).split('.')
  const wholePart = parts[0]
    .split('')
    .reverse()
    .reduce((acc, digit, idx) => {
      return (idx > 0 && idx % 3 === 0 ? ' ' : '') + digit + acc
    }, '')
  const decimalPart = parts[1]
  return `${wholePart},${decimalPart} zł`
}

/**
 * Parse price from string (handle both formats)
 */
export function parsePrice(priceStr: string): number | null {
  // Remove currency symbol and normalize
  const cleaned = priceStr
    .replace(/[^-\d,\.\s-]/g, '')
    .trim()

  // Try comma as decimal separator
  let numStr = cleaned.replace(/\s/g, '').replace(',', '.')

  // Try period as decimal separator
  if (cleaned.includes(',') && cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
    numStr = cleaned.replace(/\./g, '').replace(',', '.')
  }

  const parsed = parseFloat(numStr)
  return isFinite(parsed) ? parsed : null
}

/**
 * Create Money object
 */
export function money(amount: number): Money {
  if (!isFinite(amount) || amount < 0) {
    throw new Error(`Invalid money amount: ${amount}`)
  }
  return {
    amount: Math.round(amount * 100) / 100,
    currency: CURRENCY,
  }
}

/**
 * Add money values
 */
export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error('Cannot add money with different currencies')
  }
  return money(a.amount + b.amount)
}

/**
 * Multiply money by scalar
 */
export function multiplyMoney(m: Money, scalar: number): Money {
  return money(m.amount * scalar)
}

/**
 * Percentage calculation
 */
export function percentageOf(amount: number, percent: number): number {
  return Math.round((amount * percent) / 100 * 100) / 100
}

/**
 * Calculate discount
 */
export function applyDiscount(amount: number, discountPercent: number): number {
  const discountAmount = percentageOf(amount, discountPercent)
  return Math.round((amount - discountAmount) * 100) / 100
}

/**
 * Calculate surcharge
 */
export function applySurcharge(amount: number, surchargePercent: number): number {
  const surchargeAmount = percentageOf(amount, surchargePercent)
  return Math.round((amount + surchargeAmount) * 100) / 100
}