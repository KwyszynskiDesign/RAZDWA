/**
 * Prosty test runner dla weryfikacji refaktoryzacji
 * Uruchamia podstawowe testy bez framework testowego
 */

import { calculateBanner } from '../src/categories/banner';
import { calculateFoliaSzroniona } from '../src/categories/folia-szroniona';
import { quoteLaminowanie } from '../src/categories/laminowanie';
import { calculateRollUp } from '../src/categories/roll-up';
import { calculateSolwentPlakaty } from '../src/categories/solwent-plakaty';
import { quoteUlotkiDwustronne } from '../src/categories/ulotki-cyfrowe-dwustronne';
import { quoteJednostronne } from '../src/categories/ulotki-cyfrowe-jednostronne';
import { calculateWlepki } from '../src/categories/wlepki-naklejki';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function test(name: string, fn: () => void) {
  try {
    fn();
    results.push({ name, passed: true });
    console.log(`✓ ${name}`);
  } catch (error) {
    results.push({ name, passed: false, error: String(error) });
    console.log(`✗ ${name}`);
    console.log(`  Error: ${error}`);
  }
}

function expect(value: any) {
  return {
    toBe(expected: any) {
      if (value !== expected) {
        throw new Error(`Expected ${expected}, got ${value}`);
      }
    },
    toBeCloseTo(expected: number, precision: number = 2) {
      const diff = Math.abs(value - expected);
      const tolerance = Math.pow(10, -precision) / 2;
      if (diff > tolerance) {
        throw new Error(`Expected ${expected} ±${tolerance}, got ${value}`);
      }
    }
  };
}

console.log('\n=== Testing Banner ===\n');

test('Banner: Powlekany 10m2', () => {
  const result = calculateBanner({
    material: 'powlekany',
    areaM2: 10,
    oczkowanie: false
  });
  expect(result.tierPrice).toBe(53.0);
  expect(result.totalPrice).toBe(530.0);
});

test('Banner: Blockout 60m2', () => {
  const result = calculateBanner({
    material: 'blockout',
    areaM2: 60,
    oczkowanie: false
  });
  expect(result.tierPrice).toBe(55.0);
  expect(result.totalPrice).toBe(3300.0);
});

test('Banner: Oczkowanie surcharge', () => {
  const result = calculateBanner({
    material: 'powlekany',
    areaM2: 10,
    oczkowanie: true
  });
  expect(result.totalPrice).toBe(555.0);
});

console.log('\n=== Testing Folia Szroniona ===\n');

test('Folia: Mat 500x500mm', () => {
  const result = calculateFoliaSzroniona({
    widthMm: 500,
    heightMm: 500,
    serviceId: 'mat',
    express: false
  });
  expect(result.totalPrice).toBeCloseTo(150, 0);
});

console.log('\n=== Testing Laminowanie ===\n');

test('Laminowanie: A4 50 szt', () => {
  const result = quoteLaminowanie({
    qty: 50,
    format: 'A4',
    express: false
  });
  expect(result.tierPrice).toBe(1.3);
});

console.log('\n=== Testing Roll-up ===\n');

test('Roll-up: 85x200 full', () => {
  const result = calculateRollUp({
    format: '85x200',
    qty: 1,
    isReplacement: false,
    express: false
  });
  expect(result.totalPrice).toBe(155.0);
});

console.log('\n=== Testing Solwent Plakaty ===\n');

test('Solwent: Plakat 2m2', () => {
  const result = calculateSolwentPlakaty({
    areaM2: 2,
    material: 'Plakat 140g powlekany',
    express: false
  });
  expect(result.tierPrice).toBe(29.0);
});

console.log('\n=== Testing Ulotki Dwustronne ===\n');

test('Ulotki dwustronne: A4 100 szt', () => {
  const result = quoteUlotkiDwustronne({
    qty: 100,
    format: 'A4',
    express: false
  });
  expect(result.totalPrice).toBeCloseTo(55, 0);
});

console.log('\n=== Testing Ulotki Jednostronne ===\n');

test('Ulotki jednostronne: A5 100 szt', () => {
  const result = quoteJednostronne({
    qty: 100,
    format: 'A5',
    express: false
  });
  expect(result.totalPrice).toBeCloseTo(32, 0);
});

console.log('\n=== Testing Wlepki ===\n');

test('Wlepki: White 5m2', () => {
  const result = calculateWlepki({
    groupId: 'white',
    area: 5,
    modifiers: [],
    express: false
  });
  expect(result.tierPrice).toBe(28.0);
});

// Podsumowanie
console.log('\n=== PODSUMOWANIE ===\n');
const passed = results.filter(r => r.passed).length;
const failed = results.filter(r => !r.passed).length;
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total: ${results.length}`);

if (failed > 0) {
  console.log('\nFailed tests:');
  results.filter(r => !r.passed).forEach(r => {
    console.log(`  - ${r.name}: ${r.error}`);
  });
  process.exit(1);
} else {
  console.log('\n✓ All tests passed!');
  process.exit(0);
}
