/**
 * Etap 0 — definicje typów dla data-driven cennika.
 * Tylko typy — zero importów z plików produkcyjnych, zero kodu runtime.
 */

export type PriceUnit = "szt" | "m2" | "cm" | "mb" | "arkusz" | "strona" | "zestaw" | string;

export type ModifierType = "percent" | "flat";

export type SyncStatus = "pending" | "success" | "error";

export type RecordType = "PriceRecord" | "Modifier";

/**
 * Pojedyncza pozycja cennikowa.
 * Zastępuje flat-key w stylu "druk-bw-a4-1-5" → 0.90.
 * Nowa pozycja = nowy rekord, bez zmian w kodzie.
 */
export interface PriceRecord {
  id: string;
  category: string;
  subcategory: string;
  label: string;
  qtyFrom: number;
  qtyTo: number | null;
  unit: PriceUnit;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  syncedAt: string | null;
  _dirty: boolean;
  _deleted: boolean;
}

/**
 * Modyfikator procentowy lub kwotowy (np. express +20%, solwent satyna +12%).
 * Osobna kolekcja — nie miesza się z PriceRecord.
 */
export interface Modifier {
  id: string;
  key: string;
  label: string;
  modifierType: ModifierType;
  value: number;
  appliesTo: "all" | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  syncedAt: string | null;
  _dirty: boolean;
  _deleted: boolean;
}

/**
 * Format pliku importu JSON — tablica rekordów gotowa do załadowania do IDB.
 */
export interface PriceDatabaseSnapshot {
  version: 1;
  exportedAt: string;
  records: PriceRecord[];
  modifiers: Modifier[];
}
