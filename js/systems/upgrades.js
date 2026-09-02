/* ===== MEJORA DE ESTADÍSTICAS CON ORO =====
   13.01 lista simple con botones + · 13.02 coste creciente por stat
   13.03 +1 fijo por compra · 13.11 sin deshacer · 13.14 sin confirmación
   13.05 efecto exacto en DPS antes de comprar
   13.10 botón "mejorar todo" equilibrado · 07.12 escalado exponencial suave

   Sugerencias del Paso 8 implementadas aquí:
   #1 confirmación SOLO si la compra supera el 25% de tu oro
   #2 "coste hasta el tope" de la stat en tu nivel actual
   #3 compra x1 / x10 / xMáx */

import { PROG } from '../data/constants.js';
import { S, topeStat, costeStat, gastarOro } from '../core/state.js';
import { CLAVES_STATS } from '../data/stats.js';
import { aplicarClase } from '../data/clases.js';
import { poder, dpsEstimado } from './power.js';
import { bonosDeEquipo } from './fighter.js';
import { emit } from '../core/events-bus.js';

/** Umbral de la Sugerencia #1: por encima de esto se pide confirmación. */
export const UMBRAL_CONFIRMAR = 0.25;

/* ---------- Costes ---------- */

/** Coste de la compra número `n` a partir de las ya hechas. */
export function costeCompraN(clave, n = 0) {
  const compradas = (S.compras[clave] || 0) + n;
  return Math.floor(PROG.COSTE_STAT_BASE * Math.pow(PROG.COSTE_STAT_ESCALA, compradas));
}

/** Coste total de comprar `cantidad` puntos seguidos (13.02 acumulado). */
export function costeDeVarias(clave, cantidad) {
  let total = 0;
  const margen = topeStat() - S.stats[clave];
  const real = Math.max(0, Math.min(cantidad, margen));
  for (let n = 0; n < real; n++) total += costeCompraN(clave, n);
  return { total, cantidad: real };
}

/** Cuántas puedes pagar ahora mismo, respetando el tope. */
export function cuantasPuedoPagar(clave, oro = S.monedas.oro) {
  let n = 0, gastado = 0;
  const margen = topeStat() - S.stats[clave];
  while (n < margen) {
    const c = costeCompraN(clave, n);
    if (gastado + c > oro) break;
    gastado += c; n++;
  }
  return { cantidad: n, coste: gastado };
}

/** Sugerencia #2: oro necesario para llevar la stat a su tope actual. */
export function costeHastaTope(clave) {
  const margen = Math.max(0, topeStat() - S.stats[clave]);
  return costeDeVarias(clave, margen);
}

/* ---------- Compra ---------- */

/**
 * Compra `cantidad` puntos de una stat.
 * Devuelve { ok, compradas, gastado, motivo }.
 * Nota: NO pide confirmación — eso lo decide la interfaz con `requiereConfirmar`.
 */
export function comprarStat(clave, cantidad = 1) {
  if (!(clave in S.stats)) return { ok: false, compradas: 0, gastado: 0, motivo: 'stat-desconocida' };

  const tope = topeStat();
  if (S.stats[clave] >= tope) return { ok: false, compradas: 0, gastado: 0, motivo: 'tope' };

  let compradas = 0, gastado = 0;
  for (let n = 0; n < cantidad; n++) {
    if (S.stats[clave] >= tope) break;
    const coste = costeStat(clave);
    if (S.monedas.oro < coste) break;
    gastarOro(coste, `stat:${clave}`);
    S.stats[clave] += PROG.SUBIDA_POR_PUNTO;
    S.compras[clave]++;
    compradas++; gastado += coste;
  }

  if (!compradas) return { ok: false, compradas: 0, gastado: 0, motivo: 'sin-oro' };

  emit('stat:change', { clave, valor: S.stats[clave], coste: gastado, compradas });
  return { ok: true, compradas, gastado, motivo: null };
}

/** Sugerencia #1: ¿esta compra merece un "¿seguro?" */
export function requiereConfirmar(coste) {
  return S.monedas.oro > 0 && coste / S.monedas.oro > UMBRAL_CONFIRMAR;
}

/* ---------- Mejorar todo equilibrado (13.10) ---------- */

/**
 * Reparte el oro disponible subiendo SIEMPRE la stat más barata
 * que aún no esté en el tope. Resultado: un build parejo sin micromanejo.
 * @param {number} presupuesto oro máximo a usar (por defecto, todo)
 */
export function mejorarTodoEquilibrado(presupuesto = S.monedas.oro, maxPasos = 400) {
  const tope = topeStat();
  const detalle = {};
  let gastado = 0, pasos = 0;

  while (pasos < maxPasos) {
    // candidata = la stat más barata; a igualdad, la más baja
    let mejor = null, mejorCoste = Infinity;
    for (const k of CLAVES_STATS) {
      if (S.stats[k] >= tope) continue;
      const c = costeStat(k);
      if (c < mejorCoste || (c === mejorCoste && mejor && S.stats[k] < S.stats[mejor])) {
        mejor = k; mejorCoste = c;
      }
    }
    if (!mejor) break;                              // todo al tope
    if (gastado + mejorCoste > presupuesto) break;  // no alcanza
    if (S.monedas.oro < mejorCoste) break;

    gastarOro(mejorCoste, `stat:${mejor}`);
    S.stats[mejor] += PROG.SUBIDA_POR_PUNTO;
    S.compras[mejor]++;
    detalle[mejor] = (detalle[mejor] || 0) + 1;
    gastado += mejorCoste;
    pasos++;
  }

  if (pasos) emit('stat:change', { clave: null, valor: null, coste: gastado, compradas: pasos });
  return { pasos, gastado, detalle };
}

/* ---------- Previsualización de efecto (13.05) ---------- */

/** Qué pasa exactamente si subes `clave` en `cantidad` puntos. */
export function efectoDe(clave, cantidad = 1) {
  const bon = bonosDeEquipo();
  const cl = S.perfil.clase, sc = S.perfil.subclase;

  const antes = aplicarClase(S.stats, cl, sc);
  const prueba = { ...S.stats, [clave]: S.stats[clave] + cantidad };
  const despues = aplicarClase(prueba, cl, sc);

  const dpsA = dpsEstimado(antes, bon), dpsB = dpsEstimado(despues, bon);
  const poderA = poder(antes, bon), poderB = poder(despues, bon);

  return {
    dpsAntes: dpsA, dpsDespues: dpsB,
    dpsDelta: dpsB - dpsA,
    dpsPct: dpsA > 0 ? ((dpsB - dpsA) / dpsA) * 100 : 0,
    poderAntes: poderA, poderDespues: poderB,
    poderDelta: poderB - poderA
  };
}

/* ---------- Sugerencia #5: aviso suave de build muerta ---------- */

const DEFENSIVAS = ['vida', 'defensa', 'recuperacion', 'aguante'];

/**
 * Si el jugador lleva muchos niveles sin invertir NADA en supervivencia,
 * se le avisa. No bloquea nada: no hay respec (03.10), así que es piedad.
 */
export function avisoBuildMuerta() {
  const nivel = S.perfil.nivel;
  if (nivel < 10) return null;

  const totalDef = DEFENSIVAS.reduce((a, k) => a + (S.compras[k] || 0), 0);
  const totalTodo = CLAVES_STATS.reduce((a, k) => a + (S.compras[k] || 0), 0);
  if (totalTodo < 12) return null;

  const ratio = totalDef / totalTodo;
  if (ratio >= 0.18) return null;

  return {
    tipo: 'defensa',
    texto: `Llevas ${totalTodo} mejoras y solo ${totalDef} en supervivencia (${Math.round(ratio * 100)}%). ` +
           `Los jefes de las próximas divisiones pegan muy fuerte: sin Vida ni Defensa te tumbarán antes de que puedas responder. ` +
           `Como no existe reasignación de puntos, conviene corregir el rumbo ahora.`
  };
}
