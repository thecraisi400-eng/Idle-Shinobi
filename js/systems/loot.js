/* ===== GENERACIÓN DE BOTÍN =====
   15.02 rarezas ponderadas · 15.05 nivel propio + estrellas
   15.06 sin substats (pocas stats, grandes) · 15.09 nombres genéricos
   15.10 requisitos mixtos · 15.11 exóticos con trade-off
   15.08 SIN objetos exclusivos de jefe: los jefes solo mejoran la suerte. */

import { rng as rngGlobal, rngDe } from '../core/rng.js';
import {
  SLOTS, CLAVES_SLOTS, RAREZAS, listaRarezas, getRareza, PREFIJOS,
  EXOTICOS, CLAVES_EXOTICOS, PROB_EXOTICO,
  puntosDePieza, valorDePieza
} from '../data/equipo.js';
import { CLAVES_STATS } from '../data/stats.js';

let contadorId = 0;
export function nuevoId() {
  return `it${Date.now().toString(36)}${(contadorId++).toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;
}

/* ---------- Sorteo de rareza ---------- */

/**
 * Elige la rareza. `suerte` desplaza la curva hacia arriba
 * (jefes y campeones dan más suerte, no objetos distintos — 15.08).
 */
export function sortearRareza(rng, suerte = 1) {
  const lista = listaRarezas().map(r => ({
    v: r.n,
    // la suerte multiplica el peso de las rarezas altas
    p: r.peso * Math.pow(suerte, r.n - 1)
  }));
  return rng.pesos(lista);
}

/* ---------- Generación de una pieza ---------- */

/**
 * Crea una pieza de equipo completa.
 * @param {object} opciones { nivel, slot, rareza, rng, clase }
 */
export function generarPieza(opciones = {}) {
  const rng = opciones.rng || rngGlobal;
  const nivel = Math.max(1, Math.round(opciones.nivel ?? 1));
  const slotId = opciones.slot || rng.elegir(CLAVES_SLOTS);
  const slot = SLOTS[slotId];
  const rareza = opciones.rareza || sortearRareza(rng, opciones.suerte ?? 1);
  const r = getRareza(rareza);

  // --- Estrellas iniciales: casi siempre 0, a veces regalo ---
  const estrellas = rng.chance(0.12) ? 1 : 0;

  // --- Reparto de stats (15.06: pocas y grandes, sin substats) ---
  const total = puntosDePieza(nivel, rareza, estrellas);
  const nStats = r.statsN;
  const elegidas = [];
  // la primera stat siempre es afín al slot: una máscara no da +Potencia
  elegidas.push(rng.elegir(slot.afines));
  while (elegidas.length < nStats) {
    const k = rng.elegir(CLAVES_STATS);
    if (!elegidas.includes(k)) elegidas.push(k);
  }

  const stats = {};
  let restante = total;
  elegidas.forEach((k, i) => {
    const esUltima = i === elegidas.length - 1;
    // la stat principal se lleva la mayor parte
    const porcion = esUltima ? restante : Math.round(total * (i === 0 ? 0.62 : 0.24));
    const v = Math.max(1, Math.min(restante, porcion));
    stats[k] = (stats[k] || 0) + v;
    restante -= v;
  });
  if (restante > 0) stats[elegidas[0]] += restante;

  // --- Exótico (15.11) ---
  let exotico = null;
  const probExo = opciones.exotico === true ? 1 : (PROB_EXOTICO[rareza] || 0);
  if (opciones.exotico !== false && rng.chance(probExo)) {
    const posibles = CLAVES_EXOTICOS.filter(k => EXOTICOS[k].rarezaMin <= rareza);
    if (posibles.length) {
      exotico = EXOTICOS[rng.elegir(posibles)];
      // el trade-off se aplica sobre las stats ya repartidas
      if (stats[exotico.sube] != null) {
        stats[exotico.sube] = Math.max(1, Math.round(stats[exotico.sube] * exotico.subeMult));
      } else {
        stats[exotico.sube] = Math.max(1, Math.round(total * 0.35 * exotico.subeMult));
      }
      // el castigo: si no tenía esa stat, se crea en NEGATIVO
      const castigo = exotico.bajaMult;
      if (stats[exotico.baja] != null) {
        stats[exotico.baja] = Math.round(stats[exotico.baja] * castigo);
        if (stats[exotico.baja] === 0) delete stats[exotico.baja];
      } else {
        stats[exotico.baja] = -Math.max(1, Math.round(total * 0.20 * (1 - castigo) * 5));
      }
      if (exotico.id === 'idolo') {
        stats.presencia = Math.round((stats.presencia || total * 0.2) * 1.5);
      }
    }
  }

  // --- Requisitos mixtos (15.10) ---
  const requisitos = { nivel: Math.max(1, Math.round(nivel * 0.8)) };
  if (rareza >= 3 && rng.chance(0.55)) {
    const clave = elegidas[0];
    requisitos.stat = { clave, valor: Math.max(5, Math.round(nivel * 0.9 + rareza * 2)) };
  }
  if (rareza >= 4 && rng.chance(0.22) && opciones.clase) {
    requisitos.clase = opciones.clase;
  }

  // --- Nombre genérico (15.09) ---
  const prefijo = rng.elegir(PREFIJOS[rareza] || PREFIJOS[1]);
  const nombre = exotico
    ? `${slot.nombre} ${exotico.nombre}`
    : `${slot.nombre} ${prefijo}`;

  const pieza = {
    id: nuevoId(),
    nombre,
    slot: slotId,
    ico: slot.ico,
    rareza,
    nivel,
    estrellas,
    stats,
    exotico: exotico ? exotico.id : null,
    requisitos,
    bloqueado: false          // Sugerencia #2: candado anti auto-venta
  };
  pieza.valor = valorDePieza(pieza);
  return pieza;
}

/* ---------- Botín de un combate ---------- */

/**
 * Decide si cae algo tras una lucha y qué cae.
 * Los jefes NO tienen tabla propia (15.08): solo suben la probabilidad
 * de que caiga algo y la suerte de rareza.
 */
export function botinDeCombate(rival, opciones = {}) {
  const { nivelHeroe = 1, clase = null, gano = true, rng = rngGlobal } = opciones;
  if (!gano) return { piezas: [], material: 0 };

  const tipo = rival?.tipo || 'normal';
  const probDrop = tipo === 'campeon' ? 1
                 : tipo === 'jefe'    ? 0.85
                 : tipo === 'nemesis' ? 0.90
                 : tipo === 'elite'   ? 0.55 : 0.30;

  const suerte = tipo === 'campeon' ? 1.9
               : tipo === 'jefe'    ? 1.5
               : tipo === 'nemesis' ? 1.6
               : tipo === 'elite'   ? 1.25 : 1;

  const piezas = [];
  const cuantas = tipo === 'campeon' ? 2 : 1;
  for (let i = 0; i < cuantas; i++) {
    if (!rng.chance(probDrop)) continue;
    piezas.push(generarPieza({
      nivel: Math.max(1, Math.round((rival?.nivel || nivelHeroe) * rng.rango(0.9, 1.1))),
      suerte, clase, rng
    }));
  }

  // Material de mejora (16.01)
  let material = 0;
  if (tipo === 'campeon') material = rng.int(4, 8);
  else if (tipo === 'jefe') material = rng.int(2, 5);
  else if (tipo === 'elite') material = rng.int(1, 3);
  else if (rng.chance(0.35)) material = rng.int(1, 2);

  // 18.06 — pasiva Chatarrero de la rama Economía
  if (material) {
    const mult = 1 + (opciones.materialMult || 0);
    material = Math.round(material * mult);
  }

  return { piezas, material };
}

/* ---------- Utilidades ---------- */

/** Suma total de puntos de stat de una pieza (para ordenar y comparar). */
export function puntuacion(pieza) {
  if (!pieza?.stats) return 0;
  return Object.values(pieza.stats).reduce((a, b) => a + b, 0);
}

/** Genera un lote determinista (para pruebas y para la tienda del Paso 11). */
export function generarLote(cantidad, opciones = {}) {
  const rng = opciones.rng || rngDe('loot', opciones.semilla || 1);
  return Array.from({ length: cantidad }, () => generarPieza({ ...opciones, rng }));
}
