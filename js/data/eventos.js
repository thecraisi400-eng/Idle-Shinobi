/* ===== LOS 7 EVENTOS DIARIOS =====
   19.01 siete eventos de 3 horas · 19.02 de 00:00 a 21:00
   20.01–20.07 los siete tipos · 20.08 cura del 30% entre luchas
   20.09 puntos SOLO por victoria · 20.10 rivales invitados temáticos
   20.15 sin consumibles

   Cada tipo define sus propias reglas de puntuación; el runner las ejecuta. */

import { COMBATE } from './constants.js';

export const TIPOS_EVENTO = {

  /* 20.01 */
  relampago: {
    id:'relampago', nombre:'Torneo Relámpago', ico:'⚡', color:'#e8b64c',
    lema:'Cinco rivales en escalera y un jefe al final.',
    reglas: [
      'Escalera de 5 rivales cada vez más fuertes.',
      'El 5º es un jefe con estadísticas aumentadas.',
      'Si pierdes, el intento termina donde caíste.',
      'Entre lucha y lucha recuperas el 30% de vida.'
    ],
    // Qué stats favorece — Sugerencia #2
    favorece: ['potencia', 'aguante', 'vida'],
    luchas: 5,
    puntosPorVictoria: 100,
    bonusFinal: 350,              // por completar la escalera
    escaladoPorLucha: 0.12,
    jefeFinal: true
  },

  /* 20.02 */
  coloso: {
    id:'coloso', nombre:'Asalto al Coloso', ico:'🗿', color:'#8b8b93',
    lema:'Un solo intento. 90 segundos. Pega todo lo que puedas.',
    reglas: [
      'Un coloso con vida enorme e imbatible.',
      'Dispones de 90 segundos por intento.',
      'Puntúas por el DAÑO total infligido, no por ganar.',
      'No hay segunda oportunidad dentro del intento.'
    ],
    favorece: ['potencia', 'tecnica', 'precision'],
    luchas: 1,
    segundos: 90,
    vidaColoso: 40,               // multiplicador sobre la vida normal
    puntosPorDano: 0.5,
    modoDano: true
  },

  /* 20.03 */
  supervivencia: {
    id:'supervivencia', nombre:'Supervivencia', ico:'💀', color:'#e2564f',
    lema:'Oleadas infinitas. ¿Hasta dónde aguantas?',
    reglas: [
      'Oleadas sin fin, cada una más dura que la anterior.',
      'NO te curas entre oleadas: la vida que pierdas es definitiva.',
      'Puntúas por oleada superada, con bonus creciente.',
      'Termina cuando caes.'
    ],
    favorece: ['vida', 'defensa', 'recuperacion'],
    luchas: 99,
    puntosPorVictoria: 60,
    escaladoPorLucha: 0.05,   // sin cura, el escalado debe ser suave
    dificultadBase: 0.35,   // sin cura acumulativa, los rivales deben ser flojos
    bonusProgresivo: 12,          // +12 puntos extra por oleada acumulados
    sinCura: true
  },

  /* 20.04 */
  carreraKO: {
    id:'carreraKO', nombre:'Carrera de KOs', ico:'⏱️', color:'#4ec97a',
    lema:'Tres minutos. Tumba a todos los que puedas.',
    reglas: [
      'Tienes 180 segundos de reloj continuo.',
      'Cada rival derrotado suma puntos.',
      'Los rivales son débiles pero no paran de salir.',
      'El reloj no se detiene aunque pierdas: sigues con el siguiente.'
    ],
    favorece: ['agilidad', 'potencia', 'precision'],
    luchas: 99,
    segundos: 180,
    puntosPorVictoria: 120,
    escaladoPorLucha: 0.04,
    debilitaRivales: 0.55,        // los rivales salen al 55% de poder
    contraReloj: true
  },

  /* 20.05 */
  leyendas: {
    id:'leyendas', nombre:'Duelo de Leyendas', ico:'👑', color:'#a765e8',
    lema:'Los seis grandes maestros, uno por clase.',
    reglas: [
      'Seis rivales, uno de cada clase del círculo.',
      'Todos son muy fuertes: aquí se mide tu build de verdad.',
      'Cada leyenda derrotada vale muchos puntos.',
      'Recuperas el 30% de vida entre duelos.'
    ],
    favorece: ['potencia', 'defensa', 'tecnica'],
    luchas: 6,
    puntosPorVictoria: 220,
    bonusFinal: 500,
    escaladoPorLucha: 0.08,
    dificultadBase: 1.25,
    unaPorClase: true
  },

  /* 20.06 */
  montania: {
    id:'montania', nombre:'Rey de la Montaña', ico:'⛰️', color:'#4d9cf0',
    lema:'Sube a la cima y defiéndela tanto como puedas.',
    reglas: [
      'Las 3 primeras luchas son la subida.',
      'A partir de ahí, cada victoria es una defensa del trono.',
      'Cada defensa vale más que la anterior.',
      'Los retadores se hacen más fuertes en cada ronda.'
    ],
    favorece: ['aguante', 'recuperacion', 'defensa'],
    luchas: 99,
    puntosPorVictoria: 70,
    escaladoPorLucha: 0.11,
    subida: 3,
    multDefensa: 1.8              // las defensas puntúan casi el doble
  },

  /* 20.07 — aquí el Carisma brilla */
  estilo: {
    id:'estilo', nombre:'Concurso de Estilo', ico:'🎭', color:'#f0872f',
    lema:'No basta con ganar: hay que gustar.',
    reglas: [
      'Los críticos y los especiales valen puntos.',
      'Tu Carisma y tu Presencia multiplican el resultado.',
      'Ganar rápido puntúa menos que ganar con espectáculo.',
      'La única prueba donde las stats "sociales" mandan.'
    ],
    favorece: ['carisma', 'presencia', 'precision'],
    luchas: 4,
    puntosPorVictoria: 80,
    puntosPorCritico: 22,
    puntosPorEspecial: 45,
    escaladoPorLucha: 0.07,
    multCarisma: true
  }
};

export const CLAVES_EVENTOS = Object.keys(TIPOS_EVENTO);
export const listaEventos = () => Object.values(TIPOS_EVENTO);
export const getEvento = id => TIPOS_EVENTO[id] || null;

/* ---------- Premios (Grupo 21) ----------
   21.02 pirámide clásica · 21.03 mixto oro + gemas
   21.05 oro pequeño por participar */

/** Reparto piramidal para los 10 primeros (21.01, 21.02). */
export const PIRAMIDE = [
  { puesto: 1,  oro: 1.00, gemas: 25 },
  { puesto: 2,  oro: 0.68, gemas: 18 },
  { puesto: 3,  oro: 0.50, gemas: 14 },
  { puesto: 4,  oro: 0.36, gemas: 10 },
  { puesto: 5,  oro: 0.28, gemas: 8 },
  { puesto: 6,  oro: 0.22, gemas: 6 },
  { puesto: 7,  oro: 0.18, gemas: 5 },
  { puesto: 8,  oro: 0.15, gemas: 4 },
  { puesto: 9,  oro: 0.12, gemas: 3 },
  { puesto: 10, oro: 0.10, gemas: 2 }
];

/** Oro base del primer puesto, según el nivel del jugador. */
export function bolsaDelEvento(nivelHeroe) {
  return Math.round(600 + nivelHeroe * 240);
}

/** 21.05 — todos los participantes se llevan algo. */
export function premioParticipacion(nivelHeroe) {
  return Math.round(40 + nivelHeroe * 12);
}

/**
 * Premio de un puesto concreto (21.02, 21.03).
 * @param {number} puesto 1-based
 * @param {number} multDomingo 19.15
 */
export function premioDePuesto(puesto, nivelHeroe, multDomingo = 1) {
  const bolsa = bolsaDelEvento(nivelHeroe);
  const fila = PIRAMIDE.find(p => p.puesto === puesto);
  if (!fila) {
    return { oro: Math.round(premioParticipacion(nivelHeroe) * multDomingo), gemas: 0, premiado: false };
  }
  return {
    oro: Math.round(bolsa * fila.oro * multDomingo),
    gemas: Math.round(fila.gemas * multDomingo),
    premiado: true
  };
}

/* ---------- Duración y horarios (19.01, 19.02) ---------- */
export const DURACION_MS = 3 * 60 * 60 * 1000;      // 3 horas
export const HORAS_INICIO = [0, 3, 6, 9, 12, 15, 18];  // 7 franjas: 00:00 → 21:00

/** Etiqueta legible de una franja. */
export function etiquetaFranja(indice) {
  const h = HORAS_INICIO[indice];
  const fin = (h + 3) % 24;
  const dos = n => String(n).padStart(2, '0');
  return `${dos(h)}:00 – ${dos(fin)}:00`;
}
