/* ===== POCIONES: LA MOCHILA Y SU ACTIVACIÓN AUTOMÁTICA =====
   26.01 tres de curación + la de vida extra al arrancar
   26.02 no se "usan": se activan SOLAS en la próxima lucha
   20.15 en los eventos NO se permiten consumibles

   Reglas de activación (una de cada tipo por lucha, la mejor primero):
   - vidaExtra: al preparar la lucha, sube el máximo de vida.
   - curar:     a mitad de la lucha, cuando bajas del 50%.
   - revivir:   al llegar a 0 por primera vez, te levanta. */

import { S } from '../core/state.js';
import { POCIONES, getConsumible } from '../data/tienda.js';

/** Cuántas unidades tienes de una poción. */
export function cantidad(id, estado = S) {
  return estado.tienda?.pociones?.[id] || 0;
}

/** Todas las pociones que llevas encima. */
export function mochila(estado = S) {
  const p = estado.tienda?.pociones || {};
  return Object.keys(p)
    .filter(id => p[id] > 0 && POCIONES[id])
    .map(id => ({ ...POCIONES[id], cantidad: p[id] }));
}

export function total(estado = S) {
  return mochila(estado).reduce((a, p) => a + p.cantidad, 0);
}

/** Descuenta una unidad. Devuelve true si había. */
export function consumir(id, estado = S) {
  if (cantidad(id, estado) <= 0) return false;
  estado.tienda.pociones[id]--;
  if (estado.tienda.pociones[id] <= 0) delete estado.tienda.pociones[id];
  return true;
}

/**
 * 26.02 — decide qué pociones se activarán en la próxima lucha.
 * Elige la MEJOR de cada tipo (no gasta dos curaciones a la vez).
 * @param {boolean} esEvento 20.15 en eventos no se permiten
 */
export function planificar(estado = S, esEvento = false) {
  if (esEvento) return { vidaExtra: null, curar: null, revivir: null, ninguna: true };

  const disponibles = mochila(estado);
  const mejorDe = (tipo) => disponibles
    .filter(p => p.efecto.tipo === tipo)
    .sort((a, b) => b.efecto.valor - a.efecto.valor)[0] || null;

  const plan = {
    vidaExtra: mejorDe('vidaExtra'),
    curar: mejorDe('curar'),
    revivir: mejorDe('revivir')
  };
  plan.ninguna = !plan.vidaExtra && !plan.curar && !plan.revivir;
  return plan;
}

/**
 * Aplica las pociones al luchador antes de empezar (vidaExtra) y
 * devuelve el estado vivo de las que actúan durante la lucha.
 * Las consume del inventario: 25.09 no hay marcha atrás.
 */
export function activar(luchador, estado = S, esEvento = false) {
  const plan = planificar(estado, esEvento);
  const activas = { curar: null, revivir: null, usadas: [] };

  if (plan.vidaExtra && consumir(plan.vidaExtra.id, estado)) {
    const extra = Math.round(luchador.der.vidaMax * plan.vidaExtra.efecto.valor);
    luchador.der.vidaMax += extra;
    luchador.vida = luchador.der.vidaMax;
    activas.usadas.push(plan.vidaExtra);
  }
  if (plan.curar && consumir(plan.curar.id, estado)) {
    activas.curar = { ...plan.curar, gastada: false };
    activas.usadas.push(plan.curar);
  }
  if (plan.revivir && consumir(plan.revivir.id, estado)) {
    activas.revivir = { ...plan.revivir, gastada: false };
    activas.usadas.push(plan.revivir);
  }
  return activas;
}

/**
 * Se llama en cada tick. Devuelve un aviso si alguna poción se disparó.
 * @param {object} activas lo que devolvió activar()
 */
export function revisarTick(luchador, activas) {
  if (!activas) return null;

  // Curación a mitad: cuando bajas del 50%
  if (activas.curar && !activas.curar.gastada &&
      luchador.vida > 0 && luchador.vida < luchador.der.vidaMax * 0.5) {
    activas.curar.gastada = true;
    const cura = Math.round(luchador.der.vidaMax * activas.curar.efecto.valor);
    luchador.vida = Math.min(luchador.der.vidaMax, luchador.vida + cura);
    return { tipo: 'curar', poción: activas.curar, valor: cura, ico: activas.curar.ico };
  }
  return null;
}

/**
 * Se llama justo cuando un luchador llega a 0.
 * Si lleva elixir, lo levanta y devuelve true (la lucha continúa).
 */
export function revisarCaida(luchador, activas) {
  if (!activas || !activas.revivir || activas.revivir.gastada) return null;
  activas.revivir.gastada = true;
  const vida = Math.round(luchador.der.vidaMax * activas.revivir.efecto.valor);
  luchador.vida = vida;
  return { tipo: 'revivir', poción: activas.revivir, valor: vida, ico: activas.revivir.ico };
}

/** Texto para la pantalla previa a la lucha: qué se va a activar. */
export function resumenPlan(estado = S, esEvento = false) {
  const plan = planificar(estado, esEvento);
  if (esEvento) return 'Los consumibles no se permiten en eventos.';
  if (plan.ninguna) return 'No llevas pociones.';
  const trozos = [];
  if (plan.vidaExtra) trozos.push(`${plan.vidaExtra.ico} +${Math.round(plan.vidaExtra.efecto.valor * 100)}% vida inicial`);
  if (plan.curar) trozos.push(`${plan.curar.ico} cura ${Math.round(plan.curar.efecto.valor * 100)}% a mitad`);
  if (plan.revivir) trozos.push(`${plan.revivir.ico} segunda vida`);
  return trozos.join(' · ');
}
