/* ===== FATIGA (02.10) =====
   "Golpear y usar especiales genera cansancio que baja tu velocidad de golpe."
   El Aguante la reduce y la Recuperación la limpia entre rondas. */

import { COMBATE } from '../../data/constants.js';

/** Añade fatiga por una acción, mitigada por el Aguante. */
export function acumularFatiga(f, cantidadBase) {
  const ganada = cantidadBase * f.der.fatigaMult;
  f.fatiga = Math.min(COMBATE.FATIGA_MAX, f.fatiga + ganada);
  return ganada;
}

export function fatigaPorGolpe(f, tipoCoste = 1) {
  return acumularFatiga(f, COMBATE.FATIGA_POR_GOLPE * tipoCoste);
}

export function fatigaPorEspecial(f) {
  return acumularFatiga(f, COMBATE.FATIGA_POR_ESPECIAL);
}

/** Recuperación al cambiar de ronda. */
export function recuperarFatiga(f) {
  const antes = f.fatiga;
  f.fatiga = Math.max(0, f.fatiga - f.der.fatigaRegen);
  return antes - f.fatiga;
}

/** Multiplicador de velocidad según fatiga: 0 fatiga → 1.0, fatiga máxima → 0.55 */
export function multiplicadorVelocidad(f) {
  const pct = f.fatiga / COMBATE.FATIGA_MAX;
  return 1 - pct * COMBATE.FATIGA_PENAL_VELOCIDAD;
}

export function fatigaPct(f) {
  return f.fatiga / COMBATE.FATIGA_MAX;
}
