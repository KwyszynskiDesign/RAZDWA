import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const REQUIRED_WIZYTOWKI_KEYS = [
  'wizytowki-85x55-none-150szt',
  'wizytowki-85x55-none-200szt',
  'wizytowki-85x55-none-300szt',
  'wizytowki-85x55-none-400szt',
  'wizytowki-85x55-matt_gloss-150szt',
  'wizytowki-85x55-matt_gloss-200szt',
  'wizytowki-85x55-matt_gloss-300szt',
  'wizytowki-85x55-matt_gloss-400szt',
  'wizytowki-90x50-none-150szt',
  'wizytowki-90x50-none-200szt',
  'wizytowki-90x50-none-300szt',
  'wizytowki-90x50-none-400szt',
  'wizytowki-90x50-matt_gloss-150szt',
  'wizytowki-90x50-matt_gloss-200szt',
  'wizytowki-90x50-matt_gloss-300szt',
  'wizytowki-90x50-matt_gloss-400szt',
];

describe('Ustawienia cen - wizytówki', () => {
  it('zawiera wszystkie progi wizytówek w etykietach widoku ustawień', () => {
    const content = readFileSync(resolve(process.cwd(), 'src/ui/views/ustawienia.ts'), 'utf8');
    REQUIRED_WIZYTOWKI_KEYS.forEach((key) => {
      expect(content).toContain(`"${key}"`);
    });
  });

  it('zawiera wszystkie progi wizytówek w legacy konfiguracji ustawień', () => {
    const content = readFileSync(resolve(process.cwd(), 'docs/categories/ustawienia.js'), 'utf8');
    REQUIRED_WIZYTOWKI_KEYS.forEach((key) => {
      expect(content).toContain(`"${key}"`);
    });
  });
});
