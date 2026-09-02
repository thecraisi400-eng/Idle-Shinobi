/* ===== CURVA DE DIFICULTAD =====
   06.01 escalado exponencial 1.10^n
   06.02 dientes de sierra: tras cada jefe hay un respiro
   06.03 muros medibles en puntos concretos
   06.07 sin ayuda si te atascas (01.04 no avanzas de rival) */

import { RIVALES } from '../data/constants.js';
import { divisionPorIndice, indiceLocal, TORRE } from '../data/divisiones.js';

/** ¿El rival número i es un JEFE? (05.13 cada 10 luchas) */
export function esJefe(i) {
  if (esCampeon(i)) return false;          // el campeón es su propia categoría
  const local = indiceLocal(i);
  return local > 0 && (local + 1) % RIVALES.JEFE_CADA === 0;
}

/** ¿Es el campeón de división? (la última lucha de la división) */
export function esCampeon(i) {
  const div = divisionPorIndice(i);
  if (div === TORRE) return false;
  return indiceLocal(i) === div.luchas - 1;
}

/** Multiplicador total de stats para el rival número i. */
export function escaladoRival(i, piso = 0) {
  const div = divisionPorIndice(i);
  const local = indiceLocal(i);

  // Base exponencial suave dentro de la división (06.01).
  // ARRANQUE: el primer rival de cada división está por debajo del jugador,
  // para que entrar en una división nueva no sea un muro instantáneo.
  let mult = RIVALES.ARRANQUE * Math.pow(RIVALES.ESCALA, local * 0.42);

  // Multiplicador de la división
  mult *= div === TORRE
    ? Math.pow(TORRE.multStatsPorPiso, piso)
    : div.multStats;

  // Dientes de sierra (06.02): justo después de un jefe, respiro
  if (local > 0 && esJefe(i - 1)) mult *= 1 - RIVALES.DIENTES_SIERRA;

  // Muros medibles (06.03)
  if (RIVALES.MUROS.includes(i)) mult *= RIVALES.MURO_MULT;

  return mult;
}

/** Oro base que paga vencer al rival i (07.01 según nivel del rival). */
export function oroDelRival(i, nivelRival, piso = 0) {
  const div = divisionPorIndice(i);
  const base = nivelRival * 12;
  const multDiv = div === TORRE
    ? Math.pow(TORRE.multOroPorPiso, piso)
    : div.multOro;
  return Math.max(5, Math.round(base * multDiv));
}

/** Descripción textual de la dificultad relativa. */
export function etiquetaDificultad(poderRival, poderHeroe) {
  const r = poderRival / Math.max(1, poderHeroe);
  if (r < 0.75) return { txt: 'Presa fácil', clase: 'ok' };
  if (r < 0.92) return { txt: 'Asequible', clase: 'ok' };
  if (r < 1.08) return { txt: 'Parejo', clase: '' };
  if (r < 1.30) return { txt: 'Duro', clase: 'bad' };
  return { txt: 'Brutal', clase: 'bad' };
}
