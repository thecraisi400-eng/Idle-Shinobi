import { describe, expect, it } from 'vitest';
import { createInitialState } from '../../js/state/initial-state.js';
import { STORAGE_KEYS, loadGameState, saveGameState } from '../../js/state/persistence.js';
import { GameStoreError, createGameStore } from '../../js/state/store.js';

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key)
  };
}

describe('store de juego', () => {
  it('crea nueva partida, guarda y notifica cambios', () => {
    const storage = memoryStorage();
    const store = createGameStore({ storage, now: () => 100 });
    const events = [];
    store.subscribe((_state, action) => events.push(action.type));

    const state = store.dispatch({ type: 'game/new', settings: { textSize: 'large', quality: 'low' } });

    expect(state.resources.gold).toBe(500);
    expect(state.settings.textSize).toBe('large');
    expect(events).toEqual(['game/new']);
    expect(loadGameState({ storage }).state.settings.quality).toBe('low');
  });

  it('selecciona una clase jugable permanente y completa el tutorial en orden', () => {
    const store = createGameStore({ storage: memoryStorage(), autosave: false });

    expect(() => store.dispatch({ type: 'profile/completeTutorial' })).toThrow(/clase/);
    expect(() => store.dispatch({ type: 'profile/selectClass', classId: 'legend' })).toThrow(/jugable/);

    store.dispatch({ type: 'profile/selectClass', classId: 'agile' });
    expect(store.getState().profile.classId).toBe('agile');
    expect(() => store.dispatch({ type: 'profile/selectClass', classId: 'heavy' })).toThrow(/permanente/);

    store.dispatch({ type: 'profile/completeTutorial' });
    expect(store.getState().profile.tutorialDone).toBe(true);
  });

  it('aplica gastos de recursos de forma atómica', () => {
    const storage = memoryStorage();
    const initial = createInitialState(1);
    expect(saveGameState(initial, { storage, now: 1 }).ok).toBe(true);
    const store = createGameStore({ initialState: initial, storage, now: () => 10 });

    const afterSpend = store.dispatch({ type: 'resources/spend', cost: { gold: 125 } });
    expect(afterSpend.resources.gold).toBe(375);

    const before = store.getState();
    const persistedBefore = storage.getItem(STORAGE_KEYS.CURRENT_SAVE);
    expect(() => store.dispatch({ type: 'resources/spend', cost: { gold: 9999 } })).toThrow(GameStoreError);

    expect(store.getState()).toEqual(before);
    expect(storage.getItem(STORAGE_KEYS.CURRENT_SAVE)).toBe(persistedBefore);
  });

  it('rechaza NaN, negativos y recursos desconocidos', () => {
    const store = createGameStore({ storage: memoryStorage(), autosave: false });

    expect(() => store.dispatch({ type: 'resources/add', resource: 'gold', amount: Number.NaN })).toThrow(GameStoreError);
    expect(() => store.dispatch({ type: 'resources/add', resource: 'oro', amount: 1 })).toThrow(GameStoreError);
    expect(() => store.dispatch({ type: 'resources/spend', cost: { gems: -1 } })).toThrow(GameStoreError);
    expect(store.getState().resources).toEqual({ gold: 500, gems: 0, materials: 0 });
  });

  it('devuelve copias del estado para impedir mutación directa', () => {
    const store = createGameStore({ storage: memoryStorage(), autosave: false });
    const snapshot = store.getState();
    snapshot.resources.gold = -999;
    snapshot.inventory.equipment.push({ id: 'trampa' });

    expect(store.getState().resources.gold).toBe(500);
    expect(store.getState().inventory.equipment).toEqual([]);
  });

  it('agrupa cambios frecuentes hasta flushSave', () => {
    const storage = memoryStorage();
    const store = createGameStore({ storage, saveDelayMs: -1, now: () => 500 });

    store.dispatch({ type: 'meta/addPlayTime', seconds: 12.5 });
    expect(storage.getItem(STORAGE_KEYS.CURRENT_SAVE)).toBeNull();
    expect(store.getState().meta.playTimeSeconds).toBe(12.5);

    const flushed = store.flushSave();
    expect(flushed.ok).toBe(true);
    expect(loadGameState({ storage }).state.meta.playTimeSeconds).toBe(12.5);
  });

  it('no acepta acciones desconocidas ni ajustes fuera del esquema', () => {
    const store = createGameStore({ storage: memoryStorage(), autosave: false });

    expect(() => store.dispatch({ type: 'shop/buyItem', productId: 'x' })).toThrow(/Acción desconocida/);
    expect(() => store.dispatch({ type: 'settings/update', settings: { quality: 'ultra' } })).toThrow(/Calidad/);
    expect(() => store.dispatch({ type: 'settings/update', settings: { htmlNode: document.body } })).toThrow(/serializable|Ajuste/);
  });
});
