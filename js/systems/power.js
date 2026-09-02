/* ===== ÍNDICE DE PODER =====
   03.14 "Poder + comparación": un número que resume tu fuerza,
   junto al del rival con flecha de probabilidad de victoria.
   13.08 comparación con ventaja marcada. */

import { STATS, CLAVES_STATS, derivadas } from '../data/stats.js';
import { multiplicadorClase, relacionClase } from '../data/clases.js';

/** Poder total ponderado por la utilidad real de cada stat en combate. */
export function poder(stats, bonos = {}) {
  let total = 0;
  for (const k of CLAVES_STATS) {
    const v = (stats[k] || 0) + (bonos[k] || 0);
    total += v * STATS[k].peso;
  }
  // El combate premia el equilibrio: un pequeño bonus por no estar roto
  const vals = CLAVES_STATS.filter(k => !STATS[k].soloEventos).map(k => stats[k] || 0);
  const media = vals.reduce((a, b) => a + b, 0) / vals.length;
  const desv = Math.sqrt(vals.reduce((a, b) => a + (b - media) ** 2, 0) / vals.length);
  const equilibrio = 1 + Math.max(0, 0.06 - desv / media * 0.06);
  return Math.floor(total * equilibrio);
}

/** Poder "efectivo" en combate: incluye la ventaja de clase contra ese rival. */
export function poderEfectivo(stats, claseMia, claseRival, bonos = {}) {
  return Math.floor(poder(stats, bonos) * multiplicadorClase(claseMia, claseRival));
}

/**
 * Probabilidad de victoria estimada (03.14 flecha).
 * Curva logística sobre la razón de poderes: 1.0 → 50%, 1.3 → ~80%.
 */
export function probabilidadVictoria(poderMio, poderRival) {
  if (poderRival <= 0) return 0.99;
  const razon = poderMio / poderRival;
  const x = Math.log(razon) * 4.2;
  const p = 1 / (1 + Math.exp(-x));
  return Math.max(0.01, Math.min(0.99, p));
}

/** Etiqueta y color según la probabilidad. */
export function pronostico(p) {
  if (p >= 0.80) return { txt: 'Favorito claro',  clase: 'ok',   flecha: '▲▲' };
  if (p >= 0.60) return { txt: 'Ligero favorito', clase: 'ok',   flecha: '▲'  };
  if (p >= 0.40) return { txt: 'Parejo',          clase: '',     flecha: '='  };
  if (p >= 0.20) return { txt: 'En desventaja',   clase: 'bad',  flecha: '▼'  };
  return                { txt: 'Muy difícil',     clase: 'bad',  flecha: '▼▼' };
}

/** Comparación completa contra un rival, lista para pintar (13.08). */
export function comparar(heroe, rival) {
  const pMio   = poderEfectivo(heroe.stats, heroe.clase, rival.clase, heroe.bonos);
  const pSuyo  = poderEfectivo(rival.stats, rival.clase, heroe.clase, rival.bonos);
  const prob   = probabilidadVictoria(pMio, pSuyo);
  const filas  = CLAVES_STATS.map(k => {
    const mio = (heroe.stats[k] || 0) + (heroe.bonos?.[k] || 0);
    const suyo = (rival.stats[k] || 0) + (rival.bonos?.[k] || 0);
    return { clave: k, nombre: STATS[k].nombre, ico: STATS[k].ico, mio, suyo, delta: mio - suyo };
  });
  return {
    poderMio: pMio,
    poderRival: pSuyo,
    prob,
    pronostico: pronostico(prob),
    relacionClase: relacionClase(heroe.clase, rival.clase),
    filas
  };
}

/** DPS teórico aproximado — para el "efecto en DPS" antes de comprar (13.05). */
export function dpsEstimado(stats, bonos = {}) {
  const d = derivadas(stats, bonos);
  const golpesPorSeg = d.velocidad * 0.5;
  const critMedio = 1 + 0.10 * 0.5;   // 10% de crítico x1.5 (03.04)
  return d.danoBase * golpesPorSeg * critMedio;
}

/** Firma corta de build para compartir/depurar (Sugerencia #5 del Paso 3). */
export function firmaBuild(stats, claseId) {
  const top = CLAVES_STATS
    .map(k => ({ k, v: stats[k] || 0 }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 2)
    .map(x => x.k.slice(0, 3).toUpperCase())
    .join('-');
  const suma = CLAVES_STATS.reduce((a, k) => a + (stats[k] || 0), 0);
  return `${(claseId || 'xxx').slice(0, 3).toUpperCase()}-${top}-${suma.toString(36).toUpperCase()}`;
}
