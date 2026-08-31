import { APP_CONFIG } from "../../config/app-config.js";
import { SAVE_CONFIG } from "../../config/save-config.js";
import { createId } from "../../utils/ids.js";
import { migrateState } from "../../game/migrations/index.js";
import { createInitialState, normalizeState } from "../../game/state-normalizer.js";
import { validateState } from "../../game/validation/state-validator.js";
import { assertStorageAdapter } from "./storage-adapter.js";

function parseState(raw) {
  if (!raw) return null;
  return JSON.parse(raw);
}

function buildState(rawState, now) {
  const migrated = migrateState(rawState);
  const state = normalizeState(migrated, createInitialState({ now, saveId: migrated?.meta?.saveId ?? createId("save") }));
  const result = validateState(state);
  if (!result.valid) throw new Error(`Partida inválida: ${result.errors.join(" ")}`);
  return state;
}

export function createSaveRepository(adapter, { now = () => new Date().toISOString() } = {}) {
  assertStorageAdapter(adapter);
  return {
    load() {
      for (const key of [SAVE_CONFIG.storageKey, SAVE_CONFIG.backupStorageKey]) {
        try {
          const raw = parseState(adapter.get(key));
          if (!raw) continue;
          const wrapped = raw.state ?? raw;
          const state = buildState(wrapped, now());
          return { state, recoveredFromBackup: key === SAVE_CONFIG.backupStorageKey };
        } catch {
          // Se intenta la copia de respaldo sin destruir datos potencialmente recuperables.
        }
      }
      return null;
    },
    save(state) {
      const result = validateState(state);
      if (!result.valid) throw new TypeError(`El estado del juego no es válido: ${result.errors.join(" ")}`);
      const previous = adapter.get(SAVE_CONFIG.storageKey);
      if (previous) adapter.set(SAVE_CONFIG.backupStorageKey, JSON.stringify({ backedUpAt: now(), state: JSON.parse(previous) }));
      const nextState = { ...state, meta: { ...state.meta, updatedAt: now(), lastSavedAt: now(), revision: state.meta.revision + 1 } };
      adapter.set(SAVE_CONFIG.storageKey, JSON.stringify(nextState));
      return nextState;
    },
    reset() {
      adapter.remove(SAVE_CONFIG.storageKey);
      adapter.remove(SAVE_CONFIG.backupStorageKey);
    },
    exportState(state) {
      const result = validateState(state);
      if (!result.valid) throw new TypeError(`No se puede exportar una partida inválida: ${result.errors.join(" ")}`);
      return JSON.stringify({ format: APP_CONFIG.saveFormat, exportedAt: now(), schemaVersion: APP_CONFIG.schemaVersion, gameVersion: APP_CONFIG.gameVersion, state }, null, 2);
    },
    importState(serialized) {
      const parsed = typeof serialized === "string" ? JSON.parse(serialized) : serialized;
      if (parsed?.format !== APP_CONFIG.saveFormat) throw new TypeError("El archivo no es una partida de Ring de Campeones.");
      return buildState(parsed.state, now());
    }
  };
}
