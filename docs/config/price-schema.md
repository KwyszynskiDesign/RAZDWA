# Price Schema — specyfikacja danych

## 1. Format JSON importu

Plik importu to obiekt `PriceDatabaseSnapshot` (zdefiniowany w `price-schema.ts`):

```json
{
  "version": 1,
  "exportedAt": "2026-06-11T10:00:00.000Z",
  "records": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "category": "druk",
      "subcategory": "bw-a4",
      "label": "Druk czarno-biały A4",
      "qtyFrom": 1,
      "qtyTo": 5,
      "unit": "szt",
      "price": 0.90,
      "isActive": true,
      "createdAt": "2026-06-11T10:00:00.000Z",
      "updatedAt": "2026-06-11T10:00:00.000Z",
      "syncedAt": null,
      "_dirty": false,
      "_deleted": false
    }
  ],
  "modifiers": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "key": "modifier-express",
      "label": "Ekspres (+20%)",
      "modifierType": "percent",
      "value": 0.20,
      "appliesTo": "all",
      "isActive": true,
      "createdAt": "2026-06-11T10:00:00.000Z",
      "updatedAt": "2026-06-11T10:00:00.000Z",
      "syncedAt": null,
      "_dirty": false,
      "_deleted": false
    }
  ]
}
```

### Reguły formatu

- `id` — UUID v4, generowany lokalnie w momencie tworzenia rekordu
- `qtyTo: null` — brak górnej granicy ilości (tier "5000+")
- `price` — wartość w PLN; dla modyfikatorów `"percent"` jest ułamkiem dziesiętnym (0.20 = 20%)
- `_dirty`, `_deleted`, `syncedAt` — pola wewnętrzne; w imporcie mogą być `false`/`null`
- `version: 1` — wersja schematu; inkrementowana przy breaking changes

---

## 2. Schemat arkusza GAS — `Cennik`

Jeden arkusz GAS o nazwie **`Cennik`** dla `PriceRecord`, drugi o nazwie **`Modifikatory`** dla `Modifier`.

### Arkusz `Cennik`

| Kolumna | Typ       | Klucz unikalności | Opis |
|---------|-----------|:-----------------:|------|
| `id`    | String    | **TAK**           | UUID — klucz główny; nie może się powtórzyć |
| `category` | String | nie | np. `druk`, `wizytowki`, `laminowanie` |
| `subcategory` | String | nie | np. `bw-a4`, `85x55-none` |
| `label` | String | nie | Ludzka nazwa pozycji |
| `qtyFrom` | Number | nie | Dolna granica ilości (włącznie) |
| `qtyTo` | Number lub puste | nie | Górna granica; puste komórka = brak limitu (null) |
| `unit` | String | nie | `szt`, `m2`, `cm`, `mb`, `arkusz`, `strona`, `zestaw` |
| `price` | Number | nie | Cena w PLN |
| `isActive` | Boolean (`TRUE`/`FALSE`) | nie | Czy pozycja jest aktywna |
| `createdAt` | ISO 8601 String | nie | Timestamp utworzenia |
| `updatedAt` | ISO 8601 String | nie | Timestamp ostatniej zmiany — używany do rozwiązywania konfliktów |
| `syncedAt` | ISO 8601 String lub puste | nie | Timestamp potwierdzenia przez GAS |
| `_deleted` | Boolean (`TRUE`/`FALSE`) | nie | Soft delete — wiersz zostaje, ale jest oznaczony jako usunięty |

Wiersz nagłówkowy (row 1) jest zawsze obecny. Dane od row 2.

### Arkusz `Modifikatory`

| Kolumna | Typ | Klucz unikalności | Opis |
|---------|-----|:-----------------:|------|
| `id` | String | **TAK** | UUID |
| `key` | String | **TAK** | Unikalny slug, np. `modifier-express` |
| `label` | String | nie | Ludzka nazwa |
| `modifierType` | String | nie | `percent` lub `flat` |
| `value` | Number | nie | Ułamek dziesiętny dla `percent`; PLN dla `flat` |
| `appliesTo` | String | nie | `all` lub nazwa kategorii |
| `isActive` | Boolean | nie | |
| `createdAt` | ISO 8601 String | nie | |
| `updatedAt` | ISO 8601 String | nie | |
| `syncedAt` | ISO 8601 String lub puste | nie | |
| `_deleted` | Boolean | nie | |

---

## 3. Reguła rozwiązywania konfliktów

**Last-write-wins po `updatedAt`.**

Gdy ten sam rekord (ten sam `id`) istnieje zarówno lokalnie w IndexedDB jak i w GAS:

1. Porównaj wartości pola `updatedAt` (ISO 8601 — porównywalny leksykograficznie).
2. Wygrywa rekord z nowszym `updatedAt`.
3. Nowszy rekord nadpisuje starszy w całości — brak merge'owania pól częściowych.
4. Jeśli `updatedAt` jest identyczne — wygrywa wersja z GAS (traktowana jako autorytatywna).

### Sync payload (klient → GAS)

```json
{
  "action": "upsert_prices",
  "records": [ /* PriceRecord[] — tylko te z _dirty: true */ ],
  "modifiers": [ /* Modifier[] — tylko te z _dirty: true */ ],
  "clientTimestamp": "2026-06-11T10:05:00.000Z"
}
```

GAS odpowiada:

```json
{
  "ok": true,
  "processed": ["id1", "id2"],
  "conflicts": [
    {
      "id": "id3",
      "winner": "server",
      "serverUpdatedAt": "2026-06-11T10:04:59.000Z"
    }
  ]
}
```

Klient po otrzymaniu `processed` — ustawia `_dirty: false` i `syncedAt: now` dla tych rekordów.  
Klient po otrzymaniu `conflicts` — pobiera wersję serwerową i nadpisuje lokalną.

---

## 4. Mapowanie legacy → PriceRecord

Przykłady jak klucze z `DEFAULT_PRICES` mapują się na rekordy:

| Stary klucz | `category` | `subcategory` | `qtyFrom` | `qtyTo` | `unit` |
|-------------|------------|---------------|-----------|---------|--------|
| `druk-bw-a4-1-5` | `druk` | `bw-a4` | 1 | 5 | `szt` |
| `druk-bw-a4-5000+` | `druk` | `bw-a4` | 5000 | null | `szt` |
| `druk-cad-kolor-fmt-a1` | `drukCAD` | `kolor-fmt-a1` | 1 | null | `szt` |
| `laminowanie-a4-1-50` | `laminowanie` | `a4` | 1 | 50 | `szt` |
| `wizytowki-85x55-none-100szt` | `wizytowki` | `85x55-none` | 100 | 100 | `szt` |
| `modifier-express` | — | — | — | — | — |
| `modifier-satyna` | — | — | — | — | — |

Modyfikatory (`modifier-*`) trafiają do osobnej kolekcji `Modifier`, nie do `PriceRecord`.
