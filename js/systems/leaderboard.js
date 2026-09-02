/* ===== CLASIFICACIÓN DEL EVENTO =====
   19.07 cincuenta competidores CPU · 19.08 puntajes en una banda
   19.10 clasificación en vivo con brechas · 19.11 dificultad global fija
   19.09 empate → muerte súbita
   21.10 la tabla se ve ANTES de inscribirse

   Sugerencia #3: los 50 CPU llevan nombres del generador procedural,
   no "CPU_23". Cuesta cero y la tabla se siente como un torneo real.
   Sugerencia #4: objetivo personal en vivo ("te faltan 340 para el top 10"). */

import { rngDe } from '../core/rng.js';
import { generarNombre } from '../data/nombres.js';
import { CLAVES_CLASES, CLASES } from '../data/clases.js';
import { EVENTOS } from '../data/constants.js';
import { TIPOS_EVENTO } from '../data/eventos.js';

/**
 * Puntaje de referencia que un jugador "medio" haría en este evento.
 * 19.11 — la dificultad es global y fija: no se adapta al jugador,
 * así que mejorar tu build se nota de verdad en la tabla.
 */
/**
 * Puntaje de referencia: lo que hace un jugador MEDIO en este evento.
 * Los valores base están calibrados midiendo 40 intentos de un héroe
 * de stats planas en el Paso 11 (ver REF_BASE).
 * 19.11 — la dificultad es global y fija: no se adapta al jugador,
 * así que mejorar tu build se nota de verdad en la tabla.
 */
const REF_BASE = {
  relampago: 130, coloso: 400, supervivencia: 300,
  carreraKO: 950, leyendas: 165, montania: 120, estilo: 360
};

export function puntajeReferencia(idEvento, nivelHeroe = 1) {
  const base = REF_BASE[idEvento];
  if (base == null) return 100;
  return Math.round(base * (1 + nivelHeroe * 0.16));
}

/**
 * 19.07 / 19.08 — genera los 50 rivales CPU del evento con puntajes
 * repartidos en una banda alrededor de la referencia.
 * Determinista por día + evento: la tabla no cambia al recargar.
 */
export function generarTabla(idEvento, { dia, nivelHeroe = 1, cantidad = EVENTOS.COMPETIDORES } = {}) {
  const rng = rngDe('tabla', dia || 'x', idEvento);
  const ref = puntajeReferencia(idEvento, nivelHeroe);

  const filas = [];
  for (let i = 0; i < cantidad; i++) {
    // Banda: la mayoría cerca de la referencia, unos pocos muy arriba
    const percentil = (i + 0.5) / cantidad;
    // curva que estira los extremos
    const factor = 0.42 + Math.pow(1 - percentil, 1.9) * 1.35;
    const ruido = rng.rango(0.92, 1.08);
    const puntos = Math.max(20, Math.round(ref * factor * ruido));

    const clase = rng.elegir(CLAVES_CLASES);
    filas.push({
      id: `cpu${i}`,
      nombre: generarNombre(rng),          // Sugerencia #3
      clase,
      ico: CLASES[clase]?.ico || '🤼',
      puntos,
      esJugador: false
    });
  }

  filas.sort((a, b) => b.puntos - a.puntos);
  return filas;
}

/**
 * Inserta al jugador en la tabla y la ordena.
 * 19.09 — en caso de empate exacto, muerte súbita: el jugador queda
 * POR DEBAJO del CPU empatado (hay que superarlo, no igualarlo).
 */
export function clasificar(tablaCPU, puntosJugador, nombreJugador = 'Tú') {
  const filas = tablaCPU.map(f => ({ ...f }));
  filas.push({
    id: 'jugador', nombre: nombreJugador, clase: null, ico: '⭐',
    puntos: puntosJugador, esJugador: true
  });

  filas.sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos;
    // 19.09 muerte súbita: empatar no basta
    if (a.esJugador) return 1;
    if (b.esJugador) return -1;
    return 0;
  });

  return filas.map((f, i) => ({ ...f, puesto: i + 1 }));
}

/** Posición del jugador en una tabla ya clasificada. */
export function puestoDelJugador(clasificacion) {
  const f = clasificacion.find(x => x.esJugador);
  return f ? f.puesto : clasificacion.length;
}

/**
 * 19.10 — brechas: cuánto te separa del de arriba y del de abajo.
 * Sugerencia #4: además, cuánto falta para entrar al top 10.
 */
export function brechas(clasificacion, premiados = EVENTOS.PREMIADOS) {
  const idx = clasificacion.findIndex(f => f.esJugador);
  if (idx < 0) return null;

  const yo = clasificacion[idx];
  const arriba = idx > 0 ? clasificacion[idx - 1] : null;
  const abajo = idx < clasificacion.length - 1 ? clasificacion[idx + 1] : null;

  // Objetivo: el puntaje del que ocupa el último puesto premiado
  const corte = clasificacion[premiados - 1];
  const enPremios = yo.puesto <= premiados;
  const faltaTop = enPremios || !corte ? 0 : (corte.puntos - yo.puntos) + 1;

  return {
    puesto: yo.puesto,
    puntos: yo.puntos,
    total: clasificacion.length,
    arriba: arriba ? { nombre: arriba.nombre, puntos: arriba.puntos, diff: arriba.puntos - yo.puntos + 1 } : null,
    abajo:  abajo  ? { nombre: abajo.nombre,  puntos: abajo.puntos,  diff: yo.puntos - abajo.puntos } : null,
    enPremios,
    puntosParaTop: faltaTop,
    corteTop: corte ? corte.puntos : 0
  };
}

/**
 * Sugerencia #4 — objetivo personal en texto, con los intentos que quedan.
 * Convierte "me quedan 3 intentos" en tensión real.
 */
export function objetivoPersonal(clasificacion, intentosRestantes, mejorIntento = 0) {
  const b = brechas(clasificacion);
  if (!b) return null;

  if (b.enPremios) {
    return {
      texto: b.arriba
        ? `Estás ${b.puesto}º. Te faltan ${b.arriba.diff} puntos para adelantar a ${b.arriba.nombre}.`
        : `¡Vas primero! Defiende la posición.`,
      enPremios: true,
      objetivo: b.arriba ? b.arriba.diff : 0
    };
  }

  if (intentosRestantes <= 0) {
    return {
      texto: `Terminaste ${b.puesto}º de ${b.total}. Te faltaron ${b.puntosParaTop} puntos para el top 10.`,
      enPremios: false, objetivo: b.puntosParaTop
    };
  }

  const porIntento = mejorIntento > 0
    ? Math.ceil(b.puntosParaTop / intentosRestantes)
    : b.puntosParaTop;

  return {
    texto: `Vas ${b.puesto}º. Necesitas ${b.puntosParaTop} puntos más para entrar al top 10` +
           (mejorIntento > 0 ? ` (unos ${porIntento} por intento).` : '.'),
    enPremios: false,
    objetivo: b.puntosParaTop,
    porIntento
  };
}
