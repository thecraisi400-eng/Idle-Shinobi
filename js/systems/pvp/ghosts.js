/* ===== LOS RIVALES DEL CUADRO =====
   22.04 los huecos se llenan con CPU de nombres creíbles
   24.04 identidad: nombre + clase + detalle visual
   24.05 dificultad escalada CON SORPRESAS: el 10% es un tiburón disfrazado
   24.14 sin protección al novato: puede tocarte un campeón en ronda 1
   24.11 sin ELO visible · 24.06 sorteo puro sin seeds */

import { generarNombre } from '../../data/nombres.js';
import { CLASES, CLAVES_CLASES } from '../../data/clases.js';
import { CLAVES_STATS } from '../../data/stats.js';
import { crearLuchador } from '../fighter.js';

/** 24.05 — uno de cada diez es mucho más fuerte de lo que aparenta. */
export const PROB_TIBURON = 0.10;
export const MULT_TIBURON = 1.35;

/** 24.04 — el "detalle visual": una coletilla que da carácter. */
export const APODOS = [
  'el Invicto', 'el Verdugo', 'el Silencioso', 'el Imparable', 'el Cruel',
  'el Veterano', 'el Ambicioso', 'el Fantasma', 'el Rey Caído', 'el Hambriento',
  'la Tormenta', 'el Muro', 'el Relámpago', 'el Carnicero', 'el Elegante'
];

export const PROCEDENCIAS = [
  'Monterrey', 'Guadalajara', 'Caracas', 'Bogotá', 'Lima', 'Santiago',
  'La Habana', 'Sevilla', 'Buenos Aires', 'San Juan', 'Medellín', 'Quito'
];

/**
 * Un rival del cuadro.
 * 24.05 — la dificultad escala con el nivel del jugador, pero con sorpresas.
 */
export function crearFantasma(rng, { nivelHeroe, statsHeroe, banda = 1 }) {
  const tiburon = rng.chance(PROB_TIBURON);
  const mult = banda * (tiburon ? MULT_TIBURON : rng.rango(0.82, 1.12));

  const stats = {};
  for (const k of CLAVES_STATS) {
    const base = statsHeroe?.[k] || 15;
    stats[k] = Math.max(4, Math.round(base * mult * rng.rango(0.9, 1.1)));
  }

  const clase = rng.elegir(CLAVES_CLASES);
  const nombre = generarNombre(rng);

  const f = crearLuchador({
    nombre, clase,
    nivel: Math.max(1, Math.round(nivelHeroe * rng.rango(0.9, 1.1))),
    stats,
    personalidad: rng.elegir(['agresivo', 'oportunista', 'defensivo', 'equilibrado'])
  });

  return Object.assign(f, {
    // 24.04 identidad completa
    apodo: rng.elegir(APODOS),
    procedencia: rng.elegir(PROCEDENCIAS),
    ico: CLASES[clase]?.ico || '🤼',
    color: CLASES[clase]?.color || '#888',
    // 24.05 el tiburón NO se anuncia: se descubre luchando
    tiburon,
    cpu: true
  });
}

/**
 * 22.04 — llena el cuadro entero de CPU.
 * @param {number} cuantos plazas a rellenar
 */
export function llenarCuadro(rng, cuantos, { nivelHeroe, statsHeroe, banda = 1 }) {
  const out = [];
  const usados = new Set();
  for (let i = 0; i < cuantos; i++) {
    let f, intentos = 0;
    do {
      f = crearFantasma(rng, { nivelHeroe, statsHeroe, banda });
      intentos++;
    } while (usados.has(f.nombre) && intentos < 12);   // nombres únicos en el cuadro
    usados.add(f.nombre);
    f.id = `g${i}`;
    out.push(f);
  }
  return out;
}

/**
 * Sugerencia #2 — ficha del oponente antes de luchar.
 * 24.11 sin ELO: se muestra Poder y clase, no un rating inventado.
 * El tiburón NO se revela aquí: la sorpresa es el punto (24.05).
 */
export function fichaDe(f) {
  if (!f) return null;
  return {
    nombre: f.nombre,
    apodo: f.apodo,
    procedencia: f.procedencia,
    clase: f.clase,
    ico: f.ico,
    color: f.color,
    nivel: f.nivel,
    poder: f.poder,
    vidaMax: Math.round(f.der.vidaMax),
    dano: Math.round(f.der.danoBase)
  };
}

/** Comparativa rápida contra tu héroe, para decidir si cambias equipo. */
export function compararCon(heroe, rival) {
  if (!heroe || !rival) return null;
  const ratio = rival.poder / Math.max(1, heroe.poder);
  let veredicto, tono;
  if (ratio >= 1.25) { veredicto = 'Muy superior a ti'; tono = 'mal'; }
  else if (ratio >= 1.08) { veredicto = 'Más fuerte que tú'; tono = 'aviso'; }
  else if (ratio >= 0.92) { veredicto = 'Parejo contigo'; tono = 'neutro'; }
  else if (ratio >= 0.78) { veredicto = 'Algo por debajo'; tono = 'ok'; }
  else { veredicto = 'Muy por debajo'; tono = 'ok'; }
  return { ratio, veredicto, tono, diffPoder: rival.poder - heroe.poder };
}
