# Fix: Dopłata za zadruk >25% w kategorii A4/A3

## Problem
Użytkownik zgłosił, że w kategorii A4/A3 dopłata za zadruk >25% była naliczana nieprawidłowo - brakło formularza w UI, przez co funkcja była dostępna ale nieużywana.

## Rozwiązanie
1. **Dodano pełny formularz UI** w [src/categories/druk-a4-a3-skan.ts](src/categories/druk-a4-a3-skan.ts):
   - Checkbox zadruku >25% z polem ilości stron
   - E-mail (+1.00 zł)
   - Skanowanie (auto/ręczne)
   - EXPRESS (+20%)

2. **Przepięto logikę kalkulacji** - zamiast prostego mnożenia (ilość × cena), używamy funkcji `calculateDrukA4A3Skan()` która poprawnie liczy:
   - Strony normalne: ilość × cena bazowa
   - Strony zadrukowane >25%: ilość × (cena bazowa × 150%)

3. **Naprawiono zaokrąglenia** - wszystkie ceny są zaokrąglane do 2 miejsc dziesiętnych.

## Przykłady działania

### Przypadek 1: 20 stron, 10 z zadrukieniem >25%
- Cena bazowa (tier 6-20): **0.60 zł/str**
- 10 stron normalnych: 10 × 0.60 = **6.00 zł**
- 10 stron zadrukowanych: 10 × 0.90 (150%) = **9.00 zł**
- **RAZEM: 15.00 zł**

### Przypadek 2: 100 stron, 25 z zadrukieniem >25%
- Cena bazowa (tier 21-100): **0.35 zł/str**
- 75 stron normalnych: 75 × 0.35 = **26.25 zł**
- 25 stron zadrukowanych: 25 × 0.525 (150%) = **13.13 zł**
- **RAZEM: 39.38 zł**

### Przypadek 3: 50 stron KOLOR, wszystkie z zadrukieniem
- Cena bazowa (tier 41-100 kolor): **2.00 zł/str**
- 50 stron zadrukowanych: 50 × 3.00 (150%) = **150.00 zł**

## Testy
✅ Wszystkie 23 testy przeszły pomyślnie:
- `tests/druk.test.ts` - podstawowe przypadki
- `tests/druk-manual-verify.test.ts` - weryfikacja matematyczna

## Pliki zmienione
- [src/categories/druk-a4-a3-skan.ts](src/categories/druk-a4-a3-skan.ts) - pełny formularz UI
- [tests/druk-manual-verify.test.ts](tests/druk-manual-verify.test.ts) - nowy plik z testami weryfikacyjnymi
