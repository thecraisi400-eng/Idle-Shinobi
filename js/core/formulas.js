/**
 * Ring de Campeones - Fórmulas Matemáticas Puras
 * Versión: 1.0.0 (Paso 1)
 */

import { GAME_CONFIG } from '../config/game-config.js';

/**
 * Calcula la EXP requerida para el siguiente nivel
 * @param {number} level - Nivel actual (1 a 200)
 * @returns {number} EXP requerida
 */
export function getRequiredExp(level) {
  if (level >= GAME_CONFIG.MAX_LEVEL) return Infinity;
  return Math.floor(GAME_CONFIG.BASE_EXP_FACTOR * Math.pow(level, GAME_CONFIG.EXP_EXPONENT));
}

/**
 * Calcula el Oro otorgado por subir de nivel
 * @param {number} level
 * @returns {number}
 */
export function getLevelUpGold(level) {
  return Math.floor(GAME_CONFIG.LEVEL_GOLD_FACTOR * Math.pow(level, GAME_CONFIG.LEVEL_GOLD_EXPONENT));
}

/**
 * Calcula el costo en Oro para comprar un punto de estadística
 * @param {number} purchasedCount - Cantidad de mejoras ya compradas de esa stat
 * @param {number} heroLevel - Nivel actual del héroe
 * @returns {number} Costo en Oro
 */
export function getStatUpgradeCost(purchasedCount, heroLevel) {
  return Math.floor(
    GAME_CONFIG.STAT_COST_BASE *
    Math.pow(GAME_CONFIG.STAT_COST_MULTIPLIER, purchasedCount) *
    Math.pow(heroLevel, GAME_CONFIG.STAT_COST_LEVEL_EXPONENT)
  );
}

/**
 * Calcula el Poder de Combate (Combat Power - CP)
 * @param {Object} stats
 * @returns {number}
 */
export function calculateCombatPower(stats = {}) {
  const hp = stats.health || 0;
  const atk = stats.attack || 0;
  const def = stats.defense || 0;
  const spd = stats.speed || 0;
  const crit = (stats.criticalChance || 0) * 100;
  const dodge = (stats.dodge || 0) * 100;

  return Math.floor(
    (hp * 0.22) +
    (atk * 4.0) +
    (def * 3.2) +
    (spd * 2.5) +
    (crit * 1.8) +
    (dodge * 1.2)
  );
}

/**
 * Calcula el daño base de un impacto antes de factores aleatorios
 * @param {number} attack
 * @param {number} movePower
 * @param {number} targetDefense
 * @returns {number}
 */
export function calculateBaseDamage(attack, movePower, targetDefense) {
  const rawDamage = (attack * movePower) - (targetDefense * GAME_CONFIG.DEFENSE_MITIGATION_FACTOR);
  return Math.max(1, rawDamage);
}

/**
 * Distribución de premios para el Torneo PVP de 32 participantes
 * @param {number} entryFee 
 * @returns {{ grossPool: number, houseFee: number, netPool: number, payouts: number[] }}
 */
export function calculatePvPPayouts(entryFee) {
  const grossPool = entryFee * GAME_CONFIG.PVP_TOTAL_PARTICIPANTS;
  const houseFee = Math.floor(grossPool * GAME_CONFIG.PVP_HOUSE_FEE_RATE);
  const netPool = grossPool - houseFee;

  let distributed = 0;
  const payouts = GAME_CONFIG.PVP_PAYOUT_RATES.map((rate, index) => {
    if (index === 0) return 0; // Se resolverá al final con el residuo
    const prize = Math.floor(netPool * rate);
    distributed += prize;
    return prize;
  });

  // El 1º lugar recibe exactamente el 50% base más cualquier residuo de redondeo
  payouts[0] = netPool - distributed;

  return {
    grossPool,
    houseFee,
    netPool,
    payouts
  };
}
