/* ===== ALEATORIEDAD CON SEMILLA =====
   Sugerencia #4 del Paso 2: RNG reproducible.
   - La semilla del perfil se guarda → el rival élite o el drop no cambian
     si el jugador recarga la página a propósito (anti-savescum).
   - Permite reproducir un combate exacto para depurar bugs. */

/** Hash de cadena a entero de 32 bits (para derivar semillas de nombres). */
export function hashCadena(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** Generador mulberry32: rápido, determinista y de buena calidad. */
export function crearRNG(semilla = Date.now()) {
  let a = (typeof semilla === 'string' ? hashCadena(semilla) : semilla) >>> 0;

  const next = () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    /** Float en [0,1) */
    float: next,
    /** Entero en [min, max] inclusive */
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    /** Float en [min, max) */
    rango: (min, max) => next() * (max - min) + min,
    /** true con probabilidad p */
    chance: p => next() < p,
    /** Elemento al azar de un array */
    elegir: arr => arr[Math.floor(next() * arr.length)],
    /** Elección ponderada: pesos([{v:'a',p:3},{v:'b',p:1}]) */
    pesos: lista => {
      const total = lista.reduce((s, x) => s + x.p, 0);
      let r = next() * total;
      for (const x of lista) { r -= x.p; if (r <= 0) return x.v; }
      return lista[lista.length - 1].v;
    },
    /** Baraja una copia del array */
    barajar: arr => {
      const a2 = [...arr];
      for (let i = a2.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [a2[i], a2[j]] = [a2[j], a2[i]];
      }
      return a2;
    },
    /** Estado actual, para guardarlo */
    estado: () => a,
    /** Restaurar un estado guardado */
    restaurar: v => { a = v >>> 0; }
  };
}

/** RNG global del juego (se re-siembra al cargar partida). */
export let rng = crearRNG(Date.now());
export function sembrarGlobal(semilla) { rng = crearRNG(semilla); return rng; }

/** RNG derivado y determinista para un contexto concreto
    (ej. el rival #47 siempre genera el mismo nombre y rasgos). */
export function rngDe(...partes) {
  return crearRNG(hashCadena(partes.join('|')));
}
