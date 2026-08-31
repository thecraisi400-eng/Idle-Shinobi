import { PLAYER_CONFIG } from "../../config/player-config.js";
import { SETTINGS_CONFIG } from "../../config/settings-config.js";

const isRecord = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const isNonNegativeInteger = (value) => Number.isInteger(value) && value >= 0;
const isFiniteNonNegative = (value) => Number.isFinite(value) && value >= 0;

export function validateState(state) {
  const errors = [];
  if (!isRecord(state)) return { valid: false, errors: ["La partida debe ser un objeto."] };

  if (!isRecord(state.meta) || !Number.isInteger(state.meta.schemaVersion) || state.meta.schemaVersion < 1) {
    errors.push("meta.schemaVersion no es válido.");
  }
  if (!isRecord(state.player)) errors.push("player no es válido.");
  if (!isRecord(state.wallet)) errors.push("wallet no es válido.");

  const { player = {}, wallet = {}, settings = {}, inventory = {}, equipment = {}, events = {}, missions = {} } = state;
  if (!Number.isInteger(player.level) || player.level < 1 || player.level > PLAYER_CONFIG.maximumLevel) {
    errors.push(`player.level debe estar entre 1 y ${PLAYER_CONFIG.maximumLevel}.`);
  }
  if (!isNonNegativeInteger(player.experience) || !isNonNegativeInteger(player.experienceRequired) || (player.level < PLAYER_CONFIG.maximumLevel && player.experienceRequired < 1)) {
    errors.push("La experiencia del jugador no es válida.");
  }
  if (player.level < PLAYER_CONFIG.maximumLevel && player.experience >= player.experienceRequired) errors.push("La experiencia debe ser menor que el requisito del nivel.");
  if (player.classId !== null && !PLAYER_CONFIG.classes.includes(player.classId)) errors.push("player.classId no es una clase permitida.");
  if (!isRecord(player.baseStats) || Object.values(player.baseStats).some((value) => !isFiniteNonNegative(value))) {
    errors.push("Las estadísticas del jugador no son válidas.");
  }
  if (!isRecord(player.training) || Object.values(player.training).some((value) => !isNonNegativeInteger(value))) errors.push("El entrenamiento del jugador no es válido.");
  for (const currency of ["gold", "gems"]) {
    if (!isNonNegativeInteger(wallet[currency])) errors.push(`wallet.${currency} debe ser un entero no negativo.`);
  }
  if (!Array.isArray(inventory.items) || new Set(inventory.items.map((item) => item?.instanceId)).size !== inventory.items.length) {
    errors.push("El inventario contiene identificadores duplicados o no es válido.");
  }
  if (!isRecord(equipment.equipped)) errors.push("equipment.equipped no es válido.");
  if (!isRecord(events.completed) || !Array.isArray(events.mailbox)) errors.push("El estado de eventos no es válido.");
  if (!Array.isArray(missions.daily) || !Array.isArray(missions.weekly)) errors.push("Las misiones no son válidas.");
  if (!Number.isFinite(settings.fontScale) || settings.fontScale < SETTINGS_CONFIG.minimumFontScale || settings.fontScale > SETTINGS_CONFIG.maximumFontScale) {
    errors.push("settings.fontScale está fuera del rango permitido.");
  }
  for (const key of ["musicVolume", "effectsVolume"]) {
    if (!Number.isFinite(settings[key]) || settings[key] < 0 || settings[key] > 1) errors.push(`settings.${key} debe estar entre 0 y 1.`);
  }
  if (typeof settings.vibration !== "boolean") errors.push("settings.vibration debe ser booleano.");
  return { valid: errors.length === 0, errors };
}
