/* ===== LA TIENDA: ROTACIÓN, STOCK Y COMPRA =====
   25.02 rotación por hora · 25.03 oferta diaria al 50% por 24h
   25.12 stock limitado por día · 25.08 toda compra pide confirmación
   25.09 sin devoluciones · 25.06 sin descuentos (salvo la oferta diaria)
   25.13 tienda única, sin niveles · 25.14 mercado negro por logro
   26.03 equipo listo para llevar · 26.04 balanceado: sin Mítico ni Divino

   Toda la vitrina se DERIVA de la hora: no se guarda el catálogo, solo
   lo ya comprado. Así el jugador ve lo mismo aunque recargue. */

import { rngDe } from '../core/rng.js';
import { S, gastarOro, gastarGemas } from '../core/state.js';
import { EQUIPO } from '../data/constants.js';
import {
  SECCIONES, POCIONES, EXTRAS, CONSUMIBLES, CLAVES_CONSUMIBLES, getConsumible,
  RAREZA_MAX_TIENDA, PIEZAS_EN_VITRINA, precioDePieza, OFERTA_DESCUENTO,
  ROTACION_MS, NEGRO_PIEZAS, NEGRO_MARGEN, LOGRO_MERCADO_NEGRO
} from '../data/tienda.js';
import { generarPieza } from './loot.js';
import { valorDePieza, CLAVES_SLOTS } from '../data/equipo.js';
import { recoger, darMaterial, lleno } from './inventory.js';

/* ---------- Claves de tiempo ---------- */

/** Sello de la rotación actual: cambia en cada hora en punto (25.02). */
export function claveHora(ahora = Date.now()) {
  const d = new Date(ahora);
  const dos = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}h${dos(d.getHours())}`;
}

/** Sello del día: gobierna el stock y la oferta diaria (25.03, 25.12). */
export function claveDia(ahora = Date.now()) {
  const d = new Date(ahora);
  const dos = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

/** Sugerencia #1 — milisegundos hasta la próxima rotación. */
export function msParaRotacion(ahora = Date.now()) {
  const d = new Date(ahora);
  const siguiente = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours() + 1, 0, 0, 0);
  return siguiente.getTime() - ahora;
}

/* ---------- 26.03 / 26.04 Vitrina de equipo ---------- */

/**
 * Las piezas a la venta esta hora. Se generan de la semilla horaria,
 * así que son las mismas para toda la hora sin guardarlas en el estado.
 * 26.04 — nunca Mítico ni Divino: el botín conserva el mejor techo.
 */
export function vitrinaEquipo(ahora = Date.now(), nivelHeroe = 1) {
  const rng = rngDe('tienda', claveHora(ahora));
  const piezas = [];

  for (let i = 0; i < PIEZAS_EN_VITRINA; i++) {
    // Rareza acotada a Legendario (26.04)
    const rareza = Math.min(RAREZA_MAX_TIENDA, rng.pesos([
      { v: 1, p: 42 }, { v: 2, p: 30 }, { v: 3, p: 20 }, { v: 4, p: 8 }
    ]));
    const pieza = generarPieza({
      rng,
      nivel: Math.max(1, nivelHeroe + rng.int(-1, 2)),
      slot: rng.elegir(CLAVES_SLOTS),
      rareza,
      exotico: false                 // los exóticos son del mercado negro
    });
    pieza.idTienda = `eq${i}`;
    pieza.precio = precioDePieza(valorDePieza(pieza));
    pieza.moneda = 'oro';            // 25.05 el equipo se paga con oro
    pieza.seccion = 'equipo';
    piezas.push(pieza);
  }
  return piezas;
}

/** 25.14 — la vitrina secreta: exóticos caros. */
export function vitrinaNegro(ahora = Date.now(), nivelHeroe = 1) {
  const rng = rngDe('negro', claveHora(ahora));
  const piezas = [];
  for (let i = 0; i < NEGRO_PIEZAS; i++) {
    const pieza = generarPieza({
      rng,
      nivel: Math.max(1, nivelHeroe + rng.int(0, 3)),
      slot: rng.elegir(CLAVES_SLOTS),
      rareza: rng.pesos([{ v: 3, p: 40 }, { v: 4, p: 42 }, { v: 5, p: 18 }]),
      exotico: true                  // aquí SIEMPRE hay trade-off
    });
    pieza.idTienda = `bk${i}`;
    pieza.precio = Math.round(valorDePieza(pieza) * NEGRO_MARGEN);
    pieza.moneda = 'oro';
    pieza.seccion = 'negro';
    piezas.push(pieza);
  }
  return piezas;
}

/** 25.14 — ¿está abierto el mercado negro? */
export function mercadoNegroAbierto(estado = S) {
  return !!estado.tienda.mercadoNegro ||
         (estado.logros?.completados || []).includes(LOGRO_MERCADO_NEGRO);
}

/* ---------- 25.03 Oferta diaria ---------- */

/**
 * Un producto al 50% durante 24h. Se sortea entre los consumibles,
 * que son los únicos con id estable durante todo el día (el equipo rota
 * cada hora y la oferta no podría sobrevivir a la rotación).
 */
export function ofertaDelDia(ahora = Date.now()) {
  const rng = rngDe('oferta', claveDia(ahora));
  const id = rng.elegir(CLAVES_CONSUMIBLES);
  const base = CONSUMIBLES[id];
  return {
    ...base,
    esOferta: true,
    precioOriginal: base.precio,
    precio: Math.max(1, Math.round(base.precio * (1 - OFERTA_DESCUENTO))),
    descuento: OFERTA_DESCUENTO
  };
}

/* ---------- 25.12 Stock diario ---------- */

/** Reinicia el registro de compras si cambió el día. */
export function sincronizarDia(ahora = Date.now(), estado = S) {
  const hoy = claveDia(ahora);
  if (estado.tienda.diaStock !== hoy) {
    estado.tienda.diaStock = hoy;
    estado.tienda.comprados = {};           // {idProducto: unidades}
  }
  const hora = claveHora(ahora);
  if (estado.tienda.rotacionHora !== hora) {
    estado.tienda.rotacionHora = hora;
    estado.tienda.compradosEquipo = [];     // las piezas de esta hora ya vendidas
  }
  return { dia: hoy, hora };
}

/** Cuántas unidades quedan hoy de un consumible (25.12). */
export function stockRestante(id, ahora = Date.now(), estado = S) {
  sincronizarDia(ahora, estado);
  const prod = getConsumible(id);
  if (!prod) return 0;
  const tope = prod.stockDia ?? 99;
  const ya = estado.tienda.comprados?.[id] || 0;
  return Math.max(0, tope - ya);
}

/** 26.10 — ¿se alcanzó el tope diario de este producto? */
export function topeAlcanzado(id, ahora = Date.now(), estado = S) {
  return stockRestante(id, ahora, estado) <= 0;
}

/* ---------- Catálogo completo de una sección ---------- */

export function catalogo(seccion, ahora = Date.now(), estado = S) {
  const nivel = estado.perfil?.nivel || 1;
  sincronizarDia(ahora, estado);

  if (seccion === 'pociones') {
    return Object.values(POCIONES).map(p => decorar(p, ahora, estado));
  }
  if (seccion === 'equipo') {
    return vitrinaEquipo(ahora, nivel)
      .filter(p => !(estado.tienda.compradosEquipo || []).includes(p.idTienda));
  }
  if (seccion === 'ofertas') {
    const oferta = ofertaDelDia(ahora);
    const extras = Object.values(EXTRAS).map(p => decorar(p, ahora, estado));
    return [decorar(oferta, ahora, estado), ...extras.filter(e => e.id !== oferta.id)];
  }
  if (seccion === 'negro') {
    if (!mercadoNegroAbierto(estado)) return [];
    return vitrinaNegro(ahora, nivel)
      .filter(p => !(estado.tienda.compradosEquipo || []).includes(p.idTienda));
  }
  return [];
}

function decorar(prod, ahora, estado) {
  const restante = stockRestante(prod.id, ahora, estado);
  return { ...prod, stockRestante: restante, agotado: restante <= 0 };
}

/* ---------- Compra (25.08 confirmada, 25.09 sin vuelta atrás) ---------- */

/**
 * Comprueba si se puede comprar, SIN comprar. La pantalla llama a esto
 * para pintar el diálogo de confirmación (25.08).
 */
export function puedeComprar(prod, estado = S, ahora = Date.now()) {
  if (!prod) return { ok: false, motivo: 'Producto inexistente' };

  const esEquipo = prod.seccion === 'equipo' || prod.seccion === 'negro';
  if (!esEquipo && topeAlcanzado(prod.id, ahora, estado)) {
    return { ok: false, motivo: 'Agotado por hoy' };
  }
  if (esEquipo && (estado.tienda.compradosEquipo || []).includes(prod.idTienda)) {
    return { ok: false, motivo: 'Ya lo compraste' };
  }
  if (esEquipo && lleno()) {
    return { ok: false, motivo: 'Inventario lleno' };
  }

  const saldo = prod.moneda === 'gemas' ? estado.monedas.gemas : estado.monedas.oro;
  if (saldo < prod.precio) {
    return { ok: false, motivo: `Te faltan ${prod.precio - saldo}`, sinSaldo: true };
  }
  return { ok: true };
}

/**
 * Ejecuta la compra. Devuelve {ok, mensaje}.
 * 25.09 — no hay función de devolución, a propósito.
 */
export function comprar(prod, estado = S, ahora = Date.now()) {
  const check = puedeComprar(prod, estado, ahora);
  if (!check.ok) return { ok: false, mensaje: check.motivo };

  const pagado = prod.moneda === 'gemas'
    ? gastarGemas(prod.precio, 'tienda')
    : gastarOro(prod.precio, 'tienda');
  if (!pagado) return { ok: false, mensaje: 'No se pudo pagar' };

  const esEquipo = prod.seccion === 'equipo' || prod.seccion === 'negro';

  if (esEquipo) {
    estado.tienda.compradosEquipo = estado.tienda.compradosEquipo || [];
    estado.tienda.compradosEquipo.push(prod.idTienda);
    recoger(prod);
    return { ok: true, mensaje: `${prod.nombre} guardado en el inventario`, pieza: prod };
  }

  // Consumible: se apunta el stock y se aplica el efecto
  estado.tienda.comprados = estado.tienda.comprados || {};
  estado.tienda.comprados[prod.id] = (estado.tienda.comprados[prod.id] || 0) + 1;

  return aplicarCompra(prod, estado);
}

/** Efectos inmediatos y guardado de los que se activan en la lucha (26.02). */
function aplicarCompra(prod, estado) {
  const ef = prod.efecto || {};

  if (ef.tipo === 'material') {
    darMaterial(ef.valor);
    return { ok: true, mensaje: `+${ef.valor} vendas de campeón` };
  }
  if (ef.tipo === 'inventario') {
    estado.equipo.maxInventario = (estado.equipo.maxInventario || EQUIPO.INVENTARIO_MAX) + ef.valor;
    return { ok: true, mensaje: `Inventario ampliado a ${estado.equipo.maxInventario}` };
  }
  if (ef.tipo === 'ticket') {
    estado.tienda.tickets = (estado.tienda.tickets || 0) + 1;
    return { ok: true, mensaje: 'Ticket del Coliseo añadido' };
  }
  // 26.02 pociones: van a la mochila y se activan solas en la próxima lucha
  estado.tienda.pociones = estado.tienda.pociones || {};
  estado.tienda.pociones[prod.id] = (estado.tienda.pociones[prod.id] || 0) + 1;
  return { ok: true, mensaje: `${prod.nombre} listo para la próxima lucha` };
}

/* ---------- Sugerencia #3: "mejor que lo tuyo" ---------- */

/**
 * Compara una pieza de tienda con la equipada en su slot.
 * Reutiliza la puntuación del Paso 9 en vez de inventar otra métrica.
 */
export function comparaConEquipado(pieza, estado = S) {
  const actual = estado.equipo.slots[pieza.slot];
  const suma = p => p ? Object.values(p.stats).reduce((a, b) => a + b, 0) : 0;
  const mia = suma(pieza);
  const suya = suma(actual);
  return {
    actual,
    puntosNuevo: mia,
    puntosActual: suya,
    delta: mia - suya,
    mejor: mia > suya,
    vacio: !actual
  };
}

/* ---------- Sugerencia #2: historial de rotaciones ---------- */

/** Las N rotaciones anteriores, para saber si conviene esperar. */
export function rotacionesPasadas(n = 5, ahora = Date.now(), nivelHeroe = 1) {
  const out = [];
  for (let i = 1; i <= n; i++) {
    const t = ahora - i * ROTACION_MS;
    out.push({
      hora: new Date(t).getHours(),
      clave: claveHora(t),
      piezas: vitrinaEquipo(t, nivelHeroe)
    });
  }
  return out;
}

/* ---------- Sugerencia #4: lista de deseos ---------- */

export function alternarDeseo(slot, rareza, estado = S) {
  estado.tienda.deseos = estado.tienda.deseos || [];
  const clave = `${slot}:${rareza}`;
  const i = estado.tienda.deseos.indexOf(clave);
  if (i >= 0) { estado.tienda.deseos.splice(i, 1); return false; }
  estado.tienda.deseos.push(clave);
  return true;
}

export function enDeseos(slot, rareza, estado = S) {
  return (estado.tienda.deseos || []).includes(`${slot}:${rareza}`);
}

/** ¿Alguna pieza de la vitrina actual está en la lista de deseos? */
export function deseosEnVitrina(ahora = Date.now(), estado = S) {
  const nivel = estado.perfil?.nivel || 1;
  return catalogo('equipo', ahora, estado)
    .filter(p => enDeseos(p.slot, p.rareza, estado));
}
