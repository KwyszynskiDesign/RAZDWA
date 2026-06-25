/**
 * src/core/contracts/PriceSchema.ts
 *
 * Versioned schema contract for price databases.
 * Each clone declares its schema version; the bootstrap validates compatibility.
 *
 * Stage 1: type definitions only.
 * Migration helpers (migrateV1toV2) are added per version bump, not speculatively.
 */

export type SchemaVersion = 1;

export interface TierSchema {
  min: number;
  max: number | null;
  price: number;
}

export interface MaterialSchema {
  id: string;
  label: string;
  tiers: TierSchema[];
}

export interface CategorySchema {
  id: string;
  unit: string;
  modifiers?: string[];
  materials?: MaterialSchema[];
  tiers?: TierSchema[];
}

export interface ModifierSchema {
  id: string;
  label: string;
  type: 'percent' | 'flat';
  value: number;
  appliesTo: 'all' | string;
}

/**
 * Top-level schema envelope stored in data/schema.json (one per clone).
 * `categories` and `modifiers` are keyed by their ID.
 */
export interface PriceSchemaContract {
  version: SchemaVersion;
  exportedAt: string;
  categories: Record<string, CategorySchema>;
  modifiers: Record<string, ModifierSchema>;
}

export function assertSchemaCompatible(
  stored: { version: unknown },
  supported: SchemaVersion,
): void {
  if (stored.version !== supported) {
    throw new Error(
      `Price schema version mismatch: stored=${stored.version}, supported=${supported}`,
    );
  }
}
