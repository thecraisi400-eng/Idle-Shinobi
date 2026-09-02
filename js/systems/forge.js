/* ===== FORJA: MEJORA DE OBJETOS =====
   16.01 mejora con oro + material · 16.02 SIN tope de nivel de mejora
   15.05 las estrellas son el nivel visible de la pieza

   Mejorar NO cambia la rareza ni las stats que tiene la pieza:
   solo sube sus números. Una común mejorada nunca alcanza a una divina
   del mismo nivel, pero puede salvarte veinte luchas. */

import { S, gastarOro } from '../core/state.js';
import { emit } from '../core/events-bus.js';
import { getRareza, costeMejora, puntosDePieza, valorDePieza } from '../data/equipo.js';
import { gastarMaterial, material, buscar } from './inventory.js';

/** Localiza una pieza esté donde esté (inventario o slots). */
export function localizar(id) {
  const enInv = buscar(id);
  if (enInv) return { pieza: enInv, donde: 'inventario' };
  for (const [slotId, p] of Object.entries(S.equipo.slots)) {
    if (p?.id === id) return { pieza: p, donde: 'equipado', slot: slotId };
  }
  return { pieza: null, donde: null };
}

/** ¿Se puede pagar la mejora ahora mismo? */
export function puedeMejorar(pieza) {
  if (!pieza) return { ok: false, motivo: 'no-existe' };
  const r = getRareza(pieza.rareza);
  // 16.02: sin tope duro global, pero cada rareza tiene su horizonte visible
  const coste = costeMejora(pieza);
  const faltaOro = S.monedas.oro < coste.oro;
  const faltaMat = material() < coste.material;
  return {
    ok: !faltaOro && !faltaMat,
    motivo: faltaOro && faltaMat ? 'oro-y-material' : faltaOro ? 'oro' : faltaMat ? 'material' : null,
    coste, faltaOro, faltaMat,
    tope: r.estrellasMax
  };
}

/**
 * Sube una estrella. Recalcula stats proporcionalmente.
 * @returns { ok, pieza, coste, motivo, antes, despues }
 */
export function mejorar(id) {
  const { pieza } = localizar(id);
  if (!pieza) return { ok: false, motivo: 'no-existe' };

  const chequeo = puedeMejorar(pieza);
  if (!chequeo.ok) return { ok: false, motivo: chequeo.motivo, coste: chequeo.coste };

  const { coste } = chequeo;
  const antes = puntosDePieza(pieza.nivel, pieza.rareza, pieza.estrellas);
  const despues = puntosDePieza(pieza.nivel, pieza.rareza, pieza.estrellas + 1);
  const factor = despues / antes;

  if (!gastarOro(coste.oro, 'forja')) return { ok: false, motivo: 'oro', coste };
  if (!gastarMaterial(coste.material)) return { ok: false, motivo: 'material', coste };

  pieza.estrellas++;
  for (const k of Object.keys(pieza.stats)) {
    const v = pieza.stats[k];
    // los valores negativos de los exóticos también escalan: el trade-off se mantiene
    pieza.stats[k] = v >= 0
      ? Math.max(1, Math.round(v * factor))
      : Math.min(-1, Math.round(v * factor));
  }
  pieza.valor = valorDePieza(pieza);

  emit('forja:mejora', { pieza, coste, factor });
  emit('equipo:change', { accion: 'mejora', pieza });
  emit('hud:refresh');
  return { ok: true, pieza, coste, antes, despues, factor };
}

/** Previsualización: qué stats tendría la pieza con una estrella más. */
export function previsualizar(pieza) {
  if (!pieza) return null;
  const antes = puntosDePieza(pieza.nivel, pieza.rareza, pieza.estrellas);
  const despues = puntosDePieza(pieza.nivel, pieza.rareza, pieza.estrellas + 1);
  const factor = despues / antes;
  const stats = {};
  for (const [k, v] of Object.entries(pieza.stats)) {
    stats[k] = v >= 0 ? Math.max(1, Math.round(v * factor)) : Math.min(-1, Math.round(v * factor));
  }
  return { stats, factor, coste: costeMejora(pieza) };
}

/** Mejora repetida mientras alcance el oro y el material (con tope de pasos). */
export function mejorarVarias(id, veces = 1, maxPasos = 20) {
  let hechas = 0, oro = 0, mat = 0;
  for (let i = 0; i < Math.min(veces, maxPasos); i++) {
    const r = mejorar(id);
    if (!r.ok) break;
    hechas++; oro += r.coste.oro; mat += r.coste.material;
  }
  return { hechas, oro, material: mat };
}

/** Estrellas en texto, para pintar. */
export function estrellasTexto(pieza) {
  const max = getRareza(pieza.rareza).estrellasMax;
  return '★'.repeat(pieza.estrellas) + '☆'.repeat(Math.max(0, max - pieza.estrellas));
}
