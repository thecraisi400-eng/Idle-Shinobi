import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/game/state.js";
import { homeScreen } from "../src/ui/screens.js";

test("la pantalla principal usa wallet y muestra las seis pestañas", () => {
  const state = createInitialState();
  state.wallet.gold = 321;
  const markup = homeScreen(state);
  assert.match(markup, /321/);
  assert.match(markup, /HÉROE/);
  assert.match(markup, /EQUIPO/);
  assert.match(markup, /HABILIDAD/);
  assert.match(markup, /EVENTOS/);
  assert.match(markup, />PVP</);
  assert.match(markup, /TIENDA/);
});
