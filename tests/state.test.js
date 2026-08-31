import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState, isValidState, normalizeState, validateState } from "../src/game/state.js";
import { APP_CONFIG } from "../src/config/app-config.js";

test("el estado inicial es completo y válido", () => {
  const state = createInitialState({ now: "2026-08-31T00:00:00.000Z", saveId: "test-save" });
  assert.equal(isValidState(state), true);
  assert.equal(state.wallet.gold, 500);
  assert.equal(state.meta.schemaVersion, APP_CONFIG.schemaVersion);
  assert.deepEqual(state.inventory.items, []);
});

test("la validación informa de moneda negativa y nivel inválido", () => {
  const state = createInitialState();
  state.wallet.gold = -1;
  state.player.level = 201;
  const result = validateState(state);
  assert.equal(result.valid, false);
  assert.equal(result.errors.length, 2);
});

test("la normalización completa campos faltantes sin aceptar campos desconocidos", () => {
  const normalized = normalizeState({ meta: { schemaVersion: 1 }, wallet: { gold: 12 }, unknown: true }, createInitialState());
  assert.equal(normalized.wallet.gold, 12);
  assert.equal(normalized.wallet.gems, 0);
  assert.equal("unknown" in normalized, false);
});
