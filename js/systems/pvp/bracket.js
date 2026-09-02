/* ===== EL CUADRO DE ELIMINACIÓN =====
   23.01 eliminación simple · 23.05 rondas 32→16→8→4→2→1
   24.06 sorteo puro: cero cabezas de serie
   23.02 tus luchas se viven una a una · 23.03 de las demás solo el resultado
   23.08 empate → se repite la lucha
   23.11 se muestra tu mitad del cuadro
   23.05 la final es al mejor de 3 caídas */

import { rngDe } from '../../core/rng.js';
import { nombreRonda, FINAL_AL_MEJOR_DE } from '../../data/ligas.js';
import { llenarCuadro } from './ghosts.js';
import { resolverRapido } from '../combat/engine.js';

/**
 * Fuerza de los CPU respecto al jugador (24.05).
 * Calibrado en el Paso 12 midiendo 400 torneos por liga: con 1.00 los CPU
 * quedaban por encima (0 campeonatos en 450 intentos y ROI −32% en el cuadro
 * de 32, muy por debajo del 5% de rake). Con 0.95 un jugador medio ronda el
 * equilibrio y el cuadro de 8 da ~14% de campeonatos.
 */
export const BANDA_CPU = 0.95;

/**
 * 24.06 — sorteo puro: se baraja todo el mundo y se emparejan en orden.
 * El héroe entra en el bombo como uno más (24.14 sin protección).
 */
export function sortearCuadro(heroe, sala, opciones = {}) {
  const { semilla = Date.now(), nivelHeroe = 1, statsHeroe = null, banda = BANDA_CPU } = opciones;
  const rng = rngDe('bracket', semilla);

  const cpus = llenarCuadro(rng, sala.cuadro - 1, { nivelHeroe, statsHeroe, banda });
  const jugador = Object.assign(Object.create(Object.getPrototypeOf(heroe) || Object.prototype),
    heroe, { id: 'yo', esJugador: true, cpu: false, ico: heroe.ico || '⭐' });

  const participantes = rng.barajar([jugador, ...cpus]);

  // Ronda 1: parejas consecutivas del bombo ya barajado
  const rondas = [];
  const primera = [];
  for (let i = 0; i < participantes.length; i += 2) {
    primera.push(crearLlave(rondas.length, primera.length, participantes[i], participantes[i + 1]));
  }
  rondas.push(primera);

  // Rondas siguientes vacías, para poder pintar el cuadro completo desde el inicio
  let n = primera.length;
  while (n > 1) {
    n = n / 2;
    rondas.push(Array.from({ length: n }, (_, i) => crearLlave(rondas.length, i, null, null)));
  }

  return {
    salaId: sala.id,
    plazas: sala.cuadro,
    totalRondas: Math.log2(sala.cuadro),
    rondaActual: 1,
    rondas,
    participantes,
    jugador,
    eliminado: false,
    rondaEliminado: null,
    campeon: null,
    terminado: false,
    semilla
  };
}

function crearLlave(iRonda, iLlave, a, b) {
  return {
    ronda: iRonda + 1,
    indice: iLlave,
    a, b,
    ganador: null,
    resultado: null,          // {motivo, ticks, repeticiones}
    esDelJugador: !!(a?.esJugador || b?.esJugador),
    jugada: false
  };
}

/** La llave de esta ronda donde está el jugador (23.02). */
export function llaveDelJugador(cuadro, ronda = cuadro.rondaActual) {
  const r = cuadro.rondas[ronda - 1];
  if (!r) return null;
  return r.find(l => l.a?.esJugador || l.b?.esJugador) || null;
}

/** El rival del jugador en esta ronda, o null si ya está fuera. */
export function rivalActual(cuadro) {
  const l = llaveDelJugador(cuadro);
  if (!l) return null;
  return l.a?.esJugador ? l.b : l.a;
}

export function nombreRondaActual(cuadro) {
  const r = cuadro.rondas[cuadro.rondaActual - 1];
  return r ? nombreRonda(r.length) : '';
}

/** ¿Es la final? Entonces se juega al mejor de 3 (23.05). */
export function esFinal(cuadro, ronda = cuadro.rondaActual) {
  return ronda === cuadro.totalRondas;
}

/**
 * 23.08 — resuelve una llave. Si empata, SE REPITE hasta que haya ganador.
 * En la final, al mejor de 3 caídas (23.05).
 */
export function resolverLlave(llave, rng, opciones = {}) {
  const { alMejorDe = 1, maxRepeticiones = 20 } = opciones;
  const { a, b } = llave;

  if (!a && !b) return null;
  if (!a || !b) {                        // bye: no debería pasar con cuadros potencia de 2
    llave.ganador = a || b;
    llave.jugada = true;
    return llave;
  }

  const necesarias = Math.ceil(alMejorDe / 2);
  let vA = 0, vB = 0, repeticiones = 0, caidas = [];

  while (vA < necesarias && vB < necesarias && repeticiones < maxRepeticiones) {
    const res = resolverRapido(a, b, { semilla: rng.int(1, 1e9) });
    repeticiones++;

    if (res.ganador === 'heroe') { vA++; caidas.push({ ganador: 'a', motivo: res.motivo, ticks: res.ticks }); }
    else if (res.ganador === 'rival') { vB++; caidas.push({ ganador: 'b', motivo: res.motivo, ticks: res.ticks }); }
    else {
      // 23.08 empate: no cuenta, se repite la lucha
      caidas.push({ ganador: null, motivo: 'empate', ticks: res.ticks, repetida: true });
    }
  }

  // Salvaguarda: si tras el tope sigue empatado, decide el de más poder
  if (vA === vB) { (a.poder >= b.poder ? vA++ : vB++); }

  llave.ganador = vA > vB ? a : b;
  llave.perdedor = vA > vB ? b : a;
  llave.resultado = {
    caidas, vA, vB, repeticiones,
    empatesRepetidos: caidas.filter(c => c.repetida).length
  };
  llave.jugada = true;
  return llave;
}

/**
 * Juega la ronda actual entera.
 * 23.03 — las luchas ajenas se resuelven en silencio y solo se ve el resultado.
 * 23.02 — la del jugador se puede excluir para vivirla en la arena.
 */
export function jugarRonda(cuadro, { saltarLaDelJugador = false } = {}) {
  const rng = rngDe('ronda', cuadro.semilla, cuadro.rondaActual);
  const ronda = cuadro.rondas[cuadro.rondaActual - 1];
  const alMejorDe = esFinal(cuadro) ? FINAL_AL_MEJOR_DE : 1;

  for (const llave of ronda) {
    if (llave.jugada) continue;
    if (saltarLaDelJugador && llave.esDelJugador) continue;
    resolverLlave(llave, rng, { alMejorDe });
  }
  return ronda;
}

/**
 * Aplica el resultado de la lucha del jugador vivida en la arena (23.02).
 * @param {boolean} gano
 */
export function registrarLuchaDelJugador(cuadro, gano, detalle = null) {
  const llave = llaveDelJugador(cuadro);
  if (!llave || llave.jugada) return null;

  const yo = llave.a?.esJugador ? llave.a : llave.b;
  const otro = llave.a?.esJugador ? llave.b : llave.a;

  llave.ganador = gano ? yo : otro;
  llave.perdedor = gano ? otro : yo;
  llave.resultado = detalle || { caidas: [], vA: 0, vB: 0, repeticiones: 1, empatesRepetidos: 0 };
  llave.jugada = true;
  return llave;
}

/** Pasa a la ronda siguiente propagando los ganadores. */
export function avanzarRonda(cuadro) {
  const ronda = cuadro.rondas[cuadro.rondaActual - 1];
  if (ronda.some(l => !l.jugada)) return { ok: false, motivo: 'ronda incompleta' };

  // ¿Sigue vivo el jugador?
  const mia = ronda.find(l => l.esDelJugador);
  if (mia && !mia.ganador?.esJugador && !cuadro.eliminado) {
    cuadro.eliminado = true;
    cuadro.rondaEliminado = cuadro.rondaActual;
  }

  if (cuadro.rondaActual >= cuadro.totalRondas) {
    cuadro.campeon = ronda[0].ganador;
    cuadro.terminado = true;
    return { ok: true, terminado: true, campeon: cuadro.campeon };
  }

  // Propagar: el ganador de la llave i va a la llave floor(i/2) de la siguiente
  const siguiente = cuadro.rondas[cuadro.rondaActual];
  ronda.forEach((l, i) => {
    const destino = siguiente[Math.floor(i / 2)];
    if (i % 2 === 0) destino.a = l.ganador;
    else destino.b = l.ganador;
    destino.esDelJugador = !!(destino.a?.esJugador || destino.b?.esJugador);
  });

  cuadro.rondaActual++;
  return { ok: true, terminado: false, ronda: cuadro.rondaActual };
}

/**
 * 23.11 — tu mitad del cuadro: solo las llaves que podrías llegar a jugar.
 * Se calcula hacia atrás desde tu posición en la ronda 1.
 */
export function miMitad(cuadro) {
  const R = cuadro.totalRondas;
  const primera = cuadro.rondas[0];
  const iMio = primera.findIndex(l => l.a?.esJugador || l.b?.esJugador);
  if (iMio < 0 || R < 2) return cuadro.rondas.map(r => r.slice());

  // Mi "mitad" es el subárbol que desemboca en mi semifinal.
  // En la ronda r (1-based) la llave j pertenece a mi mitad si
  // j >> (R-1-r) coincide con el id de mi mitad (0 o 1).
  const mitad = iMio >> (R - 2);

  return cuadro.rondas.map((ronda, idx) => {
    const r = idx + 1;
    if (r >= R) return ronda.slice();               // la final la ven todos
    const shift = R - 1 - r;
    return ronda.filter((_, j) => (j >> shift) === mitad);
  });
}

/**
 * Camino recorrido por el jugador: a quién ganó en cada ronda.
 * Sirve para el resumen final y para la imagen compartible (Sugerencia #4).
 */
export function caminoDelJugador(cuadro) {
  const out = [];
  for (let r = 0; r < cuadro.rondas.length; r++) {
    const l = cuadro.rondas[r].find(x => x.a?.esJugador || x.b?.esJugador);
    if (!l || !l.jugada) continue;
    const rival = l.a?.esJugador ? l.b : l.a;
    out.push({
      ronda: r + 1,
      nombreRonda: nombreRonda(cuadro.rondas[r].length),
      rival: rival?.nombre || '—',
      ico: rival?.ico || '🤼',
      gano: !!l.ganador?.esJugador,
      empatesRepetidos: l.resultado?.empatesRepetidos || 0
    });
  }
  return out;
}

/** Simula el torneo completo de golpe (para tests y para el modo rápido). */
export function simularTorneoCompleto(cuadro) {
  let guardia = 0;
  while (!cuadro.terminado && guardia++ < 12) {
    jugarRonda(cuadro);
    avanzarRonda(cuadro);
  }
  return cuadro;
}
