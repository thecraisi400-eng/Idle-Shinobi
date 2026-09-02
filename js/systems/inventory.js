/* ===== INVENTARIO Y EQUIPAMIENTO =====
   16.09 cien espacios · 16.10 ordenación · 16.11 equipar-mejor por stat
   16.12 delta simple al comparar · 16.15 quitar equipo es gratis
   16.03/16.04 venta al 25% con confirmación · 16.05 auto-venta por rareza
   16.13 el plan dice "sin favoritos", pero la Sugerencia #2 añade un
   candado explícito SOLO como protección contra la auto-venta. */

import { S, ganarOro } from '../core/state.js';
import { EQUIPO, ECO } from '../data/constants.js';
import { emit } from '../core/events-bus.js';
import { CLAVES_SLOTS, getRareza, valorDePieza, requisitosCumplidos } from '../data/equipo.js';
import { CLAVES_STATS } from '../data/stats.js';
import { puntuacion } from './loot.js';
import { poder } from './power.js';
import { aplicarClase } from '../data/clases.js';
import { aplicarRasgosHeroe } from '../data/rangos.js';

/* ---------- Consultas básicas ---------- */

export const inventario = () => S.equipo.inventario;
export const slots = () => S.equipo.slots;
export const libres = () => EQUIPO.INVENTARIO_MAX - S.equipo.inventario.length;
export const lleno = () => libres() <= 0;

export function buscar(id) {
  return S.equipo.inventario.find(p => p.id === id) || null;
}

/* ---------- Entrada de objetos ---------- */

/**
 * Mete una pieza en el inventario.
 * Aplica la auto-venta (16.05) y respeta el candado (Sugerencia #2).
 * @returns {object} { entro, vendida, oro, motivo }
 */
export function recoger(pieza) {
  // 16.05 auto-venta por rareza
  const r = getRareza(pieza.rareza);
  const autoClave = `r${pieza.rareza}`;
  if (S.equipo.autoVenta[autoClave] && !pieza.bloqueado) {
    const oro = vender(pieza, true);
    return { entro: false, vendida: true, oro, motivo: 'auto-venta' };
  }

  if (lleno()) {
    emit('inventario:lleno', pieza);
    return { entro: false, vendida: false, oro: 0, motivo: 'lleno' };
  }

  S.equipo.inventario.push(pieza);
  S.carrera.objetosObtenidos++;
  emit('inventario:change', { accion: 'recoger', pieza });
  return { entro: true, vendida: false, oro: 0, motivo: null };
}

/* ---------- Venta (16.03, 16.04) ---------- */

/**
 * Vende una pieza al 25% de su valor.
 * La confirmación (16.03) la pide la interfaz, no esta función.
 * Devuelve el oro obtenido.
 */
export function vender(pieza, esAuto = false) {
  if (!pieza) return 0;
  if (pieza.bloqueado && esAuto) return 0;      // Sugerencia #2: el candado manda

  const oro = Math.max(1, Math.round((pieza.valor || valorDePieza(pieza)) * ECO.VENTA_PCT));
  const material = Math.max(1, Math.floor(pieza.rareza * (1 + pieza.estrellas * 0.5)));

  quitarDelInventario(pieza.id);
  ganarOro(oro, esAuto ? 'auto-venta' : 'venta');
  darMaterial(material);
  S.carrera.objetosVendidos++;
  emit('inventario:change', { accion: 'vender', pieza, oro });
  return oro;
}

/** Vende varias piezas de golpe. Nunca toca las bloqueadas ni las equipadas. */
export function venderVarias(ids) {
  let oro = 0, n = 0;
  for (const id of [...ids]) {
    const p = buscar(id);
    if (!p || p.bloqueado) continue;
    oro += vender(p);
    n++;
  }
  return { oro, cantidad: n };
}

/** Sugerencia #5: vender toda la "basura" de un toque. */
export function venderBasura(rarezaMax = 2) {
  const ids = S.equipo.inventario
    .filter(p => p.rareza <= rarezaMax && !p.bloqueado)
    .map(p => p.id);
  return venderVarias(ids);
}

function quitarDelInventario(id) {
  const i = S.equipo.inventario.findIndex(p => p.id === id);
  if (i >= 0) S.equipo.inventario.splice(i, 1);
  return i >= 0;
}

/* ---------- Material de mejora ---------- */

export function darMaterial(n) {
  if (!n) return 0;
  S.equipo.material = (S.equipo.material || 0) + n;
  emit('material:change', S.equipo.material);
  return S.equipo.material;
}

export function gastarMaterial(n) {
  if ((S.equipo.material || 0) < n) return false;
  S.equipo.material -= n;
  emit('material:change', S.equipo.material);
  return true;
}

export const material = () => S.equipo.material || 0;

/* ---------- Equipar / quitar ---------- */

/** Contexto del héroe para comprobar requisitos (15.10). */
function contextoHeroe() {
  return {
    nivel: S.perfil.nivel,
    stats: aplicarRasgosHeroe(S.stats, S.perfil.rasgos || []),
    clase: S.perfil.clase
  };
}

export function puedeEquipar(pieza) {
  return requisitosCumplidos(pieza, contextoHeroe());
}

/**
 * Equipa una pieza del inventario. La que estuviera puesta vuelve al inventario.
 * @returns { ok, motivo, anterior }
 */
export function equipar(id) {
  const pieza = buscar(id);
  if (!pieza) return { ok: false, motivo: 'no-existe', anterior: null };

  const req = puedeEquipar(pieza);
  if (!req.ok) return { ok: false, motivo: 'requisitos', faltan: req.faltan, anterior: null };

  const anterior = S.equipo.slots[pieza.slot] || null;
  quitarDelInventario(id);
  S.equipo.slots[pieza.slot] = pieza;
  if (anterior) S.equipo.inventario.push(anterior);   // hay hueco: acabamos de sacar uno

  emit('equipo:change', { accion: 'equipar', pieza, anterior });
  emit('hud:refresh');
  return { ok: true, motivo: null, anterior };
}

/** Quitar equipo es GRATIS (16.15). */
export function quitar(slotId) {
  const pieza = S.equipo.slots[slotId];
  if (!pieza) return { ok: false, motivo: 'vacio' };
  if (lleno()) return { ok: false, motivo: 'inventario-lleno' };

  S.equipo.slots[slotId] = null;
  S.equipo.inventario.push(pieza);
  emit('equipo:change', { accion: 'quitar', pieza });
  emit('hud:refresh');
  return { ok: true, pieza };
}

/* ---------- Candado (Sugerencia #2) ---------- */

export function alternarBloqueo(id) {
  const p = buscar(id);
  if (!p) return false;
  p.bloqueado = !p.bloqueado;
  emit('inventario:change', { accion: 'bloqueo', pieza: p });
  return p.bloqueado;
}

/* ---------- Ordenación (16.10) ---------- */

export const ORDENES = {
  rareza:  { id:'rareza',  nombre:'Rareza',  fn: (a,b) => b.rareza - a.rareza || puntuacion(b) - puntuacion(a) },
  poder:   { id:'poder',   nombre:'Puntos',  fn: (a,b) => puntuacion(b) - puntuacion(a) },
  nivel:   { id:'nivel',   nombre:'Nivel',   fn: (a,b) => b.nivel - a.nivel },
  slot:    { id:'slot',    nombre:'Slot',    fn: (a,b) => CLAVES_SLOTS.indexOf(a.slot) - CLAVES_SLOTS.indexOf(b.slot) || b.rareza - a.rareza },
  valor:   { id:'valor',   nombre:'Valor',   fn: (a,b) => (b.valor||0) - (a.valor||0) }
};

export function ordenar(criterio = 'rareza') {
  const o = ORDENES[criterio] || ORDENES.rareza;
  S.equipo.inventario.sort(o.fn);
  emit('inventario:change', { accion: 'ordenar', criterio });
  return S.equipo.inventario;
}

/* ---------- Comparación y mejoras (16.11, 16.12) ---------- */

/** Delta simple (16.12): qué cambia si equipo esta pieza. */
export function delta(pieza) {
  const actual = S.equipo.slots[pieza.slot] || null;
  const cambios = {};
  for (const k of CLAVES_STATS) {
    const nuevo = pieza.stats?.[k] || 0;
    const viejo = actual?.stats?.[k] || 0;
    if (nuevo !== viejo) cambios[k] = nuevo - viejo;
  }
  return {
    actual,
    cambios,
    poderDelta: poderConPieza(pieza) - poderActual(),
    puntosDelta: puntuacion(pieza) - puntuacion(actual || { stats: {} })
  };
}

/** Poder del héroe con el equipo actual. */
export function poderActual() {
  return poderCon(bonosDe(S.equipo.slots));
}

/** Sugerencia #4: poder resultante si equipara esta pieza. */
export function poderConPieza(pieza) {
  const copia = { ...S.equipo.slots, [pieza.slot]: pieza };
  return poderCon(bonosDe(copia));
}

function poderCon(bonos) {
  const conRasgos = aplicarRasgosHeroe(S.stats, S.perfil.rasgos || []);
  const finales = aplicarClase(conRasgos, S.perfil.clase, S.perfil.subclase);
  return poder(finales, bonos);
}

function bonosDe(mapaSlots) {
  const out = {};
  for (const k of CLAVES_STATS) out[k] = 0;
  for (const p of Object.values(mapaSlots || {})) {
    if (!p?.stats) continue;
    for (const [k, v] of Object.entries(p.stats)) out[k] = (out[k] || 0) + v;
  }
  return out;
}

/**
 * 16.11 — equipar lo mejor. Si se pasa `statObjetivo`, optimiza esa stat;
 * si no, maximiza el Poder total. Solo considera piezas equipables.
 */
export function equiparMejor(statObjetivo = null) {
  let cambios = 0;
  const detalle = [];

  for (const slotId of CLAVES_SLOTS) {
    const candidatas = S.equipo.inventario.filter(p => p.slot === slotId && puedeEquipar(p).ok);
    if (!candidatas.length) continue;

    const puesta = S.equipo.slots[slotId];
    const valorDe = p => {
      if (!p) return -Infinity;
      return statObjetivo
        ? (p.stats?.[statObjetivo] || 0) * 1000 + puntuacion(p)
        : poderConPieza(p);
    };

    const valorPuesta = puesta
      ? (statObjetivo ? (puesta.stats?.[statObjetivo] || 0) * 1000 + puntuacion(puesta) : poderActual())
      : -Infinity;

    let mejor = null, mejorVal = valorPuesta;
    for (const c of candidatas) {
      const v = valorDe(c);
      if (v > mejorVal) { mejor = c; mejorVal = v; }
    }

    if (mejor) {
      const r = equipar(mejor.id);
      if (r.ok) { cambios++; detalle.push({ slot: slotId, pieza: mejor }); }
    }
  }

  if (cambios) emit('equipo:change', { accion: 'auto', cambios });
  return { cambios, detalle };
}

/**
 * Sugerencia #1: ¿hay en el inventario algo mejor que lo equipado?
 * Devuelve la lista de slots con mejora disponible.
 */
export function mejorasDisponibles() {
  const out = [];
  for (const slotId of CLAVES_SLOTS) {
    const puesta = S.equipo.slots[slotId];
    const base = puesta ? poderActual() : -Infinity;
    const hay = S.equipo.inventario.some(p =>
      p.slot === slotId && puedeEquipar(p).ok &&
      (!puesta || poderConPieza(p) > base)
    );
    if (hay) out.push(slotId);
  }
  return out;
}

/** Sugerencia #5: ¿conviene avisar de inventario casi lleno? */
export function avisoInventario() {
  const usados = S.equipo.inventario.length;
  const max = EQUIPO.INVENTARIO_MAX;
  if (usados < max * 0.95) return null;
  const basura = S.equipo.inventario.filter(p => p.rareza <= 2 && !p.bloqueado).length;
  return {
    usados, max, basura,
    texto: `Inventario ${usados}/${max}. Tienes ${basura} piezas comunes o raras sin candado que puedes vender de un toque.`
  };
}
