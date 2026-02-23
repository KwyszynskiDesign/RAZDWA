// ustawienia.js – panel ustawień cen (plik ES module – bez zmian w logice)
// Logika jest już w docs/categories/ustawienia.js (legacy).
// Ten moduł re-eksportuje to co potrzebne lub inicjalizuje panel gdy strona jest ładowana poza SPA.

export function init() {
  // Ustawienia używają localStorage – logika jest wbudowana w ustawienia.js (legacy script).
  // Przy załadowaniu przez app.js nie jest potrzebna dodatkowa inicjalizacja
  // ponieważ ustawienia.js jest inline w HTML i uruchamia się sam.
}

export function destroy() {}
