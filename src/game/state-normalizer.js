import { APP_CONFIG } from "../config/app-config.js";
import { ECONOMY_CONFIG } from "../config/economy-config.js";
import { PLAYER_CONFIG } from "../config/player-config.js";
import { SETTINGS_CONFIG } from "../config/settings-config.js";
import { deepClone } from "../utils/clone.js";

function mergeKnown(defaultValue, candidate) {
  if (Array.isArray(defaultValue)) return Array.isArray(candidate) ? deepClone(candidate) : deepClone(defaultValue);
  if (defaultValue && typeof defaultValue === "object") {
    const result = {};
    for (const key of Object.keys(defaultValue)) result[key] = mergeKnown(defaultValue[key], candidate?.[key]);
    return result;
  }
  return candidate === undefined ? defaultValue : candidate;
}

export function createInitialState({ now = new Date().toISOString(), saveId = "new-game" } = {}) {
  return {
    meta: { schemaVersion: APP_CONFIG.schemaVersion, createdAt: now, updatedAt: now, lastSavedAt: now, saveId, revision: 0 },
    player: { name: "El Campeón del Pueblo", classId: null, level: 1, experience: 0, experienceRequired: PLAYER_CONFIG.initialExperienceRequired, statPoints: 0, stats: deepClone(PLAYER_CONFIG.initialStats) },
    wallet: { gold: ECONOMY_CONFIG.initialGold, gems: ECONOMY_CONFIG.initialGems },
    campaign: { chapter: 1, wins: 0, currentEnemyId: "el-martillo" },
    inventory: { items: [] },
    equipment: { equipped: {} },
    skills: { points: 0, unlocked: [] },
    events: { dailySeed: null, completed: {}, mailbox: [] },
    pvp: { recentChampions: [], rivalries: {} },
    missions: { daily: [], weekly: [] },
    achievements: [],
    settings: { fontScale: SETTINGS_CONFIG.defaultFontScale, musicVolume: SETTINGS_CONFIG.defaultMusicVolume, effectsVolume: SETTINGS_CONFIG.defaultEffectsVolume, vibration: true }
  };
}

export function normalizeState(candidate, initialState = createInitialState()) {
  const normalized = mergeKnown(initialState, candidate);
  normalized.meta.schemaVersion = APP_CONFIG.schemaVersion;
  return normalized;
}
