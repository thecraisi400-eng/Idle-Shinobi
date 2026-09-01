/**
 * Ring de Campeones — Persistencia segura en localStorage (Paso 3)
 *
 * Guarda en dos ranuras (`current` y `backup`) y verifica lo escrito antes de
 * considerarlo válido. La suma de comprobación detecta daños accidentales; no
 * pretende ser una defensa real contra trampas porque el juego no tiene servidor.
 */

import { GAME_CONFIG } from '../config/game-config.js';
import { createInitialState } from './initial-state.js';
import { migrateSave } from './migrations.js';
import { cloneAndValidateState } from './validators.js';

export const SAVE_ENVELOPE_VERSION = 1;
export const RESET_CONFIRMATION_TEXT = 'REINICIAR';
export const STORAGE_KEYS = GAME_CONFIG.STORAGE_KEYS;

export class SaveStorageError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'SaveStorageError';
    this.cause = cause;
  }
}

/** Carga `current`, cae a `backup` y, si todo falla, crea un estado nuevo. */
export function loadGameState({ storage = safeStorage(), now = Date.now() } = {}) {
  const timestamp = resolveNow(now);
  if (!storage) {
    return {
      ok: true,
      hasSave: false,
      source: 'initial',
      recovered: false,
      state: createInitialState(timestamp),
      errors: []
    };
  }

  const currentRaw = safeGetItem(storage, STORAGE_KEYS.CURRENT_SAVE);
  const current = readStateFromRaw(currentRaw, { now: timestamp });
  if (current.ok) {
    if (current.needsRewrite) saveGameState(current.state, { storage, now: timestamp });
    return {
      ok: true,
      hasSave: true,
      source: 'current',
      recovered: false,
      state: current.state,
      errors: []
    };
  }

  const backupRaw = safeGetItem(storage, STORAGE_KEYS.BACKUP_SAVE);
  const backup = readStateFromRaw(backupRaw, { now: timestamp });
  if (backup.ok) {
    // Restaurar `current` sin machacar el respaldo válido con el JSON corrupto.
    writeCurrentSlot(backup.state, { storage, now: timestamp, updateBackup: false });
    return {
      ok: true,
      hasSave: true,
      source: 'backup',
      recovered: true,
      state: backup.state,
      errors: [current.error].filter(Boolean)
    };
  }

  return {
    ok: true,
    hasSave: false,
    source: 'initial',
    recovered: false,
    state: createInitialState(timestamp),
    errors: [current.error, backup.error].filter(Boolean)
  };
}

/** Guarda un estado validado y conserva una copia anterior como respaldo. */
export function saveGameState(state, { storage = safeStorage(), now = Date.now(), updateBackup = true } = {}) {
  if (!storage) {
    return {
      ok: false,
      state: null,
      error: new SaveStorageError('localStorage no está disponible.')
    };
  }

  try {
    const clean = prepareStateForSave(state, { now });
    return writeCurrentSlot(clean, { storage, now: clean.meta.lastSavedAt, updateBackup });
  } catch (error) {
    return {
      ok: false,
      state: null,
      error: error instanceof Error ? error : new SaveStorageError('No se pudo preparar el guardado.', error)
    };
  }
}

/** Devuelve un resumen seguro del guardado disponible, sin modificar storage. */
export function getSavedGameSummary(storage = safeStorage(), { now = Date.now() } = {}) {
  const timestamp = resolveNow(now);
  if (!storage) return { hasSave: false, source: 'none', level: 0, heroName: null, updatedAt: null, schemaVersion: null };

  const current = readStateFromRaw(safeGetItem(storage, STORAGE_KEYS.CURRENT_SAVE), { now: timestamp });
  if (current.ok) return summarizeState(current.state, 'current');

  const backup = readStateFromRaw(safeGetItem(storage, STORAGE_KEYS.BACKUP_SAVE), { now: timestamp });
  if (backup.ok) return summarizeState(backup.state, 'backup');

  return { hasSave: false, source: 'none', level: 0, heroName: null, updatedAt: null, schemaVersion: null };
}

/** Comprueba si hay una partida recuperable en `current` o `backup`. */
export function hasSavedGame(storage = safeStorage()) {
  return getSavedGameSummary(storage).hasSave;
}

/** Crea un texto exportable del estado actual. */
export function exportGameState(state, { now = Date.now(), pretty = true } = {}) {
  const clean = prepareStateForSave(state, { now });
  const envelope = createSaveEnvelope(clean);
  return JSON.stringify(envelope, null, pretty ? 2 : 0);
}

/** Analiza una importación en memoria. No toca el guardado actual. */
export function parseImportedGameState(rawImport, { now = Date.now() } = {}) {
  try {
    const parsed = typeof rawImport === 'string' ? JSON.parse(rawImport) : rawImport;
    const state = unwrapAndValidateParsedSave(parsed, { now: resolveNow(now) }).state;
    return { ok: true, state, summary: summarizeState(state, 'import'), error: null };
  } catch (error) {
    return {
      ok: false,
      state: null,
      summary: null,
      error: error instanceof Error ? error : new SaveStorageError('Importación inválida.', error)
    };
  }
}

/** Reemplaza el guardado actual por un estado ya confirmado por el usuario. */
export function replaceSaveWithImportedState(state, { storage = safeStorage(), now = Date.now() } = {}) {
  return saveGameState(state, { storage, now });
}

/** Genera un estado nuevo sólo si la confirmación escrita es exacta. */
export function createResetState(confirmation, { now = Date.now() } = {}) {
  if (confirmation !== RESET_CONFIRMATION_TEXT) {
    throw new SaveStorageError(`Para reiniciar debes escribir ${RESET_CONFIRMATION_TEXT}.`);
  }
  return createInitialState(resolveNow(now));
}

/** Devuelve un identificador persistente por instalación. */
export function getInstallationId(storage = safeStorage()) {
  const existing = safeGetItem(storage, STORAGE_KEYS.INSTALLATION_ID);
  if (isSafeInstallationId(existing)) return existing;

  const generated = createInstallationId();
  try {
    storage?.setItem(STORAGE_KEYS.INSTALLATION_ID, generated);
  } catch {
    /* si falla, se devuelve igualmente para esta sesión */
  }
  return generated;
}

/** Suma de comprobación no criptográfica para detectar daños accidentales. */
export function checksumText(text) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function prepareStateForSave(state, { now }) {
  const clean = cloneAndValidateState(state);
  clean.meta.lastSavedAt = resolveNow(now);
  return cloneAndValidateState(clean);
}

function writeCurrentSlot(state, { storage, now, updateBackup }) {
  const previous = safeGetItem(storage, STORAGE_KEYS.CURRENT_SAVE);
  const raw = JSON.stringify(createSaveEnvelope(state));

  try {
    if (updateBackup && previous) storage.setItem(STORAGE_KEYS.BACKUP_SAVE, previous);
    storage.setItem(STORAGE_KEYS.CURRENT_SAVE, raw);

    const verification = readStateFromRaw(storage.getItem(STORAGE_KEYS.CURRENT_SAVE), { now });
    if (!verification.ok) throw verification.error;

    return { ok: true, state: verification.state, raw, error: null };
  } catch (error) {
    try {
      if (updateBackup && previous) {
        storage.setItem(STORAGE_KEYS.BACKUP_SAVE, previous);
        storage.setItem(STORAGE_KEYS.CURRENT_SAVE, previous);
      }
    } catch {
      /* el respaldo ya se intentó conservar; no ocultamos el error original */
    }

    return {
      ok: false,
      state,
      raw: null,
      error: error instanceof Error ? error : new SaveStorageError('No se pudo escribir el guardado.', error)
    };
  }
}

function readStateFromRaw(raw, { now }) {
  if (!raw) {
    return { ok: false, state: null, needsRewrite: false, error: new SaveStorageError('No existe guardado.') };
  }

  try {
    const parsed = JSON.parse(raw);
    return unwrapAndValidateParsedSave(parsed, { now });
  } catch (error) {
    return {
      ok: false,
      state: null,
      needsRewrite: false,
      error: error instanceof Error ? error : new SaveStorageError('No se pudo leer el guardado.', error)
    };
  }
}

function unwrapAndValidateParsedSave(parsed, { now }) {
  const envelope = unwrapEnvelope(parsed);
  const migrated = migrateSave(envelope.state, { now });
  const state = cloneAndValidateState(migrated);

  return {
    ok: true,
    state,
    needsRewrite: !envelope.wasEnvelope || envelope.schemaVersion !== state.schemaVersion,
    error: null
  };
}

function unwrapEnvelope(parsed) {
  if (isPlainObject(parsed) && (parsed.envelopeVersion !== undefined || parsed.state !== undefined || parsed.checksum !== undefined)) {
    if (parsed.envelopeVersion !== SAVE_ENVELOPE_VERSION) {
      throw new SaveStorageError('Versión de envoltorio de guardado no soportada.');
    }
    if (!Object.prototype.hasOwnProperty.call(parsed, 'state')) {
      throw new SaveStorageError('El envoltorio no incluye estado.');
    }

    const stateJson = JSON.stringify(parsed.state);
    if (typeof parsed.checksum !== 'string' || parsed.checksum !== checksumText(stateJson)) {
      throw new SaveStorageError('La suma de comprobación del guardado no coincide.');
    }

    return {
      wasEnvelope: true,
      schemaVersion: parsed.state?.schemaVersion ?? null,
      state: parsed.state
    };
  }

  return {
    wasEnvelope: false,
    schemaVersion: parsed?.schemaVersion ?? null,
    state: parsed
  };
}

function createSaveEnvelope(state) {
  const stateJson = JSON.stringify(state);
  return {
    envelopeVersion: SAVE_ENVELOPE_VERSION,
    savedAt: state.meta.lastSavedAt,
    checksum: checksumText(stateJson),
    state
  };
}

function summarizeState(state, source) {
  return {
    hasSave: true,
    source,
    level: state.progression.level,
    heroName: state.profile.heroName,
    updatedAt: state.meta.lastSavedAt,
    schemaVersion: state.schemaVersion
  };
}

function safeGetItem(storage, key) {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function safeStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function resolveNow(now) {
  const value = typeof now === 'function' ? now() : now;
  return Number.isFinite(value) && value >= 0 ? Math.floor(value) : Date.now();
}

function createInstallationId() {
  try {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  } catch {
    /* fallback determinista no requerido */
  }
  return `rdc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function isSafeInstallationId(value) {
  return typeof value === 'string' && value.length >= 8 && value.length <= 128 && !hasControlChars(value);
}

function hasControlChars(value) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 31 || code === 127) return true;
  }
  return false;
}

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
