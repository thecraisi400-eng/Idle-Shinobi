/* ===== LAS 6 CLASES + SUBCLASES =====
   05.01 seis clases con subclases · 05.02 círculo completo de ventajas
   05.04 nunca se cambia de clase · 05.05 clase del rival visible */

import { COMBATE } from './constants.js';

/* Círculo cerrado: cada clase vence a la siguiente y pierde con la anterior.
   bestia → tecnico → volador → rudo → showman → coloso → bestia */
export const ORDEN_CIRCULO = ['bestia', 'tecnico', 'volador', 'rudo', 'showman', 'coloso'];

export const CLASES = {
  bestia: {
    id: 'bestia', nombre: 'Bestia', ico: '🐻', color: '#e2564f',
    lema: 'Fuerza bruta sin freno.',
    desc: 'Golpes demoledores y mucha vida, pero lento y torpe.',
    mods: { potencia: 1.18, vida: 1.06, agilidad: 0.86, tecnica: 0.88 },
    personalidad: 'agresivo',
    subclases: [
      { id: 'destripador', nombre: 'Destripador', ico: '🩸', desc: 'Sus golpes hacen sangrar.', mods: { potencia: 1.07 } },
      { id: 'montania',    nombre: 'Montaña',     ico: '⛰️', desc: 'Aún más vida y defensa.',  mods: { vida: 1.07, defensa: 1.05 } }
    ]
  },
  tecnico: {
    id: 'tecnico', nombre: 'Técnico', ico: '🎓', color: '#4d9cf0',
    lema: 'La llave correcta en el momento justo.',
    desc: 'Penetra defensas y domina a los jueces. Frágil si lo alcanzan.',
    mods: { tecnica: 1.30, precision: 1.14, vida: 0.94, potencia: 1.02 },
    personalidad: 'defensivo',
    subclases: [
      { id: 'llavista',  nombre: 'Llavista',  ico: '🔗', desc: 'Ignora aún más defensa.',  mods: { tecnica: 1.08 } },
      { id: 'estratega', nombre: 'Estratega', ico: '🧠', desc: 'Mejor gestión de fatiga.', mods: { aguante: 1.10, recuperacion: 1.08 } }
    ]
  },
  volador: {
    id: 'volador', nombre: 'Volador', ico: '🦅', color: '#4ec97a',
    lema: 'Si no te alcanzan, no te ganan.',
    desc: 'Velocidad y esquiva extremas, pero poco cuerpo.',
    mods: { agilidad: 1.30, precision: 1.10, vida: 0.90, defensa: 0.88, potencia: 1.04 },
    personalidad: 'oportunista',
    subclases: [
      { id: 'relampago', nombre: 'Relámpago', ico: '⚡', desc: 'Golpea más veces por ronda.', mods: { agilidad: 1.07 } },
      { id: 'acrobata',  nombre: 'Acróbata',  ico: '🤸', desc: 'Esquiva y momentum extra.',   mods: { agilidad: 1.03, presencia: 1.08 } }
    ]
  },
  rudo: {
    id: 'rudo', nombre: 'Rudo', ico: '😈', color: '#a765e8',
    lema: 'Las reglas son una sugerencia.',
    desc: 'Especialista en estados alterados y golpes sucios.',
    mods: { presencia: 1.26, potencia: 1.06, tecnica: 1.06, recuperacion: 0.86, vida: 0.97 },
    personalidad: 'oportunista',
    subclases: [
      { id: 'tramposo', nombre: 'Tramposo', ico: '🃏', desc: 'Más probabilidad de aplicar estados.', mods: { presencia: 1.08 } },
      { id: 'maton',    nombre: 'Matón',    ico: '🔨', desc: 'Cambia técnica por potencia bruta.',  mods: { potencia: 1.09, tecnica: 0.95 } }
    ]
  },
  showman: {
    id: 'showman', nombre: 'Showman', ico: '🎭', color: '#e8b64c',
    lema: 'El público paga por verte a ti.',
    desc: 'Carisma y presencia enormes: rey de los eventos.',
    mods: { carisma: 1.40, presencia: 1.20, potencia: 1.04, defensa: 0.90, vida: 1.02 },
    personalidad: 'agresivo',
    subclases: [
      { id: 'idolo',     nombre: 'Ídolo',     ico: '🌟', desc: 'Puntos de evento aún mayores.', mods: { carisma: 1.10 } },
      { id: 'provocador',nombre: 'Provocador',ico: '📣', desc: 'Carga el momentum más rápido.', mods: { presencia: 1.09, agilidad: 1.03 } }
    ]
  },
  coloso: {
    id: 'coloso', nombre: 'Coloso', ico: '🗿', color: '#8b8b93',
    lema: 'Inamovible.',
    desc: 'Muralla de vida y defensa. Gana por desgaste.',
    mods: { defensa: 1.34, vida: 1.14, aguante: 1.12, agilidad: 0.84, potencia: 0.98 },
    personalidad: 'defensivo',
    subclases: [
      { id: 'muralla',  nombre: 'Muralla',  ico: '🧱', desc: 'Defensa todavía mayor.',        mods: { defensa: 1.08 } },
      { id: 'titan',    nombre: 'Titán',    ico: '🏛️', desc: 'Cambia defensa por potencia.',  mods: { potencia: 1.10, defensa: 0.96 } }
    ]
  }
};

export const CLAVES_CLASES = Object.keys(CLASES);
export const listaClases = () => Object.values(CLASES);

/** Clase a la que vence (la siguiente del círculo). */
export function venceA(claseId) {
  const i = ORDEN_CIRCULO.indexOf(claseId);
  return i < 0 ? null : ORDEN_CIRCULO[(i + 1) % ORDEN_CIRCULO.length];
}

/** Clase que le gana (la anterior del círculo). */
export function pierdeCon(claseId) {
  const i = ORDEN_CIRCULO.indexOf(claseId);
  return i < 0 ? null : ORDEN_CIRCULO[(i - 1 + ORDEN_CIRCULO.length) % ORDEN_CIRCULO.length];
}

/** Multiplicador de daño de atacante contra defensor (05.02). */
export function multiplicadorClase(atacante, defensor) {
  if (!atacante || !defensor || atacante === defensor) return 1;
  if (venceA(atacante) === defensor)   return 1 + COMBATE.VENTAJA_CLASE;
  if (pierdeCon(atacante) === defensor) return 1 - COMBATE.VENTAJA_CLASE;
  return 1;
}

/** Etiqueta legible del enfrentamiento: 'ventaja' | 'desventaja' | 'neutral' */
export function relacionClase(mia, suya) {
  const m = multiplicadorClase(mia, suya);
  return m > 1 ? 'ventaja' : m < 1 ? 'desventaja' : 'neutral';
}

/* Factor de equilibrio por clase (calculado con tests/solve.mjs).
   Garantiza que ninguna clase sea intrínsecamente más fuerte: el sabor
   lo dan los modificadores, y el ÚNICO diferenciador real de poder es
   el círculo de ventajas ±10% (05.02). */
export const EQUILIBRIO = {
  bestia: 0.943, tecnico: 1.040, volador: 1.046,
  rudo: 1.024, showman: 1.029, coloso: 0.962
};

/** Aplica los modificadores de clase y subclase a un bloque de stats. */
export function aplicarClase(stats, claseId, subclaseId = null) {
  const cl = CLASES[claseId];
  if (!cl) return { ...stats };
  const out = { ...stats };
  const aplicar = mods => {
    for (const [k, m] of Object.entries(mods || {})) {
      if (k in out) out[k] = Math.max(1, Math.round(out[k] * m));
    }
  };
  aplicar(cl.mods);
  const sub = cl.subclases.find(s => s.id === subclaseId);
  if (sub) aplicar(sub.mods);

  // Normalización de equilibrio: se aplica solo a las stats de combate,
  // nunca al Carisma (que solo puntúa en eventos, 03.12).
  const eq = EQUILIBRIO[claseId] ?? 1;
  if (eq !== 1) {
    for (const k of Object.keys(out)) {
      if (k === 'carisma') continue;
      out[k] = Math.max(1, out[k] * eq);   // sin redondear: evita cuantización
    }
  }
  return out;
}

export function subclasesDe(claseId) { return CLASES[claseId]?.subclases || []; }
