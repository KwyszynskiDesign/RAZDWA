# Ustawienia cen - Podział na kategorie

## Implementacja
Dodano system zakładek/kategorii w panelu ustawień cen, który pozwala na łatwiejsze zarządzanie cenami poprzez grupowanie ich w logiczne kategorie.

## Kategorie

### 📄 Druk A4/A3
- Druk czarno-biały A4/A3 (wszystkie przedziały)
- Druk kolorowy A4/A3 (wszystkie przedziały)
- E-mail
- Modyfikator zadruku >25%

### 🖨️ Druk CAD
- Druk CAD kolorowy (formatowy i metr bieżący)
- Druk CAD czarno-biały (formatowy i metr bieżący)

### 📸 Skanowanie
- Skanowanie automatyczne (podajnik)
- Skanowanie ręczne (szyba)

### 🔲 Introligatornia
- Laminowanie A3, A4, A5, A6
- Wszystkie przedziały ilościowe

### 🖼️ Solwent - Plakaty
- Papier 150g półmat
- Papier 200g połysk
- Wszystkie przedziały m²

### 🎌 Banner
- Banner powlekany
- Banner blockout
- Oczkowanie

### 📜 Roll-up
- Wszystkie rozmiary (85x200, 100x200, 120x200, 150x200)
- Wymiana labor
- Wymiana m²

### ❄️ Folia szroniona
- Wydruk
- Oklejanie

### 🏷️ Wlepki / Naklejki
- Po obrysie (folia)
- Polipropylen
- Standard folia
- Modyfikatory (arkusze, pojedyncze, mocny klej)

### 💼 Wizytówki
- Rozmiary 85×55 i 90×50
- Z/bez foliowania
- Wszystkie przedziały nakładowe

### 🎟️ Vouchery
- Ceny bazowe
- Modyfikatory

### ⚙️ Modyfikatory globalne
- Satyna (+12%)
- EXPRESS (+20%)
- EXPRESS Vouchery (+30%)
- Vouchery dwustronne
- Vouchery 300g

### 📋 Wszystkie
- Wyświetla wszystkie pozycje (widok oryginalny)

## Funkcjonalność

### Zakładki
- Przełączanie między kategoriami jednym kliknięciem
- Licznik pozycji w każdej kategorii, np. "📄 Druk A4/A3 (28)"
- Aktywna kategoria podświetlona na niebiesko
- Hover effect na nieaktywnych zakładkach

### Dodawanie pozycji
- Przycisk "Dodaj pozycję" automatycznie dodaje prefix odpowiedni dla aktywnej kategorii
- Np. w kategorii "Druk A4/A3" nowa pozycja dostanie prefix `druk-bw-`
- W kategorii "Wszystkie" bez prefixa

### Filtrowanie
- Tabela pokazuje tylko pozycje z aktywnej kategorii
- Prefiks kategorii jest sprawdzany automatycznie (np. `druk-bw-`, `skan-`, `banner-`)
- Pusta kategoria pokazuje komunikat "Brak pozycji w tej kategorii"

### Zachowanie zmian
- Zmiany cen są zapisywane w localStorage
- Liczniki w zakładkach aktualizują się po dodaniu/usunięciu pozycji
- Przywracanie domyślnych cen zachowuje aktualnie wybraną kategorię

## Pliki zmienione
- `docs/categories/ustawienia.html` - dodano kontener na zakładki
- `docs/categories/ustawienia.js` - logika kategorii, filtrowania i renderowania zakładek

## Kompatybilność wsteczna
✅ Zachowana - wszystkie istniejące klucze cen działają bez zmian
✅ Widok "Wszystkie" zachowuje oryginalną funkcjonalność
✅ Struktura localStorage bez zmian

## UX Improvements
- 📊 Łatwiejsze zarządzanie dużą liczbą cen
- 🎯 Szybkie odnajdywanie konkretnej kategorii
- 📈 Wizualna hierarchia i grupowanie
- 🔢 Liczniki pokazują ile pozycji jest w każdej kategorii
