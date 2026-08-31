import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/game/state.js";
import { chooseClass, gainExperience, investStatPoint, trainStat } from "../src/game/progression/actions.js";
import { experienceRequiredForLevel } from "../src/game/progression/experience.js";
import { getHeroStats, getPower } from "../src/game/progression/hero-stats.js";

test("la curva de experiencia aumenta y termina en el nivel máximo", () => {
  assert.ok(experienceRequiredForLevel(2) > experienceRequiredForLevel(1));
  assert.equal(experienceRequiredForLevel(200), 0);
});

test("elegir una clase es permanente", () => {
  const first = chooseClass(createInitialState(), "technical");
  assert.equal(first.nextState.player.classId, "technical");
  assert.match(chooseClass(first.nextState, "agile").error, /ya fue elegida/);
});

test("la experiencia entrega nivel, oro y puntos", () => {
  const state = createInitialState();
  const result = gainExperience(state, state.player.experienceRequired);
  assert.equal(result.nextState.player.level, 2);
  assert.equal(result.nextState.player.statPoints, 3);
  assert.ok(result.nextState.wallet.gold > state.wallet.gold);
});

test("invertir y entrenar atributos valida recursos y cambia estadísticas derivadas", () => {
  const state = createInitialState();
  const levelled = gainExperience(state, state.player.experienceRequired).nextState;
  const invested = investStatPoint(levelled, "attack").nextState;
  const trained = trainStat(invested, "attack").nextState;
  assert.equal(invested.player.baseStats.attack, 13);
  assert.equal(trained.player.training.attack, 1);
  assert.ok(getHeroStats(trained.player).attack > getHeroStats(levelled.player).attack);
  assert.ok(getPower(getHeroStats(trained.player)) > 0);
});
