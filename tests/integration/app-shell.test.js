import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../js/app.js';
import { NAV_TABS, ROUTES } from '../../js/ui/router.js';

/** Prepara el DOM mínimo de index.html. */
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
  return { root, app };
}

describe('armazón de la aplicación', () => {
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

  it('entra al panel con Nueva partida y muestra cabecera y navegación', async () => {
    const { root, app } = await boot();
    root.querySelector('[data-testid="btn-new-game"]').click();
    await Promise.resolve();

    expect(app.router.current).toBe(ROUTES.DASHBOARD);
    expect(root.querySelector('[data-testid="screen-dashboard"]')).not.toBeNull();
    expect(root.querySelector('[data-testid="resource-bar"]')).not.toBeNull();
    expect(root.querySelectorAll('.nav-tab')).toHaveLength(6);
  });

  it('recorre las seis pestañas y marca la activa', async () => {
    const { root, app } = await boot();
    root.querySelector('[data-testid="btn-new-game"]').click();
    await Promise.resolve();

    for (const tab of NAV_TABS) {
      root.querySelector(`[data-testid="nav-${tab.route}"]`).click();
      expect(app.router.current).toBe(tab.route);
      expect(root.querySelector(`[data-testid="screen-${tab.route}"]`)).not.toBeNull();
      expect(root.querySelector(`[data-testid="nav-${tab.route}"]`).getAttribute('aria-current')).toBe('page');
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

  it('el botón Volver regresa a la pantalla anterior', async () => {
    const { root, app } = await boot();
    root.querySelector('[data-testid="btn-new-game"]').click();
    await Promise.resolve();
    root.querySelector('[data-testid="btn-settings"]').click();
    await Promise.resolve();
    expect(app.router.current).toBe(ROUTES.SETTINGS);

    root.querySelector('[data-testid="btn-back"]').click();
    await Promise.resolve();
    expect(app.router.current).toBe(ROUTES.DASHBOARD);
  });

  it('todos los botones declaran un objetivo táctil y una etiqueta', async () => {
    const { root } = await boot();
    root.querySelector('[data-testid="btn-new-game"]').click();
    await Promise.resolve();

    for (const btn of root.querySelectorAll('button')) {
      const label = (btn.getAttribute('aria-label') || btn.textContent || '').trim();
      expect(label.length).toBeGreaterThan(0);
      expect(btn.getAttribute('type')).toBe('button');
    }
  });

  it('destroy limpia el contenedor', async () => {
    const { root, app } = await boot();
    app.destroy();
    expect(root.childElementCount).toBe(0);
  });
});
