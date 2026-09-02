/* ===== MODO BAJO RENDIMIENTO (29.14) =====
   Los móviles de gama baja son la mitad del público de un idle. El juego
   detecta el aparato y, si va justo, apaga lo caro: sombras, público
   animado, partículas y transiciones largas.

   Se puede forzar a mano desde el perfil: quien tenga un móvil potente
   pero quiera ahorrar batería también gana. */

export const CLAVE_PERF = 'oro-y-gloria:perf';

/* Modos posibles: 'auto' | 'alto' | 'bajo' */
export const MODOS = ['auto', 'alto', 'bajo'];

/** Puntuación aproximada del aparato: cuanto más alta, mejor. */
export function puntuarAparato(nav = globalThis.navigator || {}, win = globalThis.window || {}) {
  let puntos = 0;
  const nucleos = nav.hardwareConcurrency || 4;
  const ram = nav.deviceMemory || 4;          // solo en Chrome
  const dpr = win.devicePixelRatio || 1;

  puntos += nucleos >= 8 ? 3 : nucleos >= 4 ? 2 : nucleos >= 2 ? 1 : 0;
  puntos += ram >= 8 ? 3 : ram >= 4 ? 2 : ram >= 2 ? 1 : 0;
  // pantallas muy densas cuestan relleno; con pocos núcleos, penaliza
  if (dpr >= 3 && nucleos <= 4) puntos -= 1;

  return puntos;      // 0..6
}

/** ¿El aparato pide modo bajo? Umbral: 3 puntos de 6. */
export function aparatoLento(nav = globalThis.navigator || {}, win = globalThis.window || {}) {
  return puntuarAparato(nav, win) <= 2;
}

/** Respeta la preferencia del sistema de reducir animaciones. */
export function prefiereMenosMovimiento(win = globalThis.window || {}) {
  try { return !!win.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches; }
  catch (_) { return false; }
}

export function leerModo() {
  try {
    const m = localStorage.getItem(CLAVE_PERF);
    return MODOS.includes(m) ? m : 'auto';
  } catch (_) { return 'auto'; }
}

export function guardarModo(modo) {
  if (!MODOS.includes(modo)) return false;
  try { localStorage.setItem(CLAVE_PERF, modo); } catch (_) {}
  aplicar(modo);
  return true;
}

/** Resuelve 'auto' a 'alto' o 'bajo' según el aparato. */
export function modoEfectivo(modo = leerModo(), nav = globalThis.navigator || {}, win = globalThis.window || {}) {
  if (modo === 'alto' || modo === 'bajo') return modo;
  return (aparatoLento(nav, win) || prefiereMenosMovimiento(win)) ? 'bajo' : 'alto';
}

/** Pone o quita la clase `perf-low` del body; el CSS hace el resto. */
export function aplicar(modo = leerModo(), doc = globalThis.document) {
  const efectivo = modoEfectivo(modo);
  doc?.body?.classList?.toggle('perf-low', efectivo === 'bajo');
  return efectivo;
}

/** Descripción legible para la pantalla de perfil. */
export function describir(modo = leerModo()) {
  const efectivo = modoEfectivo(modo);
  if (modo === 'auto') {
    return efectivo === 'bajo'
      ? 'Automático — tu aparato pide ahorrar, efectos reducidos'
      : 'Automático — tu aparato va sobrado, todos los efectos activos';
  }
  return modo === 'bajo'
    ? 'Ahorro — sin sombras, público ni partículas'
    : 'Calidad — todos los efectos activos';
}
