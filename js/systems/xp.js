/* ===== EXPERIENCIA, RECOMPENSAS Y SUBIDA DE NIVEL =====
   04.01 curva creciente sin nivel máximo (01.08)
   07.01 oro según el nivel del rival · 07.04 25% al perder
   03.09 puntos libres por nivel · 13.04 el tope de stats sube con el nivel

   Este módulo es el que CIERRA el bucle: la Arena llama a `recompensar()`
   y aquí se reparte todo (oro, XP, gemas, récord, racha, rangos, rasgos). */

import { ECO, PROG } from '../data/constants.js';
import { S, ganarOro, ganarXP, ganarGemas, registrarResultado, xpNecesaria } from '../core/state.js';
import { rangoPorPoder, rasgosDisponibles } from '../data/rangos.js';
import { bonosTotales, reglasActivas } from './skilltree.js';
import { emit } from '../core/events-bus.js';
import { rng } from '../core/rng.js';

/* ---------- XP ---------- */

/** XP que otorga un rival. Escala con su nivel y su categoría. */
export function xpDelRival(rival, gano = true) {
  const base = 18 + (rival.nivel || 1) * 11;
  const mult = rival.tipo === 'campeon' ? 3.2
             : rival.tipo === 'jefe'    ? 2.0
             : rival.tipo === 'elite'   ? 1.6
             : rival.tipo === 'nemesis' ? 2.6 : 1;
  const total = base * mult;
  // 07.04 — perder también enseña, pero mucho menos
  return Math.max(1, Math.round(total * (gano ? 1 : ECO.ORO_DERROTA_PCT)));
}

/** Oro que paga un rival (ya viene precalculado en rival.oro). */
export function oroDelCombate(rival, gano = true) {
  const base = rival.oro || Math.max(10, (rival.nivel || 1) * ECO.ORO_POR_NIVEL_RIVAL);
  return Math.max(1, Math.round(base * (gano ? 1 : ECO.ORO_DERROTA_PCT)));
}

/** Bonus de oro por carisma/presencia: el público paga al que entretiene. */
export function bonusCarisma(heroe) {
  const car = (heroe?.stats?.carisma || 0) + (heroe?.stats?.presencia || 0) * 0.5;
  return 1 + Math.min(0.35, car * 0.004);
}

/* ---------- Recompensa completa de un combate ---------- */

/**
 * Entrega TODO el botín de una lucha y devuelve el desglose para pintarlo.
 * @param {object} rival luchador vencido (o que te venció)
 * @param {object} res   resultado del motor de combate
 * @param {object} heroe luchador del jugador
 */
export function recompensar(rival, res, heroe, gano) {
  const nivelAntes  = S.perfil.nivel;
  const puntosAntes = S.perfil.puntosLibres;
  const rangoAntes  = S.perfil.rango;

  const oroBase = oroDelCombate(rival, gano);
  const multCar = bonusCarisma(heroe);

  // 18.06 — pasivas económicas del árbol
  const pas = bonosTotales();
  const reglas = reglasActivas();
  const multOroArbol = 1 + (pas.oroMult || 0)
    + (reglas.oroPorRonda?.pct || 0) * (res?.rondas || 0);   // keystone Empresario
  const multXpArbol = 1 + (pas.xpMult || 0);

  const oro = Math.round(oroBase * multCar * multOroArbol);
  const xp  = Math.round(xpDelRival(rival, gano) * multXpArbol);

  // Gemas: gota rara, y solo al ganar (08.05 → 1–5 por vez)
  let gemas = 0;
  if (gano) {
    const prob = rival.tipo === 'campeon' ? 1
               : rival.tipo === 'jefe'    ? 0.55
               : rival.tipo === 'elite'   ? 0.25 : 0.04;
    if (rng.chance(prob)) {
      gemas = rng.int(ECO.GEMA_DROP_MIN, ECO.GEMA_DROP_MAX);
    }
  }

  ganarOro(oro, 'lucha');
  ganarXP(xp);
  if (gemas) ganarGemas(gemas, 'lucha');
  registrarResultado(gano);

  if (gano) {
    S.carrera.kos += res?.motivo === 'ko' ? 1 : 0;
  } else {
    S.carrera.kosRecibidos += res?.motivo === 'ko' ? 1 : 0;
  }

  const subioNivel = S.perfil.nivel > nivelAntes;
  const rangoNuevo = actualizarRango(heroe.poder);
  const subioRango = rangoNuevo.id !== rangoAntes;

  const desglose = {
    oro, oroBase, multCarisma: multCar, multOroArbol, multXpArbol, xp, gemas, gano,
    nivelAntes, nivelAhora: S.perfil.nivel,
    subioNivel,
    nivelesGanados: S.perfil.nivel - nivelAntes,
    puntosGanados: S.perfil.puntosLibres - puntosAntes,
    rango: rangoNuevo, subioRango,
    rasgosPendientes: rasgosDisponibles(S.perfil.nivel, S.perfil.rasgos)
  };

  emit('combate:recompensa', desglose);
  return desglose;
}

/** Recalcula y guarda el rango según el Poder (14.01). */
export function actualizarRango(poderTotal) {
  const r = rangoPorPoder(poderTotal);
  if (S.perfil.rango !== r.id) {
    S.perfil.rango = r.id;
    emit('rango:up', r);
  }
  return r;
}

/* ---------- Avance de rival tras la victoria ---------- */

/** Al ganar se avanza en la campaña; al perder se repite el rival. */
export function avanzarProgreso(gano) {
  if (!gano) return { avanzo: false };
  S.progreso.rivalIndice++;
  S.progreso.rivalActual = null;      // hay que elegir nuevas cartas
  S.progreso.cartasOfrecidas = null;
  S.progreso.luchasDesdeJefe++;
  emit('progreso:avance', { indice: S.progreso.rivalIndice });
  return { avanzo: true, indice: S.progreso.rivalIndice };
}

/* ---------- Ayudas para la interfaz ---------- */

export function xpPctExacto() {
  return { actual: S.perfil.xp, necesaria: xpNecesaria(), pct: (S.perfil.xp / xpNecesaria()) * 100 };
}

/** Cuánta XP falta para el siguiente nivel. */
export function xpRestante() {
  return Math.max(0, xpNecesaria() - S.perfil.xp);
}

/** Tope de stat que tendrás al subir N niveles (13.04). */
export function topeEnNivel(nivel) {
  return PROG.TOPE_STAT_BASE + PROG.TOPE_STAT_POR_NIVEL * (nivel - 1);
}
