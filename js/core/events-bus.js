/* ===== BUS DE EVENTOS =====
   Publicar/suscribir para que el HUD y las pantallas se actualicen
   solas cuando cambia el estado, sin re-renderizar todo el juego. */

const canales = new Map();

/** Suscribirse. Devuelve una función para cancelar. */
export function on(evento, fn) {
  if (!canales.has(evento)) canales.set(evento, new Set());
  canales.get(evento).add(fn);
  return () => off(evento, fn);
}

/** Suscribirse una sola vez. */
export function once(evento, fn) {
  const cancelar = on(evento, (...args) => { cancelar(); fn(...args); });
  return cancelar;
}

export function off(evento, fn) {
  canales.get(evento)?.delete(fn);
}

/** Emitir. Soporta comodín: emit('oro:change') también dispara 'oro:*' y '*'. */
export function emit(evento, datos) {
  disparar(evento, evento, datos);
  const base = evento.split(':')[0];
  if (base !== evento) disparar(`${base}:*`, evento, datos);
  disparar('*', evento, datos);
}

function disparar(canal, evento, datos) {
  const set = canales.get(canal);
  if (!set) return;
  for (const fn of [...set]) {
    try { fn(datos, evento); }
    catch (e) { console.error(`[bus] error en "${evento}":`, e); }
  }
}

/** Limpia todo (útil al reiniciar la partida). */
export function limpiarBus() { canales.clear(); }
