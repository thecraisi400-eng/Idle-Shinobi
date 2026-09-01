import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../js/app.js';
import { NAV_TABS, ROUTES } from '../../js/ui/router.js';

function setupDom() {
  document.body.replaceChildren();
  const app = document.createElement('div');
  app.id = 'app';
  app.className = 'app-shell';
  const modalRoot = document.createElement('div');
  modalRoot.id = 'modal-root';
  const toastRoot = document.createElement('div');
  toastRoot.id = 'toast-root';
  document.body.append(app, modalRoot, toastRoot);
  return app;
}

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key)
  };
}

async function boot(storage = memoryStorage()) {
  const root = setupDom();
  const app = await createApp(root, { win: window, storage });
  await app.start();
  return { root, app, storage };
}

async function completeOnboarding(root, classId = 'balanced') {
  root.querySelector('[data-testid="btn-new-game"]').click();
  await Promise.resolve();
  root.querySelector(`[data-testid="class-${classId}"]`).click();
  root.querySelector('[data-testid="btn-confirm-class"]').click();
  await Promise.resolve();
  for (let index = 0; index < 3; index += 1) {
    root.querySelector('[data-testid="tutorial-next"]').click();
  }
  root.querySelector('[data-testid="tutorial-finish"]').click();
  await Promise.resolve();
}

describe('interfaz y navegación del Paso 4', () => {
  beforeEach(() => {
    window.location.hash = '';
  });

  it('arranca en la portada sin cabecera ni navegación', async () => {
    const { root } = await boot();
    expect(root.querySelector('[data-testid="screen-home"]')).not.toBeNull();
    expect(root.querySelector('[data-testid="resource-bar"]')).toBeNull();
    expect(root.querySelector('[data-testid="bottom-nav"]')).toBeNull();
  });

  it('deshabilita Continuar cuando no hay partida guardada', async () => {
    const { root } = await boot();
    expect(root.querySelector('[data-testid="btn-continue"]').disabled).toBe(true);
  });

  it('habilita Continuar y muestra el nivel guardado', async () => {
    const storage = memoryStorage({
      'ringDeCampeones.save.current': JSON.stringify({ hero: { level: 12 } })
    });
    const { root } = await boot(storage);
    expect(root.querySelector('[data-testid="btn-continue"]').disabled).toBe(false);
    expect(root.querySelector('[data-testid="home-save-info"]').textContent).toContain('12');
  });

  it('crea partida, elige clase, completa tutorial y entra al panel', async () => {
    const { root, app } = await boot();
    root.querySelector('[data-testid="btn-new-game"]').click();
    await Promise.resolve();
    expect(app.router.current).toBe(ROUTES.CLASS_SELECT);
    expect(root.querySelectorAll('.class-option')).toHaveLength(4);

    root.querySelector('[data-testid="class-technical"]').click();
    root.querySelector('[data-testid="btn-confirm-class"]').click();
    await Promise.resolve();
    expect(app.router.current).toBe(ROUTES.TUTORIAL);
    expect(app.store.getState().profile.classId).toBe('technical');

    for (let index = 0; index < 3; index += 1) root.querySelector('[data-testid="tutorial-next"]').click();
    root.querySelector('[data-testid="tutorial-finish"]').click();
    await Promise.resolve();

    expect(app.router.current).toBe(ROUTES.DASHBOARD);
    expect(app.store.getState().profile.tutorialDone).toBe(true);
    expect(root.querySelector('[data-testid="resource-bar"]')).not.toBeNull();
    expect(root.querySelectorAll('.nav-tab')).toHaveLength(6);
  });

  it('recorre las seis pestañas, incluida Tienda, y marca la activa', async () => {
    const { root, app } = await boot();
    await completeOnboarding(root);

    expect(NAV_TABS.map((tab) => tab.route)).toEqual(['hero', 'equipment', 'skills', 'events', 'pvp', 'shop']);
    for (const tab of NAV_TABS) {
      root.querySelector(`[data-testid="nav-${tab.route}"]`).click();
      expect(app.router.current).toBe(tab.route);
      expect(root.querySelector(`[data-testid="screen-${tab.route}"]`)).not.toBeNull();
      expect(root.querySelector(`[data-testid="nav-${tab.route}"]`).getAttribute('aria-current')).toBe('page');
    }
  });

  it('abre los accesos secundarios desde el panel', async () => {
    const { root, app } = await boot();
    await completeOnboarding(root);

    for (const route of ['missions', 'achievements', 'inbox']) {
      root.querySelector(`[data-testid="quick-${route}"]`).click();
      expect(app.router.current).toBe(route);
      expect(root.querySelector(`[data-testid="screen-${route}"]`)).not.toBeNull();
      root.querySelector('[data-action="go-dashboard"]').click();
    }
  });

  it('abre ajustes y aplica la escala de texto elegida', async () => {
    const storage = memoryStorage();
    const { root } = await boot(storage);
    root.querySelector('[data-testid="btn-home-settings"]').click();
    await Promise.resolve();

    expect(root.querySelector('[data-testid="screen-settings"]')).not.toBeNull();
    root.querySelector('[data-testid="font-scale-large"]').click();
    await Promise.resolve();

    expect(document.documentElement.dataset.fontScale).toBe('large');
    expect(JSON.parse(storage.getItem('ringDeCampeones.preferences')).fontScale).toBe('large');
  });

  it('el botón Volver de Ajustes regresa a la pantalla anterior', async () => {
    const { root, app } = await boot();
    await completeOnboarding(root);
    root.querySelector('[data-testid="btn-settings"]').click();
    await Promise.resolve();
    expect(app.router.current).toBe(ROUTES.SETTINGS);

    root.querySelector('[data-testid="btn-back"]').click();
    await Promise.resolve();
    expect(app.router.current).toBe(ROUTES.DASHBOARD);
  });

  it('recorre precombate, combate y resultado sin aplicar recompensas', async () => {
    const { root, app } = await boot();
    await completeOnboarding(root);
    const resourcesBefore = app.store.getState().resources;

    root.querySelector('[data-testid="btn-fight"]').click();
    expect(app.router.current).toBe(ROUTES.PRECOMBAT);
    root.querySelector('[data-testid="btn-start-combat"]').click();
    expect(app.router.current).toBe(ROUTES.COMBAT);
    expect(root.querySelector('[data-testid="resource-bar"]')).toBeNull();
    root.querySelector('[data-testid="btn-resolve-combat"]').click();
    expect(app.router.current).toBe(ROUTES.RESULT);
    root.querySelector('[data-testid="btn-result-dashboard"]').click();

    expect(app.router.current).toBe(ROUTES.DASHBOARD);
    expect(app.store.getState().resources).toEqual(resourcesBefore);
  });

  it('todos los botones declaran tipo y una etiqueta', async () => {
    const { root } = await boot();
    root.querySelector('[data-testid="btn-new-game"]').click();
    await Promise.resolve();

    for (const btn of root.querySelectorAll('button')) {
      const label = (btn.getAttribute('aria-label') || btn.textContent || '').trim();
      expect(label.length).toBeGreaterThan(0);
      expect(btn.getAttribute('type')).toBe('button');
    }
  });

  it('destroy limpia el contenedor y los temporizadores', async () => {
    const { root, app } = await boot();
    app.destroy();
    expect(root.childElementCount).toBe(0);
  });
});
