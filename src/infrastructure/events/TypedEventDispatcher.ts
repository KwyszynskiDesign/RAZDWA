import type { DomainEvent, TypedEventEmitter } from "../../core/contracts/Events";

export class TypedEventDispatcher implements TypedEventEmitter {
  private readonly _listeners = new Map<string, Set<(e: DomainEvent) => void>>();

  emit<T extends DomainEvent>(event: T): void {
    const handlers = this._listeners.get(event.type);
    if (!handlers) return;
    for (const h of handlers) {
      try {
        h(event);
      } catch {
        /* isolated */
      }
    }
  }

  on<T extends DomainEvent>(
    type: T["type"],
    callback: (e: Extract<DomainEvent, { type: T["type"] }>) => void
  ): () => void {
    if (!this._listeners.has(type)) this._listeners.set(type, new Set());
    const fn = callback as (e: DomainEvent) => void;
    this._listeners.get(type)!.add(fn);
    return () => {
      this._listeners.get(type)?.delete(fn);
    };
  }
}
