/* ===== MOTOR DE LOGROS =====
   30.01 150 logros en cadenas · 07.14 oro pequeño · 08.14 gemas en colección
   Sugerencia #4: los secretos revelan su pista al 50% de progreso.

   Se evalúa TODO el catálogo tras cada evento relevante. Son 150
   comprobaciones baratas; hacerlo simple evita bugs de "logro que
   nunca salta porque olvidé llamarlo desde ahí". */

import { S, ganarOro, ganarGemas } from '../core/state.js';
import { emit } from '../core/events-bus.js';
import { LOGROS, TOTAL_LOGROS, getLogro } from '../data/logros.js';

/* ---------- Consulta ---------- */

export function completados(estado = S) {
  return estado.logros?.completados || [];
}

export function estaCompleto(id, estado = S) {
  return completados(estado).includes(id);
}

/** Progreso 0..1 de un logro concreto. */
export function progreso(logro, estado = S) {
  if (estaCompleto(logro.id, estado)) return 1;

  // Logros de cadena: se miden con un contador
  if (logro.contador) {
    const actual = estado.carrera[logro.contador] || 0;
    return Math.max(0, Math.min(1, actual / logro.meta));
  }
  // Logros de hito: o se cumple o no
  try { return logro.cond && logro.cond(estado) ? 1 : 0; }
  catch { return 0; }
}

/** Valor numérico actual, para pintar "340 / 1000". */
export function valores(logro, estado = S) {
  if (!logro.contador) return null;
  return {
    actual: Math.min(estado.carrera[logro.contador] || 0, logro.meta),
    meta: logro.meta
  };
}

/**
 * Sugerencia #4 — qué mostrar de un logro secreto.
 * Oculto hasta el 50%; a partir de ahí se revela la pista;
 * completado, se ve entero.
 */
export function vista(logro, estado = S) {
  const p = progreso(logro, estado);
  const hecho = estaCompleto(logro.id, estado);

  if (!logro.secreto || hecho) {
    return { nombre: logro.nombre, desc: logro.desc, ico: logro.ico, oculto: false, hecho, pct: p };
  }
  if (p >= 0.5) {
    return { nombre: '???', desc: logro.pista || 'Sigue jugando para descubrirlo.',
             ico: '🔍', oculto: true, revelado: true, hecho: false, pct: p };
  }
  return { nombre: '???', desc: 'Logro secreto.', ico: '❓', oculto: true, revelado: false, hecho: false, pct: p };
}

/* ---------- Evaluación ---------- */

/**
 * Revisa los 150 logros y desbloquea los que se cumplan.
 * @returns {Array} los logros recién conseguidos
 */
export function revisar(estado = S) {
  if (!estado.logros) estado.logros = { completados: [], progreso: {} };
  if (!Array.isArray(estado.logros.completados)) estado.logros.completados = [];

  const nuevos = [];

  for (const logro of LOGROS) {
    if (estaCompleto(logro.id, estado)) continue;

    let cumple = false;
    if (logro.contador) {
      cumple = (estado.carrera[logro.contador] || 0) >= logro.meta;
    } else if (logro.cond) {
      try { cumple = !!logro.cond(estado); } catch { cumple = false; }
    }
    if (!cumple) continue;

    estado.logros.completados.push(logro.id);
    if (logro.oro) ganarOro(logro.oro, 'logro');          // 07.14
    if (logro.gemas) ganarGemas(logro.gemas, 'logro');    // 08.14
    nuevos.push(logro);
    emit('logro:desbloqueado', { logro });
  }

  return nuevos;
}

/**
 * Marca un hito puntual que el estado no puede deducir solo
 * (ganar sin equipo, remontada, KO relámpago...). Lo llaman
 * la arena y los eventos al terminar una lucha.
 */
export function marcarHito(clave, estado = S) {
  estado.hitos = estado.hitos || {};
  if (estado.hitos[clave]) return false;
  estado.hitos[clave] = true;
  return true;
}

/**
 * Analiza el resultado de una lucha y marca los hitos secretos
 * que correspondan. Centraliza la lógica en un solo sitio.
 */
export function hitosDeLucha(res, { heroe, esEvento = false, esDomingo = false } = {}, estado = S) {
  if (!res) return [];
  const marcados = [];
  const gano = res.ganador === 'heroe';
  const r = res.resumen?.heroe || {};

  if (gano) {
    const vidaFinal = res.vidaHeroe ?? 0;
    const vidaMax = heroe?.der?.vidaMax || 1;

    if (vidaFinal > 0 && vidaFinal / vidaMax < 0.05 && marcarHito('remontada', estado)) marcados.push('remontada');
    if ((r.danoRecibido || 0) === 0 && marcarHito('perfecto', estado)) marcados.push('perfecto');
    if ((res.ticks || 999) <= 10 && marcarHito('relampagoKO', estado)) marcados.push('relampagoKO');
    if (res.motivo === 'jueces' && marcarHito('jueces', estado)) marcados.push('jueces');

    const sinEquipo = heroe && Object.values(estado.equipo?.slots || {}).every(s => !s);
    if (sinEquipo && marcarHito('sinEquipo', estado)) marcados.push('sinEquipo');
    if (esEvento && esDomingo && marcarHito('domingo', estado)) marcados.push('domingo');
  }

  if (res.ganador === null && marcarHito('empate', estado)) marcados.push('empate');
  if (res.motivo === 'descalificacion' && marcarHito('descalificado', estado)) marcados.push('descalificado');

  return marcados;
}

/* ---------- Resumen para la pantalla ---------- */

export function resumen(estado = S) {
  const hechos = completados(estado).length;
  const oroTotal = LOGROS.filter(l => estaCompleto(l.id, estado))
                         .reduce((a, l) => a + (l.oro || 0), 0);
  const gemasTotal = LOGROS.filter(l => estaCompleto(l.id, estado))
                           .reduce((a, l) => a + (l.gemas || 0), 0);
  return {
    hechos, total: TOTAL_LOGROS,
    pct: hechos / TOTAL_LOGROS,
    oroGanado: oroTotal,
    gemasGanadas: gemasTotal,
    secretosHechos: LOGROS.filter(l => l.secreto && estaCompleto(l.id, estado)).length
  };
}

/** Los logros agrupados por cadena, para pintarlos ordenados. */
export function porCadenas(estado = S) {
  const grupos = new Map();
  for (const l of LOGROS) {
    const k = l.cadena || 'hitos';
    if (!grupos.has(k)) grupos.set(k, []);
    grupos.get(k).push(l);
  }
  return [...grupos.entries()].map(([cadena, lista]) => ({
    cadena,
    logros: lista,
    hechos: lista.filter(l => estaCompleto(l.id, estado)).length,
    total: lista.length
  }));
}

/** El siguiente logro de cada cadena: lo que el jugador tiene "a tiro". */
export function proximos(estado = S, n = 5) {
  return LOGROS
    .filter(l => !estaCompleto(l.id, estado) && !l.secreto)
    .map(l => ({ logro: l, pct: progreso(l, estado) }))
    .filter(x => x.pct > 0)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, n);
}
