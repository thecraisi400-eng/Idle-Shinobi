/**
 * Ring de Campeones — Estado inicial de partida (Paso 3)
 *
 * Exporta una fábrica, no un objeto compartido. Cada nueva partida recibe
 * estructuras independientes para evitar referencias cruzadas entre sesiones,
 * pruebas o importaciones.
 */

import { GAME_CONFIG } from '../config/game-config.js';

export const STATE_SCHEMA_VERSION = GAME_CONFIG.SCHEMA_VERSION;

export const RESOURCE_KEYS = Object.freeze(['gold', 'gems', 'materials']);

export const STAT_KEYS = Object.freeze([
  'health',
  'attack',
  'defense',
  'speed',
  'criticalChance',
  'luck',
  'dodge',
  'accuracy',
  'criticalResistance',
  'criticalNullify'
]);

export const EQUIPMENT_SLOTS = GAME_CONFIG.EQUIPMENT_SLOTS;

export const TEXT_SIZE_OPTIONS = Object.freeze(['small', 'normal', 'large']);
export const QUALITY_OPTIONS = Object.freeze(['low', 'medium', 'high']);

/**
 * Crea un estado completo listo para validar, renderizar y guardar.
 * @param {number} [now]
 * @returns {object}
 */
export function createInitialState(now = Date.now()) {
  const timestamp = normalizeTimestamp(now);

  return {
    schemaVersion: STATE_SCHEMA_VERSION,
    profile: {
      createdAt: timestamp,
      heroName: GAME_CONFIG.HERO_DEFAULT_NAME,
      classId: null,
      tutorialDone: false
    },
    progression: {
      level: 1,
      exp: 0,
      statPoints: 0,
      skillPoints: 0,
      chapter: 1,
      fight: 1,
      victories: 0,
      defeats: 0
    },
    resources: {
      gold: 500,
      gems: 0,
      materials: 0
    },
    baseStats: {
      health: 120,
      attack: 18,
      defense: 10,
      speed: 10,
      criticalChance: 0.05,
      luck: 0,
      dodge: 0.01,
      accuracy: 0.95,
      criticalResistance: 0,
      criticalNullify: 0
    },
    inventory: {
      capacity: GAME_CONFIG.INVENTORY_CAPACITY,
      equipment: [],
      materials: {},
      consumables: []
    },
    equipped: createEmptyEquipmentSlots(),
    skills: {
      unlocked: {},
      spent: 0
    },
    campaign: {
      currentEnemyId: null,
      bossWins: 0
    },
    events: {
      dayKey: null,
      order: [],
      progress: {},
      history: []
    },
    pvp: {
      activeTournament: null,
      recentChampions: []
    },
    missions: {
      dayKey: null,
      weekKey: null,
      daily: [],
      weekly: []
    },
    achievements: {
      progress: {},
      claimed: []
    },
    shop: {
      dayKey: null,
      weekKey: null,
      offers: []
    },
    loginCalendar: {
      lastClaimKey: null,
      day: 0
    },
    inbox: [],
    settings: {
      textSize: 'normal',
      quality: 'medium',
      reducedMotion: false,
      musicVolume: 0.5,
      effectsVolume: 0.7,
      vibration: true
    },
    meta: {
      lastSavedAt: timestamp,
      playTimeSeconds: 0
    }
  };
}

/** Devuelve los siete huecos de equipamiento vacíos. */
export function createEmptyEquipmentSlots() {
  return Object.fromEntries(EQUIPMENT_SLOTS.map((slot) => [slot, null]));
}

function normalizeTimestamp(value) {
  return Number.isFinite(value) && value >= 0 ? Math.floor(value) : Date.now();
}
