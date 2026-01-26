# AGENTS.md — Kalkulator / Cenniki (źródło: CSV)

## Cel projektu
Budujemy desktopowy kalkulator cen dla punktu druku, oparty o dane z CSV (cenniki, progi ilościowe, dopłaty typu EXPRESS, minimalne kwoty itp.). [file:16]

Priorytety:
- Stabilność istniejących modułów: nowe kategorie dokładamy bez regresji. [file:16]
- Dane oddzielone od logiki: CSV/JSON to dane, `core` to obliczenia, `ui` to widoki. [file:16]

## Struktura repo (proponowana)
- /data
  - menu-razdwa-Arkusz1-1.csv  (surowe źródło) [file:16]
  - normalized/ (tu docelowo JSON/TS po normalizacji)
- /src
  - /core
    - parse/ (import CSV → struktury)
    - pricing/ (silnik progów, dopłat, minimów)
    - money/ (formatowanie PLN)
  - /categories
    - (każda kategoria w osobnym pliku, np. solwent-plakaty, vouchery, wizytowki, laminowanie…) [file:16]
  - /ui
    - (formularze i widoki per kategoria)
- /tests
  - (testy progów, minimów, dopłat)

Zasada: moduły w `/src/categories/*` nie mogą edytować siebie nawzajem; współdzielenie wyłącznie przez `/src/core/*`. [file:16]

## Zasady edycji (ważne)
1. Nie zmieniaj istniejących wyników obliczeń, jeśli zadanie nie jest “refactor core”. [file:16]
2. Dodając kategorię, tworzysz nowy plik w `/src/categories/` i dopisujesz rejestrację w jednym miejscu (np. `src/categories/index.ts`). [file:16]
3. Każda zmiana danych musi być śledzona: albo commit do `/data/normalized/*.json`, albo do modułu kategorii, ale zawsze z opisem “z jakiej sekcji CSV”. [file:16]
4. Jeśli CSV ma niejednoznaczność (np. teksty opisowe, uwagi, różne układy tabel), nie “zgaduj” — zostaw TODO i poproś o doprecyzowanie mapowania. [file:16]

## Model danych (docelowy, minimalny)
Silnik ma obsłużyć kilka typów cenników, które w CSV występują równolegle: [file:16]
- Progi ilościowe (np. "1-3 m2", "4-9 m2"...; albo "1 szt, 2 szt..."). [file:16]
- Dopłaty procentowe (np. EXPRESS +20%, papier satynowy +12%). [file:16]
- Minimalna kwota / minimalna powierzchnia (np. “MINIMALKA 1m2!”). [file:16]
- Uwagi tekstowe, które nie wpływają na cenę (mają trafić do UI jako “info”). [file:16]

Proponowane typy (TypeScript-ish):

- PriceTable:
  - id: string
  - title: string
  - unit: "m2" | "szt" | "mb" | "strona" | "format" | "inna"
  - rows: Array<PriceRow>

- PriceRow:
  - min: number
  - max: number | null
  - price: number
  - priceUnit: "per_unit" | "flat"

- Modifier:
  - type: "percent" | "fixed"
  - value: number
  - condition?: string (np. "express", "papier_satynowy")

- Rule:
  - type: "minimum"
  - unit: "m2" | "pln"
  - value: number

## Konwencje nazw kategorii (na podstawie CSV)
Nazwy kategorii i sekcji bierzemy z nagłówków w CSV, np.: [file:16]
- "SOLWENT - PLAKATY" (z minimalną powierzchnią 1m2) [file:16]
- "VOUCHERY - druk cyfrowy" (+ opcja EXPRESS +20%) [file:16]
- "DYPLOMY - druk cyfrowy" (+ opcja EXPRESS +20%) [file:16]
- "WIZYTÓWKI - druk cyfrowy" (różne formaty, warianty foliowania/UV/softtouch) [file:16]
- "LAMINOWANIE" (progi ilościowe dla formatów A3/A4/A5/A6) [file:16]
- i kolejne sekcje typu banner, OWV, wlepki/naklejki, CAD, ulotki, plakaty, oprawy itd. [file:16]

## Jak dodawać nową kategorię (workflow)
1. Wybierz jedną sekcję z CSV (jeden nagłówek) i przenieś ją do:
   - `/data/normalized/<id>.json` (preferowane), albo
   - bezpośrednio do `/src/categories/<id>.ts` jako stałe. [file:16]
2. Zaimplementuj `calculate(input) => result`:
   - input zawiera ilość (np. m2/szt), opcje (express/satyna/format), itd. [file:16]
3. Dodaj testy:
   - co najmniej 3 progi (min, środek, max), oraz 1 przypadek brzegowy. [file:16]
4. Zaktualizuj UI tylko dla tej kategorii (bez globalnych zmian). [file:16]

## Co jest “źródłem prawdy”
- Źródło prawdy cen: CSV w `/data/menu-razdwa-Arkusz1-1.csv`. [file:16]
- Jeśli znormalizujesz dane do JSON, to JSON staje się “prawdą wykonawczą”, ale musi dać się odtworzyć z CSV (opis w commit message). [file:16]
