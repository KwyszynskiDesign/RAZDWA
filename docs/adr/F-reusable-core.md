# F: Reużywalny Core, Kontrakty i Adaptery — Analiza Architektoniczna

**Status**: Analiza bez implementacji  
**Data**: 2026-06-25  
**Zakres**: Identyfikacja granic odpowiedzialności, kontraktów danych i punktów integracji

---

## 1. OBECNA STRUKTURA MODUŁÓW

### 1.1 Mapa Warstw

```
┌─────────────────────────────────────────────────────────────────┐
│ UI LAYER (docs/*, src/ui/)                                     │
│ - Views + Router (TypeScript + HTML rendering)                 │
│ - ViewContext (cart, events, communication)                    │
│ - CategoryModule interface (mount/unmount pattern)             │
└────────────────────┬────────────────────────────────────────────┘
                     │ Komunikacja: CategoryOptions → CalculationResult
                     │ Punkt sprzęgnienia: CategoryModule.mount()
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ CATEGORY LOGIC LAYER (src/categories/)                         │
│ - ~22 moduły kalkulacyjne (banner, wlepki, dyplomy, itp)       │
│ - Interfejsy: *Options → *Result                               │
│ - Importują dane przez: getPrice("category")                   │
│ - Używają core do obliczeń: calculatePrice(), formatPLN()      │
└────────────────────┬────────────────────────────────────────────┘
                     │ Komunikacja: path (dot notation) → wartość
                     │ Dane: getPrice, setPrice, getPriceLabels
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ PRICE SERVICE (src/services/priceService.ts)                   │
│ - Singleton, centralizowany dostęp do cen                      │
│ - Łączy localStorage overrides z JSON config                   │
│ - Event dispatching (PRICES_UPDATED_EVENT)                     │
│ - compat.ts: legacy helpers dla Modifier/Tier resolution       │
└────────────────────┬────────────────────────────────────────────┘
                     │ Komunikacja: wczytanie z localStorage + merge
                     │ Dane: JSON config (src/config/prices.json)
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ CORE LOGIC (src/core/)                                         │
│ - pricing.ts: findTier, calculatePrice, applyModifiers         │
│ - money.ts: formatPLN                                          │
│ - types.ts: PriceTable, CalculationResult, UtilityTypes        │
│ - compat.ts: legacy interpolation, tier picking (deprecated)   │
│ - productCat.ts: BASE_PRICE_CATEGORIES, metadata               │
│ - Logika PURE (brak efektów ubocznych, testowalna)             │
└────────────────────┬────────────────────────────────────────────┘
                     │ Komunikacja: typed structs (PriceTable)
                     │ Dane: in-memory (cache)
                     ↓
┌─────────────────────────────────────────────────────────────────┐
│ CONFIG + DATA (src/config/prices.json, data/normalized/*.json) │
│ - Static price data (build-time + localStorage overrides)      │
│ - Metadata (categories, units, modifiers)                      │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Interfejsy Kluczowe

#### Kontrakt UI → Kategoria
```typescript
// src/ui/types.ts
interface ViewContext {
  cart: { addItem: (item: CartItem) => void };
  addToBasket?: (item: { category: string; price: number; description: string }) => void;
  expressMode: boolean;
  updateLastCalculated?: (price: number, hint?: string) => void;
  on?: (event: string, callback: (data?: any) => void) => void;
  emit?: (event: string, data?: any) => void;
  showToast?: (msg: string, type?: string) => void;
}

// src/ui/router.ts
interface CategoryModule {
  id: string;
  name: string;
  mount: (container: HTMLElement, ctx: CategoryContext) => void | Promise<void>;
  initLogic?: (container: HTMLElement, ctx: CategoryContext) => void;
  unmount?: () => void;
}

interface CategoryContext extends ViewContext {
  cart: { addItem: (item: any) => void };
}
```

#### Kontrakt Kategoria → Core
```typescript
// src/core/types.ts
interface PriceTable {
  id: string;
  title?: string;
  unit: Unit;
  pricing?: 'per_unit' | 'flat';
  tiers: PriceTier[];
  modifiers?: PriceModifier[];
  rules?: PriceRule[];
  minimumQuantity?: number;
  minimumPrice?: number;
  notes?: string[];
}

interface CalculationResult {
  basePrice: number;
  effectiveQuantity: number;
  tierPrice: number;
  modifiersTotal: number;
  totalPrice: number;
  appliedModifiers: string[];
  [key: string]: unknown;
}

// Przykład: banner.ts
export interface BannerOptions {
  material: string;
  areaM2: number;
  oczkowanie: boolean;
  express?: boolean;
}

export function calculateBanner(options: BannerOptions): CalculationResult { ... }
```

---

## 2. GRANICE ODPOWIEDZIALNOŚCI (Obecne)

| Warstwa | Odpowiedzialność | Dependencje | Problem |
|---------|------------------|-------------|---------|
| **UI** | Rendering, interakcja użytkownika | ViewContext, Router | Tight coupling do CategoryModule (mount) |
| **Category** | Orchestracja, walidacja, transform danych | getPrice, calculatePrice, formatPLN | Zmieszane: logika biznesowa + konwersja danych |
| **PriceService** | Centralizacja dostępu, localStorage cache | config/prices.json | Hard-coded ścieżka do JSON, brak adaptera |
| **Core** | Pure calculations | Tylko typy TypeScript | ✓ Czysty, no side effects |
| **Config** | Source of truth dla cen | CSV → JSON (manual conversion) | Brak automacji, CSV nie zsynchronizowany |

---

## 3. PROBLEMY Z REUŻYWALNOŚCIĄ (Dzisiaj)

### 3.1 Tight Coupling: Dane i Logika

**Problem**: Każdy moduł kategorii hardcodeuje ścieżkę do `getPrice()`:

```typescript
// src/categories/banner.ts
const tableData = getPrice("banner") as any;      // Magiczny string
const materialData = tableData.materials.find(...); // Brak typowania
```

**Implikacja**: 
- Zmiana struktu JSON → kaskadowe zmiany w kategoriach
- Brak walidacji schematu w compile-time
- Trudne klonowanie (każdy klon musi pamiętać dokładnie te ścieżki)

---

### 3.2 Brak Warstwowego Adaptera

**Koncepcja**: Integracje zewnętrzne powinny mieć punkt wejścia:

```
Dzisiaj:
  src/config/prices.json → hardcoded w priceService
  src/services/priceService.ts → getPrice() global
  localStorage override → wbudowany w priceService
  
Problem:
  - CSV nie ma adaptera (ręczna konwersja)
  - Google Apps Script integration → hardcoded URL w orderExportService
  - Nie ma pluginu do: API, Shopify, webhooks, itp.
```

**Efekt dla Klonowania**:
- Każdy klon musi znowu:
  1. Załadować CSV
  2. Ręcznie przekonwertować do JSON
  3. Zmienić hardcoded ścieżki w priceService
  4. Ustawić nowy GAS endpoint

---

### 3.3 ViewContext: Niejasne Kontrakty

**Problem**: ViewContext zawiera callback'i bez schematu:

```typescript
interface ViewContext {
  on?: (event: string, callback: (data?: any) => void) => void;
  emit?: (event: string, data?: any) => void;  // any ← brak schematu!
  showToast?: (msg: string, type?: string) => void;
}
```

**Implikacja**:
- UI i kategorie wymijają się "po zmroku" (stringly-typed events)
- Niemożliwość type-checkingu podczas migracji
- Klony będą mieć inny event system (GraphQL, REST, Websockets?) — brak kontraktu

---

### 3.4 PriceService: Monolityczny, Brak Strategi

```typescript
// src/services/priceService.ts (359 linii)
- Wczytywanie JSON
- Merge localStorage
- Event dispatching
- Path resolver (dot notation)
- Labels i subgroups cache
- Variant definitions
- Wszystko w jednym pliku!
```

**Problem**: 
- Brak interfejsu dla alternatywnych źródeł danych
- Testowanie: mockowanie całego serwisu jest inwazyjne
- Rozszerzalność: dodanie nowego źródła = modyfikacja monolitu

---

### 3.5 Metadata Rozproszone

**Problem**: Informacja o kategoriach jest w trzech miejscach:

```typescript
// 1. src/core/productCat.ts
BASE_PRICE_CATEGORIES = [{id: "druk-a4-a3", label: "Druk A4/A3", ...}]

// 2. data/normalized/*.json
{id: "druk-a4-a3", unit: "m2", ...}

// 3. src/categories/*.ts
export interface DrukA4A3Options { format: "A4" | "A3"; ... }
```

**Efekt**: 
- Brak single source of truth
- Desynchronizacja metadata ← trudno klonować
- Validacja schematu musi być w trzech miejscach

---

### 3.6 compat.ts: "Wszystko Stare"

```typescript
// src/core/compat.ts (422 linie)
- getInterpolatedPrice() — legacy tier picking
- extractQuantityFromText() — heurystyka
- resolveStoredPrice() — fallback do IDB
- getDefaultPricesMap() — migracja cen
```

**Problem**:
- Kod utrzymanie dla wstecznej kompatybilności
- Zasłania nowe abstrakcje (Category abstraction)
- Klony będą musiały zrozumieć, czy to jeszcze potrzebne

---

## 4. ZIDENTYFIKOWANE PUNKTY INTEGRACJI

### 4.1 Źródła Danych (Dzisiaj)

| Źródło | Format | Integracja | Problem |
|--------|--------|-----------|---------|
| **CSV** | `cennik raz dwa druk - Arkusz1.csv` | Ręczna konwersja JSON | Brak automacji, podatne na błędy |
| **localStorage** | Object<string, number> | `priceService.setPrice()` | User overrides tylko w UI |
| **IDB** | `razdwa_prices` cache | `resolveStoredPrice()` (legacy) | Migracja niekompletna (TODO-A, TODO-B) |
| **Google Apps Script** | HTTPS endpoint | `orderExportService.ts` | URL zapieczona w bundle (no dynamic config) |

### 4.2 Event System

Dzisiaj: ViewContext.emit() / on() — brak schematu

```typescript
// Przykład z ustawień
emit("price-changed", { path: "banner.materials.0.price", value: 60 })
emit("category-updated", { id: "banner", ... })

// Brak type safety ← problem dla klonów
```

### 4.3 Validacja Schematu

Dzisiaj: **brak**. Każda kategoria sama waliduje:

```typescript
// banner.ts
const materialData = tableData.materials.find(...);
if (!materialData) throw new Error(`Unknown material: ${options.material}`);
```

**Brak**: 
- JSON Schema dla cen
- Runtime validation dla options
- Dokumentacji API

---

## 5. DECYZJE ARCHITEKTONICZNE (Które Trzeba Zapisać)

### D1: Granica Core vs Config

**Obecna Reguła**: 
- Core = logika Pure (pricing.ts, money.ts)
- Config = dane + metadata (prices.json)
- Compat = legacy glue (ZAGROŻONE)

**Do Zapisu**:
```
CORE BOUNDARY (nigdy się nie zmienia między klonami):
  ✓ PriceTable struct
  ✓ Tier lookup logic
  ✓ Modifier application (percent, fixed)
  ✓ formatPLN()
  ✗ getPrice() — to nie jest core, to adapter!
  
CONFIG BOUNDARY (zmienia się per klon):
  ✓ prices.json (dane)
  ✓ categories metadata
  ✓ modifier definitions
```

---

### D2: Adapter Pattern dla Źródeł Danych

**Docelowa Architektura**:

```typescript
// src/core/contracts/PriceDataSource.ts
export interface PriceDataSource {
  // Synchroniczne odczytanie
  getPrice(path: string): any;
  
  // Ustawienie (jeśli writable)
  setPrice?(path: string, value: any): void;
  
  // Subskrypcja zmian (jeśli observable)
  onChanged?(path: string, callback: (value: any) => void): () => void;
}

// src/adapters/JsonPriceSource.ts
export class JsonPriceSource implements PriceDataSource {
  constructor(private data: any) {}
  getPrice(path: string) { ... }
}

// src/adapters/LocalStorageOverrideSource.ts
export class LocalStorageOverrideSource implements PriceDataSource {
  getPrice(path: string) { ... } // fallback do base + localStorage
  setPrice(path: string, value) { ... } // localStorage.setItem()
  onChanged(path, callback) { ... } // custom event
}

// src/adapters/ApiSource.ts (dla klonów)
export class ApiPriceSource implements PriceDataSource {
  getPrice(path: string) { return fetch(`/api/prices/${path}`) }
}
```

---

### D3: Kontrakt Danych: CategoryFactory

**Dzisiaj**: Kategorie są rozrzucone, UI zna o nich z hardcoded importów

**Docelowo**:

```typescript
// src/core/contracts/CategoryRegistry.ts
export interface CategoryDefinition {
  id: string;
  label: string;
  unit: Unit;
  icon?: string;
  // Schema dla options
  optionsSchema: { [key: string]: FieldDefinition };
  // Factory do tworzenia
  create(options: unknown): CalculationResult;
}

export interface CategoryRegistry {
  register(def: CategoryDefinition): void;
  getById(id: string): CategoryDefinition | null;
  listAll(): CategoryDefinition[];
}

// Potem UI może robić:
for (const def of registry.listAll()) {
  const result = def.create({ qty: 100, material: "banner-200g" });
}
```

---

### D4: Event Contract (Typed Events)

**Dzisiaj**: ViewContext.emit("price-changed", {...}) — stringly-typed

**Docelowo**:

```typescript
// src/core/contracts/Events.ts
export interface PriceChangedEvent {
  type: 'price-changed';
  path: string;
  oldValue: number;
  newValue: number;
  timestamp: Date;
}

export interface CategoryUpdatedEvent {
  type: 'category-updated';
  categoryId: string;
  changes: { [key: string]: any };
}

export type DomainEvent = PriceChangedEvent | CategoryUpdatedEvent | ...;

export interface EventEmitter {
  emit<T extends DomainEvent>(event: T): void;
  on<T extends DomainEvent>(type: T['type'], callback: (e: T) => void): () => void;
}
```

---

### D5: Wersjonowanie Kontraktów

**Dla Klonów**: Każdy klon może mieć inną wersję schematu cen

```typescript
// src/core/contracts/PriceSchema.ts
export interface PriceSchemaVersion {
  version: 1 | 2 | 3; // Semantic versioning
  categories: { [id: string]: CategorySchema };
  modifiers: { [id: string]: ModifierSchema };
}

// Migracje między wersjami
export function migratePricesV1toV2(data: any): any { ... }
```

---

## 6. PROPONOWANA DOCELOWA ARCHITEKTURA (F-Target)

### 6.1 Trójwarstwowy Model

```
┌────────────────────────────────────────────────────────┐
│ PRESENTATION LAYER (UI, Views)                         │
│ - React/Vue components, HTML rendering                │
│ - Type-safe event emission (PriceChangedEvent, etc)   │
│ - ViewContext contracts (typed)                        │
└────────────────────┬─────────────────────────────────┘
                     │
    ┌────────────────▼──────────────────┐
    │ DOMAIN LAYER (Business Logic)     │
    │ ┌──────────────────────────────┐  │
    │ │ Core Module                  │  │
    │ │ - Pure calculations (pricing)│  │
    │ │ - Type definitions           │  │
    │ │ - NO SIDE EFFECTS            │  │
    │ └──────────────────────────────┘  │
    │ ┌──────────────────────────────┐  │
    │ │ Category Module (logic)       │  │
    │ │ - Orchestration              │  │
    │ │ - Use cases (calculateBanner) │  │
    │ │ - Adapts Core to UI context  │  │
    │ └──────────────────────────────┘  │
    │ ┌──────────────────────────────┐  │
    │ │ Contracts & Interfaces       │  │
    │ │ - PriceDataSource            │  │
    │ │ - CategoryRegistry           │  │
    │ │ - Events (typed)             │  │
    │ └──────────────────────────────┘  │
    └────────────────┬──────────────────┘
                     │
    ┌────────────────▼──────────────────┐
    │ INFRASTRUCTURE LAYER (Adapters)  │
    │ ┌──────────────────────────────┐  │
    │ │ PriceDataSource Impls        │  │
    │ │ - JsonPriceSource            │  │
    │ │ - ApiPriceSource             │  │
    │ │ - CsvPriceSource (!)         │  │
    │ │ - LocalStorageOverrideSource │  │
    │ └──────────────────────────────┘  │
    │ ┌──────────────────────────────┐  │
    │ │ Integration Points           │  │
    │ │ - Google Apps Script adapter │  │
    │ │ - Event dispatcher           │  │
    │ │ - Logger                     │  │
    │ └──────────────────────────────┘  │
    └────────────────────────────────────┘
```

### 6.2 Struktura Katalogów (Docelowa)

```
src/
├── core/
│   ├── contracts/
│   │   ├── PriceDataSource.ts      (interface)
│   │   ├── CategoryRegistry.ts     (interface)
│   │   ├── Events.ts              (typed events)
│   │   └── PriceSchema.ts          (versioning)
│   ├── pricing.ts                  (pure logic)
│   ├── money.ts
│   ├── types.ts
│   └── errors.ts
├── domain/
│   ├── categories/
│   │   ├── index.ts               (registry factory)
│   │   ├── banner.ts
│   │   ├── wlepki.ts
│   │   └── ... (każda jako implement CategoryDefinition)
│   ├── modifiers.ts               (Modifier domain model)
│   └── usecase/                   (high-level operations)
│       ├── calculatePrice.ts
│       ├── updateCategoryPrice.ts
│       └── ...
├── infrastructure/
│   ├── adapters/
│   │   ├── JsonPriceSource.ts
│   │   ├── LocalStorageOverrideSource.ts
│   │   ├── ApiPriceSource.ts       (dla klonów)
│   │   ├── CsvPriceSource.ts       (dla CSV import)
│   │   └── CompositeSource.ts      (chain of responsibility)
│   ├── services/
│   │   ├── PriceServiceV2.ts       (DI container)
│   │   └── EventDispatcher.ts
│   └── persistence/
│       ├── LocalStorageRepository.ts
│       └── IdbRepository.ts
├── ui/
│   ├── contracts/
│   │   └── ViewContext.ts          (typed version)
│   ├── router.ts                   (TS, no legacy scripts)
│   ├── types.ts
│   └── views/
│       ├── banner.ts
│       └── ...
├── config/
│   ├── prices.json                 (build-time)
│   └── schema.json                 (JSON Schema validation)
└── types/
    └── index.ts
```

---

## 7. KONTRAKT DANYCH (Docelowy)

### 7.1 Input/Output Kategории

```typescript
// src/core/contracts/CategoryContract.ts

// Uniwersalny input contract
export interface CategoryInput {
  quantity: number;          // zawsze jest
  unit?: Unit;               // opcjonalnie nadpisuje default
  modifiers: string[];       // ["express", "satyna"]
  [key: string]: unknown;    // category-specific fields (material, format, etc)
}

// Uniwersalny output contract
export interface CategoryOutput {
  success: boolean;
  basePrice: number;         // bez modyfikatorów
  effectiveQuantity: number; // po minimum rules
  modifiers: {               // breakdown
    [id: string]: {
      name: string;
      type: 'percent' | 'fixed' | 'multiplicative';
      value: number;
      appliedAmount: number; // PLN
    }
  };
  totalPrice: number;
  warnings: string[];
  metadata?: {
    tier: PriceTier;         // która cena została użyta
    interpolated: boolean;   // czy użyta interpolacja
    appliedRules: string[];  // które reguły zadziałały
  }
}

// Kategoria musi implementować
export interface CategoryDefinition {
  id: string;
  label: string;
  unit: Unit;
  schema: JSONSchema7;  // Runtime validation
  
  validate(input: unknown): input is CategoryInput | ValidationError;
  calculate(input: CategoryInput): CategoryOutput;
}
```

---

### 7.2 Price Schema Contract

```typescript
// data/schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "banner": {
      "type": "object",
      "properties": {
        "materials": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": { "type": "string" },
              "name": { "type": "string" },
              "tiers": {
                "type": "array",
                "items": {
                  "type": "object",
                  "required": ["min", "price"],
                  "properties": {
                    "min": { "type": "number" },
                    "max": { "type": ["number", "null"] },
                    "price": { "type": "number" }
                  }
                }
              }
            },
            "required": ["id", "name", "tiers"]
          }
        }
      }
    }
  }
}
```

---

### 7.3 Event Schema

```typescript
// src/core/contracts/EventSchema.ts

export const eventSchema = {
  'price-changed': {
    path: string;      // "banner.materials.0.price"
    oldValue: number;
    newValue: number;
    source: 'ui' | 'import' | 'api';
  },
  'category-registered': {
    categoryId: string;
    definition: CategoryDefinition;
  },
  'validation-failed': {
    categoryId: string;
    input: unknown;
    errors: ValidationError[];
  },
};
```

---

## 8. RYZYKA MIGRACJI

### 8.1 Ryzyka Wysokie (Blokerów)

| Ryzyka | Opis | Mitygacja |
|--------|------|-----------|
| **Breaking change w core.pricing** | Zmieszane warianty CalculationResult (legacy fields) | Utworzyć V2 obok V1, migrować stopniowo |
| **localStorage overrides** | Dzisiaj: flat keys ("banner-200g" → 60), docelowo: structured | Migracja schematu + fallback reader |
| **ViewContext.emit()** | Brak typed events — zmiana spowoduje cascading errors | Type-safe EventEmitter, stawiaj deprecation warnings |
| **CSV → JSON** | Ręczny proces, podatny na błędy | Build script do konwersji (zautomatyzować) |

### 8.2 Ryzyka Średnie

| Ryzyka | Opis | Mitygacja |
|--------|------|-----------|
| **getPrice() -> PriceDataSource** | Każda kategoria hardcodeuje ścieżki | Wrapper do translacji ("banner" → source.getPrice("banner")) |
| **Kompatybilność testów** | Stare testy mockują getPrice | Testy muszą mockować PriceDataSource |
| **Google Apps Script URL** | Zapieczona w bundle | Runtime lookup w localStorage + fallback |
| **Metadata desynchronizacja** | Categories w 3 miejscach | Single registry, generuj pozostałe |

### 8.3 Ryzyka Niskie

| Ryzyka | Opis | Mitygacja |
|--------|------|-----------|
| **Legacy compat.ts** | Przestarzały kod (migracja v1) | Oznacz @deprecated, redirect na nowe API |
| **Performance** | Dodatkowe warstwy abstrakcji | Profiluj na produkcji, nie optymalizuj spekulacyjnie |

---

## 9. KOLEJNOŚĆ WYDZIELEŃ (Etapy Migracji)

### Etap 1️⃣: Kontrakty i Interfejsy (2-3 dni, no breaking changes)
```
Zadania:
1. src/core/contracts/PriceDataSource.ts    (interface)
2. src/core/contracts/CategoryRegistry.ts   (interface)
3. src/core/contracts/Events.ts             (typed events)
4. Dokumentacja kontraktów
5. Testy unit dla interfejsów (dummy impls)

Dependencje: brak
Output: Czyste interfejsy, można używać parallelnie z old code
```

---

### Etap 2️⃣: Adaptery Infrastrukturalne (3-5 dni, no breaking changes)
```
Zadania:
1. src/infrastructure/adapters/JsonPriceSource.ts
2. src/infrastructure/adapters/LocalStorageOverrideSource.ts
3. src/infrastructure/adapters/CompositeSource.ts (ChainOfResponsibility)
4. Unit testy dla każdego adaptera
5. Benchmark: porównie getPrice() vs PriceDataSource

Dependencje: Etap 1
Output: Adaptery działają w parallel z getPrice()
Backcompat: getPrice() = CompositeSource(['localStorage', 'json'])
```

---

### Etap 3️⃣: CategoryRegistry i Migracja Kategorii (5-7 dni, progressive deprecation)
```
Zadania:
1. src/domain/CategoryRegistry.ts (impl + factory)
2. Migruj każdą kategorię na CategoryDefinition:
   - banner.ts: implement CategoryDefinition
   - wlepki.ts: implement CategoryDefinition
   - ... (17 kategori)
3. src/ui/views/category-loader.ts (dynamic mount)
4. Testy: każda kategoria musi mieć schema validation
5. Dokumentacja: jak dodać nową kategorię (nowy proces)

Dependencje: Etap 1, Etap 2
Output: Kategorie są discoverable (listAll(), getById())
Backcompat: Stare imports ("import { calculateBanner } from ...") still work
```

---

### Etap 4️⃣: TypeScript Event System (2-3 dni, no breaking changes)
```
Zadania:
1. src/infrastructure/services/EventDispatcher.ts (typed emitter)
2. Zamiń ViewContext.emit/on na typed version
3. Deprecate string-based events
4. Update wszystkich listeners

Dependencje: Etap 1
Output: Compile-time safe events
Backcompat: String-based events warned w console, redirect na typed
```

---

### Etap 5️⃣: CSV Import Adapter (3-4 dni, new feature, no breaking changes)
```
Zadania:
1. Build script: CSV -> JSON converter (scripts/csv-to-prices.js)
2. src/infrastructure/adapters/CsvPriceSource.ts (parser)
3. CLI: yarn prices:import-csv -- --source "cennik.csv"
4. Testy: porównanie CSV import vs manual JSON
5. Dokumentacja: jak importować nowy cennik z CSV

Dependencje: Etap 2
Output: Automacja procesu CSV -> prices.json
```

---

### Etap 6️⃣: API Adapter (dla Klonów) (3-4 dni, optional, extensibility)
```
Zadania:
1. src/infrastructure/adapters/ApiPriceSource.ts
2. API contract (OpenAPI/GraphQL schema)
3. Konfiguracja: PRICE_API_URL (env var)
4. Fallback strategy: API down → localStorage
5. Testy: mock API, offline scenarios

Dependencje: Etap 1, Etap 2
Output: Klony mogą linkować do zewnętrznego API cen
```

---

### Etap 7️⃣: Dependency Injection i PriceServiceV2 (4-5 dni, breaking: stare imports muszą się zmienić)
```
Zadania:
1. src/infrastructure/services/PriceServiceV2.ts (DI container)
2. Bootstrap (src/bootstrap.ts): wstrzykiwanie adaptera
3. Migruj src/services/priceService.ts → deleguj do container
4. Update src/categories/* — zamiast getPrice() użyj injected source
5. Testy: każda kategoria testowana z mock adapter
6. Remove compat.ts dependencies

Dependencje: Etap 1-6
Output: Kategorie nie wiedzą gdzie pochodzą dane
Breaking: Niektóre stare imports mogą się złamać (migracja testów)
```

---

## 10. DECYZJE DO SPISU

### D10.1: Gdzie się inicjuje adaptery?

```typescript
// Opcja A: src/bootstrap.ts (recommend)
export function createPriceService(): PriceDataSource {
  const json = new JsonPriceSource(config);
  const localStorage = new LocalStorageOverrideSource(json);
  return new CompositeSource([localStorage, json]);
}

// main.ts
const priceSource = createPriceService();
app.provide('PriceDataSource', priceSource);

// kategorii używają:
constructor(private priceSource: PriceDataSource) { ... }
```

---

### D10.2: Czy category-specific opcje walidować w core czy w kategorii?

```typescript
// Opcja A: W kategorii (szybciej, bardziej elastyczne dla klonów)
export class BannerCategory implements CategoryDefinition {
  validate(input: unknown) {
    // Material musi być jeden z: "200g", "250g", "300g"
    if (!['200g', '250g', '300g'].includes(input.material)) {
      throw new ValidationError(...)
    }
  }
}

// Opcja B: W JSON Schema (lepiej do refactor'u dla klonów)
// data/schema.json:
{
  "banner": {
    "properties": {
      "material": { "enum": ["200g", "250g", "300g"] }
    }
  }
}

// REKOMENDACJA: Opcja B + generuj validator z schematu
```

---

### D10.3: Czy EventEmitter ma być globalny czy injected?

```typescript
// Opcja A: Global (prosty, sprzęgnienie)
export const eventBus = new EventDispatcher();
eventBus.emit({ type: 'price-changed', ... })

// Opcja B: DI (clean, ale boilerplate)
export interface CategoryContext {
  eventBus: EventDispatcher;
}

// Opcja C: Hybrid (wskaż na app.provide, ale nie required)
app.provide('EventBus', eventBus);

// REKOMENDACJA: Opcja C dla klonów
```

---

### D10.4: Wersjonowanie Kontraktów (Dla Klonów)

```
Jeśli drugi klon ma inny cennik:
- unit: "m2" zamiast "szt"
- modifiers: inne (np. nie "express", ale "premium")
- priceSchema: zaktualizuj do v2

Strategy:
1. Każdy klon ma swój data/schema.json
2. Bootstrap: wczytaj schema.json + validate
3. CategoryRegistry: check schema compatibility
4. PriceDataSource: enforce schema validation
```

---

## 11. PODSUMOWANIE: Tabela Decyzji

| Decyzja | Odpowiedź | Implikacja |
|---------|-----------|-----------|
| **Core boundary** | Tylko pure calculations + types | ✓ Reużywalny, no side effects |
| **Data source abstraction** | PriceDataSource interface + adaptery | ✓ Klony mogą swap impl (JSON/API/CSV) |
| **Metadata source of truth** | CategoryRegistry (single) | ✓ Brak desynchronizacji |
| **Event typing** | Typed discriminated unions | ✓ Compile-time safety |
| **Kontrakt UI-Domain** | ViewContext typed, CategoryDefinition | ✓ Brak magic strings |
| **CSV automation** | Build script CSV→JSON + adapter | ✓ Klony ładują CSV w 1 komendzie |
| **Dependency injection** | src/bootstrap.ts factory | ✓ Config centralized, testability |
| **Wersjonowanie** | PriceSchemaVersion + migrations | ✓ Klony mogą mieć inny cennik |
| **Backward compat** | Stare APIs z deprecation warnings | ✓ Migracja bez crashu |

---

## 12. ARTEFAKTY DO OPRACOWANIA (Next Steps)

### Dla Implementacji (Jeśli Go):
1. **Specyfikacja Interfejsów** (OpenAPI/AsyncAPI)
2. **Implementacja Etapu 1** (Kontrakty)
3. **Test Plan** (Regression + Integration)
4. **Migration Guide** dla każdego Etapu
5. **Documentation for Clones** (Jak dodać nową kategorię, jak zmienić source danych)

### Dla Klonów (Dzisiaj):
1. **CLONE_SETUP.md**: Krok-po-kroku instrukcje
   - Fork repa
   - Załaduj CSV via script
   - Zmień GOOGLE_APPS_SCRIPT_URL
   - Testy powinny przejść
2. **API Contract** (co klon musi implementować, co jest fixed)

---

## KONIEC ANALIZY

**Status**: ✅ Analiza bez implementacji  
**Wniosek**: Architektura F jest **wykonalna** i **zalecana** do wdrożenia w 7 etapach  
**Następny krok**: Decyzja: **Go/NoGo** na Etap 1 (Kontrakty)
