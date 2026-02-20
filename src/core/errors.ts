/*
 * /src/core/errors.ts
 * Error hierarchy for RAZDWA pricing calculator
 */

export class RAZDWAError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'RAZDWAError'
    Object.setPrototypeOf(this, RAZDWAError.prototype)
  }

  toJSON() {
    return {
      error: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    }
  }
}

export class ValidationError extends RAZDWAError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

export class TierNotFoundError extends RAZDWAError {
  constructor(
    quantity: number,
    unit: string,
    details?: Record<string, unknown>
  ) {
    super(
      `Nie znaleziono tier'u dla ilości ${quantity} ${unit}`,
      'TIER_NOT_FOUND',
      400,
      { quantity, unit, ...details }
    )
    this.name = 'TierNotFoundError'
    Object.setPrototypeOf(this, TierNotFoundError.prototype)
  }
}

export class ModifierNotFoundError extends RAZDWAError {
  constructor(modifierId: string, available?: string[]) {
    super(
      `Nieznany modyfikator: ${modifierId}`,
      'MODIFIER_NOT_FOUND',
      400,
      { modifierId, available }
    )
    this.name = 'ModifierNotFoundError'
    Object.setPrototypeOf(this, ModifierNotFoundError.prototype)
  }
}

export class IncompatibleUnitError extends RAZDWAError {
  constructor(expected: string, received: string) {
    super(
      `Jednostka niezgodna. Oczekiwana: ${expected}, otrzymana: ${received}`,
      'INCOMPATIBLE_UNIT',
      400,
      { expected, received }
    )
    this.name = 'IncompatibleUnitError'
    Object.setPrototypeOf(this, IncompatibleUnitError.prototype)
  }
}

export class MinimumQuantityError extends RAZDWAError {
  constructor(required: number, provided: number, unit: string) {
    super(
      `Ilość musi być co najmniej ${required} ${unit}, podano: ${provided}`,
      'MINIMUM_QUANTITY_NOT_MET',
      400,
      { required, provided, unit }
    )
    this.name = 'MinimumQuantityError'
    Object.setPrototypeOf(this, MinimumQuantityError.prototype)
  }
}

export class CSVParseError extends RAZDWAError {
  constructor(message: string, line?: number, details?: Record<string, unknown>) {
    super(
      `Błąd parsowania CSV: ${message}${line ? ` (linia ${line})` : ''}`,
      'CSV_PARSE_ERROR',
      400,
      { line, ...details }
    )
    this.name = 'CSVParseError'
    Object.setPrototypeOf(this, CSVParseError.prototype)
  }
}

export class DataNormalizationError extends RAZDWAError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      `Błąd normalizacji danych: ${message}`,
      'DATA_NORMALIZATION_ERROR',
      400,
      details
    )
    this.name = 'DataNormalizationError'
    Object.setPrototypeOf(this, DataNormalizationError.prototype)
  }
}

export function isRAZDWAError(error: unknown): error is RAZDWAError {
  return error instanceof RAZDWAError
}