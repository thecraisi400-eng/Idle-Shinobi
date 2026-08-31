import test from "node:test";
import assert from "node:assert/strict";
import { ROUTES, createUiState, navigate } from "../src/ui/router.js";

test("la navegación conserva la pantalla anterior para volver", () => {
  const start = createUiState();
  const hero = navigate(start, ROUTES.HERO);
  assert.equal(hero.route, ROUTES.HERO);
  assert.equal(hero.previousRoute, ROUTES.START);
});

test("una ruta desconocida no modifica el estado de interfaz", () => {
  const state = createUiState(ROUTES.HOME);
  assert.equal(navigate(state, "desconocida"), state);
});
