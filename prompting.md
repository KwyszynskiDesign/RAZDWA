# Prompting.md

## Cel

Ten plik opisuje, jak pisać prompty do Claude Code i podobnych narzędzi, aby były szybkie, precyzyjne i mało kosztowne.

## Zasada główna

Każdy prompt ma jasno określać:

- co budujemy,
- po co to budujemy,
- jaki ma być efekt końcowy,
- jaki jest zakres,
- czego nie robić,
- jaki format odpowiedzi jest oczekiwany.

## Dobry prompt zawiera

- Cel.
- Kontekst.
- Ograniczenia.
- Oczekiwany rezultat.
- Pliki lub ścieżki, jeśli są istotne.
- Kryteria jakości.
- Priorytety.

## Jak pisać prompty

- Bądź konkretny.
- Unikaj ogólników.
- Używaj krótkich zdań.
- Podawaj nazwy plików i zakres zadania.
- Gdy zadanie jest złożone, najpierw proś o plan.
- Nie wrzucaj całego repozytorium do kontekstu.
- Nie mieszaj kilku zadań naraz, jeśli nie trzeba.

## Wzór promptu

Cel:
[co ma powstać]

Kontekst:
[gdzie to się dzieje i dlaczego]

Zakres:
[co dokładnie ma być zrobione]

Ograniczenia:
[czyli czego nie robić]

Oczekiwany format:
[plan / kod / lista kroków / analiza]

Kryterium sukcesu:
[po czym poznajemy, że zadanie jest wykonane dobrze]

## Praca z Claude Code

- Najpierw plan, potem implementacja.
- Najpierw logika, potem kod.
- Jeśli trzeba, każ poprosić o doprecyzowanie braków.
- Preferuj małe iteracje zamiast jednego dużego strzału.
- Po każdej większej zmianie sprawdzaj, czy wynik dalej zgadza się z celem.

## Anty-wzorce

- „Zrób to lepiej”.
- „Napraw wszystko”.
- „Ogarnij cały projekt”.
- „Ulepsz UX”.
- „Zmień kod, żeby działał lepiej”.

Zamiast tego:

- wskaż plik,
- wskaż problem,
- wskaż oczekiwany efekt,
- wskaż ograniczenia.
