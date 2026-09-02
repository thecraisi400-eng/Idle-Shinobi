/* ===== EQUIPO: SLOTS, RAREZAS Y PLANTILLAS =====
   15.01 ocho slots · 15.02 seis rarezas · 15.03 colores clásicos
   15.05 nivel propio + estrellas · 15.06 SIN substats · 15.09 nombres genéricos
   15.10 requisitos mixtos · 15.11 trade-offs con builds exóticas
   15.04/15.07/15.08 sin sets, sin pasivas legendarias, sin objetos de jefe */

import { CLAVES_STATS } from './stats.js';

/* ---------- LOS 8 SLOTS (15.01) ---------- */
export const SLOTS = {
  mascara:     { id:'mascara',     nombre:'Máscara',     ico:'🎭', afines:['presencia','carisma','tecnica'] },
  capa:        { id:'capa',        nombre:'Capa',        ico:'🧣', afines:['carisma','presencia','recuperacion'] },
  botas:       { id:'botas',       nombre:'Botas',       ico:'🥾', afines:['agilidad','aguante','precision'] },
  muniequeras: { id:'muniequeras', nombre:'Muñequeras',  ico:'🎽', afines:['precision','tecnica','potencia'] },
  cinturon:    { id:'cinturon',    nombre:'Cinturón',    ico:'🥋', afines:['aguante','vida','defensa'] },
  protector:   { id:'protector',   nombre:'Protector',   ico:'🛡️', afines:['defensa','vida','aguante'] },
  guantes:     { id:'guantes',     nombre:'Guantes',     ico:'🥊', afines:['potencia','precision','tecnica'] },
  amuleto:     { id:'amuleto',     nombre:'Amuleto',     ico:'🧿', afines:['recuperacion','presencia','vida'] }
};

export const CLAVES_SLOTS = Object.keys(SLOTS);

/* ---------- LAS 6 RAREZAS (15.02, 15.03 colores clásicos) ---------- */
export const RAREZAS = {
  1: { n:1, id:'comun',      nombre:'Común',      color:'#8b8b93', peso:52,  mult:1.00, statsN:1, valor:1.0,  estrellasMax:3 },
  2: { n:2, id:'raro',       nombre:'Raro',       color:'#4ec97a', peso:26,  mult:1.35, statsN:1, valor:2.2,  estrellasMax:4 },
  3: { n:3, id:'epico',      nombre:'Épico',      color:'#4d9cf0', peso:13,  mult:1.80, statsN:2, valor:5.0,  estrellasMax:5 },
  4: { n:4, id:'legendario', nombre:'Legendario', color:'#a765e8', peso:6,   mult:2.40, statsN:2, valor:12.0, estrellasMax:6 },
  5: { n:5, id:'mitico',     nombre:'Mítico',     color:'#f0872f', peso:2.4, mult:3.20, statsN:3, valor:28.0, estrellasMax:7 },
  6: { n:6, id:'divino',     nombre:'Divino',     color:'#e8b64c', peso:0.6, mult:4.30, statsN:3, valor:65.0, estrellasMax:8 }
};

export const NIVELES_RAREZA = Object.keys(RAREZAS).map(Number);
export const listaRarezas = () => Object.values(RAREZAS);
export const getRareza = n => RAREZAS[n] || RAREZAS[1];

/* ---------- NOMBRES GENÉRICOS (15.09) ----------
   Nada de "Guantelete Sangriento de Kthar": el jugador debe leer
   la pieza de un vistazo. Prefijo por rareza + nombre del slot. */
export const PREFIJOS = {
  1: ['Gastado', 'de Gimnasio', 'Sencillo', 'Usado'],
  2: ['Reforzado', 'de Torneo', 'Sólido', 'Pulido'],
  3: ['de Campeón', 'Profesional', 'de Élite', 'Templado'],
  4: ['de Leyenda', 'Imperial', 'Supremo', 'Coronado'],
  5: ['Mítico', 'de los Titanes', 'Inmortal', 'Ancestral'],
  6: ['Divino', 'del Olimpo', 'Eterno', 'Absoluto']
};

/* ---------- TRADE-OFFS: BUILDS EXÓTICAS (15.11) ----------
   El corazón del min-max. Una pieza exótica da mucho más de lo normal
   en una stat a cambio de un castigo real en otra. */
export const EXOTICOS = {
  bruto: {
    id:'bruto', nombre:'del Bruto', ico:'💢',
    desc:'+40% de bonificación en Potencia, −20% en Defensa.',
    sube:'potencia', subeMult:1.40, baja:'defensa', bajaMult:0.80,
    rarezaMin:3
  },
  bailarin: {
    id:'bailarin', nombre:'del Bailarín', ico:'🩰',
    desc:'+40% en Agilidad, −20% en Vida.',
    sube:'agilidad', subeMult:1.40, baja:'vida', bajaMult:0.80,
    rarezaMin:3
  },
  muralla: {
    id:'muralla', nombre:'de la Muralla', ico:'🧱',
    desc:'+45% en Defensa, −25% en Potencia.',
    sube:'defensa', subeMult:1.45, baja:'potencia', bajaMult:0.75,
    rarezaMin:3
  },
  cirujano: {
    id:'cirujano', nombre:'del Cirujano', ico:'🔪',
    desc:'+40% en Técnica, −20% en Aguante.',
    sube:'tecnica', subeMult:1.40, baja:'aguante', bajaMult:0.80,
    rarezaMin:3
  },
  vampiro: {
    id:'vampiro', nombre:'del Vampiro', ico:'🩸',
    desc:'+45% en Recuperación, −25% en Defensa.',
    sube:'recuperacion', subeMult:1.45, baja:'defensa', bajaMult:0.75,
    rarezaMin:4
  },
  idolo: {
    id:'idolo', nombre:'del Ídolo', ico:'🌟',
    desc:'+50% en Carisma y Presencia, −20% en Potencia.',
    sube:'carisma', subeMult:1.50, baja:'potencia', bajaMult:0.80,
    rarezaMin:3
  },
  kamikaze: {
    id:'kamikaze', nombre:'del Kamikaze', ico:'💣',
    desc:'+55% en Potencia, −30% en Vida. Matar o morir.',
    sube:'potencia', subeMult:1.55, baja:'vida', bajaMult:0.70,
    rarezaMin:4
  },
  roca: {
    id:'roca', nombre:'de la Roca', ico:'🗿',
    desc:'+50% en Vida, −25% en Agilidad.',
    sube:'vida', subeMult:1.50, baja:'agilidad', bajaMult:0.75,
    rarezaMin:3
  }
};

export const CLAVES_EXOTICOS = Object.keys(EXOTICOS);
export const listaExoticos = () => Object.values(EXOTICOS);

/** Probabilidad de que una pieza sea exótica, según rareza. */
export const PROB_EXOTICO = { 1:0, 2:0, 3:0.14, 4:0.26, 5:0.40, 6:0.55 };

/* ---------- MATERIALES DE MEJORA (16.01) ---------- */
export const MATERIAL = {
  id: 'vendas', nombre: 'Vendas de campeón', ico: '🩹',
  desc: 'Se obtienen al vender equipo y al ganar a jefes. Se usan para mejorar piezas.'
};

/* ---------- FÓRMULAS ---------- */

/** Puntos de estadística que reparte una pieza. */
export function puntosDePieza(nivel, rareza, estrellas = 0) {
  const r = getRareza(rareza);
  const base = 3 + nivel * 1.15;
  return Math.max(1, Math.round(base * r.mult * (1 + estrellas * 0.18)));
}

/** Valor en oro de la pieza (para vender al 25%, 16.04). */
export function valorDePieza(pieza) {
  const r = getRareza(pieza.rareza);
  const base = 18 + pieza.nivel * 9;
  const exo = pieza.exotico ? 1.5 : 1;
  return Math.max(5, Math.round(base * r.valor * (1 + pieza.estrellas * 0.30) * exo));
}

/** Coste de subir una estrella (16.01 oro + material, 16.02 sin tope). */
export function costeMejora(pieza) {
  const r = getRareza(pieza.rareza);
  const e = pieza.estrellas;
  return {
    oro: Math.round((40 + pieza.nivel * 18) * r.valor * 0.45 * Math.pow(1.55, e)),
    material: Math.max(1, Math.round((1 + e * 0.9) * (1 + (pieza.rareza - 1) * 0.5)))
  };
}

/* ---------- REQUISITOS MIXTOS (15.10) ---------- */

/** ¿Puede el jugador equipar esta pieza? Devuelve motivos legibles. */
export function requisitosCumplidos(pieza, { nivel, stats, clase }) {
  const faltan = [];
  const req = pieza.requisitos || {};
  if (req.nivel && nivel < req.nivel) faltan.push(`Nivel ${req.nivel}`);
  if (req.stat) {
    const val = (stats?.[req.stat.clave] || 0);
    if (val < req.stat.valor) faltan.push(`${req.stat.clave} ${req.stat.valor}`);
  }
  if (req.clase && clase !== req.clase) faltan.push(`Clase ${req.clase}`);
  return { ok: faltan.length === 0, faltan };
}

/** Texto corto de los requisitos, para la tarjeta. */
export function textoRequisitos(pieza) {
  const req = pieza.requisitos || {};
  const p = [];
  if (req.nivel) p.push(`Nv.${req.nivel}`);
  if (req.stat) p.push(`${req.stat.clave} ${req.stat.valor}`);
  if (req.clase) p.push(req.clase);
  return p.join(' · ') || 'Sin requisitos';
}

/** Comprueba que una clave de stat es válida (defensa contra datos corruptos). */
export const esStatValida = k => CLAVES_STATS.includes(k);
