import { describe, expect, it } from 'vitest';
import {
  calculateBaseExpReward,
  calculateBaseGoldReward,
  calculateCombatPower,
  calculateEnemyAttack,
  calculateEnemyHealth,
  calculatePvPPayouts,
  getRequiredExp,
  getStatUpgradeCost
} from '../../js/core/formulas.js';

describe('fórmulas de juego', () => {
  it('calcula EXP y costo de stat con redondeo consistente', () => {
    expect(getRequiredExp(1)).toBe(100);
    expect(getRequiredExp(10)).toBe(Math.round(100 * 10 ** 1.55));
    expect(getRequiredExp(200)).toBe(Infinity);
    expect(getStatUpgradeCost(0, 1)).toBe(75);
    expect(getStatUpgradeCost(3, 10)).toBe(Math.round(75 * 1.18 ** 3 * 10 ** 0.35));
  });

  it('calcula poder usando porcentajes como fracción 0..1', () => {
    expect(
      calculateCombatPower({ health: 120, attack: 18, defense: 10, speed: 10, criticalChance: 0.05, dodge: 0.01 })
    ).toBe(Math.round(120 * 0.22 + 18 * 4 + 10 * 3.2 + 10 * 2.5 + 0.05 * 180 + 0.01 * 120));
  });

  it('calcula escalado de enemigos y premios base', () => {
    expect(calculateEnemyHealth(1)).toBe(105);
    expect(calculateEnemyAttack(1)).toBe(15);
    expect(calculateEnemyHealth(3, 1.2)).toBe(Math.round(105 * 1.11 ** 2 * 1.2));
    expect(calculateBaseGoldReward(4, 1.5)).toBe(Math.round(55 * 4 ** 1.18 * 1.5));
    expect(calculateBaseExpReward(4, 1.5)).toBe(Math.round(35 * 4 ** 1.16 * 1.5));
  });

  it('calcula la bolsa PVP sin perder residuo de redondeo', () => {
    const payouts = calculatePvPPayouts(500);

    expect(payouts.grossPool).toBe(16000);
    expect(payouts.houseFee).toBe(3200);
    expect(payouts.netPool).toBe(12800);
    expect(payouts.payouts.reduce((sum, value) => sum + value, 0)).toBe(12800);
  });
});
