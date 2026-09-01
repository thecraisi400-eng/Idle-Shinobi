/**
 * Ring de Campeones - Fórmulas matemáticas puras y defensivas
 * Versión: 1.1.0 (Paso 3)
 */

import { GAME_CONFIG } from '../config/game-config.js';

/**
 * Calcula la EXP requerida para el siguiente nivel.
 * Fórmula: redondear(100 × nivel^1,55)
 * @param {number} level - Nivel actual (1 a 200)
 * @returns {number} EXP requerida
 */
export function getRequiredExp(level) {
  const cleanLevel = clampInteger(level, 1, GAME_CONFIG.MAX_LEVEL);
  if (cleanLevel >= GAME_CONFIG.MAX_LEVEL) return Infinity;
  return Math.round(GAME_CONFIG.BASE_EXP_FACTOR * Math.pow(cleanLevel, GAME_CONFIG.EXP_EXPONENT));
}

/**
 * Calcula el Oro otorgado por subir de nivel.
 * @param {number} level
 * @returns {number}
 */
export function getLevelUpGold(level) {
  const cleanLevel = clampInteger(level, 1, GAME_CONFIG.MAX_LEVEL);
  return Math.round(GAME_CONFIG.LEVEL_GOLD_FACTOR * Math.pow(cleanLevel, GAME_CONFIG.LEVEL_GOLD_EXPONENT));
}

/**
 * Calcula el costo en Oro para comprar un punto de estadística.
 * Fórmula: redondear(75 × 1,18^mejorasCompradas × nivel^0,35)
 * @param {number} purchasedCount - Cantidad de mejoras ya compradas de esa stat
 * @param {number} heroLevel - Nivel actual del héroe
 * @returns {number} Costo en Oro
 */
export function getStatUpgradeCost(purchasedCount, heroLevel) {
  const cleanPurchased = clampInteger(purchasedCount, 0, Number.MAX_SAFE_INTEGER);
  const cleanLevel = clampInteger(heroLevel, 1, GAME_CONFIG.MAX_LEVEL);
  return Math.round(
    GAME_CONFIG.STAT_COST_BASE *
    Math.pow(GAME_CONFIG.STAT_COST_MULTIPLIER, cleanPurchased) *
    Math.pow(cleanLevel, GAME_CONFIG.STAT_COST_LEVEL_EXPONENT)
  );
}

/**
 * Calcula el Poder de Combate (Combat Power - CP).
 * Fórmula: vida×0,22 + ataque×4 + defensa×3,2 + velocidad×2,5
 *          + crítico%×180 + esquiva%×120
 * @param {Object} stats
 * @returns {number}
 */
export function calculateCombatPower(stats = {}) {
  const hp = nonNegativeNumber(stats.health);
  const atk = nonNegativeNumber(stats.attack);
  const def = nonNegativeNumber(stats.defense);
  const spd = nonNegativeNumber(stats.speed);
  const crit = clampPercentage(stats.criticalChance);
  const dodge = clampPercentage(stats.dodge);

  return Math.round(
    (hp * 0.22) +
    (atk * 4.0) +
    (def * 3.2) +
    (spd * 2.5) +
    (crit * 180) +
    (dodge * 120)
  );
}

/**
 * Vida base del enemigo.
 * Fórmula: 105 × 1,11^(capítulo-1) × factorDeLucha
 */
export function calculateEnemyHealth(chapter, fightFactor = 1) {
  const cleanChapter = clampInteger(chapter, 1, Number.MAX_SAFE_INTEGER);
  const cleanFactor = positiveNumber(fightFactor, 1);
  return Math.round(105 * Math.pow(1.11, cleanChapter - 1) * cleanFactor);
}

/**
 * Ataque base del enemigo.
 * Fórmula: 15 × 1,095^(capítulo-1) × factorDeLucha
 */
export function calculateEnemyAttack(chapter, fightFactor = 1) {
  const cleanChapter = clampInteger(chapter, 1, Number.MAX_SAFE_INTEGER);
  const cleanFactor = positiveNumber(fightFactor, 1);
  return Math.round(15 * Math.pow(1.095, cleanChapter - 1) * cleanFactor);
}

/** Oro base de victoria: redondear(55 × capítulo^1,18 × dificultad). */
export function calculateBaseGoldReward(chapter, difficulty = 1) {
  const cleanChapter = clampInteger(chapter, 1, Number.MAX_SAFE_INTEGER);
  const cleanDifficulty = positiveNumber(difficulty, 1);
  return Math.round(55 * Math.pow(cleanChapter, 1.18) * cleanDifficulty);
}

/** EXP base de victoria: redondear(35 × capítulo^1,16 × dificultad). */
export function calculateBaseExpReward(chapter, difficulty = 1) {
  const cleanChapter = clampInteger(chapter, 1, Number.MAX_SAFE_INTEGER);
  const cleanDifficulty = positiveNumber(difficulty, 1);
  return Math.round(35 * Math.pow(cleanChapter, 1.16) * cleanDifficulty);
}

/**
 * Calcula el daño base de un impacto antes de factores aleatorios.
 * @param {number} attack
 * @param {number} movePower
 * @param {number} targetDefense
 * @returns {number}
 */
export function calculateBaseDamage(attack, movePower, targetDefense) {
  const rawDamage =
    nonNegativeNumber(attack) * positiveNumber(movePower, 1) -
    nonNegativeNumber(targetDefense) * GAME_CONFIG.DEFENSE_MITIGATION_FACTOR;
  return Math.max(1, Math.round(rawDamage));
}

/**
 * Distribución de premios para el Torneo PVP de 32 participantes.
 * @param {number} entryFee
 * @returns {{ grossPool: number, houseFee: number, netPool: number, payouts: number[] }}
 */
export function calculatePvPPayouts(entryFee) {
  const cleanEntryFee = clampInteger(entryFee, 0, Number.MAX_SAFE_INTEGER);
  const grossPool = cleanEntryFee * GAME_CONFIG.PVP_TOTAL_PARTICIPANTS;
  const houseFee = Math.round(grossPool * GAME_CONFIG.PVP_HOUSE_FEE_RATE);
  const netPool = grossPool - houseFee;

  let distributed = 0;
  const payouts = GAME_CONFIG.PVP_PAYOUT_RATES.map((rate, index) => {
    if (index === 0) return 0; // Se resolverá al final con el residuo.
    const prize = Math.floor(netPool * rate);
    distributed += prize;
    return prize;
  });

  // El 1º lugar recibe exactamente su 50% base más cualquier residuo de redondeo.
  payouts[0] = netPool - distributed;

  return {
    grossPool,
    houseFee,
    netPool,
    payouts
  };
}

function clampInteger(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.floor(value)));
}

function nonNegativeNumber(value) {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function positiveNumber(value, fallback) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function clampPercentage(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
