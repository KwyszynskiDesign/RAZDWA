/**
 * /src/services/priceService.ts
 * Centralized service for managing pricing data
 * 
 * Zasady:
 * - Wszystkie moduły kalkulacyjne muszą używać tego serwisu
 * - Brak bezpośredniego importu JSON w modułach
 * - Spójność danych zapewniona przez pojedynczy punkt dostępu
 */

interface PriceData {
  [key: string]: any;
}

class PriceService {
  private priceCache: Map<string, PriceData> = new Map();
  private initialized: boolean = false;

  /**
   * Ładuje wszystkie dane cenowe
   * Wywoływane przy starcie aplikacji
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const priceFiles = [
      'banner',
      'dyplomy',
      'folia-szroniona',
      'laminowanie',
      'roll-up',
      'solwent-plakaty',
      'solwent-plakaty-200g',
      'ulotki-cyfrowe-dwustronne',
      'ulotki-cyfrowe-jednostronne',
      'vouchery',
      'wizytowki-druk-cyfrowy',
      'wlepki-naklejki',
      'zaproszenia-kreda'
    ];

    for (const file of priceFiles) {
      try {
        const data = await import(`../../data/normalized/${file}.json`);
        this.priceCache.set(file, data.default || data);
      } catch (error) {
        console.warn(`Failed to load price data for ${file}:`, error);
      }
    }

    this.initialized = true;
  }

  /**
   * Pobiera dane cenowe dla określonej kategorii
   * @param category - Nazwa kategorii (np. 'banner', 'dyplomy')
   * @returns Dane cenowe lub null jeśli nie znaleziono
   */
  getPrice(category: string): PriceData | null {
    if (!this.initialized) {
      throw new Error('PriceService not initialized. Call initialize() first.');
    }

    return this.priceCache.get(category) || null;
  }

  /**
   * Pobiera zagnieżdżoną wartość z danych cenowych
   * @param path - Ścieżka do wartości (np. 'banner.materials.0.tiers')
   * @returns Wartość lub null jeśli nie znaleziono
   */
  getPriceByPath(path: string): any {
    const parts = path.split('.');
    const category = parts[0];
    const data = this.getPrice(category);

    if (!data) return null;

    let current: any = data;
    for (let i = 1; i < parts.length; i++) {
      if (current === null || current === undefined) return null;
      current = current[parts[i]];
    }

    return current;
  }

  /**
   * Ustawia nową wartość ceny
   * @param category - Nazwa kategorii
   * @param value - Nowa wartość danych cenowych
   */
  setPrice(category: string, value: PriceData): void {
    this.priceCache.set(category, value);
  }

  /**
   * Ustawia zagnieżdżoną wartość w danych cenowych
   * @param path - Ścieżka do wartości (np. 'banner.materials.0.tiers.0.price')
   * @param value - Nowa wartość
   */
  setPriceByPath(path: string, value: any): void {
    const parts = path.split('.');
    const category = parts[0];
    const data = this.getPrice(category);

    if (!data) {
      throw new Error(`Category ${category} not found`);
    }

    let current: any = data;
    for (let i = 1; i < parts.length - 1; i++) {
      if (current[parts[i]] === undefined) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }

    current[parts[parts.length - 1]] = value;
    this.setPrice(category, data);
  }

  /**
   * Sprawdza czy kategoria istnieje
   * @param category - Nazwa kategorii
   * @returns true jeśli kategoria istnieje
   */
  hasCategory(category: string): boolean {
    return this.priceCache.has(category);
  }

  /**
   * Pobiera listę wszystkich dostępnych kategorii
   * @returns Lista nazw kategorii
   */
  getAvailableCategories(): string[] {
    return Array.from(this.priceCache.keys());
  }

  /**
   * Czyści cache (przydatne w testach)
   */
  clearCache(): void {
    this.priceCache.clear();
    this.initialized = false;
  }

  /**
   * Ładuje dane synchronicznie (dla kompatybilności wstecznej)
   * @param category - Nazwa kategorii
   * @returns Dane cenowe
   */
  loadSync(category: string): PriceData {
    try {
      const data = require(`../../data/normalized/${category}.json`);
      this.priceCache.set(category, data);
      return data;
    } catch (error) {
      throw new Error(`Failed to load price data for ${category}: ${error}`);
    }
  }
}

// Singleton instance
export const priceService = new PriceService();

// Export class for testing purposes
export { PriceService };
