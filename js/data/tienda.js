/* ===== CATÁLOGO DE LA TIENDA (Grupos 25 y 26) =====
   25.01 tres secciones: Equipo, Pociones, Ofertas
   25.05 equipo con oro, premium con gemas · 25.06 sin descuentos
   26.01 pociones de curación + la de vida extra al arrancar
   26.02 los buffs se activan solos en la siguiente lucha
   26.09 ticket de PVP · 26.10 materiales con tope diario
   26.12 las gemas compran comodidad, jamás poder
   25.14 mercado negro desbloqueable por logro */

import { EQUIPO } from './constants.js';

/** 25.01 — las tres secciones, más la secreta (25.14). */
export const SECCIONES = {
  pociones: { id:'pociones', nombre:'Pociones', ico:'🧪', desc:'Consumibles para la próxima lucha.' },
  equipo:   { id:'equipo',   nombre:'Equipo',   ico:'🛡️', desc:'Piezas listas para llevar, sin dados.' },
  ofertas:  { id:'ofertas',  nombre:'Ofertas',  ico:'🏷️', desc:'La oferta del día y los extras.' },
  negro:    { id:'negro',    nombre:'Mercado Negro', ico:'🕯️', desc:'Piezas exóticas. Solo para quien sabe.', secreta:true }
};

export const CLAVES_SECCIONES = Object.keys(SECCIONES);

/** 25.14 — el logro que abre el mercado negro. */
export const LOGRO_MERCADO_NEGRO = 'coleccionista';

/* ---------- 26.01 POCIONES ----------
   Tres de curación + la que arranca la lucha con vida extra.
   26.02 no se "usan": se activan solas en la siguiente lucha. */

export const POCIONES = {
  vendaje: {
    id:'vendaje', nombre:'Vendaje rápido', ico:'🩹', seccion:'pociones',
    desc:'Recupera 25% de vida a mitad de la lucha.',
    moneda:'oro', precio: 120,
    efecto:{ tipo:'curar', valor:0.25, momento:'mitad' },
    stockDia: 5
  },
  tonico: {
    id:'tonico', nombre:'Tónico del luchador', ico:'🧴', seccion:'pociones',
    desc:'Recupera 50% de vida a mitad de la lucha.',
    moneda:'oro', precio: 320,
    efecto:{ tipo:'curar', valor:0.50, momento:'mitad' },
    stockDia: 3
  },
  elixir: {
    id:'elixir', nombre:'Elixir de segunda vida', ico:'⚗️', seccion:'pociones',
    desc:'Al caer por primera vez, te levantas con 40% de vida.',
    moneda:'oro', precio: 900,
    efecto:{ tipo:'revivir', valor:0.40 },
    stockDia: 1
  },
  hidromiel: {
    id:'hidromiel', nombre:'Hidromiel de guerra', ico:'🍯', seccion:'pociones',
    desc:'Empiezas la lucha con 20% de vida extra sobre tu máximo.',
    moneda:'oro', precio: 400,
    efecto:{ tipo:'vidaExtra', valor:0.20 },
    stockDia: 3
  }
};

export const CLAVES_POCIONES = Object.keys(POCIONES);

/* ---------- 26.09 / 26.10 EXTRAS ---------- */

export const EXTRAS = {
  ticketPvp: {
    id:'ticketPvp', nombre:'Ticket del Coliseo', ico:'🎟️', seccion:'ofertas',
    desc:'Cubre la entrada de un torneo de tu liga actual.',
    moneda:'gemas', precio: 15,
    efecto:{ tipo:'ticket' },
    stockDia: 2,
    comodidad: true            // 26.12 ahorra oro, no da poder
  },
  vendas: {
    id:'vendas', nombre:'Vendas de campeón', ico:'🩹', seccion:'ofertas',
    desc:'5 unidades de material para mejorar equipo.',
    moneda:'oro', precio: 650,
    efecto:{ tipo:'material', valor:5 },
    stockDia: 4,               // 26.10 tope diario
    limiteDiario: 4
  },
  vendasGema: {
    id:'vendasGema', nombre:'Fardo de vendas', ico:'📦', seccion:'ofertas',
    desc:'20 unidades de material, al instante.',
    moneda:'gemas', precio: 25,
    efecto:{ tipo:'material', valor:20 },
    stockDia: 1,
    limiteDiario: 1,
    comodidad: true            // 26.12 atajo de tiempo, no de poder
  },
  ampliacion: {
    id:'ampliacion', nombre:'Baúl ampliado', ico:'🧰', seccion:'ofertas',
    desc:'+20 huecos permanentes en el inventario.',
    moneda:'gemas', precio: 40,
    efecto:{ tipo:'inventario', valor:20 },
    stockDia: 1,
    unico: false,
    comodidad: true            // 26.12 comodidad pura
  }
};

export const CLAVES_EXTRAS = Object.keys(EXTRAS);

/** Todo lo que no es equipo generado: pociones + extras. */
export const CONSUMIBLES = { ...POCIONES, ...EXTRAS };
export const CLAVES_CONSUMIBLES = Object.keys(CONSUMIBLES);
export const getConsumible = id => CONSUMIBLES[id] || null;

/* ---------- 26.03 / 26.04 EQUIPO DE TIENDA ----------
   "Listo para llevar": ves el objeto exacto y sus stats, sin dados.
   Pero balanceado: la tienda vende rarezas medias, el botín conserva
   el mejor techo (Mítico y Divino no se venden nunca). */

export const RAREZA_MAX_TIENDA = 4;      // hasta Legendario; Mítico/Divino solo caen
export const PIEZAS_EN_VITRINA = 6;      // cuántas piezas hay cada hora

/** 26.04 — el precio del equipo sale de su valor real, con margen de tienda. */
export const MARGEN_TIENDA = 3.2;

export function precioDePieza(valorOro) {
  return Math.max(50, Math.round(valorOro * MARGEN_TIENDA));
}

/* ---------- 25.03 OFERTA DIARIA ---------- */
export const OFERTA_DESCUENTO = 0.50;    // 1 producto al 50% durante 24h

/* ---------- 25.02 ROTACIÓN ---------- */
export const ROTACION_MS = 60 * 60 * 1000;   // cada hora en punto

/* ---------- 25.14 MERCADO NEGRO ----------
   Vende las piezas exóticas del Paso 9: mucho poder con contrapartida. */
export const NEGRO_PIEZAS = 3;
export const NEGRO_MARGEN = 5.5;         // caro: es la tienda de los caprichos
