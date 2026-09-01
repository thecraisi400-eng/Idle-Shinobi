import { describe, expect, it } from 'vitest';
import { formatDateTime, formatDuration, formatFullNumber, formatNumber, formatPercent } from '../../js/core/formatters.js';

describe('formatters', () => {
  it('formatea números compactos', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(999)).toBe('999');
    expect(formatNumber(1200)).toBe('1.2K');
    expect(formatNumber(120000)).toBe('120K');
    expect(formatNumber(1_500_000)).toBe('1.5M');
    expect(formatNumber(-2500)).toBe('-2.5K');
  });

  it('tolera valores inválidos', () => {
    expect(formatNumber(NaN)).toBe('0');
    expect(formatNumber(undefined)).toBe('0');
    expect(formatFullNumber('x')).toBe('0');
  });

  it('formatea números completos en español', () => {
    expect(formatFullNumber(120000).replace(/\u00a0/g, ' ')).toMatch(/120[.\s]000/);
  });

  it('formatea porcentajes', () => {
    expect(formatPercent(0.125)).toBe('12,5 %');
    expect(formatPercent(0.2)).toBe('20 %');
  });

  it('formatea duraciones', () => {
    expect(formatDuration(0)).toBe('00:00');
    expect(formatDuration(75)).toBe('01:15');
    expect(formatDuration(3671)).toBe('1:01:11');
  });

  it('formatea fechas y protege valores inválidos', () => {
    expect(formatDateTime(Number.NaN)).toBe('—');
    expect(formatDateTime(new Date('2026-09-01T06:00:00Z'))).toMatch(/2026/);
  });
});
