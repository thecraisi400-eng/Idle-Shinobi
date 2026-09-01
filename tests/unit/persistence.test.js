import { describe, expect, it } from 'vitest';
import { createInitialState } from '../../js/state/initial-state.js';
import {
  RESET_CONFIRMATION_TEXT,
  STORAGE_KEYS,
  createResetState,
  exportGameState,
  getInstallationId,
  getSavedGameSummary,
  loadGameState,
  parseImportedGameState,
  replaceSaveWithImportedState,
  saveGameState
} from '../../js/state/persistence.js';

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
    dump: () => Object.fromEntries(data)
  };
}

describe('persistencia segura', () => {
  it('guardar y cargar conserva todos los campos validados', () => {
    const storage = memoryStorage();
    const state = createInitialState(1000);
    state.profile.heroName = 'La Pantera';
    state.progression.level = 5;
    state.resources.gold = 777;
    state.inventory.materials.tape = 3;

    const saved = saveGameState(state, { storage, now: 2000 });
    expect(saved.ok).toBe(true);

    const loaded = loadGameState({ storage, now: 3000 });
    expect(loaded.source).toBe('current');
    expect(loaded.state).toEqual(saved.state);
    expect(loaded.state.profile.heroName).toBe('La Pantera');
    expect(loaded.state.meta.lastSavedAt).toBe(2000);
  });

  it('si current está roto recupera la copia backup anterior', () => {
    const storage = memoryStorage();
    const first = createInitialState(1);
    first.progression.level = 2;
    expect(saveGameState(first, { storage, now: 10 }).ok).toBe(true);

    const second = createInitialState(2);
    second.progression.level = 9;
    expect(saveGameState(second, { storage, now: 20 }).ok).toBe(true);

    storage.setItem(STORAGE_KEYS.CURRENT_SAVE, '{json-roto');

    const loaded = loadGameState({ storage, now: 30 });
    expect(loaded.recovered).toBe(true);
    expect(loaded.source).toBe('backup');
    expect(loaded.state.progression.level).toBe(2);
    expect(getSavedGameSummary(storage).level).toBe(2);
  });

  it('una interrupción al guardar conserva current y backup anteriores', () => {
    const storage = memoryStorage();
    const original = createInitialState(1);
    original.progression.level = 3;
    expect(saveGameState(original, { storage, now: 10 }).ok).toBe(true);
    const previousCurrent = storage.getItem(STORAGE_KEYS.CURRENT_SAVE);

    let failCurrentWrites = true;
    const flakyStorage = {
      getItem: storage.getItem,
      removeItem: storage.removeItem,
      setItem(key, value) {
        if (failCurrentWrites && key === STORAGE_KEYS.CURRENT_SAVE) throw new Error('corte simulado');
        storage.setItem(key, value);
      }
    };

    const next = createInitialState(2);
    next.progression.level = 15;
    const failed = saveGameState(next, { storage: flakyStorage, now: 20 });

    expect(failed.ok).toBe(false);
    expect(storage.getItem(STORAGE_KEYS.CURRENT_SAVE)).toBe(previousCurrent);
    expect(storage.getItem(STORAGE_KEYS.BACKUP_SAVE)).toBe(previousCurrent);

    failCurrentWrites = false;
    expect(loadGameState({ storage }).state.progression.level).toBe(3);
  });

  it('migra un guardado antiguo sin perder recursos', () => {
    const storage = memoryStorage({
      [STORAGE_KEYS.CURRENT_SAVE]: JSON.stringify({
        hero: { level: 12, name: 'El Relámpago' },
        resources: { gold: 1234, gems: 6, materials: 7 }
      })
    });

    const loaded = loadGameState({ storage, now: 5000 });
    expect(loaded.hasSave).toBe(true);
    expect(loaded.state.schemaVersion).toBe(1);
    expect(loaded.state.progression.level).toBe(12);
    expect(loaded.state.profile.heroName).toBe('El Relámpago');
    expect(loaded.state.resources).toEqual({ gold: 1234, gems: 6, materials: 7 });
    expect(getSavedGameSummary(storage).level).toBe(12);
  });

  it('una importación inválida no reemplaza el guardado existente', () => {
    const storage = memoryStorage();
    const original = createInitialState(1);
    original.resources.gold = 900;
    const saved = saveGameState(original, { storage, now: 10 });
    const before = storage.getItem(STORAGE_KEYS.CURRENT_SAVE);

    const invalid = createInitialState(2);
    invalid.resources.gems = -50;
    const parsed = parseImportedGameState(JSON.stringify(invalid), { now: 20 });

    expect(parsed.ok).toBe(false);
    expect(storage.getItem(STORAGE_KEYS.CURRENT_SAVE)).toBe(before);
    expect(loadGameState({ storage }).state).toEqual(saved.state);
  });

  it('exporta, analiza y reemplaza una importación válida sólo después de confirmarla', () => {
    const storage = memoryStorage();
    const imported = createInitialState(1);
    imported.progression.level = 8;
    imported.resources.materials = 33;

    const text = exportGameState(imported, { now: 77 });
    const parsed = parseImportedGameState(text);
    expect(parsed.ok).toBe(true);
    expect(parsed.summary.level).toBe(8);
    expect(getSavedGameSummary(storage).hasSave).toBe(false);

    const replaced = replaceSaveWithImportedState(parsed.state, { storage, now: 88 });
    expect(replaced.ok).toBe(true);
    expect(loadGameState({ storage }).state.progression.level).toBe(8);
  });

  it('reiniciar requiere escribir una confirmación explícita', () => {
    expect(() => createResetState('reiniciar')).toThrow(/REINICIAR/);
    const state = createResetState(RESET_CONFIRMATION_TEXT, { now: 42 });
    expect(state.progression.level).toBe(1);
    expect(state.resources.gold).toBe(500);
    expect(state.meta.lastSavedAt).toBe(42);
  });

  it('mantiene un installationId estable', () => {
    const storage = memoryStorage();
    const first = getInstallationId(storage);
    const second = getInstallationId(storage);

    expect(first).toBe(second);
    expect(storage.dump()[STORAGE_KEYS.INSTALLATION_ID]).toBe(first);
  });
});
