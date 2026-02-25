/**
 * Przykłady użycia PriceService
 * 
 * Ten plik pokazuje różne scenariusze użycia warstwy priceService
 */

import { priceService } from '../src/services/priceService';

// ============================================================================
// PRZYKŁAD 1: Podstawowe pobieranie danych
// ============================================================================

function example1_BasicUsage() {
  console.log('=== PRZYKŁAD 1: Podstawowe użycie ===\n');
  
  // Załaduj dane dla kategorii 'banner'
  const bannerPrices = priceService.loadSync('banner');
  
  console.log('Tytuł kategorii:', bannerPrices.title);
  console.log('Jednostka:', bannerPrices.unit);
  console.log('Liczba materiałów:', bannerPrices.materials.length);
  
  // Wyświetl pierwszy materiał
  const firstMaterial = bannerPrices.materials[0];
  console.log('\nPierwszy materiał:');
  console.log('  ID:', firstMaterial.id);
  console.log('  Nazwa:', firstMaterial.name);
  console.log('  Progi cenowe:', firstMaterial.tiers);
}

// ============================================================================
// PRZYKŁAD 2: Pobieranie zagnieżdżonej wartości
// ============================================================================

function example2_NestedPath() {
  console.log('\n=== PRZYKŁAD 2: Pobieranie przez ścieżkę ===\n');
  
  // Załaduj dane
  priceService.loadSync('banner');
  
  // Pobierz cenę z pierwszego progu pierwszego materiału
  const price = priceService.getPriceByPath('banner.materials.0.tiers.0.price');
  console.log('Cena z pierwszego progu:', price, 'PLN');
  
  // Pobierz nazwę modyfikatora
  const modifierName = priceService.getPriceByPath('banner.modifiers.0.name');
  console.log('Pierwszy modyfikator:', modifierName);
}

// ============================================================================
// PRZYKŁAD 3: Modyfikacja cen w runtime
// ============================================================================

function example3_ModifyPrice() {
  console.log('\n=== PRZYKŁAD 3: Modyfikacja cen ===\n');
  
  // Załaduj dane
  const bannerPrices = priceService.loadSync('banner');
  
  // Wyświetl oryginalną cenę
  const originalPrice = bannerPrices.materials[0].tiers[0].price;
  console.log('Oryginalna cena:', originalPrice, 'PLN');
  
  // Zmień cenę
  bannerPrices.materials[0].tiers[0].price = 60.0;
  priceService.setPrice('banner', bannerPrices);
  
  // Sprawdź zmianę
  const newPrices = priceService.getPrice('banner');
  console.log('Nowa cena:', newPrices.materials[0].tiers[0].price, 'PLN');
  
  // Przywróć oryginalną cenę
  priceService.setPriceByPath('banner.materials.0.tiers.0.price', originalPrice);
  console.log('Przywrócono oryginalną cenę');
}

// ============================================================================
// PRZYKŁAD 4: Sprawdzanie dostępnych kategorii
// ============================================================================

function example4_ListCategories() {
  console.log('\n=== PRZYKŁAD 4: Dostępne kategorie ===\n');
  
  // Załaduj kilka kategorii
  priceService.loadSync('banner');
  priceService.loadSync('laminowanie');
  priceService.loadSync('roll-up');
  
  // Wyświetl listę
  const categories = priceService.getAvailableCategories();
  console.log('Załadowane kategorie:');
  categories.forEach(cat => console.log('  -', cat));
  
  // Sprawdź czy kategoria istnieje
  console.log('\nCzy "banner" jest załadowany?', priceService.hasCategory('banner'));
  console.log('Czy "wizytowki" jest załadowany?', priceService.hasCategory('wizytowki'));
}

// ============================================================================
// PRZYKŁAD 5: Użycie w module kalkulacyjnym (pattern)
// ============================================================================

function example5_CalculationPattern() {
  console.log('\n=== PRZYKŁAD 5: Pattern dla modułu kalkulacyjnego ===\n');
  
  // Symulacja funkcji kalkulacyjnej
  function calculateBannerExample(options: { material: string, areaM2: number }) {
    // 1. Załaduj dane
    const priceData = priceService.loadSync('banner');
    
    // 2. Znajdź odpowiedni materiał
    const material = priceData.materials.find((m: any) => m.id === options.material);
    if (!material) {
      throw new Error(`Nieznany materiał: ${options.material}`);
    }
    
    // 3. Znajdź odpowiedni próg cenowy
    const tier = material.tiers.find((t: any) => 
      options.areaM2 >= t.min && (t.max === null || options.areaM2 <= t.max)
    );
    
    if (!tier) {
      throw new Error('Brak odpowiedniego progu cenowego');
    }
    
    // 4. Oblicz cenę
    const totalPrice = options.areaM2 * tier.price;
    
    return {
      tierPrice: tier.price,
      quantity: options.areaM2,
      totalPrice: totalPrice
    };
  }
  
  // Przykładowe użycie
  const result = calculateBannerExample({
    material: 'powlekany',
    areaM2: 10
  });
  
  console.log('Wynik kalkulacji:');
  console.log('  Cena za m²:', result.tierPrice, 'PLN');
  console.log('  Ilość:', result.quantity, 'm²');
  console.log('  Suma:', result.totalPrice, 'PLN');
}

// ============================================================================
// PRZYKŁAD 6: Bulk operations (operacje zbiorcze)
// ============================================================================

function example6_BulkOperations() {
  console.log('\n=== PRZYKŁAD 6: Operacje zbiorcze ===\n');
  
  // Załaduj wszystkie potrzebne kategorie naraz
  const categories = ['banner', 'laminowanie', 'roll-up', 'solwent-plakaty'];
  
  console.log('Ładowanie kategorii...');
  categories.forEach(cat => {
    try {
      priceService.loadSync(cat);
      console.log(`  ✓ ${cat}`);
    } catch (error) {
      console.log(`  ✗ ${cat} - błąd:`, error);
    }
  });
  
  console.log('\nZaładowano', priceService.getAvailableCategories().length, 'kategorii');
}

// ============================================================================
// PRZYKŁAD 7: Error handling
// ============================================================================

function example7_ErrorHandling() {
  console.log('\n=== PRZYKŁAD 7: Obsługa błędów ===\n');
  
  try {
    // Próba załadowania nieistniejącej kategorii
    priceService.loadSync('nieistniejaca-kategoria');
  } catch (error) {
    console.log('Złapano błąd:', error.message);
  }
  
  // Bezpieczne pobieranie
  const data = priceService.getPrice('banner');
  if (data) {
    console.log('Dane dla "banner" istnieją');
  } else {
    console.log('Dane dla "banner" nie zostały załadowane');
  }
}

// ============================================================================
// URUCHOMIENIE PRZYKŁADÓW
// ============================================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║     Przykłady użycia PriceService                  ║');
  console.log('╚════════════════════════════════════════════════════╝\n');
  
  try {
    example1_BasicUsage();
    example2_NestedPath();
    example3_ModifyPrice();
    example4_ListCategories();
    example5_CalculationPattern();
    example6_BulkOperations();
    example7_ErrorHandling();
    
    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║     ✓ Wszystkie przykłady wykonane pomyślnie      ║');
    console.log('╚════════════════════════════════════════════════════╝\n');
  } catch (error) {
    console.error('\n✗ Błąd podczas wykonywania przykładów:', error);
    process.exit(1);
  }
}

export {
  example1_BasicUsage,
  example2_NestedPath,
  example3_ModifyPrice,
  example4_ListCategories,
  example5_CalculationPattern,
  example6_BulkOperations,
  example7_ErrorHandling
};
