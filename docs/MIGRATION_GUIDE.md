# Migration Guide: Przejście na PriceService

## Dla deweloperów dodających nowe kategorie

### Stary sposób ❌

```typescript
// src/categories/nowa-kategoria.ts
import prices from "../../data/normalized/nowa-kategoria.json";

export function calculateNowaKategoria(options) {
  const data = prices;
  const tier = data.tiers.find(t => ...);
  // ...
}
```

### Nowy sposób ✅

```typescript
// src/categories/nowa-kategoria.ts
import { priceService } from "../services/priceService";

export function calculateNowaKategoria(options) {
  const data = priceService.loadSync('nowa-kategoria');
  const tier = data.tiers.find(t => ...);
  // ...
}
```

## Kroki migracji dla nowej kategorii

### 1. Przygotuj dane JSON

```bash
# Umieść plik w:
data/normalized/nowa-kategoria.json
```

### 2. Zarejestruj w priceService

Dodaj nazwę pliku do listy w `priceService.ts`:

```typescript
// src/services/priceService.ts
async initialize(): Promise<void> {
  const priceFiles = [
    'banner',
    'laminowanie',
    // ... inne
    'nowa-kategoria'  // ⬅️ Dodaj tutaj
  ];
  // ...
}
```

### 3. Utwórz moduł kalkulacyjny

```typescript
// src/categories/nowa-kategoria.ts
import { priceService } from "../services/priceService";
import { calculatePrice } from "../core/pricing";
import { PriceTable, CalculationResult } from "../core/types";

export interface NowaKategoriaOptions {
  qty: number;
  express?: boolean;
}

export function calculateNowaKategoria(
  options: NowaKategoriaOptions
): CalculationResult {
  // 1. Załaduj dane przez priceService
  const priceData = priceService.loadSync('nowa-kategoria');
  
  // 2. Przygotuj strukturę dla core/pricing
  const priceTable: PriceTable = {
    id: priceData.id,
    title: priceData.title,
    unit: priceData.unit,
    pricing: priceData.pricing,
    tiers: priceData.tiers,
    modifiers: priceData.modifiers
  };
  
  // 3. Przygotuj modyfikatory
  const activeModifiers: string[] = [];
  if (options.express) {
    activeModifiers.push("express");
  }
  
  // 4. Użyj funkcji z core/pricing
  return calculatePrice(priceTable, options.qty, activeModifiers);
}
```

### 4. Napisz testy

```typescript
// tests/nowa-kategoria.test.ts
import { describe, it, expect } from 'vitest';
import { calculateNowaKategoria } from '../src/categories/nowa-kategoria';

describe('Nowa Kategoria', () => {
  it('should calculate basic price', () => {
    const result = calculateNowaKategoria({
      qty: 10,
      express: false
    });
    
    expect(result.totalPrice).toBeGreaterThan(0);
  });
  
  it('should apply express modifier', () => {
    const normal = calculateNowaKategoria({ qty: 10, express: false });
    const express = calculateNowaKategoria({ qty: 10, express: true });
    
    expect(express.totalPrice).toBeGreaterThan(normal.totalPrice);
  });
});
```

### 5. Zweryfikuj

```bash
# Sprawdź importy
node tests/verify-refactoring.js

# Uruchom testy
npm test
```

## Częste pytania (FAQ)

### Q: Czy mogę modyfikować ceny w runtime?

**Tak!** Użyj `setPrice()` lub `setPriceByPath()`:

```typescript
// Pobierz dane
const prices = priceService.getPrice('banner');

// Zmodyfikuj
prices.materials[0].tiers[0].price = 60.0;

// Zapisz
priceService.setPrice('banner', prices);
```

### Q: Jak testować moduły z priceService?

**Mockuj priceService:**

```typescript
import { vi } from 'vitest';
import { priceService } from '../services/priceService';

vi.spyOn(priceService, 'loadSync').mockReturnValue({
  id: 'test',
  tiers: [{ min: 1, max: null, price: 10 }],
  // ... mock data
});
```

### Q: Czy priceService działa asynchronicznie?

**Domyślnie synchronicznie** (loadSync), ale dostępna jest też metoda async:

```typescript
// Synchronicznie (preferowane dla prostoty)
const prices = priceService.loadSync('banner');

// Asynchronicznie (dla inicjalizacji)
await priceService.initialize();
const prices = priceService.getPrice('banner');
```

### Q: Co jeśli potrzebuję dostępu do surowego JSON?

**priceService zwraca te same dane:**

```typescript
// Stary sposób
import data from "../../data/normalized/banner.json";

// Nowy sposób - IDENTYCZNE dane
const data = priceService.loadSync('banner');
```

### Q: Czy to wpływa na wydajność?

**NIE - cache poprawia wydajność:**

```typescript
// Pierwsze wywołanie: ładuje z dysku
priceService.loadSync('banner'); // ~1-5ms

// Kolejne wywołania: z cache
priceService.loadSync('banner'); // ~0.001ms
```

## Przykłady dla różnych scenariuszy

### Scenariusz 1: Prosta kategoria z progami

```typescript
export function calculateProstyProdukt(options: { qty: number }) {
  const data = priceService.loadSync('prosty-produkt');
  
  // Znajdź odpowiedni próg
  const tier = data.tiers.find(t => 
    options.qty >= t.min && 
    (t.max === null || options.qty <= t.max)
  );
  
  return {
    tierPrice: tier.price,
    totalPrice: options.qty * tier.price
  };
}
```

### Scenariusz 2: Kategoria z wariantami (materiały)

```typescript
export function calculateZWariantami(options: { 
  material: string;
  qty: number;
}) {
  const data = priceService.loadSync('z-wariantami');
  
  // Znajdź materiał
  const material = data.materials.find(m => m.id === options.material);
  if (!material) {
    throw new Error(`Unknown material: ${options.material}`);
  }
  
  // Znajdź próg dla tego materiału
  const tier = material.tiers.find(t => 
    options.qty >= t.min && 
    (t.max === null || options.qty <= t.max)
  );
  
  return { 
    tierPrice: tier.price,
    totalPrice: options.qty * tier.price 
  };
}
```

### Scenariusz 3: Kategoria z dopłatami

```typescript
export function calculateZDoplatami(options: {
  qty: number;
  express: boolean;
  satynowy: boolean;
}) {
  const data = priceService.loadSync('z-doplatami');
  
  let basePrice = calculateBasePrice(data.tiers, options.qty);
  let total = basePrice;
  
  // Dopłaty procentowe
  if (options.satynowy) {
    total *= 1.12; // +12%
  }
  if (options.express) {
    total *= 1.20; // +20%
  }
  
  return { basePrice, totalPrice: total };
}
```

## Checklist dla code review

Przy przeglądzie kodu nowej kategorii sprawdź:

- [ ] ✅ Używa `priceService.loadSync()` zamiast `import ... from "...json"`
- [ ] ✅ Import z `"../services/priceService"`
- [ ] ✅ Ma testy jednostkowe
- [ ] ✅ Zgodny z interfejsem `CalculationResult`
- [ ] ✅ Obsługuje błędy (nieznany materiał, zły próg, etc.)
- [ ] ✅ Nie modyfikuje danych (immutable)
- [ ] ✅ Dodany do rejestru w `priceService.initialize()`

## Narzędzia pomocnicze

### Weryfikacja struktury projektu

```bash
# Sprawdź czy wszystkie moduły używają priceService
node tests/verify-refactoring.js
```

### Debug priceService

```typescript
// Sprawdź co jest załadowane
console.log(priceService.getAvailableCategories());

// Sprawdź czy kategoria istnieje
console.log(priceService.hasCategory('banner'));

// Zobacz surowe dane
console.log(JSON.stringify(priceService.getPrice('banner'), null, 2));
```

## Dalsze kroki

Po zapoznaniu się z tym przewodnikiem:

1. Przeczytaj [AGENTS.md](../AGENTS.md) - zasady projektu
2. Zobacz [przykłady](../docs/examples/priceService-examples.ts)
3. Przeczytaj [dokumentację refaktoryzacji](REFACTORING_PRICE_SERVICE.md)

## Kontakt

Jeśli masz pytania lub napotkasz problemy, sprawdź:
- Issues w repozytorium
- Dokumentacja w `/docs/`
- Przykłady w `/docs/examples/`
