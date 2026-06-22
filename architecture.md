# architecture.md

## Cel systemu
[Krótki opis architektury i celu technicznego]

## Stack
- Frontend: [np. WordPress / React / Elementor]
- Backend: [np. Node.js / PHP]
- Baza danych: [np. MySQL / PostgreSQL]
- Automatyzacje: [np. Google Apps Script / Make / n8n]
- Integracje: [np. API, webhooki, płatności]

## Struktura
- `src/` — kod aplikacji
- `docs/` — dokumentacja
- `tests/` — testy
- `assets/` — pliki statyczne
- `scripts/` — narzędzia pomocnicze

## Zasady architektoniczne
- Jedna odpowiedzialność na moduł.
- Logika biznesowa oddzielona od prezentacji.
- Komponenty mają być reużywalne.
- Integracje zewnętrzne izolowane w osobnych warstwach.
- Najpierw prosty przepływ, potem rozszerzenia.

## Flow danych
1. Użytkownik wykonuje akcję.
2. Warstwa UI przekazuje dane.
3. Logika waliduje dane.
4. Backend / automatyzacja przetwarza żądanie.
5. Wynik wraca do UI lub kolejnej usługi.

## Endpoint Google Apps Script (source of truth)
Endpoint backendu GAS jest konfiguracją **build-time**, nie runtime. Flow: GitHub Secret `GOOGLE_APPS_SCRIPT_URL` → esbuild `define` (`scripts/build.mjs`) → stała `CURRENT_APPS_SCRIPT_URL` w `orderExportService.ts` → zapieczona w bundlu `docs/assets/app.js`. Runtime override w localStorage (`razdwa_order_export_config`) istnieje i jest walidowany (`isValidGasUrl`: `https://script.google.com/.../exec`), lecz nie jest podłączony do UI — panel Ustawień nie ustawia URL.

## Granice odpowiedzialności
- UI odpowiada za prezentację.
- Logika odpowiada za reguły biznesowe.
- Integracje odpowiadają za komunikację z zewnętrznymi systemami.
- Automatyzacje odpowiadają za powtarzalne procesy.

## Gotchas
- [tu wpisz typowe błędy]
- [tu wpisz ograniczenia stacku]
- [tu wpisz rzeczy, których nie wolno robić]

## Decyzje architektoniczne
- [decyzja 1]
- [decyzja 2]
- [decyzja 3]