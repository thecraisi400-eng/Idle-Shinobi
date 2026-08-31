import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState, isValidState } from "../src/game/state.js";

test("el estado inicial es válido y tiene recursos iniciales", () => {
  const state = createInitialState();
  assert.equal(isValidState(state), true);
  assert.equal(state.currencies.gold, 500);
  assert.equal(state.currencies.gems, 0);
});

test("un estado con moneda negativa no es válido", () => {
  const state = createInitialState();
  state.currencies.gold = -1;
  assert.equal(isValidState(state), false);
});
