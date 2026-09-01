/**
 * Ring de Campeones — Coordinación general de la aplicación (Paso 3)
 *
 * Monta el armazón, conecta el enrutador y usa el store central como única
 * fuente de verdad para progreso, recursos, ajustes y guardado seguro.
 */

import { createGameStore } from './state/store.js';
import { getInstallationId, getSavedGameSummary, loadGameState } from './state/persistence.js';
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

export const APP_VERSION = '0.3.0';

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
  const initialLoad = loadGameState({ storage });
  const store = createGameStore({ initialState: initialLoad.state, storage });
  let preferences = applyPreferences(loadPreferences(storage), win.document);
  let saveSummary = getSavedGameSummary(storage);

  // Crea o recupera el identificador local de instalación sin incluirlo en el estado.
  getInstallationId(storage);

  const headerSlot = el('div', { attrs: { 'data-slot': 'header' } });
  const screenSlot = el('div', { attrs: { 'data-slot': 'screen' }, className: 'screen-slot' });
  const navSlot = el('div', { attrs: { 'data-slot': 'nav' } });
  const skipLink = el('a', { className: 'skip-link', text: 'Ir al contenido', attrs: { href: '#main-content' } });

  const disposers = [];

  function renderScreen(route) {
    switch (route) {
      case ROUTES.HOME:
        return renderHomeScreen({ hasSave: saveSummary.hasSave, savedLevel: saveSummary.level, version: APP_VERSION });
      case ROUTES.SETTINGS:
        return renderSettingsScreen({ preferences });
      default:
        return renderPlaceholderScreen(route);
    }
  }

  function render() {
    const route = router.current;
    const immersive = IMMERSIVE_ROUTES.includes(route);
    const state = store.getState();

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
          level: state.progression.level,
          gold: state.resources.gold,
          gems: state.resources.gems,
          materials: state.resources.materials,
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
      const loaded = loadGameState({ storage });
      if (!loaded.hasSave) {
        saveSummary = getSavedGameSummary(storage);
        render();
        showToast('No se encontró una partida válida.', { variant: 'error' });
        return;
      }

      store.replaceState(loaded.state, { persist: false });
      syncPreferencesFromState(loaded.state);
      refreshSaveSummaryFromState(true);
      router.go(ROUTES.DASHBOARD, { replace: true });
      router.resetStack();
      showToast(loaded.recovered ? 'Partida recuperada desde el respaldo.' : 'Partida cargada. ¡Al ring!', {
        variant: 'success'
      });
    },
    async 'new-game'() {
      if (saveSummary.hasSave) {
        const confirmed = await confirmModal({
          title: 'Nueva partida',
          body: 'Ya existe una partida guardada. Crear una nueva la sustituirá. ¿Deseas continuar?',
          confirmLabel: 'Crear nueva',
          cancelLabel: 'Cancelar',
          variant: 'danger'
        });
        if (!confirmed) return;
      }

      store.dispatch({ type: 'game/new', settings: settingsFromPreferences(preferences) });
      refreshSaveSummaryFromState(true);
      router.go(ROUTES.DASHBOARD, { replace: true });
      router.resetStack();
      showToast('Nueva partida guardada. La elección de clase llega en el Paso 4.', { variant: 'success' });
    },
    'set-font-scale'(target) {
      preferences = applyPreferences(savePreferences({ ...preferences, fontScale: target.dataset.value }, storage), win.document);
      store.dispatch({
        type: 'settings/update',
        settings: { textSize: preferences.fontScale },
        persist: saveSummary.hasSave
      });
      if (saveSummary.hasSave) refreshSaveSummaryFromState(true);
      showToast('Tamaño de texto actualizado.', { variant: 'success' });
    },
    'set-quality'(target) {
      preferences = applyPreferences(savePreferences({ ...preferences, quality: target.dataset.value }, storage), win.document);
      store.dispatch({
        type: 'settings/update',
        settings: { quality: preferences.quality },
        persist: saveSummary.hasSave
      });
      if (saveSummary.hasSave) refreshSaveSummaryFromState(true);
      showToast('Calidad visual actualizada.', { variant: 'success' });
    }
  };

  function onClick(event) {
    const target = event.target.closest('[data-action]');
    if (!target || !root.contains(target)) return;
    const handler = actions[target.dataset.action];
    if (!handler) return;
    event.preventDefault();
    Promise.resolve(handler(target)).catch((error) => {
      console.error(error);
      showToast('No se pudo completar la acción.', { variant: 'error' });
    });
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

  function refreshSaveSummaryFromState(hasSave) {
    const state = store.getState();
    saveSummary = {
      hasSave,
      source: hasSave ? 'current' : 'none',
      level: hasSave ? state.progression.level : 0,
      heroName: hasSave ? state.profile.heroName : null,
      updatedAt: hasSave ? state.meta.lastSavedAt : null,
      schemaVersion: hasSave ? state.schemaVersion : null
    };
  }

  function syncPreferencesFromState(state) {
    preferences = applyPreferences(
      savePreferences({ fontScale: state.settings.textSize, quality: state.settings.quality }, storage),
      win.document
    );
  }

  return {
    router,
    store,

    async start() {
      clear(root);
      root.append(skipLink, headerSlot, screenSlot, navSlot);

      // El botón Atrás cierra primero cualquier modal abierto.
      disposers.push(router.addBackGuard(() => (isModalOpen() ? closeModal(null) : false)));
      disposers.push(router.subscribe(() => render()));
      disposers.push(store.subscribe(() => render()));

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
      store.destroy();
      clear(root);
    }
  };
}

function settingsFromPreferences(preferences) {
  return {
    textSize: preferences.fontScale,
    quality: preferences.quality
  };
}

function safeStorage(win) {
  try {
    return win?.localStorage ?? null;
  } catch {
    return null;
  }
}
