import { describe, it, expect } from 'vitest';
import { parseNumericInput } from '../src/core/numericInput';

describe('parseNumericInput', () => {
  it('parses a comma decimal separator', () => {
    expect(parseNumericInput('12,5')).toBe(12.5);
  });

  it('parses a dot decimal separator', () => {
    expect(parseNumericInput('12.5')).toBe(12.5);
  });

  it('trims surrounding whitespace', () => {
    expect(parseNumericInput(' 7 ')).toBe(7);
  });

  it('rejects negative values by default', () => {
    expect(parseNumericInput('-5')).toBeNull();
  });

  it('rejects zero by default', () => {
    expect(parseNumericInput('0')).toBeNull();
  });

  it('accepts zero when allowZero is set', () => {
    expect(parseNumericInput('0', { allowZero: true })).toBe(0);
  });

  it('rejects negative values even when allowZero is set', () => {
    expect(parseNumericInput('-1', { allowZero: true })).toBeNull();
  });

  it('returns null for empty, null and undefined', () => {
    expect(parseNumericInput('')).toBeNull();
    expect(parseNumericInput(null)).toBeNull();
    expect(parseNumericInput(undefined)).toBeNull();
  });

  it('returns null for non-numeric input', () => {
    expect(parseNumericInput('abc')).toBeNull();
  });

  it('truncates to an integer when integer is set', () => {
    expect(parseNumericInput('3.7', { integer: true })).toBe(3);
  });

  it('rejects values below min', () => {
    expect(parseNumericInput('2', { min: 5 })).toBeNull();
  });

  it('rejects values above max', () => {
    expect(parseNumericInput('20', { max: 10 })).toBeNull();
  });

  it('accepts values within an explicit range', () => {
    expect(parseNumericInput('5', { min: 1, max: 10 })).toBe(5);
  });
});
