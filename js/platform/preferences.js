/**
 * Ring de Campeones — Preferencias de presentación (Paso 2)
 *
 * Sólo guarda ajustes de pantalla (escala de texto y calidad visual).
 * El guardado de la partida es independiente y se define en el Paso 3.
 */

const PREFERENCES_KEY = 'ringDeCampeones.preferences';

export const FONT_SCALES = Object.freeze([
  { id: 'small', label: 'Pequeño', value: 0.9 },
  { id: 'normal', label: 'Normal', value: 1 },
  { id: 'large', label: 'Grande', value: 1.12 }
]);

export const QUALITY_LEVELS = Object.freeze([
  { id: 'low', label: 'Baja' },
  { id: 'medium', label: 'Media' },
  { id: 'high', label: 'Alta' }
]);

export const DEFAULT_PREFERENCES = Object.freeze({
  fontScale: 'normal',
  quality: 'high'
});

const VALID_FONT_SCALES = new Set(FONT_SCALES.map((item) => item.id));
const VALID_QUALITIES = new Set(QUALITY_LEVELS.map((item) => item.id));

/** Normaliza cualquier objeto de preferencias a valores válidos. */
export function sanitizePreferences(input) {
  const source = input && typeof input === 'object' ? input : {};
  return {
    fontScale: VALID_FONT_SCALES.has(source.fontScale) ? source.fontScale : DEFAULT_PREFERENCES.fontScale,
    quality: VALID_QUALITIES.has(source.quality) ? source.quality : DEFAULT_PREFERENCES.quality
  };
}

/** Lee las preferencias del almacenamiento local sin lanzar excepciones. */
export function loadPreferences(storage = safeStorage()) {
  try {
    const raw = storage?.getItem(PREFERENCES_KEY);
    return sanitizePreferences(raw ? JSON.parse(raw) : null);
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

/** Guarda las preferencias; devuelve las preferencias saneadas. */
export function savePreferences(preferences, storage = safeStorage()) {
  const clean = sanitizePreferences(preferences);
  try {
    storage?.setItem(PREFERENCES_KEY, JSON.stringify(clean));
  } catch {
    /* almacenamiento lleno o bloqueado: la sesión continúa igualmente */
  }
  return clean;
}

/** Refleja las preferencias en el elemento <html> para que las use el CSS. */
export function applyPreferences(preferences, documentRef = document) {
  const clean = sanitizePreferences(preferences);
  const root = documentRef?.documentElement;
  if (root) {
    root.dataset.fontScale = clean.fontScale;
    root.dataset.quality = clean.quality;
  }
  return clean;
}

function safeStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

export { PREFERENCES_KEY };
