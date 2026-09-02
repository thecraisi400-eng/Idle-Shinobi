/* ===== EL POZO Y SU REPARTO =====
   22.02 pozo = entradas − rake del 5%
   22.12 la inscripción muestra el desglose y el reparto completo
   23.06 top 7 con premio dominante: 40/22/14/8/6/5/5
   23.07 los eliminados temprano no reciben nada
   23.04 sin premio por ronda: todo se paga por puesto final
   24.09 sin multiplicadores por hora pico */

import { ECO } from '../../data/constants.js';

/** 23.06 — reparto del pozo entre los 7 primeros. */
export const REPARTO = [
  { puesto: 1, pct: 0.40 },
  { puesto: 2, pct: 0.22 },
  { puesto: 3, pct: 0.14 },
  { puesto: 4, pct: 0.08 },
  { puesto: 5, pct: 0.06 },
  { puesto: 6, pct: 0.05 },
  { puesto: 7, pct: 0.05 }
];

export const PREMIADOS = REPARTO.length;

/**
 * Cuántos puestos cobran en un cuadro concreto.
 * El plan fija el top 7 pensando en el cuadro de 32 (23.06). Aplicarlo tal
 * cual a un cuadro de 8 premiaría a 7 de 8 jugadores, lo que contradice
 * 23.07 ("salir pronto = perder la entrada"). Se escala a un cuarto del
 * cuadro, con el top 7 como techo.
 */
export function premiadosDe(plazas) {
  return Math.max(1, Math.min(PREMIADOS, Math.floor(plazas / 4)));
}

/** Reparto renormalizado al número real de premiados del cuadro. */
export function repartoDe(plazas) {
  const n = premiadosDe(plazas);
  const trozo = REPARTO.slice(0, n);
  const suma = trozo.reduce((a, r) => a + r.pct, 0);
  return trozo.map(r => ({ puesto: r.puesto, pct: r.pct / suma }));
}

/**
 * 22.02 — cálculo del pozo.
 * @param {number} buyIn entrada por cabeza
 * @param {number} plazas tamaño del cuadro
 * @param {number} multPozo 24.12 el XL infla el pozo
 */
export function calcularPozo(buyIn, plazas, multPozo = 1) {
  const recaudado = buyIn * plazas;
  const rake = Math.round(recaudado * ECO.PVP_RAKE);
  const pozo = Math.round((recaudado - rake) * multPozo);
  return { recaudado, rake, pozo, rakePct: ECO.PVP_RAKE, multPozo };
}

/**
 * 22.12 — tabla completa de premios por puesto, para enseñarla ANTES de pagar.
 * Los puestos 5º a 7º no son un puesto exacto sino un rango (los que caen
 * en la misma ronda comparten), así que se etiquetan como tal.
 */
export function tablaPremios(buyIn, plazas, multPozo = 1) {
  const { pozo } = calcularPozo(buyIn, plazas, multPozo);
  return repartoDe(plazas).map(r => ({
    puesto: r.puesto,
    pct: r.pct,
    oro: Math.round(pozo * r.pct),
    // ¿recupera al menos lo que pagó?
    rentable: Math.round(pozo * r.pct) >= buyIn
  }));
}

/** 23.07 — cuánto cobra un puesto concreto. Fuera del top 7: nada. */
export function premioDePuesto(puesto, buyIn, plazas, multPozo = 1) {
  const fila = repartoDe(plazas).find(r => r.puesto === puesto);
  if (!fila) return 0;
  const { pozo } = calcularPozo(buyIn, plazas, multPozo);
  return Math.round(pozo * fila.pct);
}

/**
 * Puesto final a partir de la ronda en que caíste.
 * En eliminación simple, los que caen en la misma ronda empatan a puesto:
 * el sistema les asigna el mejor puesto de su grupo (estándar en deportes).
 * @param {number} rondaEliminado 1-based; null/0 si fue campeón
 * @param {number} plazas
 */
export function puestoPorRonda(rondaEliminado, plazas) {
  const rondas = Math.log2(plazas);
  if (!rondaEliminado || rondaEliminado > rondas) return 1;      // campeón
  if (rondaEliminado === rondas) return 2;                        // perdió la final
  // Los eliminados en la ronda R son 2^(rondas-R) jugadores.
  // Su mejor puesto es 2^(rondas-R) + 1.
  const cuantos = Math.pow(2, rondas - rondaEliminado);
  return cuantos + 1;
}

/**
 * Resumen económico de un torneo terminado: qué pagaste, qué cobraste
 * y el neto. Con esto la pantalla es honesta sobre las pérdidas.
 */
export function balanceTorneo({ puesto, buyIn, plazas, multPozo = 1 }) {
  const premio = premioDePuesto(puesto, buyIn, plazas, multPozo);
  return {
    puesto, buyIn, premio,
    neto: premio - buyIn,
    premiado: premio > 0,
    campeon: puesto === 1
  };
}

/* ---------- Sugerencia #3: aviso de riesgo del buy-in ---------- */

/**
 * ¿Qué porcentaje de tu bolsillo es esta entrada?
 * Devuelve un nivel de riesgo para pintar el aviso antes de confirmar.
 */
export function riesgoBuyIn(buyIn, saldo) {
  if (saldo <= 0) return { pct: 1, nivel: 'imposible', texto: 'No tienes saldo para esta sala.' };
  const pct = buyIn / saldo;
  if (buyIn > saldo) return { pct, nivel: 'imposible', texto: 'No te alcanza para la entrada.' };
  if (pct >= 0.5) return { pct, nivel: 'alto', texto: `Cuidado: es el ${Math.round(pct * 100)}% de todo lo que tienes.` };
  if (pct >= 0.25) return { pct, nivel: 'medio', texto: `Es el ${Math.round(pct * 100)}% de tu saldo.` };
  return { pct, nivel: 'bajo', texto: `Solo el ${Math.round(pct * 100)}% de tu saldo.` };
}
