/**
 * Ring de Campeones — Coordinación general de la aplicación (Paso 2)
 *
 * Responsabilidad: montar el armazón (cabecera, pantalla, navegación),
 * conectar el enrutador y delegar los eventos táctiles. Todavía no hay
 * sistemas de juego: las pantallas son temporales y se completan más adelante.
 */

import { GAME_CONFIG } from './config/game-config.js';
import { el, clear, mount } from './ui/render.js';
import { createRouter, ROUTES, IMMERSIVE_ROUTES, NAV_TABS } from './ui/router.js';
import { renderResourceBar } from './ui/components/resource-bar.js';
import { renderBottomNav } from './ui/components/bottom-nav.js';
import { closeModal, confirmModal, isModalOpen } from './ui/components/modal.js';
import { showToast } from './ui/components/toast.js';
import { renderHomeScreen } from './ui/screens/home.js';
import { renderSettingsScreen } from './ui/screens/settings.js';
import { renderPlaceholderScreen } from './ui/screens/placeholder-screens.js';
import { applyPreferences, loadPreferences, savePreferences } from './platform/preferences.js';

export const APP_VERSION = '0.2.0';

/**
 * Construye la aplicación sobre un contenedor.
 * @param {HTMLElement} root Normalmente `#app`.
 * @param {Object} [options]
 * @param {Window} [options.win]
 * @param {Storage|null} [options.storage]
 * @returns {Promise<{start: () => Promise<void>, destroy: () => void, router: object}>}
 */
export async function createApp(root, { win = window, storage = safeStorage(win) } = {}) {
  if (!root) throw new Error('No se encontró el contenedor de la aplicación.');

  const router = createRouter({ win });
  let preferences = applyPreferences(loadPreferences(storage), win.document);

  /** Datos provisionales de cabecera hasta que exista el estado (Paso 3). */
  const session = {
    level: 1,
    gold: 0,
    gems: 0,
    materials: 0,
    hasSave: detectSave(storage),
    savedLevel: detectSavedLevel(storage)
  };

  const headerSlot = el('div', { attrs: { 'data-slot': 'header' } });
  const screenSlot = el('div', { attrs: { 'data-slot': 'screen' }, className: 'screen-slot' });
  const navSlot = el('div', { attrs: { 'data-slot': 'nav' } });
  const skipLink = el('a', { className: 'skip-link', text: 'Ir al contenido', attrs: { href: '#main-content' } });

  const disposers = [];

  function renderScreen(route) {
    switch (route) {
      case ROUTES.HOME:
        return renderHomeScreen({ hasSave: session.hasSave, savedLevel: session.savedLevel, version: APP_VERSION });
      case ROUTES.SETTINGS:
        return renderSettingsScreen({ preferences });
      default:
        return renderPlaceholderScreen(route);
    }
  }

  function render() {
    const route = router.current;
    const immersive = IMMERSIVE_ROUTES.includes(route);

    mount(screenSlot, renderScreen(route));

    if (immersive) {
      clear(headerSlot);
      clear(navSlot);
      screenSlot.classList.add('screen-slot--immersive');
    } else {
      screenSlot.classList.remove('screen-slot--immersive');
      mount(
        headerSlot,
        renderResourceBar({
          level: session.level,
          gold: session.gold,
          gems: session.gems,
          materials: session.materials,
          nextEventLabel: 'Próximo evento',
          nextEventTime: '--:--'
        })
      );
      const activeRoute = NAV_TABS.some((tab) => tab.route === route) ? route : null;
      mount(navSlot, renderBottomNav({ activeRoute }));
    }

    root.dataset.route = route;
  }

  /** Acciones disparadas por `data-action` en cualquier botón del armazón. */
  const actions = {
    navigate(target) {
      const route = target.dataset.route;
      if (route) router.go(route);
    },
    'open-settings'() {
      router.go(ROUTES.SETTINGS);
    },
    back() {
      if (!router.back()) router.go(ROUTES.DASHBOARD, { replace: true });
    },
    'continue-game'() {
      if (!session.hasSave) return;
      router.go(ROUTES.DASHBOARD, { replace: true });
      router.resetStack();
      showToast('Partida cargada. ¡Al ring!', { variant: 'success' });
    },
    async 'new-game'() {
      if (session.hasSave) {
        const confirmed = await confirmModal({
          title: 'Nueva partida',
          body: 'Ya existe una partida guardada. Crear una nueva la sustituirá. ¿Deseas continuar?',
          confirmLabel: 'Crear nueva',
          cancelLabel: 'Cancelar',
          variant: 'danger'
        });
        if (!confirmed) return;
      }
      router.go(ROUTES.DASHBOARD, { replace: true });
      router.resetStack();
      showToast('La elección de clase y el tutorial llegan en el Paso 4.');
    },
    'set-font-scale'(target) {
      preferences = applyPreferences(savePreferences({ ...preferences, fontScale: target.dataset.value }, storage), win.document);
      render();
      showToast('Tamaño de texto actualizado.', { variant: 'success' });
    },
    'set-quality'(target) {
      preferences = applyPreferences(savePreferences({ ...preferences, quality: target.dataset.value }, storage), win.document);
      render();
      showToast('Calidad visual actualizada.', { variant: 'success' });
    }
  };

  function onClick(event) {
    const target = event.target.closest('[data-action]');
    if (!target || !root.contains(target)) return;
    const handler = actions[target.dataset.action];
    if (!handler) return;
    event.preventDefault();
    Promise.resolve(handler(target)).catch(console.error);
  }

  function onPopState() {
    // 1) El botón Atrás cierra primero un modal y restaura la entrada del historial.
    if (isModalOpen()) {
      closeModal(null);
      router.syncHash({ push: true });
      return;
    }
    // 2) Si no hay modal, vuelve a la pantalla anterior de la aplicación.
    if (!router.back()) {
      // 3) Sin historial propio: la app se mantiene abierta en la portada.
      router.go(ROUTES.HOME, { replace: true });
    }
  }

  return {
    router,

    async start() {
      clear(root);
      root.append(skipLink, headerSlot, screenSlot, navSlot);

      // El botón Atrás cierra primero cualquier modal abierto.
      disposers.push(router.addBackGuard(() => (isModalOpen() ? closeModal(null) : false)));
      disposers.push(router.subscribe(() => render()));

      root.addEventListener('click', onClick);
      disposers.push(() => root.removeEventListener('click', onClick));

      win.addEventListener('popstate', onPopState);
      disposers.push(() => win.removeEventListener('popstate', onPopState));

      const hashRoute = router.readHash();
      if (hashRoute && hashRoute !== router.current) {
        router.go(hashRoute, { replace: true });
      } else {
        router.syncHash();
        render();
      }
    },

    destroy() {
      for (const dispose of disposers.splice(0)) dispose();
      clear(root);
    },

    /** Sólo para pruebas: datos provisionales de la cabecera. */
    _session: session
  };
}

function safeStorage(win) {
  try {
    return win?.localStorage ?? null;
  } catch {
    return null;
  }
}

function detectSave(storage) {
  try {
    return Boolean(storage?.getItem(GAME_CONFIG.STORAGE_KEYS.CURRENT_SAVE));
  } catch {
    return false;
  }
}

function detectSavedLevel(storage) {
  try {
    const raw = storage?.getItem(GAME_CONFIG.STORAGE_KEYS.CURRENT_SAVE);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    const level = Number(parsed?.hero?.level ?? parsed?.level ?? 0);
    return Number.isFinite(level) && level > 0 ? Math.floor(level) : 0;
  } catch {
    return 0;
  }
}
