/* ===== LAS 5 LIGAS DEL COLISEO =====
   24.01 cinco ligas fijas: Bronce, Plata, Oro, Diamante, Leyenda
   22.01 buy-in por liga · 22.03 tamaño de cuadro por liga
   22.06 salas separadas por liga · 22.07 salas de oro Y salas de gemas
   24.02 temporada semanal · 24.03 premio de temporada solo en moneda
   24.12 sábado XL: cuadro de 64 con pozo gordo */

export const LIGAS = [
  {
    n: 1, id: 'bronce', nombre: 'Bronce', ico: '🥉', color: '#b07a4a',
    lema: 'Donde todos empiezan.',
    cuadro: 8,                 // 3 rondas
    buyInOro: 100,             // 22.01 el plan fija 100 en la liga baja
    buyInGemas: 5,             // 22.07 sala paralela de gemas
    nivelMin: 10,              // 22.09
    premioTemporada: 1200
  },
  {
    n: 2, id: 'plata', nombre: 'Plata', ico: '🥈', color: '#c0c6cf',
    lema: 'Ya sabes lo que haces.',
    cuadro: 16,                // 4 rondas
    buyInOro: 500,             // 22.01 el escalón medio del plan
    buyInGemas: 12,
    nivelMin: 15,
    premioTemporada: 4000
  },
  {
    n: 3, id: 'oro', nombre: 'Oro', ico: '🥇', color: '#e8b64c',
    lema: 'El cuadro clásico de 32.',
    cuadro: 32,                // 5 rondas: 32→16→8→4→2→1 (23.05)
    buyInOro: 2500,            // 22.01 el escalón alto del plan
    buyInGemas: 30,
    nivelMin: 22,
    premioTemporada: 14000
  },
  {
    n: 4, id: 'diamante', nombre: 'Diamante', ico: '💠', color: '#7fd8ff',
    lema: 'Aquí ya no hay turistas.',
    cuadro: 32,
    buyInOro: 7000,
    buyInGemas: 60,
    nivelMin: 32,
    premioTemporada: 38000
  },
  {
    n: 5, id: 'leyenda', nombre: 'Leyenda', ico: '👑', color: '#a765e8',
    lema: 'La cima del Coliseo.',
    cuadro: 32,
    buyInOro: 18000,
    buyInGemas: 120,
    nivelMin: 45,
    premioTemporada: 95000
  }
];

export const CLAVES_LIGAS = LIGAS.map(l => l.id);
export const getLiga = n => LIGAS.find(l => l.n === n) || LIGAS[0];
export const getLigaPorId = id => LIGAS.find(l => l.id === id) || LIGAS[0];

/** 24.12 — el sábado se abre además un cuadro XL de 64 con pozo gordo. */
export const XL = {
  id: 'xl', nombre: 'Sábado XL', ico: '🎪', color: '#f0872f',
  lema: 'Cuadro de 64. Una vez por semana.',
  cuadro: 64,                  // 6 rondas
  multBuyIn: 2,                // entrada doble...
  multPozo: 1.5,               // ...y encima el pozo se infla
  dia: 6                       // sábado (Date.getDay())
};

export function esSabado(fecha = new Date()) {
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  return d.getDay() === XL.dia;
}

/**
 * La sala concreta que se juega: liga + moneda (+ variante XL).
 * 22.06 — cada combinación es una sala independiente.
 */
export function construirSala(nLiga, moneda = 'oro', xl = false) {
  const liga = getLiga(nLiga);
  const cuadro = xl ? XL.cuadro : liga.cuadro;
  const base = moneda === 'gemas' ? liga.buyInGemas : liga.buyInOro;
  const buyIn = xl ? Math.round(base * XL.multBuyIn) : base;

  return {
    liga, moneda, xl, cuadro, buyIn,
    id: `${liga.id}-${moneda}${xl ? '-xl' : ''}`,
    nombre: xl ? `${XL.nombre} · ${liga.nombre}` : `${liga.nombre} · ${moneda === 'gemas' ? 'Gemas' : 'Oro'}`,
    ico: xl ? XL.ico : liga.ico,
    color: xl ? XL.color : liga.color,
    rondas: Math.log2(cuadro),
    multPozo: xl ? XL.multPozo : 1
  };
}

/** Todas las salas abiertas ahora mismo para un jugador de nivel N (22.11 24/7). */
export function salasDisponibles(nivel, fecha = new Date()) {
  const out = [];
  for (const liga of LIGAS) {
    for (const moneda of ['oro', 'gemas']) {
      out.push({ ...construirSala(liga.n, moneda, false), abierta: nivel >= liga.nivelMin });
    }
    if (esSabado(fecha)) {
      out.push({ ...construirSala(liga.n, 'oro', true), abierta: nivel >= liga.nivelMin });
    }
  }
  return out;
}

/* ---------- Nombres de ronda (23.05 "con tradición") ---------- */

const NOMBRES_RONDA = {
  1: 'Final',
  2: 'Semifinal',
  4: 'Cuartos de final',
  8: 'Octavos de final',
  16: 'Dieciseisavos',
  32: 'Ronda inicial'
};

/** @param {number} luchas número de luchas de esa ronda */
export function nombreRonda(luchas) {
  return NOMBRES_RONDA[luchas] || `Ronda de ${luchas * 2}`;
}

/** 23.05 — la final es al mejor de 3 caídas: la clásica. */
export const FINAL_AL_MEJOR_DE = 3;

/* ---------- 24.02 Temporada semanal ---------- */

/** Lunes 00:00 de la semana de `fecha`. */
export function inicioTemporada(fecha = new Date()) {
  const d = fecha instanceof Date ? new Date(fecha) : new Date(fecha);
  const dia = (d.getDay() + 6) % 7;                 // 0 = lunes
  const l = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dia, 0, 0, 0, 0);
  return l.getTime();
}

export function finTemporada(fecha = new Date()) {
  return inicioTemporada(fecha) + 7 * 24 * 3600 * 1000;
}

/** ¿Cambió la semana desde el último sello guardado? */
export function temporadaCaducada(sello, ahora = Date.now()) {
  if (!sello) return true;
  return inicioTemporada(new Date(ahora)) > sello;
}

/**
 * 24.03 — premio de fin de temporada, pagado en la moneda de tu liga.
 * Escala con los torneos ganados durante la semana.
 */
export function premioTemporada(nLiga, torneosGanados = 0) {
  const liga = getLiga(nLiga);
  const base = Math.round(liga.premioTemporada * (0.35 + Math.min(1, torneosGanados * 0.22)));
  return { oro: base, liga: liga.nombre, torneosGanados };
}
