/**
 * Ring de Campeones — Store central y acciones atómicas (Paso 3)
 *
 * `dispatch(action)` es el único punto de escritura. Cada acción trabaja sobre
 * un clon validado; si falla una comprobación o el guardado inmediato falla,
 * el estado anterior queda intacto.
 */

import { createInitialState, QUALITY_OPTIONS, RESOURCE_KEYS, TEXT_SIZE_OPTIONS } from './initial-state.js';
import { CLASSES } from '../config/classes.js';
import { createResetState, saveGameState } from './persistence.js';
import { cloneAndValidateState, cloneSerializable, deepFreeze, isResourceKey, isSafeId } from './validators.js';

const SETTINGS_KEYS = Object.freeze([
  'textSize',
  'quality',
  'reducedMotion',
  'musicVolume',
  'effectsVolume',
  'vibration'
]);
const BOOLEAN_SETTINGS = new Set(['reducedMotion', 'vibration']);
const PERCENT_SETTINGS = new Set(['musicVolume', 'effectsVolume']);
const VALID_TEXT_SIZES = new Set(TEXT_SIZE_OPTIONS);
const VALID_QUALITIES = new Set(QUALITY_OPTIONS);
const SAVE_MODES = Object.freeze({
  IMMEDIATE: 'immediate',
  DEFERRED: 'deferred',
  NONE: 'none'
});

export class GameStoreError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'GameStoreError';
    this.cause = cause;
  }
}

/**
 * @param {Object} [options]
 * @param {object} [options.initialState]
 * @param {Storage|null} [options.storage]
 * @param {boolean} [options.autosave]
 * @param {number} [options.saveDelayMs]
 * @param {number|(() => number)} [options.now]
 */
export function createGameStore({
  initialState = createInitialState(),
  storage = safeStorage(),
  autosave = true,
  saveDelayMs = 300,
  now = Date.now
} = {}) {
  let state = freezeState(initialState);
  const listeners = new Set();
  let saveTimer = null;

  function notify(action, previous) {
    for (const listener of listeners) listener(state, action, previous);
  }

  function commit(nextState, action, saveMode) {
    const previous = state;
    let clean = cloneAndValidateState(nextState);

    if (saveMode === SAVE_MODES.IMMEDIATE) {
      clean.meta.lastSavedAt = resolveNow(now);
      clean = cloneAndValidateState(clean);
      const saved = autosave ? saveGameState(clean, { storage, now: clean.meta.lastSavedAt }) : { ok: true, state: clean };
      if (!saved.ok) throw new GameStoreError('No se pudo guardar la acción atómica.', saved.error);
      state = freezeState(saved.state);
      notify(action, previous);
      return getState();
    }

    state = freezeState(clean);
    notify(action, previous);

    if (saveMode === SAVE_MODES.DEFERRED) scheduleSave();
    return getState();
  }

  function scheduleSave() {
    if (!autosave || saveDelayMs < 0) return;
    if (saveTimer !== null) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveTimer = null;
      flushSave();
    }, saveDelayMs);
  }

  function dispatch(action) {
    if (!action || typeof action !== 'object' || typeof action.type !== 'string') {
      throw new GameStoreError('La acción debe ser un objeto con type.');
    }

    const saveMode = resolveSaveMode(action);
    const draft = cloneAndValidateState(state);
    const timestamp = resolveNow(now);
    let next = draft;

    switch (action.type) {
      case 'game/new':
        next = createInitialState(timestamp);
        if (action.settings !== undefined) applySettingsPatch(next, action.settings);
        break;
      case 'game/reset':
        next = createResetState(action.confirmation, { now: timestamp });
        break;
      case 'game/replace':
        next = cloneAndValidateState(action.state);
        break;
      case 'profile/setHeroName':
        applyHeroName(next, action.heroName);
        break;
      case 'profile/selectClass':
        applyClassSelection(next, action.classId);
        break;
      case 'profile/completeTutorial':
        completeTutorial(next);
        break;
      case 'resources/add':
        applyResourceDelta(next, readResourceAmounts(action, { requirePositive: true }), 1);
        break;
      case 'resources/spend':
        applyResourceSpend(next, readCost(action));
        break;
      case 'rewards/grant':
        applyReward(next, action);
        break;
      case 'settings/update':
        applySettingsPatch(next, action.settings);
        break;
      case 'meta/addPlayTime':
        next.meta.playTimeSeconds = safeAdd(next.meta.playTimeSeconds, readPositiveFinite(action.seconds, 'seconds'));
        break;
      default:
        throw new GameStoreError(`Acción desconocida: ${action.type}`);
    }

    return commit(next, action, saveMode);
  }

  function getState() {
    return cloneAndValidateState(state);
  }

  function flushSave() {
    if (saveTimer !== null) {
      clearTimeout(saveTimer);
      saveTimer = null;
    }
    if (!autosave) return { ok: true, state: getState(), error: null };

    const clean = cloneAndValidateState(state);
    clean.meta.lastSavedAt = resolveNow(now);
    const result = saveGameState(clean, { storage, now: clean.meta.lastSavedAt });
    if (result.ok) {
      const previous = state;
      state = freezeState(result.state);
      notify({ type: 'store/flushed' }, previous);
    }
    return result;
  }

  return {
    getState,
    dispatch,
    flushSave,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    replaceState(nextState, { persist = true } = {}) {
      return commit(nextState, { type: 'game/replace' }, persist ? SAVE_MODES.IMMEDIATE : SAVE_MODES.NONE);
    },
    destroy() {
      if (saveTimer !== null) clearTimeout(saveTimer);
      saveTimer = null;
      listeners.clear();
    }
  };
}

function freezeState(input) {
  return deepFreeze(cloneAndValidateState(input));
}

function resolveSaveMode(action) {
  if (action.persist === false) return SAVE_MODES.NONE;
  if (action.persist === 'deferred' || action.type === 'meta/addPlayTime') return SAVE_MODES.DEFERRED;
  return SAVE_MODES.IMMEDIATE;
}

function readResourceAmounts(action, { requirePositive }) {
  const source = action.amounts ?? (action.resource ? { [action.resource]: action.amount } : null);
  if (!source || typeof source !== 'object') throw new GameStoreError('La acción debe indicar cantidades de recursos.');

  let amounts;
  try {
    amounts = cloneSerializable(source);
  } catch (error) {
    throw new GameStoreError('La cantidad de recursos no es serializable.', error);
  }
  if (!amounts || typeof amounts !== 'object' || Array.isArray(amounts)) {
    throw new GameStoreError('La acción debe indicar cantidades de recursos.');
  }

  const output = {};
  let total = 0;
  for (const [resource, amount] of Object.entries(amounts)) {
    if (!isResourceKey(resource)) throw new GameStoreError(`Recurso desconocido: ${resource}`);
    if (!Number.isInteger(amount) || amount < 0) throw new GameStoreError(`Cantidad inválida para ${resource}.`);
    if (amount > 0) total += amount;
    output[resource] = amount;
  }
  if (requirePositive && total <= 0) throw new GameStoreError('La cantidad debe ser mayor que cero.');
  return output;
}

function readCost(action) {
  return readResourceAmounts({ amounts: action.cost ?? action.amounts }, { requirePositive: true });
}

function applyResourceDelta(state, amounts, sign) {
  for (const key of RESOURCE_KEYS) {
    const amount = amounts[key] ?? 0;
    if (amount === 0) continue;
    state.resources[key] = safeAdd(state.resources[key], amount * sign);
    if (state.resources[key] < 0) throw new GameStoreError(`${key} no puede quedar negativo.`);
  }
}

function applyResourceSpend(state, cost) {
  for (const [key, amount] of Object.entries(cost)) {
    if (state.resources[key] < amount) throw new GameStoreError(`No hay suficiente ${key}.`);
  }
  applyResourceDelta(state, cost, -1);
}

function applyReward(state, action) {
  if (action.resources !== undefined) applyResourceDelta(state, readResourceAmounts({ amounts: action.resources }, { requirePositive: false }), 1);
  if (action.exp !== undefined) {
    const exp = readNonNegativeInteger(action.exp, 'exp');
    state.progression.exp = safeAdd(state.progression.exp, exp);
  }
}

function applyHeroName(state, heroName) {
  if (typeof heroName !== 'string') throw new GameStoreError('El nombre del héroe debe ser texto.');
  const clean = heroName.trim();
  if (clean.length < 1 || clean.length > 40 || hasControlChars(clean)) {
    throw new GameStoreError('El nombre del héroe no es válido.');
  }
  state.profile.heroName = clean;
}

function applyClassSelection(state, classId) {
  const fighterClass = Object.values(CLASSES).find((entry) => entry.id === classId && entry.isPlayable);
  if (!fighterClass) throw new GameStoreError('La clase seleccionada no es jugable.');
  if (state.profile.classId !== null && state.profile.classId !== fighterClass.id) {
    throw new GameStoreError('La clase del héroe es permanente para esta partida.');
  }
  state.profile.classId = fighterClass.id;
}

function completeTutorial(state) {
  if (!state.profile.classId) throw new GameStoreError('Debes elegir una clase antes de completar el tutorial.');
  state.profile.tutorialDone = true;
}

function applySettingsPatch(state, patch) {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) throw new GameStoreError('Los ajustes deben ser un objeto.');
  let clean;
  try {
    clean = cloneSerializable(patch);
  } catch (error) {
    throw new GameStoreError('Los ajustes no son serializables.', error);
  }

  for (const key of Object.keys(clean)) {
    if (!SETTINGS_KEYS.includes(key)) throw new GameStoreError(`Ajuste desconocido: ${key}`);
  }

  for (const [key, value] of Object.entries(clean)) {
    if (key === 'textSize' && !VALID_TEXT_SIZES.has(value)) throw new GameStoreError('Tamaño de texto inválido.');
    if (key === 'quality' && !VALID_QUALITIES.has(value)) throw new GameStoreError('Calidad inválida.');
    if (BOOLEAN_SETTINGS.has(key) && typeof value !== 'boolean') throw new GameStoreError(`${key} debe ser booleano.`);
    if (PERCENT_SETTINGS.has(key) && (!Number.isFinite(value) || value < 0 || value > 1)) {
      throw new GameStoreError(`${key} debe estar entre 0 y 1.`);
    }
    state.settings[key] = value;
  }
}

function readPositiveFinite(value, label) {
  if (!Number.isFinite(value) || value <= 0) throw new GameStoreError(`${label} debe ser un número mayor que cero.`);
  return value;
}

function readNonNegativeInteger(value, label) {
  if (!Number.isInteger(value) || value < 0) throw new GameStoreError(`${label} debe ser un entero no negativo.`);
  return value;
}

function safeAdd(left, right) {
  const result = left + right;
  if (!Number.isFinite(result) || result < 0 || result > Number.MAX_SAFE_INTEGER) {
    throw new GameStoreError('La operación numérica sale de los límites seguros.');
  }
  return result;
}

function resolveNow(now) {
  const value = typeof now === 'function' ? now() : now;
  return Number.isFinite(value) && value >= 0 ? Math.floor(value) : Date.now();
}

function safeStorage() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function hasControlChars(value) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 31 || code === 127) return true;
  }
  return false;
}

export { isSafeId };
