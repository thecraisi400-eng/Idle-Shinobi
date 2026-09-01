/**
 * Ring de Campeones — Migraciones de guardado (Paso 3)
 *
 * Las versiones nunca se saltan. Hoy el esquema oficial es v1, pero dejamos el
 * carril preparado para v1 → v2 → v3 cuando el juego crezca.
 */

import { GAME_CONFIG } from '../config/game-config.js';
import { createInitialState, RESOURCE_KEYS, STATE_SCHEMA_VERSION } from './initial-state.js';
import { cloneSerializable, isSafeId } from './validators.js';

export class SaveMigrationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SaveMigrationError';
  }
}

/** Migraciones secuenciales futuras: la clave es la versión de origen. */
export const MIGRATIONS = Object.freeze({});

/**
 * Convierte cualquier guardado soportado al esquema actual.
 * @param {unknown} rawSave Objeto ya parseado desde JSON.
 * @param {{now?: number}} [options]
 * @returns {object}
 */
export function migrateSave(rawSave, { now = Date.now() } = {}) {
  const save = cloneSerializable(rawSave);
  if (!isPlainObject(save)) throw new SaveMigrationError('El guardado debe ser un objeto.');

  let version = readSchemaVersion(save);
  let state = save;

  if (version === 0) {
    state = migrateLegacyToV1(save, now);
    version = 1;
  }

  if (version > STATE_SCHEMA_VERSION) {
    throw new SaveMigrationError(`El guardado es de una versión futura (${version}).`);
  }

  while (version < STATE_SCHEMA_VERSION) {
    const migrate = MIGRATIONS[version];
    if (typeof migrate !== 'function') {
      throw new SaveMigrationError(`No existe migración desde v${version}.`);
    }
    state = migrate(state);
    version = readSchemaVersion(state);
  }

  return state;
}

/** Devuelve true si el objeto parece un prototipo antiguo recuperable. */
export function isLegacySave(rawSave) {
  return (
    isPlainObject(rawSave) &&
    rawSave.schemaVersion === undefined &&
    (rawSave.hero !== undefined || rawSave.level !== undefined || rawSave.progression !== undefined || rawSave.resources !== undefined)
  );
}

function readSchemaVersion(save) {
  if (Number.isInteger(save.schemaVersion)) return save.schemaVersion;
  if (isLegacySave(save)) return 0;
  throw new SaveMigrationError('El guardado no incluye schemaVersion válido.');
}

function migrateLegacyToV1(legacy, now) {
  const state = createInitialState(now);

  const level = firstDefined(legacy?.progression?.level, legacy?.hero?.level, legacy?.level);
  if (level !== undefined) state.progression.level = expectLegacyInteger(level, 'level', 1, GAME_CONFIG.MAX_LEVEL);

  const exp = firstDefined(legacy?.progression?.exp, legacy?.hero?.exp, legacy?.exp);
  if (exp !== undefined) state.progression.exp = expectLegacyInteger(exp, 'exp', 0, Number.MAX_SAFE_INTEGER);

  const heroName = firstDefined(legacy?.profile?.heroName, legacy?.hero?.name, legacy?.heroName);
  if (heroName !== undefined) {
    if (!isSafeText(heroName, 1, 40)) throw new SaveMigrationError('Nombre de héroe inválido en guardado antiguo.');
    state.profile.heroName = heroName;
  }

  const classId = firstDefined(legacy?.profile?.classId, legacy?.hero?.classId, legacy?.classId);
  if (classId !== undefined) {
    if (classId !== null && !isSafeId(classId)) throw new SaveMigrationError('Clase inválida en guardado antiguo.');
    state.profile.classId = classId;
  }

  const resources = isPlainObject(legacy.resources) ? legacy.resources : legacy;
  for (const key of RESOURCE_KEYS) {
    if (resources[key] !== undefined) {
      state.resources[key] = expectLegacyInteger(resources[key], key, 0, Number.MAX_SAFE_INTEGER);
    }
  }

  if (isPlainObject(legacy.settings)) {
    if (legacy.settings.textSize !== undefined) state.settings.textSize = legacy.settings.textSize;
    if (legacy.settings.quality !== undefined) state.settings.quality = legacy.settings.quality;
  }

  state.meta.lastSavedAt = now;
  return state;
}

function expectLegacyInteger(value, label, min, max) {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new SaveMigrationError(`Valor antiguo inválido para ${label}.`);
  }
  return value;
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined);
}

function isSafeText(value, min, max) {
  return typeof value === 'string' && value.length >= min && value.length <= max && !hasControlChars(value);
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
