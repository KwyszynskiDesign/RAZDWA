# Integracja Google Apps Script → Google Sheets

## 1) Utwórz arkusz docelowy
1. Załóż nowy arkusz Google.
2. Nazwij zakładkę np. `orders`.
3. W wierszu 1 utwórz nagłówki (TYLKO te i w tej kolejności):

- Data
- Godzina
- Firma
- Kto dodał
- Imię
- Nazwisko
- NIP
- Telefon
- Email
- Materiał
- jedno/dwustronne
- Produkt
- Ilosc sztuk
- Cena za sztukę
- Uwagi
- Suma (PLN)
- Priorytet
- Ekspres

## 2) Utwórz Apps Script
1. W arkuszu: Rozszerzenia → Apps Script.
2. Wklej poniższy kod do pliku `Code.gs`.
3. Podmień `SHEET_NAME` jeśli używasz innej nazwy zakładki.

```javascript
const SHEET_NAME = 'orders';
const HEADERS = [
  'Data', 'Godzina', 'Firma', 'Kto dodał', 'Imię', 'Nazwisko', 'NIP', 'Telefon', 'Email',
  'Materiał', 'jedno/dwustronne', 'Produkt', 'Ilosc sztuk', 'Cena za sztukę',
  'Uwagi', 'Suma (PLN)', 'Priorytet', 'Ekspres'
];

function ensureSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

  // Synchronizacja nagłówków także dla istniejącego arkusza
  const current = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const same = HEADERS.every((h, i) => String(current[i] || '').trim() === h);
  if (!same) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function normalizeExpress(v) {
  return (v === true || v === 'true' || v === 1 || v === '1' || v === 'TAK' || v === 'TAK ⚡')
    ? 'TAK ⚡'
    : 'NIE';
}

function toNumberOrBlank(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : '';
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}') || {};
    const row = body;

    // Wymagane minimum: telefon
    if (!row['Telefon']) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: false, message: 'Numer telefonu jest wymagany.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const sheet = ensureSheet();

    sheet.appendRow([
      row['Data'] || '',
      row['Godzina'] || '',
      row['Firma'] || '',
      row['Kto dodał'] || '',
      row['Imię'] || '',
      row['Nazwisko'] || '',
      row['NIP'] || '',
      row['Telefon'] || '',
      row['Email'] || '',
      row['Materiał'] || '',
      row['jedno/dwustronne'] || '',
      row['Produkt'] || '',
      toNumberOrBlank(row['Ilosc sztuk']),
      toNumberOrBlank(row['Cena za sztukę']),
      row['Uwagi'] || '',
      toNumberOrBlank(row['Suma (PLN)']),
      row['Priorytet'] || 'Normalny',
      normalizeExpress(row['Ekspres'])
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, message: 'Saved to sheet' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## 3) Wdróż Web App
1. Kliknij **Deploy** → **New deployment**.
2. Typ: **Web app**.
3. Execute as: **Me**.
4. Who has access: **Anyone** (lub Anyone with link).
5. Skopiuj URL kończący się na `/exec`.

## 4) Wklej URL do aplikacji RAZDWA
1. Otwórz kategorię **Ustawienia cen**.
2. Sekcja **Integracja Google Sheets (Apps Script)**:
   - wklej URL Web App,
   - zaznacz „Aktywuj wysyłkę do Apps Script",
   - kliknij „Zapisz i odśwież".

Po tej konfiguracji przycisk „Wyślij do bazy" będzie wysyłał rekord zamówienia do arkusza.

---

## 5) Dodaj obsługę cennika (fragmenty do dopisania w Code.gs)

Dopisz poniższe **bez ingerencji w istniejące funkcje** (`doPost` z `saveOrder` / `saveClick` / `handlePricesUpdate` i wszystko co działa).

### Stałe (dopisz na górze pliku, obok SHEET_NAME)

```javascript
const CENNIK_SHEET_NAME = 'cennik';
const VARIANTS_SHEET_NAME = 'variants';
const CHUNK_SIZE = 400;
```

### Helpery odczytu i zapisu cennika (nowe funkcje, dopisz gdziekolwiek)

```javascript
function ensureCennikSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(CENNIK_SHEET_NAME) || ss.insertSheet(CENNIK_SHEET_NAME);
}

function readCennik() {
  const sheet = ensureCennikSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 1) return {};
  const data = sheet.getRange(1, 1, lastRow, 2).getValues();
  const result = {};
  data.forEach(function(row) {
    const key = String(row[0] || '').trim();
    if (!key) return;
    const val = row[1];
    result[key] = (val === '' || val === null || val === undefined) ? null : Number(val);
  });
  return result;
}

function writeCennik(prices) {
  const sheet = ensureCennikSheet();
  sheet.clearContents();
  const keys = Object.keys(prices);
  if (keys.length === 0) return;
  for (var i = 0; i < keys.length; i += CHUNK_SIZE) {
    const chunk = keys.slice(i, i + CHUNK_SIZE);
    const rows = chunk.map(function(k) {
      const v = prices[k];
      return [k, (v === null || v === undefined) ? '' : v];
    });
    sheet.getRange(i + 1, 1, rows.length, 2).setValues(rows);
  }
}
```

### Helpery odczytu i zapisu wariantów (nowe funkcje, dopisz razem z helperami cennika)

```javascript
function ensureVariantsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(VARIANTS_SHEET_NAME) || ss.insertSheet(VARIANTS_SHEET_NAME);
}

function readVariants() {
  const sheet = ensureVariantsSheet();
  if (sheet.getLastRow() < 1) return [];
  const raw = String(sheet.getRange(1, 1).getValue() || '').trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function writeVariants(variants) {
  const sheet = ensureVariantsSheet();
  sheet.clearContents();
  if (!Array.isArray(variants) || variants.length === 0) return;
  sheet.getRange(1, 1).setValue(JSON.stringify(variants));
}
```

### doGet — obsługa action=getState i action=getPrices (podmiana istniejącej)

`getState` zwraca pełny stan (ceny + warianty) — tego używa aplikacja przy reopen.
`getPrices` jest zachowane dla kompatybilności wstecznej.

```javascript
function doGet(e) {
  try {
    var action = e && e.parameter && e.parameter.action;
    if (action === 'getState') {
      Logger.log('GET getState');
      return ContentService
        .createTextOutput(JSON.stringify({ prices: readCennik(), variants: readVariants() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    if (action === 'getPrices') {
      Logger.log('GET getPrices');
      return ContentService
        .createTextOutput(JSON.stringify(readCennik()))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, message: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

Odpowiedź dla `getState`:
```json
{
  "prices": { "druk-bw-a4-1-5": 0.5, "solwent-150g-1-3": 45, ... },
  "variants": [
    { "key": "zaproszenia-a6-single-normal-200", "categoryId": "zaproszenia", ... },
    ...
  ]
}
```

### Fragment doPost dla prices_update i variants_update (dopisz NA POCZĄTKU istniejącej funkcji doPost)

```javascript
// Dopisz jako pierwszy blok wewnątrz try{} w doPost(e):
const body = JSON.parse((e && e.postData && e.postData.contents) || '{}') || {};

if (body.type === 'prices_update') {
  Logger.log('POST prices_update');
  if (!body.prices || typeof body.prices !== 'object') {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, message: 'Brak pola prices.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  writeCennik(body.prices);
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, message: 'Cennik zapisany.' }))
    .setMimeType(ContentService.MimeType.JSON);
}

if (body.type === 'variants_update') {
  Logger.log('POST variants_update');
  if (!Array.isArray(body.variants)) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, message: 'Brak pola variants.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  writeVariants(body.variants);
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, message: 'Warianty zapisane.' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// tutaj dalej istniejąca logika zamówień (saveOrder, saveClick, itp.) bez zmian
```
