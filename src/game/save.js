import { createLocalStorageAdapter } from "../services/storage/local-storage-adapter.js";
import { createSaveRepository } from "../services/storage/save-repository.js";

function repository() {
  return createSaveRepository(createLocalStorageAdapter());
}

export function loadGame() {
  try {
    return repository().load()?.state ?? null;
  } catch {
    return null;
  }
}

export function saveGame(state) {
  return repository().save(state);
}

export function exportGame(state) {
  return repository().exportState(state);
}

export function importGame(serialized) {
  return repository().importState(serialized);
}

export function resetGame() {
  repository().reset();
}
