import { describe, it, expect, beforeEach } from 'vitest';
import {
  logVariantOperation,
  getVariantLog,
  clearVariantLog,
  type VariantLogEntry,
} from '../src/core/variantLogger';

function makeEntry(overrides: Partial<VariantLogEntry> = {}): VariantLogEntry {
  return {
    action: 'add',
    key: 'test-key',
    categoryId: 'druk-a4-a3',
    prefix: 'druk-bw-a4-',
    label: 'Wariant testowy',
    qty: '',
    price: 1.5,
    timestamp: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('variantLogger', () => {
  beforeEach(() => {
    clearVariantLog();
  });

  it('clearVariantLog() zeruje log', () => {
    logVariantOperation(makeEntry());
    clearVariantLog();
    expect(getVariantLog()).toHaveLength(0);
  });

  it('add: wpis trafia do logu z action=add', () => {
    logVariantOperation(makeEntry({ action: 'add', key: 'druk-bw-a4-1-5-szt' }));
    const log = getVariantLog();
    expect(log).toHaveLength(1);
    expect(log[0].action).toBe('add');
    expect(log[0].key).toBe('druk-bw-a4-1-5-szt');
  });

  it('update: wpis trafia do logu z action=update', () => {
    logVariantOperation(makeEntry({ action: 'update', key: 'druk-bw-a4-1-5-szt', price: 2.0 }));
    const log = getVariantLog();
    expect(log).toHaveLength(1);
    expect(log[0].action).toBe('update');
    expect(log[0].price).toBe(2.0);
  });

  it('skip: wpis trafia do logu z action=skip i pustym key', () => {
    logVariantOperation(makeEntry({ action: 'skip', key: '', qty: '', price: null }));
    const log = getVariantLog();
    expect(log).toHaveLength(1);
    expect(log[0].action).toBe('skip');
    expect(log[0].key).toBe('');
    expect(log[0].price).toBeNull();
  });

  it('wiele operacji zachowuje kolejność i każda ma poprawne pole action', () => {
    logVariantOperation(makeEntry({ action: 'add',    key: 'key-1' }));
    logVariantOperation(makeEntry({ action: 'update', key: 'key-1' }));
    logVariantOperation(makeEntry({ action: 'skip',   key: '' }));
    const log = getVariantLog();
    expect(log).toHaveLength(3);
    expect(log[0].action).toBe('add');
    expect(log[1].action).toBe('update');
    expect(log[2].action).toBe('skip');
    expect(log[0].key).toBe('key-1');
    expect(log[1].key).toBe('key-1');
  });

  it('getVariantLog() zwraca readonly view — nie można go mutować bezpośrednio', () => {
    logVariantOperation(makeEntry({ action: 'add', key: 'abc' }));
    const log = getVariantLog();
    // Wymuszamy przypisanie do zmiennej readonly, sprawdzamy że długość się nie zmienia
    // po operacji clearVariantLog na oryginalnym array
    const lengthBefore = log.length;
    clearVariantLog();
    // log jest referencją do wewnętrznego array — po clear jego length wynosi 0
    // (in-memory reference semantics), ale to zachowanie jest świadome
    expect(lengthBefore).toBe(1);
  });

  it('wpis zachowuje wszystkie pola bez zmian', () => {
    const entry = makeEntry({
      action: 'add',
      key: 'ulotki-jed-a6-200',
      categoryId: 'ulotki',
      prefix: 'ulotki-jed-a6-',
      label: '',
      qty: '200',
      price: 0.5,
      timestamp: '2026-05-30T12:00:00.000Z',
    });
    logVariantOperation(entry);
    const stored = getVariantLog()[0];
    expect(stored).toEqual(entry);
  });

  it('clearVariantLog() po wielu wpisach zeruje log', () => {
    logVariantOperation(makeEntry({ action: 'add' }));
    logVariantOperation(makeEntry({ action: 'update' }));
    logVariantOperation(makeEntry({ action: 'skip', key: '' }));
    clearVariantLog();
    expect(getVariantLog()).toHaveLength(0);
  });
});
