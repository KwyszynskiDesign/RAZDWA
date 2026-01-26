# AGENTS.md — Kalkulator cenników (Desktop)

## TL;DR
Repo zawiera kalkulator cen oparty o cenniki z CSV. Nie ruszaj działających modułów. Dokładaj nowe kategorie jako osobne pliki. Każda zmiana ma testy. [file:16]

## Źródło danych
Źródłem prawdy jest: `/data/menu-razdwa-Arkusz1-1.csv`. [file:16]
CSV zawiera wiele sekcji (nagłówki) i różne układy tabel (progi m2, progi sztuk, formaty A4/A3, dopłaty procentowe, teksty opisowe). [file:16]

## Zasady bezpieczeństwa zmian
1. Nie zmieniaj istniejących wyników obliczeń bez osobnego zadania “refactor core”. [file:16]
2. Zmiany mają być lokalne: nowa kategoria = nowy plik w `/src/categories/`. [file:16]
3. Dane ≠ logika: cenniki trzymamy jako JSON w `/data/normalized/`, a kod w `/src/`. [file:16]
4. Jeśli fragment CSV jest niejednoznaczny (np. komentarze, podwójne tabele, brak jednostki) — zostaw TODO i zadaj pytanie. [file:16]

## Struktura repo (wymagana)
- /data
  - menu-razdwa-Arkusz1-1.csv  (surowe) [file:16]
  - /normalized
    - *.json  (znormalizowane sekcje)
- /src
  - /core
    - pricing.ts        (wybór progu, naliczanie dopłat/minimów)
    - parse.ts          (narzędzia do parsowania liczb: "65 zł / m2" → 65)
    - money.ts          (format PLN)
    - types.ts          (typy danych)
  - /categories
    - index.ts          (rejestr kategorii)
    - *.ts              (każda kategoria osobno)
- /tests
  - *.test.ts

## Model danych (docelowy)
Obsługujemy wzorce z CSV: [file:16]
- progi ilościowe: np. "1-3 m2", "4-9 m2" albo "1 szt", "2 szt"... [file:16]
- dopłaty procentowe: EXPRESS +20%, papier satynowy +12% [file:16]
- minima: np. minimalna powierzchnia (MINIMALKA 1m2) lub minimalna kwota [file:16]
- uwagi tekstowe (do UI, bez wpływu na cenę) [file:16]

### Typy (TS)
PriceTable:
- id: string
- title: string
- unit: "m2" | "szt" | "mb" | "strona" | "format" | "inna"
- pricing: "per_unit" | "flat"
- tiers: Array<{ min: number, max: number | null, price: number }>
- modifiers?: Array<{ id: string, type: "percent" | "fixed", value: number }>
- rules?: Array<{ type: "minimum", unit: "m2" | "pln", value: number }>
- notes?: string[]

## Rejestr kategorii
`/src/categories/index.ts` eksportuje listę kategorii do UI:
- id
- label
- calculate(input) => result
- schema wejścia (jakie pola w UI)

## Jak dodawać kategorię
1. Wybierz JEDEN nagłówek/sekcję z CSV (np. "SOLWENT - PLAKATY"). [file:16]
2. Zrób JSON w `/data/normalized/<id>.json`. [file:16]
3. Zaimplementuj `/src/categories/<id>.ts`, korzystając wyłącznie z `/src/core/*`. [file:16]
4. Dodaj testy: min/środek/max + 1 edge case. [file:16]
