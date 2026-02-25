# RAZDWA
Kalkulator cenników dla drukarni

## 📋 Architektura

Projekt używa wielowarstwowej architektury z jasnym podziałem odpowiedzialności:

```
┌─────────────────────────────────────────┐
│         UI Layer (docs/*)               │
│  Formularze, widoki, interakcje         │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│    Category Modules (src/categories/)   │
│  Logika kalkulacji, walidacja           │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│    Price Service (src/services/)        │
│  ⭐ Dostęp do danych, cache, spójność   │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│    Data Layer (data/normalized/)        │
│  JSON z cenami, statyczne dane          │
└─────────────────────────────────────────┘
```

## 🚀 Główne komponenty

### `/src/services/priceService.ts` 
**Warstwa pośrednia dla zarządzania cenami**

Centralny punkt dostępu do wszystkich danych cenowych. Zapewnia:
- Spójność danych w całej aplikacji
- Cache dla wydajności
- Łatwe testowanie (możliwość mockowania)
- Separation of concerns

```typescript
import { priceService } from '../services/priceService';

// Pobierz dane cenowe
const prices = priceService.loadSync('banner');

// Zmodyfikuj cenę
priceService.setPriceByPath('banner.materials.0.tiers.0.price', 60.0);
```

### `/src/categories/`
**Moduły kalkulacyjne**

Każda kategoria produktów (bannery, ulotki, wizytówki) ma własny moduł:
- Logika wyliczania cen
- Walidacja danych wejściowych
- Obsługa modyfikatorów (express, oczkowanie, itp.)

### `/data/normalized/`
**Dane cenowe**

Znormalizowane pliki JSON z cenami, progami ilościowymi, modyfikatorami.

## 📚 Dokumentacja

- **[AGENTS.md](AGENTS.md)** - Zasady rozwoju projektu
- **[REFACTORING_PRICE_SERVICE.md](docs/REFACTORING_PRICE_SERVICE.md)** - Szczegóły refaktoryzacji
- **[Przykłady użycia](docs/examples/priceService-examples.ts)** - Przykładowy kod

## 🔧 Weryfikacja

Sprawdź czy refaktoryzacja została poprawnie wykonana:

```bash
node tests/verify-refactoring.js
```

## 💡 Zasady rozwoju

### ✅ DO:
- Używaj `priceService` dla dostępu do danych cenowych
- Trzymaj logikę w `/src/categories/`
- Trzymaj dane w `/data/normalized/`
- Pisz testy dla nowych funkcji

### ❌ NIE:
- Nie importuj JSON bezpośrednio w modułach
- Nie przechowuj kopii danych w pamięci
- Nie mieszaj UI z logiką biznesową

## 🏗️ Struktura projektu

```
RAZDWA/
├── src/
│   ├── services/          # ⭐ Warstwa serwisowa
│   │   └── priceService.ts
│   ├── categories/        # Moduły kalkulacyjne
│   │   ├── banner.ts
│   │   ├── laminowanie.ts
│   │   └── ...
│   ├── core/              # Narzędzia wspólne
│   │   ├── pricing.ts
│   │   ├── money.ts
│   │   └── types.ts
│   └── ui/                # Warstwa UI
├── data/
│   └── normalized/        # Dane cenowe (JSON)
├── tests/                 # Testy
└── docs/                  # Dokumentacja i frontend
```

## 📦 Zależności

- TypeScript 5.9+
- Vitest (testy)
- esbuild (bundling)

## 🎯 Status

✅ Warstwa PriceService zaimplementowana  
✅ Wszystkie moduły zrefaktoryzowane  
✅ Weryfikacja automatyczna działa  
✅ Zgodność wsteczna zachowana

