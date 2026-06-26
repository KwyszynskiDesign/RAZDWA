import type { CategoryDefinition, CategoryRegistry } from '../core/contracts/CategoryRegistry';

export class DefaultCategoryRegistry implements CategoryRegistry {
  private readonly _map = new Map<string, CategoryDefinition>();

  register(def: CategoryDefinition): void {
    this._map.set(def.id, def);
  }

  getById(id: string): CategoryDefinition | null {
    return this._map.get(id) ?? null;
  }

  listAll(): CategoryDefinition[] {
    return Array.from(this._map.values());
  }

  has(id: string): boolean {
    return this._map.has(id);
  }
}
