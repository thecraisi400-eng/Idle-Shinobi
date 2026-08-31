import { GAME_CONFIG } from "../config/game-config.js";

export function createInitialState() {
  return {
    version: GAME_CONFIG.saveVersion,
    player: {
      name: "El Campeón del Pueblo",
      classId: null,
      level: 1,
      experience: 0,
      experienceRequired: 100,
      statPoints: 0,
      stats: { health: 100, attack: 12, defense: 6, speed: 10, critical: 5 }
    },
    currencies: { gold: 500, gems: 0 },
    campaign: { chapter: 1, wins: 0, currentEnemyId: "el-martillo" },
    equipment: { equipped: {}, inventory: [] },
    skills: { points: 0, unlocked: [] },
    events: { dailySeed: null, completed: {}, mailbox: [] },
    pvp: { recentChampions: [], rivalries: {} },
    missions: { daily: [], weekly: [] },
    achievements: [],
    settings: { fontScale: 1, musicVolume: 0.7, effectsVolume: 0.8, vibration: true }
  };
}

export function isValidState(state) {
  return Boolean(
    state &&
      state.version === GAME_CONFIG.saveVersion &&
      state.player && Number.isInteger(state.player.level) && state.player.level >= 1 &&
      state.currencies && Number.isFinite(state.currencies.gold) && state.currencies.gold >= 0 &&
      Number.isFinite(state.currencies.gems) && state.currencies.gems >= 0
  );
}
