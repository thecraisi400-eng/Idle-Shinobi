/**
 * Ring de Campeones — Validación defensiva del estado (Paso 3)
 *
 * El guardado vive en el navegador, así que nunca se aceptan números no
 * finitos, recursos negativos, porcentajes fuera de rango ni estructuras que
 * no puedan serializarse con seguridad.
 */

import { GAME_CONFIG } from '../config/game-config.js';
import {
  EQUIPMENT_SLOTS,
  QUALITY_OPTIONS,
  RESOURCE_KEYS,
  STATE_SCHEMA_VERSION,
  STAT_KEYS,
  TEXT_SIZE_OPTIONS
} from './initial-state.js';

const TOP_LEVEL_KEYS = Object.freeze([
  'schemaVersion',
  'profile',
  'progression',
  'resources',
  'baseStats',
  'inventory',
  'equipped',
  'skills',
  'campaign',
  'events',
  'pvp',
  'missions',
  'achievements',
  'shop',
  'loginCalendar',
  'inbox',
  'settings',
  'meta'
]);

const PROFILE_KEYS = Object.freeze(['createdAt', 'heroName', 'classId', 'tutorialDone']);
const PROGRESSION_KEYS = Object.freeze([
  'level',
  'exp',
  'statPoints',
  'skillPoints',
  'chapter',
  'fight',
  'victories',
  'defeats'
]);
const INVENTORY_KEYS = Object.freeze(['capacity', 'equipment', 'materials', 'consumables']);
const SKILLS_KEYS = Object.freeze(['unlocked', 'spent']);
const CAMPAIGN_KEYS = Object.freeze(['currentEnemyId', 'bossWins']);
const EVENTS_KEYS = Object.freeze(['dayKey', 'order', 'progress', 'history']);
const PVP_KEYS = Object.freeze(['activeTournament', 'recentChampions']);
const MISSIONS_KEYS = Object.freeze(['dayKey', 'weekKey', 'daily', 'weekly']);
const ACHIEVEMENTS_KEYS = Object.freeze(['progress', 'claimed']);
const SHOP_KEYS = Object.freeze(['dayKey', 'weekKey', 'offers']);
const LOGIN_KEYS = Object.freeze(['lastClaimKey', 'day']);
const SETTINGS_KEYS = Object.freeze([
  'textSize',
  'quality',
  'reducedMotion',
  'musicVolume',
  'effectsVolume',
  'vibration'
]);
const META_KEYS = Object.freeze(['lastSavedAt', 'playTimeSeconds']);
const PERCENT_STATS = new Set(['criticalChance', 'dodge', 'accuracy', 'criticalResistance', 'criticalNullify']);
const VALID_RESOURCES = new Set(RESOURCE_KEYS);
const VALID_TEXT_SIZES = new Set(TEXT_SIZE_OPTIONS);
const VALID_QUALITIES = new Set(QUALITY_OPTIONS);
const VALID_SLOTS = new Set(EQUIPMENT_SLOTS);
const MAX_SAFE_AMOUNT = Number.MAX_SAFE_INTEGER;

export class StateValidationError extends Error {
  constructor(errors) {
    super(`Estado inválido: ${errors.join('; ')}`);
    this.name = 'StateValidationError';
    this.errors = errors;
  }
}

/**
 * Clona una estructura JSON segura y rechaza funciones, DOM, fechas, NaN,
 * infinitos, undefined, símbolos, BigInt y ciclos.
 * @param {unknown} value
 * @returns {unknown}
 */
export function cloneSerializable(value) {
  const errors = [];
  const clone = cloneSerializableValue(value, '$', new WeakSet(), errors);
  if (errors.length > 0) throw new StateValidationError(errors);
  return clone;
}

/** Congela recursivamente una estructura segura para evitar mutaciones externas. */
export function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return value;
  seen.add(value);
  if (Array.isArray(value)) {
    for (const item of value) deepFreeze(item, seen);
  } else if (isPlainObject(value)) {
    for (const item of Object.values(value)) deepFreeze(item, seen);
  }
  return Object.freeze(value);
}

/** Valida y devuelve un clon limpio del estado. Lanza si hay errores. */
export function cloneAndValidateState(input) {
  const state = cloneSerializable(input);
  const errors = collectStateErrors(state);
  if (errors.length > 0) throw new StateValidationError(errors);
  return state;
}

/** Valida el estado sin lanzar excepciones. */
export function validateGameState(input) {
  try {
    const state = cloneAndValidateState(input);
    return { valid: true, state, errors: [] };
  } catch (error) {
    return {
      valid: false,
      state: null,
      errors: error instanceof StateValidationError ? error.errors : [error.message]
    };
  }
}

/** Comprueba que un nombre de recurso pertenece al estado oficial. */
export function isResourceKey(resource) {
  return VALID_RESOURCES.has(resource);
}

/** Comprueba si una cadena puede guardarse como identificador simple. */
export function isSafeId(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= 96 && !hasControlChars(value);
}

function collectStateErrors(state) {
  const errors = [];

  expectPlainObject(state, '$', errors);
  if (errors.length > 0) return errors;

  expectOnlyKeys(state, '$', TOP_LEVEL_KEYS, errors);
  expectExactInteger(state.schemaVersion, '$.schemaVersion', STATE_SCHEMA_VERSION, errors);

  validateProfile(state.profile, errors);
  validateProgression(state.progression, errors);
  validateResources(state.resources, errors);
  validateBaseStats(state.baseStats, errors);
  validateInventory(state.inventory, errors);
  validateEquipped(state.equipped, errors);
  validateSkills(state.skills, errors);
  validateCampaign(state.campaign, errors);
  validateEvents(state.events, errors);
  validatePvp(state.pvp, errors);
  validateMissions(state.missions, errors);
  validateAchievements(state.achievements, errors);
  validateShop(state.shop, errors);
  validateLoginCalendar(state.loginCalendar, errors);
  expectArray(state.inbox, '$.inbox', errors);
  validateSettings(state.settings, errors);
  validateMeta(state.meta, errors);

  return errors;
}

function validateProfile(profile, errors) {
  if (!expectPlainObject(profile, '$.profile', errors)) return;
  expectOnlyKeys(profile, '$.profile', PROFILE_KEYS, errors);
  expectNonNegativeInteger(profile.createdAt, '$.profile.createdAt', errors);
  expectString(profile.heroName, '$.profile.heroName', errors, { min: 1, max: 40 });
  expectNullableId(profile.classId, '$.profile.classId', errors);
  expectBoolean(profile.tutorialDone, '$.profile.tutorialDone', errors);
}

function validateProgression(progression, errors) {
  if (!expectPlainObject(progression, '$.progression', errors)) return;
  expectOnlyKeys(progression, '$.progression', PROGRESSION_KEYS, errors);
  expectIntegerInRange(progression.level, '$.progression.level', 1, GAME_CONFIG.MAX_LEVEL, errors);
  expectNonNegativeInteger(progression.exp, '$.progression.exp', errors);
  expectNonNegativeInteger(progression.statPoints, '$.progression.statPoints', errors);
  expectNonNegativeInteger(progression.skillPoints, '$.progression.skillPoints', errors);
  expectPositiveInteger(progression.chapter, '$.progression.chapter', errors);
  expectPositiveInteger(progression.fight, '$.progression.fight', errors);
  expectNonNegativeInteger(progression.victories, '$.progression.victories', errors);
  expectNonNegativeInteger(progression.defeats, '$.progression.defeats', errors);
}

function validateResources(resources, errors) {
  if (!expectPlainObject(resources, '$.resources', errors)) return;
  expectOnlyKeys(resources, '$.resources', RESOURCE_KEYS, errors);
  for (const key of RESOURCE_KEYS) expectNonNegativeInteger(resources[key], `$.resources.${key}`, errors);
}

function validateBaseStats(stats, errors) {
  if (!expectPlainObject(stats, '$.baseStats', errors)) return;
  expectOnlyKeys(stats, '$.baseStats', STAT_KEYS, errors);
  for (const key of STAT_KEYS) {
    if (PERCENT_STATS.has(key)) expectPercentage(stats[key], `$.baseStats.${key}`, errors);
    else expectNonNegativeFinite(stats[key], `$.baseStats.${key}`, errors);
  }
  if (stats.health <= 0) errors.push('$.baseStats.health debe ser mayor que 0');
  if (stats.accuracy <= 0) errors.push('$.baseStats.accuracy debe ser mayor que 0');
}

function validateInventory(inventory, errors) {
  if (!expectPlainObject(inventory, '$.inventory', errors)) return;
  expectOnlyKeys(inventory, '$.inventory', INVENTORY_KEYS, errors);
  expectNonNegativeInteger(inventory.capacity, '$.inventory.capacity', errors);
  expectArray(inventory.equipment, '$.inventory.equipment', errors);
  validateMaterialBag(inventory.materials, errors);
  expectArray(inventory.consumables, '$.inventory.consumables', errors);

  if (Array.isArray(inventory.equipment) && Array.isArray(inventory.consumables) && Number.isInteger(inventory.capacity)) {
    const occupied = inventory.equipment.length + inventory.consumables.length;
    if (occupied > inventory.capacity) {
      errors.push(`$.inventory supera su capacidad (${occupied}/${inventory.capacity})`);
    }
  }
}

function validateMaterialBag(materials, errors) {
  if (!expectPlainObject(materials, '$.inventory.materials', errors)) return;
  for (const [materialId, amount] of Object.entries(materials)) {
    if (!isSafeId(materialId)) errors.push(`$.inventory.materials contiene un identificador inválido: ${materialId}`);
    expectNonNegativeInteger(amount, `$.inventory.materials.${materialId}`, errors);
  }
}

function validateEquipped(equipped, errors) {
  if (!expectPlainObject(equipped, '$.equipped', errors)) return;
  expectOnlyKeys(equipped, '$.equipped', EQUIPMENT_SLOTS, errors);
  for (const slot of EQUIPMENT_SLOTS) {
    if (!VALID_SLOTS.has(slot)) errors.push(`Hueco de equipo desconocido: ${slot}`);
    expectNullableId(equipped[slot], `$.equipped.${slot}`, errors);
  }
}

function validateSkills(skills, errors) {
  if (!expectPlainObject(skills, '$.skills', errors)) return;
  expectOnlyKeys(skills, '$.skills', SKILLS_KEYS, errors);
  expectPlainObject(skills.unlocked, '$.skills.unlocked', errors);
  expectNonNegativeInteger(skills.spent, '$.skills.spent', errors);
}

function validateCampaign(campaign, errors) {
  if (!expectPlainObject(campaign, '$.campaign', errors)) return;
  expectOnlyKeys(campaign, '$.campaign', CAMPAIGN_KEYS, errors);
  expectNullableId(campaign.currentEnemyId, '$.campaign.currentEnemyId', errors);
  expectNonNegativeInteger(campaign.bossWins, '$.campaign.bossWins', errors);
}

function validateEvents(events, errors) {
  if (!expectPlainObject(events, '$.events', errors)) return;
  expectOnlyKeys(events, '$.events', EVENTS_KEYS, errors);
  expectNullableId(events.dayKey, '$.events.dayKey', errors);
  expectStringArray(events.order, '$.events.order', errors);
  expectPlainObject(events.progress, '$.events.progress', errors);
  expectArray(events.history, '$.events.history', errors);
}

function validatePvp(pvp, errors) {
  if (!expectPlainObject(pvp, '$.pvp', errors)) return;
  expectOnlyKeys(pvp, '$.pvp', PVP_KEYS, errors);
  if (pvp.activeTournament !== null) expectPlainObject(pvp.activeTournament, '$.pvp.activeTournament', errors);
  expectArray(pvp.recentChampions, '$.pvp.recentChampions', errors);
}

function validateMissions(missions, errors) {
  if (!expectPlainObject(missions, '$.missions', errors)) return;
  expectOnlyKeys(missions, '$.missions', MISSIONS_KEYS, errors);
  expectNullableId(missions.dayKey, '$.missions.dayKey', errors);
  expectNullableId(missions.weekKey, '$.missions.weekKey', errors);
  expectArray(missions.daily, '$.missions.daily', errors);
  expectArray(missions.weekly, '$.missions.weekly', errors);
}

function validateAchievements(achievements, errors) {
  if (!expectPlainObject(achievements, '$.achievements', errors)) return;
  expectOnlyKeys(achievements, '$.achievements', ACHIEVEMENTS_KEYS, errors);
  expectPlainObject(achievements.progress, '$.achievements.progress', errors);
  expectStringArray(achievements.claimed, '$.achievements.claimed', errors);
}

function validateShop(shop, errors) {
  if (!expectPlainObject(shop, '$.shop', errors)) return;
  expectOnlyKeys(shop, '$.shop', SHOP_KEYS, errors);
  expectNullableId(shop.dayKey, '$.shop.dayKey', errors);
  expectNullableId(shop.weekKey, '$.shop.weekKey', errors);
  expectArray(shop.offers, '$.shop.offers', errors);
}

function validateLoginCalendar(calendar, errors) {
  if (!expectPlainObject(calendar, '$.loginCalendar', errors)) return;
  expectOnlyKeys(calendar, '$.loginCalendar', LOGIN_KEYS, errors);
  expectNullableId(calendar.lastClaimKey, '$.loginCalendar.lastClaimKey', errors);
  expectNonNegativeInteger(calendar.day, '$.loginCalendar.day', errors);
}

function validateSettings(settings, errors) {
  if (!expectPlainObject(settings, '$.settings', errors)) return;
  expectOnlyKeys(settings, '$.settings', SETTINGS_KEYS, errors);
  if (!VALID_TEXT_SIZES.has(settings.textSize)) errors.push('$.settings.textSize no es válido');
  if (!VALID_QUALITIES.has(settings.quality)) errors.push('$.settings.quality no es válido');
  expectBoolean(settings.reducedMotion, '$.settings.reducedMotion', errors);
  expectPercentage(settings.musicVolume, '$.settings.musicVolume', errors);
  expectPercentage(settings.effectsVolume, '$.settings.effectsVolume', errors);
  expectBoolean(settings.vibration, '$.settings.vibration', errors);
}

function validateMeta(meta, errors) {
  if (!expectPlainObject(meta, '$.meta', errors)) return;
  expectOnlyKeys(meta, '$.meta', META_KEYS, errors);
  expectNonNegativeInteger(meta.lastSavedAt, '$.meta.lastSavedAt', errors);
  expectNonNegativeFinite(meta.playTimeSeconds, '$.meta.playTimeSeconds', errors);
}

function cloneSerializableValue(value, path, seen, errors) {
  if (value === null) return null;

  const type = typeof value;
  if (type === 'string' || type === 'boolean') return value;
  if (type === 'number') {
    if (!Number.isFinite(value)) errors.push(`${path} debe ser un número finito`);
    return value;
  }
  if (type === 'undefined' || type === 'function' || type === 'symbol' || type === 'bigint') {
    errors.push(`${path} contiene un valor no serializable (${type})`);
    return null;
  }

  if (seen.has(value)) {
    errors.push(`${path} contiene una referencia circular`);
    return null;
  }
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item, index) => cloneSerializableValue(item, `${path}[${index}]`, seen, errors));
  }

  if (!isPlainObject(value)) {
    errors.push(`${path} debe ser un objeto plano serializable`);
    return null;
  }

  const output = {};
  for (const [key, item] of Object.entries(value)) {
    output[key] = cloneSerializableValue(item, `${path}.${key}`, seen, errors);
  }
  return output;
}

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function expectPlainObject(value, path, errors) {
  if (!isPlainObject(value)) {
    errors.push(`${path} debe ser un objeto plano`);
    return false;
  }
  return true;
}

function expectOnlyKeys(object, path, allowedKeys, errors) {
  if (!isPlainObject(object)) return;
  const allowed = new Set(allowedKeys);
  for (const key of Object.keys(object)) {
    if (!allowed.has(key)) errors.push(`${path}.${key} no pertenece al esquema`);
  }
  for (const key of allowedKeys) {
    if (!Object.prototype.hasOwnProperty.call(object, key)) errors.push(`${path}.${key} es obligatorio`);
  }
}

function expectArray(value, path, errors) {
  if (!Array.isArray(value)) {
    errors.push(`${path} debe ser una lista`);
    return false;
  }
  return true;
}

function expectStringArray(value, path, errors) {
  if (!expectArray(value, path, errors)) return;
  for (const [index, item] of value.entries()) expectString(item, `${path}[${index}]`, errors, { min: 1, max: 96 });
}

function expectString(value, path, errors, { min = 0, max = 500 } = {}) {
  if (typeof value !== 'string') {
    errors.push(`${path} debe ser texto`);
    return false;
  }
  if (value.length < min || value.length > max) errors.push(`${path} debe tener entre ${min} y ${max} caracteres`);
  if (hasControlChars(value)) errors.push(`${path} contiene caracteres de control`);
  return true;
}

function expectNullableId(value, path, errors) {
  if (value === null) return true;
  if (!isSafeId(value)) {
    errors.push(`${path} debe ser null o un identificador válido`);
    return false;
  }
  return true;
}

function expectBoolean(value, path, errors) {
  if (typeof value !== 'boolean') errors.push(`${path} debe ser booleano`);
}

function expectExactInteger(value, path, expected, errors) {
  if (value !== expected) errors.push(`${path} debe ser ${expected}`);
}

function expectPositiveInteger(value, path, errors) {
  expectIntegerInRange(value, path, 1, MAX_SAFE_AMOUNT, errors);
}

function expectNonNegativeInteger(value, path, errors) {
  expectIntegerInRange(value, path, 0, MAX_SAFE_AMOUNT, errors);
}

function expectIntegerInRange(value, path, min, max, errors) {
  if (!Number.isInteger(value) || value < min || value > max) {
    errors.push(`${path} debe ser entero entre ${min} y ${max}`);
  }
}

function expectNonNegativeFinite(value, path, errors) {
  if (!Number.isFinite(value) || value < 0) errors.push(`${path} debe ser número finito no negativo`);
}

function expectPercentage(value, path, errors) {
  if (!Number.isFinite(value) || value < 0 || value > 1) errors.push(`${path} debe estar entre 0 y 1`);
}

function hasControlChars(value) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 31 || code === 127) return true;
  }
  return false;
}
