/* ===== GENERADOR PROCEDURAL DE RIVALES =====
   05.08 nombres procedurales · 06.13 rasgos + rareza de rasgos
   06.06 élites al 5% · 05.13 jefes · 06.12 nivel + poder en el selector
   05.11 rival con historia (némesis)

   Sugerencia #4 del Paso 7: el RETRATO se deriva de la misma semilla
   que el nombre, así hay cientos de rivales visualmente distintos
   sin dibujar arte extra. */

import { rngDe } from '../core/rng.js';
import { RIVALES } from '../data/constants.js';
import { generarNombre } from '../data/nombres.js';
import { CLAVES_CLASES, CLASES } from '../data/clases.js';
import { CLAVES_ESPECIALES, ESPECIALES } from '../data/especiales.js';
import { crearLuchador } from './fighter.js';
import { esJefe, esCampeon, escaladoRival, oroDelRival } from './difficulty.js';
import { divisionPorIndice, indiceLocal } from '../data/divisiones.js';

/* ---------- RASGOS con rareza (06.13) ---------- */
export const RASGOS = {
  // comunes
  duro:        { id:'duro', nombre:'Piel dura', ico:'🪨', rareza:1, desc:'+15% de defensa.', mods:{ defensa:1.15 } },
  sanguineo:   { id:'sanguineo', nombre:'Sangre caliente', ico:'🌡️', rareza:1, desc:'+12% de potencia, −8% de defensa.', mods:{ potencia:1.12, defensa:0.92 } },
  veloz:       { id:'veloz', nombre:'Pies ligeros', ico:'💨', rareza:1, desc:'+12% de agilidad.', mods:{ agilidad:1.12 } },
  resistente:  { id:'resistente', nombre:'Pulmones de acero', ico:'🫁', rareza:1, desc:'+18% de aguante.', mods:{ aguante:1.18 } },
  // poco comunes
  tanque:      { id:'tanque', nombre:'Mole', ico:'🧱', rareza:2, desc:'+20% de vida, −10% de agilidad.', mods:{ vida:1.20, agilidad:0.90 } },
  tecnicoFino: { id:'tecnicoFino', nombre:'Manos de seda', ico:'🎩', rareza:2, desc:'+20% de técnica.', mods:{ tecnica:1.20 } },
  carismatico: { id:'carismatico', nombre:'Favorito del público', ico:'📣', rareza:2, desc:'+25% de carisma y presencia.', mods:{ carisma:1.25, presencia:1.15 } },
  // raros
  berserk:     { id:'berserk', nombre:'Berserker', ico:'😡', rareza:3, desc:'+25% de potencia, −15% de defensa y vida.', mods:{ potencia:1.25, defensa:0.85, vida:0.85 } },
  fantasmal:   { id:'fantasmal', nombre:'Escurridizo', ico:'👻', rareza:3, desc:'+25% de agilidad y precisión.', mods:{ agilidad:1.25, precision:1.20 } },
  regenerador: { id:'regenerador', nombre:'Se recupera solo', ico:'🩹', rareza:3, desc:'+35% de recuperación.', mods:{ recuperacion:1.35 } },
  // épicos
  monstruo:    { id:'monstruo', nombre:'Monstruo', ico:'👹', rareza:4, desc:'+15% a TODAS sus estadísticas.', mods:{ potencia:1.15, vida:1.15, defensa:1.15, agilidad:1.15, tecnica:1.15 } },
  imparable:   { id:'imparable', nombre:'Imparable', ico:'🔱', rareza:4, desc:'+30% de potencia y aguante.', mods:{ potencia:1.30, aguante:1.30 } }
};

export const RAREZA_RASGO = {
  1: { nombre:'Común',      color:'#8b8b93', peso: 60 },
  2: { nombre:'Poco común', color:'#4ec97a', peso: 25 },
  3: { nombre:'Raro',       color:'#4d9cf0', peso: 12 },
  4: { nombre:'Épico',      color:'#a765e8', peso: 3 }
};

const RASGOS_POR_RAREZA = Object.values(RASGOS).reduce((m, r) => {
  (m[r.rareza] ||= []).push(r);
  return m;
}, {});

function elegirRasgo(rng, sesgoRareza = 0) {
  const lista = Object.entries(RAREZA_RASGO).map(([r, d]) => ({
    v: Number(r),
    p: d.peso * (Number(r) >= 3 ? 1 + sesgoRareza : 1)
  }));
  const rareza = rng.pesos(lista);
  return rng.elegir(RASGOS_POR_RAREZA[rareza]);
}

/** Aplica los mods de una lista de rasgos. */
function aplicarRasgos(stats, rasgos) {
  const out = { ...stats };
  for (const r of rasgos) {
    for (const [k, m] of Object.entries(r.mods || {})) {
      if (k in out) out[k] = Math.max(1, Math.round(out[k] * m));
    }
  }
  return out;
}

/* ---------- Retrato procedural (Sugerencia #4) ---------- */
const PIELES = ['#c98a5e', '#a9683f', '#8a4f2d', '#e0a878', '#7a4426', '#d69b6b'];

function retratoDe(rng, clase) {
  return {
    piel: rng.elegir(PIELES),
    mascaraTono: rng.int(0, 3),        // variación del color de clase
    adorno: rng.chance(0.4)
  };
}

/**
 * Genera el rival número i de la campaña.
 * DETERMINISTA: el mismo (semilla, i) devuelve siempre el mismo rival.
 */
export function generarRival(i, opciones = {}) {
  const {
    semillaPartida = 1,
    statsHeroe = null,
    nivelHeroe = 1,
    piso = 0,
    variante = 0        // para ofrecer 3 tarjetas distintas del mismo índice
  } = opciones;

  const rng = rngDe('rival', semillaPartida, i, variante);
  const div = divisionPorIndice(i);
  const local = indiceLocal(i);

  const jefe = esJefe(i);
  const campeon = esCampeon(i);
  const elite = !jefe && !campeon && rng.chance(RIVALES.ELITE_PROB);   // 06.06

  // --- Clase ---
  const clase = rng.elegir(CLAVES_CLASES);

  // --- Stats base escaladas ---
  const mult = escaladoRival(i, piso)
    * (campeon ? RIVALES.CAMPEON_MULT          // 05.14 campeón de división
       : jefe ? RIVALES.JEFE_MULT              // 06.09 jefes = solo stats altas
       : elite ? RIVALES.ELITE_MULT : 1);

  const referencia = statsHeroe || {};
  const stats = {};
  for (const k of ['potencia','aguante','tecnica','agilidad','carisma','vida','defensa','precision','recuperacion','presencia']) {
    const base = referencia[k] || 15;
    // variación individual: cada rival tiene su propio perfil
    const perfil = rng.rango(0.82, 1.18);
    stats[k] = Math.max(5, Math.round(base * mult * perfil));
  }

  // --- Rasgos (06.13) ---
  const nRasgos = campeon ? 3 : jefe ? 2 : elite ? 2 : rng.chance(0.55) ? 1 : 0;
  const rasgos = [];
  const usados = new Set();
  for (let n = 0; n < nRasgos; n++) {
    const r = elegirRasgo(rng, (jefe || campeon || elite) ? 1.8 : 0);
    if (usados.has(r.id)) continue;
    usados.add(r.id);
    rasgos.push(r);
  }
  const statsFinales = aplicarRasgos(stats, rasgos);

  // --- Nombre e identidad ---
  const nombre = campeon
    ? `${generarNombre(rng)}`
    : generarNombre(rng);

  const nivel = Math.max(1, Math.round(nivelHeroe * (jefe ? 1.15 : elite ? 1.08 : 1)));

  // --- Especial del rival ---
  const dispo = CLAVES_ESPECIALES.filter(k => ESPECIALES[k].desbloqueo.nivel <= nivel + 5);
  const especial = rng.elegir(dispo.length ? dispo : ['plancha']);

  const luchador = crearLuchador({
    nombre, clase, nivel, stats: statsFinales,
    personalidad: rng.elegir(['agresivo', 'oportunista', 'defensivo'])   // 02.07
  });

  return Object.assign(luchador, {
    indice: i,
    esJefe: jefe,
    esCampeon: campeon,
    esElite: elite,
    division: div,
    indiceLocal: local,
    rasgos,
    especial,
    retrato: retratoDe(rng, clase),
    oro: Math.round(oroDelRival(i, nivel, piso) * (campeon ? 4.0 : jefe ? 2.2 : elite ? 1.8 : 1)),
    tipo: campeon ? 'campeon' : jefe ? 'jefe' : elite ? 'elite' : 'normal'
  });
}

/**
 * Genera las 3 tarjetas de elección (06.04).
 * Sugerencia #1 del Paso 7: son decisiones REALES —
 * una fácil con poco oro, una pareja, una arriesgada con botín superior.
 */
export function generarCartas(i, opciones = {}) {
  const perfiles = [
    { id: 'seguro',    etiqueta: 'Rival cómodo',   multStats: 0.86, multOro: 0.78, ico: '🟢' },
    { id: 'parejo',    etiqueta: 'Rival parejo',   multStats: 1.00, multOro: 1.00, ico: '🟡' },
    { id: 'arriesgado',etiqueta: 'Rival peligroso',multStats: 1.20, multOro: 1.55, ico: '🔴' }
  ];

  return perfiles.map((p, idx) => {
    const r = generarRival(i, { ...opciones, variante: idx + 1 });
    // Aplica el perfil de riesgo
    const stats = {};
    for (const [k, v] of Object.entries(r.stats)) stats[k] = Math.max(4, Math.round(v * p.multStats));
    const ajustado = crearLuchador({
      nombre: r.nombre, clase: r.clase, nivel: r.nivel,
      stats, personalidad: r.personalidad
    });
    return Object.assign(ajustado, {
      indice: r.indice, esJefe: r.esJefe, esCampeon: r.esCampeon, esElite: r.esElite,
      division: r.division, indiceLocal: r.indiceLocal, rasgos: r.rasgos,
      especial: r.especial, retrato: r.retrato, tipo: r.tipo,
      oro: Math.round(r.oro * p.multOro),
      perfil: p
    });
  });
}

/* ---------- NÉMESIS (05.11 rival con historia) ---------- */

/** Crea o recupera al némesis: reaparece más fuerte cada vez. */
export function generarNemesis(estadoNemesis, opciones = {}) {
  const veces = estadoNemesis?.encuentros || 0;
  const rng = rngDe('nemesis', opciones.semillaPartida || 1);

  const nombre = estadoNemesis?.nombre || generarNombre(rng);
  const clase = estadoNemesis?.clase || rng.elegir(CLAVES_CLASES);

  const mult = 1.25 * Math.pow(1.18, veces);
  const stats = {};
  for (const [k, v] of Object.entries(opciones.statsHeroe || {})) {
    stats[k] = Math.max(6, Math.round(v * mult));
  }

  const l = crearLuchador({
    nombre, clase, nivel: Math.round((opciones.nivelHeroe || 1) * 1.2),
    stats, personalidad: 'oportunista'
  });

  return Object.assign(l, {
    esNemesis: true,
    encuentros: veces,
    rasgos: [RASGOS.monstruo],
    tipo: 'nemesis',
    oro: Math.round((opciones.oroBase || 100) * 4),
    frase: FRASES_NEMESIS[Math.min(veces, FRASES_NEMESIS.length - 1)]
  });
}

const FRASES_NEMESIS = [
  'Nadie te conoce como yo.',
  'Otra vez tú. Esta vez no será igual.',
  'He entrenado solo para destruirte.',
  'Cada derrota me hizo más fuerte.',
  'Esto termina hoy.'
];
