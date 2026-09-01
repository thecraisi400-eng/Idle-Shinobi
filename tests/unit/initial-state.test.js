import { describe, expect, it } from 'vitest';
import { createInitialState, EQUIPMENT_SLOTS, RESOURCE_KEYS, STATE_SCHEMA_VERSION } from '../../js/state/initial-state.js';
import { cloneAndValidateState, validateGameState } from '../../js/state/validators.js';

describe('estado inicial', () => {
  it('crea la estructura completa del esquema actual', () => {
    const state = createInitialState(12345);

    expect(state.schemaVersion).toBe(STATE_SCHEMA_VERSION);
    expect(state.profile.createdAt).toBe(12345);
    expect(state.profile.heroName).toBe('El Campeón del Pueblo');
    expect(state.progression).toMatchObject({ level: 1, exp: 0, chapter: 1, fight: 1 });
    expect(state.resources).toEqual({ gold: 500, gems: 0, materials: 0 });
    expect(Object.keys(state.equipped)).toEqual([...EQUIPMENT_SLOTS]);
    expect(Object.values(state.equipped)).toEqual(EQUIPMENT_SLOTS.map(() => null));
    expect(Object.keys(state.resources)).toEqual([...RESOURCE_KEYS]);
    expect(state.meta.lastSavedAt).toBe(12345);
  });

  it('devuelve objetos independientes en cada llamada', () => {
    const first = createInitialState(1);
    const second = createInitialState(1);

    first.inventory.equipment.push({ id: 'mask_001' });
    first.resources.gold = 0;
    first.equipped.head = 'mask_001';

    expect(second.inventory.equipment).toEqual([]);
    expect(second.resources.gold).toBe(500);
    expect(second.equipped.head).toBeNull();
  });

  it('valida el estado inicial y rechaza datos no seguros', () => {
    const state = createInitialState(1);
    expect(validateGameState(state).valid).toBe(true);

    expect(() => cloneAndValidateState({ ...state, resources: { ...state.resources, gold: -1 } })).toThrow(/Estado inválido/);
    expect(() => cloneAndValidateState({ ...state, baseStats: { ...state.baseStats, dodge: 2 } })).toThrow(/Estado inválido/);
    expect(() => cloneAndValidateState({ ...state, meta: { ...state.meta, playTimeSeconds: Number.NaN } })).toThrow(
      /Estado inválido/
    );
    expect(() => cloneAndValidateState({ ...state, inventory: { ...state.inventory, equipment: [document.body] } })).toThrow(
      /serializable/
    );
    expect(() => cloneAndValidateState({ ...state, debug: () => {} })).toThrow(/serializable|esquema/);
  });
});
