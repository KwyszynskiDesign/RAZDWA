/**
 * priceService – warstwa pośrednia dostępu do danych cenowych.
 *
 * Wszystkie moduły kalkulacyjne muszą korzystać z getPrice() / setPrice()
 * zamiast importować config/prices.json bezpośrednio.
 */
import _config from "../../config/prices.json";

let _prices: any = JSON.parse(JSON.stringify(_config));

/**
 * Pobierz wartość cennika po ścieżce z notacją kropkową,
 * np. getPrice("banner"), getPrice("drukCAD.price.color").
 * Zwraca undefined gdy ścieżka nie istnieje.
 */
export function getPrice(path: string): any {
  const keys = path.split(".");
  let obj: any = _prices;
  for (const key of keys) {
    if (obj == null || typeof obj !== "object") return undefined;
    obj = obj[key];
  }
  return obj;
}

/**
 * Ustaw wartość cennika po ścieżce z notacją kropkową.
 * Tworzy pośrednie obiekty w razie potrzeby.
 */
export function setPrice(path: string, value: any): void {
  const keys = path.split(".");
  let obj: any = _prices;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (obj[key] == null || typeof obj[key] !== "object") {
      obj[key] = {};
    }
    obj = obj[key];
  }
  obj[keys[keys.length - 1]] = value;
}

/**
 * Przywróć wszystkie ceny do wartości domyślnych z pliku konfiguracyjnego.
 */
export function resetPrices(): void {
  _prices = JSON.parse(JSON.stringify(_config));
}
