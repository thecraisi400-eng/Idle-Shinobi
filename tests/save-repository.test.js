import test from "node:test";
import assert from "node:assert/strict";
import { createInitialState } from "../src/game/state.js";
import { createMemoryStorageAdapter } from "../src/services/storage/memory-storage-adapter.js";
import { createSaveRepository } from "../src/services/storage/save-repository.js";
import { SAVE_CONFIG } from "../src/config/save-config.js";

function repository(adapter) {
  return createSaveRepository(adapter, { now: () => "2026-08-31T12:00:00.000Z" });
}

test("guardar crea una copia de respaldo y aumenta la revisión", () => {
  const adapter = createMemoryStorageAdapter();
  const repo = repository(adapter);
  const first = repo.save(createInitialState({ now: "2026-08-31T00:00:00.000Z" }));
  const second = repo.save({ ...first, wallet: { ...first.wallet, gold: 700 } });
  assert.equal(second.meta.revision, 2);
  assert.ok(adapter.get(SAVE_CONFIG.backupStorageKey));
});

test("la carga recupera el respaldo ante un guardado principal corrupto", () => {
  const adapter = createMemoryStorageAdapter();
  const repo = repository(adapter);
  repo.save(createInitialState());
  repo.save(createInitialState());
  adapter.set(SAVE_CONFIG.storageKey, "{corrupto");
  const loaded = repo.load();
  assert.equal(loaded.recoveredFromBackup, true);
  assert.equal(loaded.state.wallet.gold, 500);
});

test("la exportación se puede importar y los archivos ajenos se rechazan", () => {
  const repo = repository(createMemoryStorageAdapter());
  const exported = repo.exportState(createInitialState());
  assert.equal(repo.importState(exported).player.name, "El Campeón del Pueblo");
  assert.throws(() => repo.importState('{"format":"otro"}'), /no es una partida/);
});

test("una partida del prototipo se migra a la estructura wallet e inventory", () => {
  const adapter = createMemoryStorageAdapter({
    [SAVE_CONFIG.storageKey]: JSON.stringify({
      version: 1,
      player: { name: "El Campeón del Pueblo", level: 1, experience: 0, experienceRequired: 100, statPoints: 0, stats: { health: 100, attack: 12, defense: 6, speed: 10, critical: 5 } },
      currencies: { gold: 81, gems: 2 },
      equipment: { equipped: {}, inventory: [] }
    })
  });
  const loaded = repository(adapter).load();
  assert.equal(loaded.state.wallet.gold, 81);
  assert.equal(loaded.state.wallet.gems, 2);
  assert.deepEqual(loaded.state.inventory.items, []);
});
