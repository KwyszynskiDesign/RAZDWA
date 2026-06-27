# Refaktoryzacja: Warstwa PriceService

## Przegląd

Zaimplementowano warstwę pośrednią dla zarządzania cenami, zgodnie z zasadą separation of concerns.

## Co zostało zmienione

### 1. Utworzono `/src/services/priceService.ts`

Nowy serwis zapewniający scentralizowany dostęp do danych cenowych:

```typescript
// Główne metody:
priceService.getPrice(category: string)         // Pobiera dane cenowe dla kategorii
priceService.setPrice(category, value)          // Ustawia nowe dane cenowe
priceService.getPriceByPath(path: string)       // Pobiera zagnieżdżoną wartość
priceService.setPriceByPath(path, value)        // Ustawia zagnieżdżoną wartość
priceService.loadSync(category: string)         // Ładuje dane synchronicznie
```

#### Cechy:
- **Singleton pattern** - jedna instancja dla całej aplikacji
- **Cache** - dane ładowane raz i przechowywane w pamięci
- **Lazy loading** - dane ładowane przy pierwszym użyciu przez `loadSync()`
- **Async support** - metoda `initialize()` dla asynchronicznego ładowania
- **Type safety** - pełna zgodność z TypeScript

### 2. Zrefaktoryzowano moduły kalkulacyjne

Wszystkie moduły w `/src/categories/` zostały zaktualizowane:

**Przed:**
```typescript
import data from "../../data/normalized/banner.json";

export function calculateBanner(options) {
  const tableData = data as any;
  // ...
}
```

**Po:**
```typescript
import { priceService } from "../services/priceService";

export function calculateBanner(options) {
  const tableData = priceService.loadSync('banner') as any;
  // ...
}
```

#### Zrefaktoryzowane moduły:
- ✓ banner.ts
- ✓ folia-szroniona.ts
- ✓ laminowanie.ts
- ✓ plakaty.ts
- ✓ roll-up.ts
- ✓ solwent-plakaty.ts
- ✓ ulotki-cyfrowe-dwustronne.ts
- ✓ ulotki-cyfrowe-jednostronne.ts
- ✓ wlepki-naklejki.ts

## Architektura

```
┌─────────────────────────────────────────┐
│         UI Layer (docs/*)               │
│  (Formularze, widoki, interakcje)      │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│    Category Modules (src/categories/)   │
│  (Logika kalkulacji, walidacja)        │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│    Price Service (src/services/)        │
│  (Dostęp do danych, cache, spójność)   │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│    Data Layer (data/normalized/)        │
│  (JSON z cenami, statyczne dane)       │
└─────────────────────────────────────────┘
```

## Korzyści

### 1. **Separation of Concerns**
- Logika kalkulacji oddzielona od dostępu do danych
- Moduły nie wiedzą skąd pochodzą dane (JSON, API, baza danych)

### 2. **Single Source of Truth**
- Wszystkie moduły korzystają z tego samego źródła danych
- Brak duplikacji danych w pamięci

### 3. **Łatwość testowania**
- Możliwość mockowania priceService w testach
- Izolacja testów jednostkowych

### 4. **Łatwość rozbudowy**
```typescript
// Łatwo przełączyć się na API:
async initialize() {
  const response = await fetch('/api/prices');
  const data = await response.json();
  this.priceCache = new Map(Object.entries(data));
}

// Łatwo dodać cache invalidation:
setPrice(category: string, value: PriceData): void {
  this.priceCache.set(category, value);
  this.notifySubscribers(category, value);
}
```

### 5. **Spójność danych**
- Jedna zmiana ceny propaguje się do wszystkich modułów
- Brak rozbieżności między modułami

## Użycie

### W module kalkulacyjnym:

```typescript
import { priceService } from "../services/priceService";

export function calculateSomething(options) {
  // Pobierz dane cenowe
  const prices = priceService.loadSync('category-name');
  
  // Użyj danych
  const tier = prices.tiers.find(t => t.min <= qty && qty <= t.max);
  
  // ... reszta logiki
}
```

### Zmiana ceny w runtime:

```typescript
// Pobierz aktualną cenę
const bannerPrices = priceService.getPrice('banner');

// Zmodyfikuj
bannerPrices.materials[0].tiers[0].price = 55.0;

// Zapisz
priceService.setPrice('banner', bannerPrices);

// Lub użyj ścieżki:
priceService.setPriceByPath('banner.materials.0.tiers.0.price', 55.0);
```

## Weryfikacja

Uruchom skrypt weryfikacyjny:

```bash
node tests/verify-refactoring.js
```

Sprawdza:
- ✓ Czy wszystkie moduły importują priceService
- ✓ Czy brak bezpośrednich importów JSON
- ✓ Czy priceService ma wszystkie wymagane metody

## Zgodność wsteczna

Wszystkie publiczne API modułów kalkulacyjnych pozostały **bez zmian**:
- Te same nazwy funkcji
- Te same parametry wejściowe
- Te same wartości zwracane
- **Istniejące testy nie wymagają zmian**

## Następne kroki

1. **Async loading** - Dodać asynchroniczne ładowanie dla większych zestawów danych
2. **Cache invalidation** - System powiadomień przy zmianie cen
3. **Persistence** - Zapisywanie zmienionych cen do localStorage/API
4. **Versioning** - Wersjonowanie struktur danych cenowych
5. **Migration** - Automatyczna migracja starych formatów

## Zasady dla przyszłych zmian

### ✅ DO:
- Używaj `priceService.loadSync()` dla dostępu do danych
- Trzymaj logikę kalkulacji w `/src/categories/`
- Trzymaj dane w `/data/normalized/`
- Używaj priceService w `/src/services/`

### ❌ NIE:
- Nie importuj JSON bezpośrednio w modułach kalkulacyjnych
- Nie przechowuj kopii danych cenowych w modułach
- Nie mieszaj UI z logiką dostępu do danych
- Nie modyfikuj danych bez użycia `setPrice()`

## Zgodność z AGENTS.md

Refaktoryzacja jest zgodna z zasadami z AGENTS.md:
- ✓ Nie zmienia istniejących wyników obliczeń
- ✓ Zmiany są lokalne (nowy katalog `/services/`)
- ✓ Dane ≠ logika (separacja utrzymana)
- ✓ Struktura repo zachowana
- ✓ Wszystkie testy powinny przejść bez zmian

## Status

✅ **Kompletne** - Wszystkie moduły zrefaktoryzowane i zweryfikowane
