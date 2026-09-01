/**
 * Ring de Campeones - Configuración Global y Constantes Inmutables
 * Versión: 1.0.0 (Paso 1)
 */

export const GAME_CONFIG = Object.freeze({
  // Identidad
  GAME_TITLE: 'Ring de Campeones',
  HERO_DEFAULT_NAME: 'El Campeón del Pueblo',
  SCHEMA_VERSION: 1,

  // Progresión y Niveles
  MAX_LEVEL: 200,
  BASE_EXP_FACTOR: 100,
  EXP_EXPONENT: 1.55,
  LEVEL_GOLD_FACTOR: 50,
  LEVEL_GOLD_EXPONENT: 1.10,

  // Stats y Costos
  STAT_COST_BASE: 75,
  STAT_COST_MULTIPLIER: 1.18,
  STAT_COST_LEVEL_EXPONENT: 0.35,

  // Capacidad y Equipamiento
  INVENTORY_CAPACITY: 50,
  MAX_EQUIPMENT_LEVEL: 15,
  SELL_RETURN_RATE: 0.25,
  UNDO_WINDOW_SECONDS: 5,
  EQUIPMENT_SLOTS: Object.freeze([
    'head',
    'torso',
    'arms',
    'legs',
    'boots',
    'belt',
    'amulet'
  ]),

  // Rarezas
  RARITIES: Object.freeze({
    COMMON: 'common',
    UNCOMMON: 'uncommon',
    RARE: 'rare',
    EPIC: 'epic',
    LEGENDARY: 'legendary',
    DIVINE: 'divine'
  }),

  // Combate
  COMBAT_TICK_MS: 50,
  MAX_COMBAT_SECONDS: 180,
  ACTION_BAR_MAX: 100,
  BASE_CHARGE_RATE: 8,
  SPEED_CHARGE_FACTOR: 0.32,
  DEFENSE_MITIGATION_FACTOR: 0.55,
  CRITICAL_MULTIPLIER_BASE: 2.0,
  FINISHER_THRESHOLD: 0.20,
  FINISHER_MULTIPLIER: 1.50,
  CLASS_ADVANTAGE: 1.12,
  CLASS_DISADVANTAGE: 0.90,
  MIN_HIT_CHANCE: 0.05,
  MAX_DODGE_CHANCE: 0.35,
  REVIVE_CHANCE_BASE: 0.01,
  DAMAGE_VARIATION_MIN: 0.95,
  DAMAGE_VARIATION_MAX: 1.05,

  // Campaña
  BOSS_INTERVAL: 5,
  BOSS_STAT_FACTOR: 1.45,
  BOSS_GOLD_MULTIPLIER: 2.0,
  BOSS_EXP_MULTIPLIER: 2.2,

  // PVP Torneo de 32
  PVP_TOTAL_PARTICIPANTS: 32,
  PVP_HOUSE_FEE_RATE: 0.20,
  PVP_PAYOUT_RATES: Object.freeze([0.50, 0.25, 0.10, 0.06, 0.04, 0.03, 0.02]),
  PVP_ROOMS: Object.freeze({
    BRONZE: { id: 'bronze', name: 'Sala Bronce', entryFee: 500, currency: 'gold' },
    SILVER: { id: 'silver', name: 'Sala Plata', entryFee: 2500, currency: 'gold' },
    GOLD: { id: 'gold', name: 'Sala Oro', entryFee: 25, currency: 'gems' }
  }),

  // Eventos Diarios
  EVENT_DAY_START_HOUR: 6, // 06:00 AM hora local
  EVENT_BLOCK_HOURS: 3,
  TOTAL_DAILY_EVENTS: 7,

  // Almacenamiento Local
  STORAGE_KEYS: Object.freeze({
    CURRENT_SAVE: 'ringDeCampeones.save.current',
    BACKUP_SAVE: 'ringDeCampeones.save.backup',
    INSTALLATION_ID: 'ringDeCampeones.installationId'
  })
});
