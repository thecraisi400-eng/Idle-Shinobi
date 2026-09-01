/**
 * Ring de Campeones — Coordinación general de la aplicación (Paso 4).
 *
 * Mantiene separado el estado persistente del juego y el estado efímero de la
 * interfaz (páginas, pestañas y demostraciones visuales).
 */

import { createGameStore } from './state/store.js';
import { getInstallationId, getSavedGameSummary, loadGameState } from './state/persistence.js';
import { el, clear, mount } from './ui/render.js';
import { ACTIVE_MODE_ROUTES, createRouter, IMMERSIVE_ROUTES, NAV_TABS, ROUTES } from './ui/router.js';
import { renderResourceBar } from './ui/components/resource-bar.js';
import { renderBottomNav } from './ui/components/bottom-nav.js';
import { closeModal, confirmModal, isModalOpen, openModal } from './ui/components/modal.js';
import { showToast } from './ui/components/toast.js';
import { renderHomeScreen } from './ui/screens/home.js';
import { renderSettingsScreen } from './ui/screens/settings.js';
import { renderClassSelectionScreen, renderTutorialScreen, TUTORIAL_PAGES } from './ui/screens/onboarding.js';
import { renderDashboardScreen } from './ui/screens/dashboard.js';
import { renderEquipmentScreen, renderHeroScreen, renderSkillsScreen } from './ui/screens/progression-screens.js';
import { renderEventsScreen, renderPvpScreen, renderShopScreen } from './ui/screens/activity-screens.js';
import { renderAchievementsScreen, renderInboxScreen, renderMissionsScreen } from './ui/screens/secondary-screens.js';
import { renderCombatScreen, renderEventPlayScreen, renderPrecombatScreen, renderResultScreen } from './ui/screens/combat-screens.js';
import { activateView } from './ui/view-lifecycle.js';
import { EVENTS_DEMO, findDemoItem, SHOP_ITEMS_DEMO, SKILL_BRANCHES_DEMO, UI_BADGES_DEMO } from './ui/mock-data.js';
import { applyPreferences, loadPreferences, savePreferences } from './platform/preferences.js';

export const APP_VERSION = '0.4.0';

export async function createApp(root, { win = window, storage = safeStorage(win) } = {}) {
  if (!root) throw new Error('No se encontró el contenedor de la aplicación.');

  const router = createRouter({ win });
  const initialLoad = loadGameState({ storage });
  const store = createGameStore({ initialState: initialLoad.state, storage });
  let preferences = applyPreferences(loadPreferences(storage), win.document);
  let saveSummary = getSavedGameSummary(storage);
  let disposeView = () => {};
  let undoTimer = null;

  const ui = createUiState();
  getInstallationId(storage);
  applyAccessibilityState(store.getState(), win.document);

  const headerSlot = el('div', { attrs: { 'data-slot': 'header' } });
  const screenSlot = el('div', { attrs: { 'data-slot': 'screen' }, className: 'screen-slot' });
  const navSlot = el('div', { attrs: { 'data-slot': 'nav' } });
  const skipLink = el('a', { className: 'skip-link', text: 'Ir al contenido', attrs: { href: '#main-content' } });
  const disposers = [];

  function renderScreen(route, state) {
    switch (route) {
      case ROUTES.HOME:
        return renderHomeScreen({ hasSave: saveSummary.hasSave, savedLevel: saveSummary.level, version: APP_VERSION });
      case ROUTES.CLASS_SELECT:
        return renderClassSelectionScreen({ selectedClassId: ui.selectedClassId });
      case ROUTES.TUTORIAL:
        return renderTutorialScreen({ page: ui.tutorialPage, classId: state.profile.classId });
      case ROUTES.DASHBOARD:
        return renderDashboardScreen({ state });
      case ROUTES.HERO:
        return renderHeroScreen({ state, tab: ui.heroTab, statsPage: ui.heroStatsPage, upgradeQuantity: ui.statUpgradeQuantity });
      case ROUTES.EQUIPMENT:
        return renderEquipmentScreen({
          tab: ui.equipmentTab,
          inventoryPage: ui.inventoryPage,
          soldItemIds: ui.soldItemIds,
          undoSale: ui.undoSale
        });
      case ROUTES.SKILLS:
        return renderSkillsScreen({ state, branchId: ui.skillBranch, page: ui.skillPage });
      case ROUTES.EVENTS:
        return renderEventsScreen({ tab: ui.eventsTab, dayPage: ui.eventsDayPage });
      case ROUTES.EVENT_PLAY:
        return renderEventPlayScreen({ state, eventId: ui.activeEventId });
      case ROUTES.PVP:
        return renderPvpScreen({ tab: ui.pvpTab, roomPage: ui.pvpRoomPage });
      case ROUTES.SHOP:
        return renderShopScreen({ category: ui.shopCategory, page: ui.shopPage });
      case ROUTES.MISSIONS:
        return renderMissionsScreen({ tab: ui.missionsTab, page: ui.missionsPage });
      case ROUTES.ACHIEVEMENTS:
        return renderAchievementsScreen({ page: ui.achievementsPage });
      case ROUTES.INBOX:
        return renderInboxScreen({ page: ui.inboxPage });
      case ROUTES.SETTINGS:
        return renderSettingsScreen({
          preferences,
          settings: state.settings,
          tab: ui.settingsTab,
          hasGame: saveSummary.hasSave
        });
      case ROUTES.PRECOMBAT:
        return renderPrecombatScreen({ state });
      case ROUTES.COMBAT:
        return renderCombatScreen({ state });
      case ROUTES.RESULT:
        return renderResultScreen({ state, kind: ui.resultKind });
      default:
        return renderHomeScreen({ hasSave: saveSummary.hasSave, savedLevel: saveSummary.level, version: APP_VERSION });
    }
  }

  function render() {
    disposeView();
    disposeView = () => {};

    const route = router.current;
    const state = store.getState();
    const immersive = IMMERSIVE_ROUTES.includes(route);
    mount(screenSlot, renderScreen(route, state));

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
          nextEventTime: 10800
        })
      );
      const activeRoute = NAV_TABS.some((tab) => tab.route === route) ? route : null;
      mount(navSlot, renderBottomNav({ activeRoute, badges: UI_BADGES_DEMO }));
    }

    root.dataset.route = route;
    disposeView = activateView(root, { win });
  }

  function navigateTo(route) {
    if (!router.isValidRoute(route)) return;
    const fromPrimaryTab = NAV_TABS.some((tab) => tab.route === router.current);
    const toPrimaryTab = NAV_TABS.some((tab) => tab.route === route);
    router.go(route, { replace: fromPrimaryTab && toPrimaryTab });
  }

  function goDashboard() {
    router.go(ROUTES.DASHBOARD, { replace: true });
    router.resetStack();
  }

  async function requestLeaveActiveMode() {
    const route = router.current;
    if (!ACTIVE_MODE_ROUTES.includes(route)) return false;
    const confirmed = await confirmModal({
      title: route === ROUTES.COMBAT ? '¿Abandonar combate?' : '¿Abandonar evento?',
      body: 'El intento activo terminará y no recibirás premios. ¿Deseas salir?',
      confirmLabel: 'Abandonar',
      cancelLabel: 'Continuar',
      variant: 'danger'
    });
    if (confirmed) {
      if (route === ROUTES.EVENT_PLAY) router.go(ROUTES.EVENTS, { replace: true });
      else goDashboard();
    }
    return confirmed;
  }

  const actions = {
    navigate(target) {
      if (target.dataset.route) navigateTo(target.dataset.route);
    },
    'go-dashboard'() {
      goDashboard();
    },
    'open-settings'() {
      router.go(ROUTES.SETTINGS);
    },
    back() {
      if (!router.back()) router.go(saveSummary.hasSave ? resolveResumeRoute(store.getState()) : ROUTES.HOME, { replace: true });
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
      router.go(resolveResumeRoute(loaded.state), { replace: true });
      router.resetStack();
      showToast(loaded.recovered ? 'Partida recuperada desde el respaldo.' : 'Partida cargada.', { variant: 'success' });
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
      resetUiState(ui);
      refreshSaveSummaryFromState(true);
      router.go(ROUTES.CLASS_SELECT, { replace: true });
      router.resetStack();
    },
    'select-class'(target) {
      ui.selectedClassId = target.dataset.classId || null;
      render();
    },
    'confirm-class'() {
      if (!ui.selectedClassId) return;
      store.dispatch({ type: 'profile/selectClass', classId: ui.selectedClassId });
      refreshSaveSummaryFromState(true);
      ui.tutorialPage = 0;
      router.go(ROUTES.TUTORIAL, { replace: true });
    },
    'tutorial-next'() {
      ui.tutorialPage = Math.min(TUTORIAL_PAGES.length - 1, ui.tutorialPage + 1);
      render();
    },
    'tutorial-previous'() {
      ui.tutorialPage = Math.max(0, ui.tutorialPage - 1);
      render();
    },
    async 'skip-tutorial'() {
      const confirmed = await confirmModal({
        title: 'Saltar entrenamiento',
        body: 'Puedes consultar estas instrucciones más adelante desde Ajustes. ¿Entrar al panel ahora?',
        confirmLabel: 'Saltar',
        cancelLabel: 'Continuar tutorial'
      });
      if (confirmed) finishTutorial();
    },
    'finish-tutorial'() {
      finishTutorial();
    },
    'ui-tab'(target) {
      const group = target.dataset.group;
      if (!Object.hasOwn(ui, group)) return;
      ui[group] = target.dataset.value;
      resetPageForGroup(group);
      render();
    },
    'ui-page'(target) {
      const group = target.dataset.group;
      if (!Object.hasOwn(ui, group)) return;
      ui[group] = Math.max(0, Number(ui[group] || 0) + Number(target.dataset.delta || 0));
      render();
    },
    'stat-quantity'(target) {
      ui.statUpgradeQuantity = Math.min(10, Math.max(1, ui.statUpgradeQuantity + Number(target.dataset.delta || 0)));
      render();
    },
    async 'confirm-stat-upgrade'(target) {
      const names = { health: 'Vida', attack: 'Ataque', defense: 'Defensa', speed: 'Velocidad', criticalChance: 'Crítico', luck: 'Suerte', dodge: 'Esquiva', accuracy: 'Precisión', criticalResistance: 'Resistencia crítica', criticalNullify: 'Anulación crítica' };
      const name = names[target.dataset.statId] || 'estadística';
      const total = 75 * ui.statUpgradeQuantity;
      const confirmed = await confirmModal({
        title: `Mejorar ${name}`,
        body: `Comprar ${ui.statUpgradeQuantity} mejora(s) costará un total de ${total} Oro. Esta es una demostración de interfaz.`,
        confirmLabel: 'Confirmar demo',
        cancelLabel: 'Cancelar'
      });
      if (confirmed) showToast('Vista de mejora validada; no se gastó Oro.', { variant: 'success' });
    },
    'show-item-detail'(target) {
      showItemDetail(target.dataset.itemId);
    },
    'show-shop-item'(target) {
      showItemDetail(target.dataset.itemId);
    },
    'show-empty-slot'(target) {
      showToast(`El hueco ${target.dataset.slotId || ''} está vacío.`, { variant: 'info' });
    },
    'demo-equip'() {
      showToast('Comparación validada; el equipo real se conectará después.', { variant: 'success' });
    },
    'demo-sell'(target) {
      startDemoSale(target.dataset.itemId);
    },
    'undo-sale'() {
      if (!ui.undoSale) return;
      ui.soldItemIds.delete(ui.undoSale.id);
      ui.undoSale = null;
      clearUndoTimer();
      render();
      showToast('Venta deshecha.', { variant: 'success' });
    },
    'demo-learn-skill'() {
      showToast('Nodo disponible; no se gastaron puntos en la demostración.', { variant: 'success' });
    },
    async 'reset-skills'() {
      const confirmed = await confirmModal({
        title: 'Resetear habilidades',
        body: 'Recuperarás todos los puntos invertidos a cambio de 20 Gemas. No se aplicará ningún cambio en esta demostración.',
        confirmLabel: 'Confirmar demo',
        cancelLabel: 'Cancelar'
      });
      if (confirmed) showToast('Confirmación de reseteo validada.', { variant: 'success' });
    },
    'show-event-detail'(target) {
      const event = EVENTS_DEMO.find((entry) => entry.id === target.dataset.eventId);
      if (event) openModal({ title: event.name, body: `${event.description} Estado: ${event.status}. Horario: ${event.time}.` });
    },
    async 'open-event'(target) {
      const eventId = target.dataset.eventId || 'lightning';
      if (!ui.seenEventTutorials.has(eventId)) {
        await openModal({
          title: 'Cómo jugar este evento',
          body: 'Encadena victorias antes de que termine el tiempo. La vida se conserva entre rondas y el mejor resultado queda en el historial.',
          actions: [{ label: 'Entendido', value: true, variant: 'primary', autofocus: true }]
        });
        ui.seenEventTutorials.add(eventId);
      }
      ui.activeEventId = eventId;
      router.go(ROUTES.EVENT_PLAY);
    },
    async 'enter-pvp-room'(target) {
      const confirmed = await confirmModal({
        title: 'Entrar al torneo',
        body: 'La entrada se consume al confirmar y se pierde al quedar eliminado. El torneo tiene 32 participantes y premios para el Top 7.',
        confirmLabel: 'Entrar a la demo',
        cancelLabel: 'Cancelar'
      });
      if (confirmed) {
        ui.pvpTab = 'bracket';
        render();
        showToast(`Sala ${target.dataset.roomId || ''} preparada.`, { variant: 'success' });
      }
    },
    async 'buy-demo-item'(target) {
      const item = SHOP_ITEMS_DEMO.find((entry) => entry.id === target.dataset.itemId);
      if (!item) return;
      if (item.currency === 'gems') {
        const confirmed = await confirmModal({
          title: 'Compra con Gemas',
          body: `${item.name} cuesta ${item.price} Gemas. Las compras premium siempre requieren confirmación.`,
          confirmLabel: 'Confirmar demo',
          cancelLabel: 'Cancelar'
        });
        if (!confirmed) return;
      }
      showToast('Compra visual validada; no se consumieron recursos.', { variant: 'success' });
    },
    'claim-demo-reward'() {
      showToast('Recompensa preparada; no se modificó la partida.', { variant: 'success' });
    },
    'claim-demo-message'() {
      showToast('Mensaje reclamable validado.', { variant: 'success' });
    },
    'claim-all-demo'() {
      showToast('Se reclamarían 2 mensajes; el objeto sin espacio se conserva.', { variant: 'success' });
    },
    'open-precombat'() {
      router.go(ROUTES.PRECOMBAT);
    },
    'start-demo-combat'() {
      router.go(ROUTES.COMBAT, { replace: true });
    },
    'resolve-demo-combat'() {
      ui.resultKind = 'combat';
      router.go(ROUTES.RESULT, { replace: true });
    },
    'complete-demo-event'() {
      ui.resultKind = 'event';
      router.go(ROUTES.RESULT, { replace: true });
    },
    'leave-active-mode'() {
      requestLeaveActiveMode();
    },
    'set-font-scale'(target) {
      preferences = applyPreferences(savePreferences({ ...preferences, fontScale: target.dataset.value }, storage), win.document);
      store.dispatch({ type: 'settings/update', settings: { textSize: preferences.fontScale }, persist: saveSummary.hasSave });
      if (saveSummary.hasSave) refreshSaveSummaryFromState(true);
      showToast('Tamaño de texto actualizado.', { variant: 'success' });
    },
    'set-quality'(target) {
      preferences = applyPreferences(savePreferences({ ...preferences, quality: target.dataset.value }, storage), win.document);
      store.dispatch({ type: 'settings/update', settings: { quality: preferences.quality }, persist: saveSummary.hasSave });
      if (saveSummary.hasSave) refreshSaveSummaryFromState(true);
      showToast('Calidad visual actualizada.', { variant: 'success' });
    },
    'set-volume'(target) {
      const setting = target.dataset.setting;
      if (!['musicVolume', 'effectsVolume'].includes(setting)) return;
      store.dispatch({ type: 'settings/update', settings: { [setting]: Number(target.dataset.value) }, persist: saveSummary.hasSave });
      if (saveSummary.hasSave) refreshSaveSummaryFromState(true);
      showToast('Volumen actualizado.', { variant: 'success' });
    },
    'toggle-setting'(target) {
      const setting = target.dataset.setting;
      if (!['reducedMotion', 'vibration'].includes(setting)) return;
      store.dispatch({ type: 'settings/update', settings: { [setting]: target.dataset.value === 'true' }, persist: saveSummary.hasSave });
      applyAccessibilityState(store.getState(), win.document);
      if (saveSummary.hasSave) refreshSaveSummaryFromState(true);
      showToast('Preferencia actualizada.', { variant: 'success' });
    },
    'demo-backup'(target) {
      const action = target.dataset.backupAction === 'export' ? 'Exportar' : 'Importar';
      openModal({ title: `${action} respaldo`, body: `La pantalla de ${action.toLowerCase()} está lista. La operación de archivos se conectará en el paso correspondiente.` });
    }
  };

  function finishTutorial() {
    store.dispatch({ type: 'profile/completeTutorial' });
    refreshSaveSummaryFromState(true);
    goDashboard();
    showToast('¡Entrenamiento completado! Bienvenido al ring.', { variant: 'success' });
  }

  function resetPageForGroup(group) {
    const map = {
      skillBranch: 'skillPage',
      shopCategory: 'shopPage',
      missionsTab: 'missionsPage'
    };
    if (map[group]) ui[map[group]] = 0;
  }

  function showItemDetail(itemId) {
    const item = findDemoItem(itemId);
    if (!item) return;
    const body = el('div', {
      className: 'detail-summary',
      children: [
        el('span', { className: 'detail-summary__icon', text: item.icon, attrs: { 'aria-hidden': 'true' } }),
        el('p', { text: item.stat || item.stats || 'Sin estadísticas adicionales.' }),
        el('p', { text: `Rareza: ${item.rarity}. ${item.power ? `Poder: ${item.power}.` : ''}` }),
        el('p', { className: 'comparison-label comparison-label--good', text: '▲ Mejora estimada frente al objeto actual' })
      ]
    });
    openModal({ title: item.name, body });
  }

  function startDemoSale(itemId) {
    const item = findDemoItem(itemId);
    if (!item || ui.soldItemIds.has(item.id)) return;
    ui.soldItemIds.add(item.id);
    ui.undoSale = { id: item.id, name: item.name };
    clearUndoTimer();
    undoTimer = win.setTimeout(() => {
      undoTimer = null;
      ui.undoSale = null;
      if (router.current === ROUTES.EQUIPMENT) render();
      showToast('Venta de demostración finalizada.', { variant: 'info' });
    }, 5000);
    render();
  }

  function clearUndoTimer() {
    if (undoTimer !== null) win.clearTimeout(undoTimer);
    undoTimer = null;
  }

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
    const previous = router.current;
    if (!router.back()) {
      router.go(saveSummary.hasSave ? ROUTES.DASHBOARD : ROUTES.HOME, { replace: true });
      return;
    }
    if (router.current === previous) router.syncHash({ push: true });
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
    applyAccessibilityState(state, win.document);
  }

  return {
    router,
    store,
    async start() {
      clear(root);
      root.append(skipLink, headerSlot, screenSlot, navSlot);

      disposers.push(
        router.addBackGuard(() => {
          if (isModalOpen()) return closeModal(null);
          if (ACTIVE_MODE_ROUTES.includes(router.current)) {
            requestLeaveActiveMode();
            return true;
          }
          return false;
        })
      );
      disposers.push(router.subscribe(() => render()));
      disposers.push(store.subscribe(() => render()));

      root.addEventListener('click', onClick);
      disposers.push(() => root.removeEventListener('click', onClick));
      win.addEventListener('popstate', onPopState);
      disposers.push(() => win.removeEventListener('popstate', onPopState));

      const requestedRoute = router.readHash();
      const initialRoute = guardInitialRoute(requestedRoute, saveSummary.hasSave, store.getState());
      if (initialRoute !== router.current) router.go(initialRoute, { replace: true });
      else {
        router.syncHash();
        render();
      }
    },
    destroy() {
      disposeView();
      clearUndoTimer();
      closeModal(null);
      for (const dispose of disposers.splice(0)) dispose();
      store.destroy();
      clear(root);
    }
  };
}

function createUiState() {
  return {
    selectedClassId: null,
    tutorialPage: 0,
    heroTab: 'overview',
    heroStatsPage: 0,
    statUpgradeQuantity: 1,
    equipmentTab: 'equipped',
    inventoryPage: 0,
    soldItemIds: new Set(),
    undoSale: null,
    skillBranch: SKILL_BRANCHES_DEMO[0].id,
    skillPage: 0,
    eventsTab: 'current',
    eventsDayPage: 0,
    activeEventId: 'lightning',
    seenEventTutorials: new Set(),
    pvpTab: 'rooms',
    pvpRoomPage: 0,
    shopCategory: 'equipment',
    shopPage: 0,
    missionsTab: 'daily',
    missionsPage: 0,
    achievementsPage: 0,
    inboxPage: 0,
    settingsTab: 'visual',
    resultKind: 'combat'
  };
}

function resetUiState(ui) {
  Object.assign(ui, createUiState());
}

function resolveResumeRoute(state) {
  if (!state.profile.classId) return ROUTES.CLASS_SELECT;
  if (!state.profile.tutorialDone) return ROUTES.TUTORIAL;
  return ROUTES.DASHBOARD;
}

function guardInitialRoute(requestedRoute, hasSave, state) {
  if (!requestedRoute || requestedRoute === ROUTES.HOME || requestedRoute === ROUTES.SETTINGS) {
    return requestedRoute || ROUTES.HOME;
  }
  if (!hasSave) return ROUTES.HOME;
  const resumeRoute = resolveResumeRoute(state);
  if (resumeRoute !== ROUTES.DASHBOARD) return resumeRoute;
  if (requestedRoute === ROUTES.CLASS_SELECT || requestedRoute === ROUTES.TUTORIAL) return ROUTES.DASHBOARD;
  return requestedRoute;
}

function applyAccessibilityState(state, document) {
  if (!document?.documentElement) return;
  document.documentElement.dataset.reducedMotion = state.settings.reducedMotion ? 'true' : 'false';
}

function settingsFromPreferences(preferences) {
  return { textSize: preferences.fontScale, quality: preferences.quality };
}

function safeStorage(win) {
  try {
    return win?.localStorage ?? null;
  } catch {
    return null;
  }
}
