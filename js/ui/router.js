/**
 * Ring de Campeones — Enrutador en memoria con espejo en el hash.
 *
 * Flujo del Paso 4:
 * PORTADA → CLASE → TUTORIAL → PANEL → secciones → PRECOMBATE → COMBATE → RESULTADO.
 */

export const ROUTES = Object.freeze({
  HOME: 'home',
  CLASS_SELECT: 'class-select',
  TUTORIAL: 'tutorial',
  DASHBOARD: 'dashboard',
  HERO: 'hero',
  EQUIPMENT: 'equipment',
  SKILLS: 'skills',
  EVENTS: 'events',
  EVENT_PLAY: 'event-play',
  PVP: 'pvp',
  SHOP: 'shop',
  MISSIONS: 'missions',
  ACHIEVEMENTS: 'achievements',
  INBOX: 'inbox',
  SETTINGS: 'settings',
  PRECOMBAT: 'precombat',
  COMBAT: 'combat',
  RESULT: 'result'
});

/** Rutas que ocupan toda la pantalla sin cabecera ni navegación inferior. */
export const IMMERSIVE_ROUTES = Object.freeze([
  ROUTES.HOME,
  ROUTES.CLASS_SELECT,
  ROUTES.TUTORIAL,
  ROUTES.SETTINGS,
  ROUTES.PRECOMBAT,
  ROUTES.COMBAT,
  ROUTES.EVENT_PLAY,
  ROUTES.RESULT
]);

/** Las seis secciones pedidas; el panel se abre tocando el nivel de la cabecera. */
export const NAV_TABS = Object.freeze([
  { route: ROUTES.HERO, label: 'Héroe', icon: '🥊' },
  { route: ROUTES.EQUIPMENT, label: 'Equipo', icon: '🛡️' },
  { route: ROUTES.SKILLS, label: 'Habilidad', icon: '✨' },
  { route: ROUTES.EVENTS, label: 'Eventos', icon: '📅' },
  { route: ROUTES.PVP, label: 'PVP', icon: '🏆' },
  { route: ROUTES.SHOP, label: 'Tienda', icon: '🛒' }
]);

export const ACTIVE_MODE_ROUTES = Object.freeze([ROUTES.COMBAT, ROUTES.EVENT_PLAY]);
export const ONBOARDING_ROUTES = Object.freeze([ROUTES.CLASS_SELECT, ROUTES.TUTORIAL]);

const VALID_ROUTES = new Set(Object.values(ROUTES));

export function createRouter({ initialRoute = ROUTES.HOME, win = window } = {}) {
  let current = isValidRoute(initialRoute) ? initialRoute : ROUTES.HOME;
  const stack = [];
  const listeners = new Set();
  const backGuards = [];

  function isValidRoute(route) {
    return VALID_ROUTES.has(route);
  }

  function notify(previous) {
    for (const listener of listeners) listener(current, previous);
  }

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
    back() {
      for (let i = backGuards.length - 1; i >= 0; i -= 1) {
        if (backGuards[i]() === true) return true;
      }
      if (stack.length === 0) return false;

      const previous = current;
      current = stack.pop();
      syncHash();
      notify(previous);
      return true;
    },
    addBackGuard(guard) {
      backGuards.push(guard);
      return () => {
        const index = backGuards.indexOf(guard);
        if (index >= 0) backGuards.splice(index, 1);
      };
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    resetStack() {
      stack.length = 0;
    },
    readHash() {
      const raw = String(win?.location?.hash || '').replace(/^#\/?/, '');
      return isValidRoute(raw) ? raw : null;
    },
    syncHash
  };
}
