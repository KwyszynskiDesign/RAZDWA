# F: Reużywalny Core — ADR (Zaimplementowane, Stage 1–5)

**Status**: Zaimplementowane  
**Data analizy**: 2026-06-25  
**Data implementacji**: 2026-06-26  
**Commity**: `ae6de70a` (Stage 1) → `f12d6ae5` (Stage 5)

---

## Stan po Stage 1–5

### Co jest source of truth

| Obszar | Source of truth | Plik |
|--------|----------------|------|
| Odczyt cen | `priceSource` (adapter chain) | `src/bootstrap.ts` |
| Eventy domenowe | `eventBus.emit('price-changed')` | `src/bootstrap.ts` |
| Kategorie (obliczenia) | `categoryRegistry` | `src/bootstrap.ts` |
| Dane cenowe (build-time) | `src/config/prices.json` via `JsonPriceSource` | — |
| Overrides użytkownika | `localStorage['razdwa_prices']` via `LocalStorageOverrideSource` | — |

### Co jest adapterem

```
src/infrastructure/adapters/
  JsonPriceSource.ts              ← dot-path traversal nad prices.json
  LocalStorageOverrideSource.ts   ← lazy localStorage reads dla defaultPrices.*

src/infrastructure/events/
  TypedEventDispatcher.ts         ← in-process Map<type, Set<fn>>

src/domain/
  CategoryRegistry.ts             ← DefaultCategoryRegistry implements CategoryRegistry
  registerBuiltinCategories.ts    ← adaptery dyplomy + banner → CategoryDefinition
```

### Co jest legacy bridge (nie ruszać bez Stage 7)

| Bridge | Lokalizacja | Dlaczego zostaje |
|--------|------------|-----------------|
| `getPrice()` → `priceSource` | `priceService.ts:179` | 30+ kategorii wciąż importuje `getPrice()` bezpośrednio |
| `getConfigRoot()` w `compat.ts` | `core/compat.ts:2` | `getDefaultPricesMap()`, `warmPriceCache()` nadal z niego korzystają |
| `applyStorageOverrides()` | `priceService.ts:135` | Eager merge na start; coexists z lazy `LocalStorageOverrideSource` — obie ścieżki potrzebne |
| `SimpleEventEmitter` + `ctx.emit/on` | `main.ts:408`, `ustawienia.ts:3273+` | 4 martwe wywołania `ctx.emit("prices-updated")`, brak listenerów; usunięcie = edit w 3400-linijnym pliku |
| `CategoryModule` (mount/unmount) | `src/ui/router.ts` | 20 kategorii nie ma `CategoryDefinition`, wciąż korzysta ze starego DOM-routingu |

---

## Architektura po Stage 1–5

### Composition root (`src/bootstrap.ts`)

```typescript
// Trzy singletonowe zależności:
export const priceSource: PriceDataSource         // LocalStorageOverrideSource → JsonPriceSource
export const categoryRegistry: CategoryRegistry   // DefaultCategoryRegistry (dyplomy + banner)
export const eventBus: TypedEventEmitter          // TypedEventDispatcher (in-process)
```

### Ścieżka odczytu cen (po Stage 2)

```
getPrice("banner.materials.0.price")
  → priceSource.getPrice(path)          // LocalStorageOverrideSource
    → jeśli path == "defaultPrices.*"   // czyta lazy z localStorage
    → else: base.getPrice(path)         // JsonPriceSource → dot-path nad prices.json
```

### Ścieżka eventów (po Stage 4–5)

```
priceService.setPrice(...)
  → notifyPricesUpdated(path)
    → eventBus.emit({ type: 'price-changed', path, source: 'ui', timestamp })
      → main.ts listener: router.handleRoute()   // remount widoku
```

### CategoryRegistry (po Stage 3)

```typescript
// Bootstrap rejestruje 2 kategorie przez wrapper:
categoryRegistry.register({ id: 'dyplomy', unit: 'szt', calculate: wrapDyplomy })
categoryRegistry.register({ id: 'banner',  unit: 'm2',  calculate: wrapBanner  })

// Pozostałe 20 kategorii: wciąż przez CategoryModule (legacy DOM-routing)
// Docelowo Stage 7: wszystkie przez CategoryDefinition
```

---

## Kontrakty (src/core/contracts/)

| Plik | Status | Używany przez |
|------|--------|--------------|
| `PriceDataSource.ts` | ✅ zaimplementowany | `JsonPriceSource`, `LocalStorageOverrideSource`, `priceService` |
| `CategoryRegistry.ts` | ✅ zaimplementowany | `DefaultCategoryRegistry`, `registerBuiltinCategories`, `bootstrap` |
| `Events.ts` | ✅ zaimplementowany | `TypedEventDispatcher`, `priceService`, `main.ts`, testy |
| `PriceSchema.ts` | 📋 typ-only, niezaimplementowany | Nikt (aspiracyjny — dla klonów) |

### Typy eventów domenowych

| Event | Status | Emituje | Słucha |
|-------|--------|---------|--------|
| `price-changed` | ✅ aktywny | `priceService.notifyPricesUpdated` | `main.ts`, testy |
| `category-updated` | 📋 typ-only | nikt | nikt |
| `validation-failed` | 📋 typ-only | nikt | nikt |
| `variant-changed` | 📋 typ-only | nikt | nikt |

---

## Co zostało poza zakresem Stage 1–5

Poniższe punkty z oryginalnego planu (Etap 5–7) są **out of scope** dla Stage 1–5:

- **CSV Import Adapter** — brak `CsvPriceSource.ts`; cennik wciąż ręcznie konwertowany
- **API Adapter** — brak `ApiPriceSource.ts`; klony muszą ręcznie podmienić JSON
- **DI / PriceServiceV2** — `priceService.ts` wciąż jest monolitem; kategorie importują `getPrice()` globalnie
- **Pełna migracja CategoryModule → CategoryDefinition** — 20 z 22 kategorii wciąż w starym DOM-routingu

---

## Decyzje architektoniczne podjęte w implementacji

### D1: Bootstrap jako composition root

`src/bootstrap.ts` jest jedynym miejscem, gdzie tworzone są singletonowe instancje adapterów. Nie ma DI container — zależności są eksportowane jako moduł-level stałe.

**Dlaczego**: prosta init-order wymagała late-binding gettera (`initPriceRoot`) zamiast DI, bo `priceService.ts` importuje `bootstrap.ts` i musi zainicjalizować root po własnym module eval.

### D2: Lazy localStorage w LocalStorageOverrideSource

`LocalStorageOverrideSource.getPrice("defaultPrices.x")` czyta z localStorage w każdym wywołaniu zamiast bake-in na start. Coexists z eager `applyStorageOverrides()` w priceService.

**Dlaczego**: cross-tab consistency; zapis w jednej zakładce jest widoczny w innej bez reloadu.

### D3: TypedEventDispatcher in-process (nie window-backed)

`eventBus` nie dispatcha `window.CustomEvent`. Jest czystym in-process Map. 

**Dlaczego**: testy bez DOM, brak cross-frame pollution, łatwiejszy cleanup (unsubscribe function).

### D4: registerBuiltinCategories() z main.ts, nie z bootstrap.ts

`main.ts` wywołuje `registerBuiltinCategories(categoryRegistry)` zamiast robić to w `bootstrap.ts`.

**Dlaczego**: `bootstrap.ts` → `registerBuiltinCategories` → `dyplomy.ts` → `compat.ts` → `priceService.ts` → `bootstrap.ts` to circular dep. Entry point `main.ts` nie jest importowany przez żaden moduł kalkulacyjny, więc cycle nie powstaje.

### D5: Stub modifiers w CategoryDefinition wrapper

`wrapDyplomy` / `wrapBanner` produkują `Record<string, ModifierBreakdown>` z zerowanymi polami numerycznymi, bo stare `appliedModifiers: string[]` nie zawiera breakdown. Nie zmienia wyników obliczeń — to transformacja interfejsu.

---

## Następne kroki (jeśli go Stage 7)

1. Migracja pozostałych 20 kategorii z `CategoryModule` → `CategoryDefinition`
2. Usunięcie `SimpleEventEmitter` i `ctx.emit/on` z `ViewContext` (po czym z `ustawienia.ts`)
3. Pełna DI dla `getPrice()` — kategorie przez injected `PriceDataSource` zamiast globalnego importu
4. Usunięcie `compat.ts` dependencies z core (lub rename na `src/services/legacyPricing.ts`)

---

## Struktura plików (stan po Stage 1–5)

```
src/
├── bootstrap.ts                         ← composition root (priceSource, categoryRegistry, eventBus)
├── core/
│   ├── contracts/
│   │   ├── PriceDataSource.ts           ← interface + resolvePriceNumber()
│   │   ├── CategoryRegistry.ts          ← CategoryDefinition, CategoryRegistry, CategoryOutput
│   │   ├── Events.ts                    ← DomainEvent union, TypedEventEmitter
│   │   └── PriceSchema.ts              ← aspiracyjny; PriceSchemaContract, assertSchemaCompatible
│   ├── types.ts                         ← CategoryInput (source of truth), CartItem, etc.
│   ├── compat.ts                        ← LEGACY: getInterpolatedPrice, resolveStoredPrice, etc.
│   └── pricing.ts                       ← pure: calculatePrice, findTier, applyModifiers
├── domain/
│   ├── CategoryRegistry.ts              ← DefaultCategoryRegistry implements CategoryRegistry
│   └── registerBuiltinCategories.ts     ← dyplomy + banner → CategoryDefinition adapters
├── infrastructure/
│   ├── adapters/
│   │   ├── JsonPriceSource.ts           ← dot-path traversal, prototype-pollution guard
│   │   └── LocalStorageOverrideSource.ts ← lazy localStorage reads dla defaultPrices.*
│   └── events/
│       └── TypedEventDispatcher.ts      ← in-process TypedEventEmitter implementation
├── services/
│   └── priceService.ts                  ← BRIDGE: getPrice() → priceSource; setPrice, labels, variants
└── ui/
    ├── types.ts                         ← ViewContext (on?/emit? = legacy bridge, brak konsumentów)
    └── main.ts                          ← entry point; rejestruje kategorie, słucha eventBus
```
