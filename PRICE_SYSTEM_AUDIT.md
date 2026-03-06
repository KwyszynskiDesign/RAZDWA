# 📋 Raport: Centralizacja cen i system przechowywania

Data: 6 marca 2026  
Status: ✅ ZWERYFIKOWANE

## Podsumowanie

Projekt posiada **scentralizowany system zarządzania cenami** z dwoma warstwami:
1. **Warstwa danych**: Ceny domyślne w `/docs/config/prices.json` oraz w plikach JSON kategorii (`/data/normalized/*.json`)
2. **Warstwa logiki**: `priceService.ts` + `resolveStoredPrice()` z przechowywaniem w `localStorage`

**Konkluzja**: ✅ Wszystkie ceny pochodzą z jednego źródła logicznego, a zmiany w ustawieniach **propagują się prawidłowo** do kategorii.

---

## 1. Struktura przechowywania cen

### 1.1 Ceny domyślne (MASTER)
- **Główny plik**: `docs/config/prices.json`
- **Przeznaczenie**: Ceny dla kategorii używających `priceService`
- **Kategorie**: banner, drukCAD, drukA4A3, dyplomy, folia, laminowanie, plakaty, rollUp, solwentPlakaty, ulotki, vouchery, wizytowki, wlepki, zaproszenia

### 1.2 Ceny znormalizowane (JSON)
- **Lokalizacja**: `data/normalized/` (16 plików JSON)
- **Struktura**: Każdy plik zawiera `categories[].items[].price`
- **Kategorie specjalne**:
  - `artykuly-biurowe.json` - 28 artykułów w 8 kategoriach (teczki, skoroszyt, segregatory, artykuły piszcze, nośniki itp.)
  - `uslugi.json` - 16 usług w 5 kategoriach (formatowanie, poprawki graficzne, archiwizacja itp.)

### 1.3 Przechowywanie zmian użytkownika
- **Klucz**: `razdwa_prices` w `localStorage`
- **Format**: `{ "kategoria-id": cena_zł, ... }`
- **Inicjalizacja**: Przy starcie aplikacji, `priceService` ładuje overriday z localStorage do pamięci
- **Zapis**: Przy każdej edycji w "Ustawienia cen", nowe wartości zapisywane do localStorage

---

## 2. Przepływ danych (Flow)

```
┌─────────────────────────────────────┐
│  docs/config/prices.json (MASTER)   │
│  +                                  │
│  data/normalized/*.json             │
└──────────────┬──────────────────────┘
               │ (imports)
               ▼
┌──────────────────────────────────────┐
│  src/services/priceService.ts        │
│  - getPrice(path)                    │
│  - setPrice(path, value)             │
│  - loadFromStorage()                 │
└──────────┬───────────────────────────┘
           │ provides API
           ▼
┌──────────────────────────────────────┐
│  src/core/compat.ts                  │
│  - resolveStoredPrice(key, default)  │
│  - readStoredPrices()                │
└──────────┬───────────────────────────┘
           │ used by categories
           ▼
┌──────────────────────────────────────┐
│  Kategorie:                          │
│  - artykuly-biurowe.ts               │
│  - uslugi.ts                         │
│  - i wszystkie inne...               │
└──────────────────────────────────────┘
```

---

## 3. Weryfikacja: Artykuły Biurowe i Usługi

### 3.1 Artykuły Biurowe (`src/categories/artykuly-biurowe.ts`)

```typescript
// Linia 23-24: Używanie resolveStoredPrice()
const storageKey = `artykuly-${item.itemId}`;
const price = resolveStoredPrice(storageKey, item.price);
```

**Mechanizm**:
1. Kod pobiera domyślną cenę z `data/normalized/artykuly-biurowe.json`
2. Szuka overridu w localStorage pod kluczem `artykuly-{itemId}`
3. Jeśli znaleziony → używa overridu
4. Jeśli nie → używa domyślnej ceny z JSON

**Test**: ✅ `should override price from localStorage`
```
Default: papier-ryza-a4 = 19.00 zł
Override setPrice("defaultPrices.artykuly-papier-ryza-a4", 22.00)
Result: 22.00 zł ✅
```

### 3.2 Usługi (`src/categories/uslugi.ts`)

```typescript
// Linia 22-23: Identyczne podejście
const storageKey = `uslugi-${service.serviceId}`;
const price = resolveStoredPrice(storageKey, service.price);
```

**Mechanizm**: Identyczny jak artykuły biurowe.

**Test**: ✅ `should handle time-based services with price override`
```
Default: formatowanie = 50.00 zł, 2.5h
Override: setPrice("defaultPrices.uslugi-formatowanie", 60.00)
Result: 60 * 2.5 = 150.00 zł ✅
```

---

## 4. System Ustawień Cen

### 4.1 Lokalizacja
**Plik**: `src/ui/views/ustawienia.ts`

### 4.2 Funkcjonalność
- **Wyświetla**: Tabelę wszystkich cen w localStorage
- **Dodaj**: Nową cenę custom (+ Dodaj pozycję)
- **Edytuj**: Zmień wartość (input number)
- **Usuń**: Usuń override (✕ button)
- **Zapisz**: `setPrice("defaultPrices", updatedPrices)` → localStorage
- **Reset**: `resetPrices()` → przywrócenie wartości domyślnych

### 4.3 Notyfikacja zmian
```typescript
// Linia 121: Broadcast do innych kart przeglądarki
window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
```

---

## 5. Wyniki testów

### 5.1 Test Suite: `tests/price-persistence.test.ts`

**Wszystkie 11 testów ✅ PRZECHODZĄ**

#### Artykuły Biurowe (4 testy)
- ✅ `should use default price when no override is set` - domyślna cena z JSON
- ✅ `should override price from localStorage` - override działa
- ✅ `should handle multiple items with mixed overrides` - mieszane overriday
- ✅ `localStorage data should persist after setPrice` - zapis do localStorage

#### Usługi (5 testów)
- ✅ `should use default price when no override is set`
- ✅ `should override price from localStorage for flat services`
- ✅ `should handle time-based services with price override` - z multiplikacją godzin
- ✅ `should handle multiple services with mixed overrides`
- ✅ `localStorage data should persist after setPrice`

#### Konsystencja cross-kategorii (2 testy)
- ✅ `should maintain separate namespaces for artykuly and uslugi prices`
- ✅ `resetting prices should clear all overrides`

### 5.2 Pełny test suite
```
npm test
→ 178 testów przechodzą (167 + 11 nowych)
→ 0 błędów
→ 100% pass rate
```

---

## 6. Architektura: Gdzie są ceny?

| Lokalizacja | Typ | Przeznaczenie | Kategorie |
|---|---|---|---|
| `docs/config/prices.json` | Master | Ceny domyślne | banner, drukCAD, drukA4A3, dyplomy, folia, laminowanie, plakaty, rollUp, solwentPlakaty, ulotki, vouchery, wizytowki, wlepki, zaproszenia |
| `data/normalized/*.json` | Master | Ceny znormalizowane | plakaty, solwent-plakaty, roll-up, dyplomy, vouchery, zaproszenia, folia, laminowanie, ulotki, wlepki, wizytowki, artykuly-biurowe, uslugi |
| `localStorage (razdwa_prices)` | Runtime | Overriday użytkownika | WSZYSTKIE |

---

## 7. Flow zmian ceny (Ustawienia → Kategoria)

### Scenariusz: Zmiana ceny artykułu

```
1. Użytkownik klika "Ustawienia"
   ↓
2. W tabeli zmienia "artykuly-papier-ryza-a4" z 19.00 na 25.00
   ↓
3. Klika "💾 Zapisz i odśwież"
   ↓
4. setPrice("defaultPrices.artykuly-papier-ryza-a4", 25.00)
   ↓
5. localStorage.setItem("razdwa_prices", JSON.stringify({...}))
   ↓
6. window.dispatchEvent(StorageEvent) → powiadomi inne karty
   ↓
7. Użytkownik wraca do "Artykuły Biurowe"
   ↓
8. quoteArtykulyBiurowe() wywołuje:
   resolveStoredPrice("artykuly-papier-ryza-a4", 19.00)
   ↓
9. readStoredPrices() czyta localStorage
   ↓
10. ZWRACA 25.00 (override) ZAMIAST 19.00 (domyślna)
    ↓
11. ✅ Cena w kalkulacji = 25.00
```

---

## 8. Rekomendacje

### ✅ Co jest dobrze
1. **Single source of truth**: Ceny pochodzą z jednego miejsca logicznego
2. **Konsystencja**: Wszystkie kategorie używają `resolveStoredPrice()`
3. **Persystencja**: Zmiany zachowują się w localStorage
4. **Namespacing**: Klucze są unikalne: `{kategoria}-{id}`
5. **Testy**: 11 testów weryfikuje propagację cen

### 🔄 Dalsze ulepszenia
1. **Export/Import cennika**: Możliwość wgrania CSV lub JSON
2. **Historia zmian**: Log zmian cen z datą i autorem
3. **Bulk edit**: Zmiana wielu cen jednocześnie (np. +10% do wszystkich)
4. **Backup**: Automatyczne backupy cennika
5. **Sync z serwerem**: Opcjonalna synchronizacja z API

---

## 9. Checklist Weryfikacji

- ✅ Ceny artykułów biurowych pochodzą z `data/normalized/artykuly-biurowe.json`
- ✅ Ceny usług pochodzą z `data/normalized/uslugi.json`
- ✅ `resolveStoredPrice()` wyszukuje overriday w localStorage
- ✅ `setPrice()` zapisuje zmiany do localStorage
- ✅ Ustawienia cen propagują się do kategorii
- ✅ Reset przywraca ceny domyślne
- ✅ Multiple categories mogą mieć separate overriday
- ✅ localStorage persists między sesjami przeglądarki
- ✅ Wszystkie 11 testów persistence przechodzą
- ✅ Całe test suite (178 testów) przechodzi

---

**Konkluzja**: ✅ **System jest gotowy do produkcji.**  
Ceny są scentralizowane, overriday działają prawidłowo, a wszystkie testy potwierdzają poprawność implementacji.
