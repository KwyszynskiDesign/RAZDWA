/**
 * /src/core/numericInput.ts
 * Shared parsing/validation for numeric form inputs.
 * No DOM, no localStorage, no side effects.
 */

export interface NumericInputOptions {
  min?: number
  max?: number
  allowZero?: boolean
  integer?: boolean
}

/**
 * Parse a numeric input string into a bounded number.
 * Normalizes a comma decimal separator, rejects non-finite values,
 * and by default rejects anything <= 0. Returns `null` when invalid.
 */
export function parseNumericInput(
  value: string | null | undefined,
  options: NumericInputOptions = {}
): number | null {
  const { min, max, allowZero = false, integer = false } = options

  const normalized = (value ?? '').toString().trim().replace(',', '.')
  if (normalized === '') return null

  const parsed = integer ? parseInt(normalized, 10) : parseFloat(normalized)
  if (!Number.isFinite(parsed)) return null

  const lowerBound = min ?? (allowZero ? 0 : undefined)
  if (lowerBound !== undefined && parsed < lowerBound) return null
  if (lowerBound === undefined && !allowZero && parsed <= 0) return null

  if (max !== undefined && parsed > max) return null

  return parsed
}
