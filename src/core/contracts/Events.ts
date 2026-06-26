/**
 * src/core/contracts/Events.ts
 *
 * Typed discriminated union for all domain events.
 * Replaces stringly-typed ViewContext.emit("price-changed", {...}).
 *
 * Stage 1: type definitions only.
 * Implementation (TypedEventDispatcher) is Stage 4.
 */

export interface PriceChangedEvent {
  type: 'price-changed';
  path: string;
  oldValue?: number;
  newValue?: number;
  source: 'ui' | 'import' | 'api';
  timestamp: string;
}

export interface CategoryUpdatedEvent {
  type: 'category-updated';
  categoryId: string;
}

export interface ValidationFailedEvent {
  type: 'validation-failed';
  categoryId: string;
  input: unknown;
  errors: string[];
}

export interface VariantChangedEvent {
  type: 'variant-changed';
  categoryId: string;
  variantKey: string;
}

export type DomainEvent =
  | PriceChangedEvent
  | CategoryUpdatedEvent
  | ValidationFailedEvent
  | VariantChangedEvent;

/**
 * Type-safe event emitter contract.
 * Narrowing `type` gives the correct payload shape at compile time.
 */
export interface TypedEventEmitter {
  emit<T extends DomainEvent>(event: T): void;
  on<T extends DomainEvent>(
    type: T['type'],
    callback: (e: Extract<DomainEvent, { type: T['type'] }>) => void,
  ): () => void;
}
