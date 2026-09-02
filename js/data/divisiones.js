/* ===== LAS 6 DIVISIONES + TEMPORADA (05.12) =====
   El jugador asciende por divisiones; al superar la 6ª entra en la
   Torre Infinita (06.11 modo endless). */

export const DIVISIONES = [
  {
    n: 1, id: 'novatos', nombre: 'Novatos', ico: '🥉', color: '#8b8b93',
    desc: 'Gimnasios de barrio y público escaso.',
    luchas: 20, multStats: 1.00, multOro: 1.00
  },
  {
    n: 2, id: 'aspirantes', nombre: 'Aspirantes', ico: '🥈', color: '#4ec97a',
    desc: 'Los primeros carteles con tu nombre.',
    luchas: 25, multStats: 1.35, multOro: 1.30
  },
  {
    n: 3, id: 'profesionales', nombre: 'Profesionales', ico: '🥇', color: '#4d9cf0',
    desc: 'Arenas llenas y rivales que estudian tu estilo.',
    luchas: 30, multStats: 1.85, multOro: 1.75
  },
  {
    n: 4, id: 'estrellas', nombre: 'Estrellas', ico: '⭐', color: '#a765e8',
    desc: 'Televisión nacional. Aquí ya nadie regala nada.',
    luchas: 35, multStats: 2.55, multOro: 2.40
  },
  {
    n: 5, id: 'campeones', nombre: 'Campeones', ico: '🏆', color: '#f0872f',
    desc: 'Cinturones de verdad y rivales de élite.',
    luchas: 40, multStats: 3.50, multOro: 3.20
  },
  {
    n: 6, id: 'leyendas', nombre: 'Leyendas', ico: '👑', color: '#e8b64c',
    desc: 'Solo los inmortales llegan hasta aquí.',
    luchas: 50, multStats: 4.80, multOro: 4.50
  }
];

/** La Torre Infinita: cuando terminas la división 6 (06.11). */
export const TORRE = {
  n: 7, id: 'torre', nombre: 'Torre Infinita', ico: '🗼', color: '#6ec8ff',
  desc: 'Pisos sin fin, cada uno más duro que el anterior.',
  multStatsPorPiso: 1.06, multOroPorPiso: 1.05
};

export const getDivision = n => DIVISIONES.find(d => d.n === n) || TORRE;

/** Total de luchas acumuladas hasta el final de una división. */
export function luchasAcumuladas(n) {
  return DIVISIONES.filter(d => d.n <= n).reduce((s, d) => s + d.luchas, 0);
}

/** ¿En qué división cae el rival número i (global)? */
export function divisionPorIndice(i) {
  let acum = 0;
  for (const d of DIVISIONES) {
    acum += d.luchas;
    if (i < acum) return d;
  }
  return TORRE;
}

/** Índice local dentro de la división (para saber si toca jefe). */
export function indiceLocal(i) {
  let acum = 0;
  for (const d of DIVISIONES) {
    if (i < acum + d.luchas) return i - acum;
    acum += d.luchas;
  }
  return i - acum;   // piso de la torre
}

export const TOTAL_LUCHAS_CAMPANA = luchasAcumuladas(6);   // 200
