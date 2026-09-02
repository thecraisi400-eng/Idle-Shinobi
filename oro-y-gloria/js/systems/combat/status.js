/* ===== GESTOR DE ESTADOS ALTERADOS =====
   Aplica, procesa y expira los 8 estados durante el combate.
   La Recuperación del defensor da resistencia a recibirlos. */

import { ESTADOS } from '../../data/estados.js';

/** Inicializa la lista de estados de un luchador. */
export function limpiarEstados(f) {
  f.estados = [];
  // 18.05 — el escudo inicial del árbol sobrevive a la limpieza:
  // el motor llama a limpiarEstados DESPUÉS de prepararParaLucha.
  f.escudo = Math.round(f.pasivas?.escudoInicial || 0);
}

/** ¿Tiene el estado activo? */
export function tiene(f, id) {
  return f.estados?.some(e => e.id === id) || false;
}

export function capasDe(f, id) {
  return f.estados?.find(e => e.id === id)?.capas || 0;
}

/**
 * Aplica un estado. Respeta la regla de acumulación (Sugerencia #5).
 * @returns {{aplicado:boolean, refrescado:boolean, capas:number}}
 */
export function aplicarEstado(f, id, rng = null, opciones = {}) {
  const def = ESTADOS[id];
  if (!def) return { aplicado: false, refrescado: false, capas: 0 };

  // Resistencia por Recuperación (solo para estados malos)
  if (def.tipo === 'malo' && rng && !opciones.ignoraResistencia) {
    const resist = Math.min(0.45, (f.der.fatigaRegen || 0) * 0.02);
    if (rng.chance(resist)) return { aplicado: false, refrescado: false, capas: 0, resistido: true };
  }

  const dur = opciones.dur || def.dur;
  const existente = f.estados.find(e => e.id === id);

  if (existente) {
    if (def.acumula === 'apila' && existente.capas < def.maxCapas) {
      existente.capas++;
      existente.restante = Math.max(existente.restante, dur);
      return { aplicado: true, refrescado: false, capas: existente.capas };
    }
    // REFRESCA: renueva duración en vez de apilar infinito
    existente.restante = dur;
    // El escudo NO se renueva mientras siga activo: si no, re-aplicarlo en
    // cada especial daba un sustain infinito e imbatible (92% de winrate).
    // Hay que esperar a que expire para volver a levantarlo.
    return { aplicado: true, refrescado: true, capas: existente.capas };
  }

  const nuevo = { id, restante: dur, capas: 1 };
  f.estados.push(nuevo);

  if (def.escudoInicial) {
    f.escudo = def.escudoInicial(f);
    nuevo.escudo = f.escudo;
  }
  return { aplicado: true, refrescado: false, capas: 1 };
}

export function quitarEstado(f, id) {
  const i = f.estados.findIndex(e => e.id === id);
  if (i >= 0) {
    if (id === 'escudo') f.escudo = 0;
    f.estados.splice(i, 1);
    return true;
  }
  return false;
}

/**
 * Procesa un tick: daño/cura por turno y expiración.
 * @returns {Array} lista de sucesos para el log
 */
export function procesarTick(f) {
  const sucesos = [];
  if (!f.estados?.length) return sucesos;

  for (let i = f.estados.length - 1; i >= 0; i--) {
    const est = f.estados[i];
    const def = ESTADOS[est.id];
    if (!def) { f.estados.splice(i, 1); continue; }

    if (def.porTick) {
      const r = def.porTick(f, est.capas);
      if (r?.dano) {
        f.vida -= r.dano;
        sucesos.push({ tipo: 'estadoTick', id: est.id, ico: def.ico, nombre: def.nombre, dano: r.dano });
      }
      if (r?.cura) {
        const antes = f.vida;
        f.vida = Math.min(f.der.vidaMax, f.vida + r.cura);
        const real = Math.round(f.vida - antes);
        if (real > 0) sucesos.push({ tipo: 'estadoTick', id: est.id, ico: def.ico, nombre: def.nombre, cura: real });
      }
    }

    est.restante--;
    if (est.restante <= 0) {
      if (est.id === 'escudo') f.escudo = 0;
      f.estados.splice(i, 1);
      sucesos.push({ tipo: 'estadoFin', id: est.id, ico: def.ico, nombre: def.nombre });
    }
  }
  return sucesos;
}

/** ¿Está bloqueado para actuar este tick? (aturdimiento) */
export function bloqueado(f) {
  return f.estados?.some(e => ESTADOS[e.id]?.bloqueaAccion) || false;
}

/** Multiplicador del daño que INFLIGE. */
export function modDanoInfligido(f) {
  let m = 1;
  for (const e of f.estados || []) {
    const d = ESTADOS[e.id];
    if (d?.modDanoInfligido) m *= d.modDanoInfligido;
  }
  return m;
}

/** Multiplicador de velocidad de acción. */
export function modVelocidad(f) {
  let m = 1;
  for (const e of f.estados || []) {
    const d = ESTADOS[e.id];
    if (d?.modVelocidad) m *= d.modVelocidad;
  }
  return m;
}

/** Probabilidad extra de crítico que recibe (estado Vendido). */
export function critExtraRecibido(f) {
  let extra = 0;
  for (const e of f.estados || []) {
    const d = ESTADOS[e.id];
    if (d?.critExtraRecibido) extra += d.critExtraRecibido;
  }
  return extra;
}

/**
 * Absorbe daño con el escudo antes de tocar la vida.
 * @returns {{danoFinal:number, absorbido:number}}
 */
export function absorberConEscudo(f, dano) {
  if (!f.escudo || f.escudo <= 0) return { danoFinal: dano, absorbido: 0 };
  const absorbido = Math.min(f.escudo, dano);
  f.escudo -= absorbido;
  if (f.escudo <= 0) quitarEstado(f, 'escudo');
  return { danoFinal: dano - absorbido, absorbido };
}

/** Resumen para el HUD (11.07 fila de iconos, no sobre el luchador). */
export function iconosEstados(f) {
  return (f.estados || []).map(e => {
    const d = ESTADOS[e.id];
    return {
      id: e.id, ico: d.ico, nombre: d.nombre, color: d.color,
      tipo: d.tipo, restante: e.restante, capas: e.capas
    };
  });
}
