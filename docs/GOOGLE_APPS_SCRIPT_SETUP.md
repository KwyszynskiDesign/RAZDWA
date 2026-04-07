# Integracja Google Apps Script → Google Sheets

## 1) Utwórz arkusz docelowy
1. Załóż nowy arkusz Google.
2. Nazwij zakładkę np. `orders`.
3. W wierszu 1 utwórz nagłówki (TYLKO te i w tej kolejności):

- Data
- Godzina
- Firma
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
  'Data', 'Godzina', 'Firma', 'Imię', 'Nazwisko', 'NIP', 'Telefon', 'Email',
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
   - zaznacz „Aktywuj wysyłkę do Apps Script”,
   - kliknij „Zapisz i odśwież”.

Po tej konfiguracji przycisk „Wyślij do bazy” będzie wysyłał rekord zamówienia do arkusza.
