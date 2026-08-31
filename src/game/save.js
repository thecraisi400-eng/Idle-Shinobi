import { GAME_CONFIG } from "../config/game-config.js";
import { isValidState } from "./state.js";

function getStorage() {
  return globalThis.localStorage;
}

export function loadGame() {
  try {
    const rawSave = getStorage()?.getItem(GAME_CONFIG.storageKey);
    if (!rawSave) return null;
    const state = JSON.parse(rawSave);
    return isValidState(state) ? state : null;
  } catch {
    return null;
  }
}

export function saveGame(state) {
  if (!isValidState(state)) throw new TypeError("El estado del juego no es válido.");
  const storage = getStorage();
  const previousSave = storage?.getItem(GAME_CONFIG.storageKey);
  if (previousSave) storage.setItem(GAME_CONFIG.backupStorageKey, previousSave);
  storage?.setItem(GAME_CONFIG.storageKey, JSON.stringify(state));
}
