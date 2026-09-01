import { beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_PREFERENCES,
  FONT_SCALES,
  QUALITY_LEVELS,
  applyPreferences,
  loadPreferences,
  sanitizePreferences,
  savePreferences
} from '../../js/platform/preferences.js';

/** Almacenamiento en memoria compatible con la API de localStorage. */
function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key)
  };
}

describe('preferences', () => {
  beforeEach(() => {
    delete document.documentElement.dataset.fontScale;
    delete document.documentElement.dataset.quality;
  });

  it('define tres escalas de texto y tres calidades', () => {
    expect(FONT_SCALES.map((item) => item.value)).toEqual([0.9, 1, 1.12]);
    expect(QUALITY_LEVELS.map((item) => item.id)).toEqual(['low', 'medium', 'high']);
  });

  it('sanea valores desconocidos', () => {
    expect(sanitizePreferences({ fontScale: 'gigante', quality: 'ultra' })).toEqual(DEFAULT_PREFERENCES);
    expect(sanitizePreferences(null)).toEqual(DEFAULT_PREFERENCES);
    expect(sanitizePreferences({ fontScale: 'large', quality: 'low' })).toEqual({ fontScale: 'large', quality: 'low' });
  });

  it('guarda y recupera preferencias', () => {
    const storage = memoryStorage();
    savePreferences({ fontScale: 'small', quality: 'medium' }, storage);
    expect(loadPreferences(storage)).toEqual({ fontScale: 'small', quality: 'medium' });
  });

  it('sobrevive a un almacenamiento corrupto o bloqueado', () => {
    expect(loadPreferences(memoryStorage({ 'ringDeCampeones.preferences': '{no-json' }))).toEqual(DEFAULT_PREFERENCES);
    expect(loadPreferences(null)).toEqual(DEFAULT_PREFERENCES);
    expect(() => savePreferences(DEFAULT_PREFERENCES, null)).not.toThrow();
  });

  it('refleja las preferencias en el elemento html', () => {
    applyPreferences({ fontScale: 'large', quality: 'low' }, document);
    expect(document.documentElement.dataset.fontScale).toBe('large');
    expect(document.documentElement.dataset.quality).toBe('low');
  });
});
