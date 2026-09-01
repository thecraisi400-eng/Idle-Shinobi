/**
 * Ring de Campeones — Rutas y navegación (Paso 2)
 *
 * Flujo: PORTADA → (clase → tutorial) → PANEL → pestañas.
 * Las pantallas inmersivas (combate, evento) ocultan cabecera y navegación.
 */

export const ROUTES = Object.freeze({
  HOME: 'home',
  DASHBOARD: 'dashboard',
  HERO: 'hero',
  EQUIPMENT: 'equipment',
  SKILLS: 'skills',
  EVENTS: 'events',
  PVP: 'pvp',
  SHOP: 'shop',
  SETTINGS: 'settings',
  COMBAT: 'combat'
});

/** Rutas que ocupan toda la pantalla sin cabecera ni navegación inferior. */
export const IMMERSIVE_ROUTES = Object.freeze([ROUTES.HOME, ROUTES.COMBAT]);

/** Pestañas de la navegación inferior, en orden. */
export const NAV_TABS = Object.freeze([
  { route: ROUTES.DASHBOARD, label: 'Panel', icon: '🏟️' },
  { route: ROUTES.HERO, label: 'Héroe', icon: '🥊' },
  { route: ROUTES.EQUIPMENT, label: 'Equipo', icon: '🛡️' },
  { route: ROUTES.SKILLS, label: 'Habilidad', icon: '✨' },
  { route: ROUTES.EVENTS, label: 'Eventos', icon: '📅' },
  { route: ROUTES.PVP, label: 'PVP', icon: '🏆' }
]);

const VALID_ROUTES = new Set(Object.values(ROUTES));

/**
 * Enrutador en memoria con espejo en el hash de la URL.
 * @param {Object} [options]
 * @param {string} [options.initialRoute]
 * @param {Window} [options.win]
 */
export function createRouter({ initialRoute = ROUTES.HOME, win = window } = {}) {
  let current = isValidRoute(initialRoute) ? initialRoute : ROUTES.HOME;
  /** @type {string[]} Pila de retroceso dentro de la aplicación. */
  const stack = [];
  const listeners = new Set();
  /** @type {(() => boolean)[]} Interceptores del botón Atrás (modales, combate). */
  const backGuards = [];

  function isValidRoute(route) {
    return VALID_ROUTES.has(route);
  }

  function notify(previous) {
    for (const listener of listeners) listener(current, previous);
  }

  /**
   * Refleja la ruta en el hash. `push` crea una entrada de historial para que
   * el botón Atrás del teléfono retroceda dentro del juego en vez de salir.
   */
  function syncHash({ push = false } = {}) {
    if (!win?.location || !win?.history) return;
    const hash = `#/${current}`;
    if (win.location.hash === hash) return;
    if (push && typeof win.history.pushState === 'function') {
      win.history.pushState({ route: current }, '', hash);
    } else {
      win.history.replaceState({ route: current }, '', hash);
    }
  }

  return {
    get current() {
      return current;
    },

    get depth() {
      return stack.length;
    },

    isValidRoute,

    /** Navega a una ruta; `replace` evita apilar retroceso. */
    go(route, { replace = false } = {}) {
      if (!isValidRoute(route)) {
        console.warn(`Ruta desconocida: ${route}`);
        return false;
      }
      if (route === current) return false;

      const previous = current;
      if (!replace) stack.push(previous);
      current = route;
      syncHash({ push: !replace });
      notify(previous);
      return true;
    },

    /** Vuelve atrás. Devuelve false si ya no hay a dónde volver. */
    back() {
      for (let i = backGuards.length - 1; i >= 0; i -= 1) {
        if (backGuards[i]() === true) return true; // consumido (modal, combate…)
      }
      if (stack.length === 0) return false;

      const previous = current;
      current = stack.pop();
      syncHash();
      notify(previous);
      return true;
    },

    /** Registra un interceptor del botón Atrás. Devuelve la función de baja. */
    addBackGuard(guard) {
      backGuards.push(guard);
      return () => {
        const index = backGuards.indexOf(guard);
        if (index >= 0) backGuards.splice(index, 1);
      };
    },

    /** Suscribe un oyente a los cambios de ruta. Devuelve la función de baja. */
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    /** Vacía la pila de retroceso (por ejemplo al entrar al panel). */
    resetStack() {
      stack.length = 0;
    },

    /** Aplica la ruta escrita en el hash, si es válida. */
    readHash() {
      const raw = String(win?.location?.hash || '').replace(/^#\/?/, '');
      return isValidRoute(raw) ? raw : null;
    },

    syncHash
  };
}
