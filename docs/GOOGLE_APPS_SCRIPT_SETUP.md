# Integracja Google Apps Script → Google Sheets

## 1) Utwórz arkusz docelowy
1. Załóż nowy arkusz Google.
2. Nazwij zakładkę np. `orders`.
3. W wierszu 1 utwórz nagłówki:

- createdAt
- customerName
- customerPhone
- customerEmail
- priority
- notes
- itemsCount
- total
- hasExpress
- rawJson

## 2) Utwórz Apps Script
1. W arkuszu: Rozszerzenia → Apps Script.
2. Wklej poniższy kod do pliku `Code.gs`.
3. Podmień `SHEET_NAME` jeśli używasz innej nazwy zakładki.

```javascript
const SHEET_NAME = 'orders';

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    const createdAt = body.createdAt || new Date().toISOString();
    const customer = body.customer || {};
    const summary = body.summary || {};

    sheet.appendRow([
      createdAt,
      customer.name || '',
      customer.phone || '',
      customer.email || '',
      customer.priority || '',
      customer.notes || '',
      summary.itemsCount || 0,
      summary.total || 0,
      summary.hasExpress ? 'TAK' : 'NIE',
      JSON.stringify(body)
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
