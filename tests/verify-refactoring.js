/**
 * Prosty skrypt weryfikacyjny - sprawdza czy moduły poprawnie importują priceService
 * Uruchom: node tests/verify-refactoring.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== Weryfikacja Refaktoryzacji PriceService ===\n');

// Sprawdź czy pliki nie zawierają bezpośrednich importów JSON

const categoryFiles = [
  'src/categories/banner.ts',
  'src/categories/folia-szroniona.ts',
  'src/categories/laminowanie.ts',
  'src/categories/plakaty.ts',
  'src/categories/roll-up.ts',
  'src/categories/solwent-plakaty.ts',
  'src/categories/ulotki-cyfrowe-dwustronne.ts',
  'src/categories/ulotki-cyfrowe-jednostronne.ts',
  'src/categories/wlepki-naklejki.ts'
];

let allPassed = true;

console.log('Sprawdzam pliki kategorii...\n');

const rootDir = path.join(__dirname, '..');

categoryFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Sprawdź czy nie ma bezpośrednich importów JSON
  const hasDirectJsonImport = /import.*from\s+["'].*\.json["']/.test(content);
  
  // Sprawdź czy ma import priceService
  const hasPriceService = /import.*priceService.*from.*priceService/.test(content);
  
  // Sprawdź czy używa priceService.loadSync() lub getPrice()
  const usesPriceService = /priceService\.(loadSync|getPrice)/.test(content);
  
  const status = !hasDirectJsonImport && hasPriceService && usesPriceService;
  
  if (status) {
    console.log(`✓ ${file}`);
  } else {
    console.log(`✗ ${file}`);
    if (hasDirectJsonImport) console.log(`  - Zawiera bezpośredni import JSON`);
    if (!hasPriceService) console.log(`  - Brak importu priceService`);
    if (!usesPriceService) console.log(`  - Nie używa priceService`);
    allPassed = false;
  }
});

console.log('\n=== Sprawdzam plik priceService.ts ===\n');

const priceServicePath = path.join(rootDir, 'src/services/priceService.ts');
if (fs.existsSync(priceServicePath)) {
  console.log('✓ Plik priceService.ts istnieje');
  
  const content = fs.readFileSync(priceServicePath, 'utf-8');
  
  // Sprawdź kluczowe metody
  const hasGetPrice = content.includes('getPrice(');
  const hasSetPrice = content.includes('setPrice(');
  const hasLoadSync = content.includes('loadSync(');
  
  if (hasGetPrice) console.log('✓ Metoda getPrice() obecna');
  else { console.log('✗ Brak metody getPrice()'); allPassed = false; }
  
  if (hasSetPrice) console.log('✓ Metoda setPrice() obecna');
  else { console.log('✗ Brak metody setPrice()'); allPassed = false; }
  
  if (hasLoadSync) console.log('✓ Metoda loadSync() obecna');
  else { console.log('✗ Brak metody loadSync()'); allPassed = false; }
} else {
  console.log('✗ Plik priceService.ts nie istnieje');
  allPassed = false;
}

console.log('\n=== WYNIK ===\n');

if (allPassed) {
  console.log('✓ Refaktoryzacja przebiegła pomyślnie!');
  console.log('✓ Wszystkie moduły używają priceService');
  console.log('✓ Brak bezpośrednich importów JSON');
  process.exit(0);
} else {
  console.log('✗ Refaktoryzacja wymaga poprawek');
  process.exit(1);
}
