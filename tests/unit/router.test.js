import { describe, expect, it } from 'vitest';
import { createRouter, ROUTES, NAV_TABS, IMMERSIVE_ROUTES } from '../../js/ui/router.js';

/** Ventana simulada mínima para el enrutador. */
function fakeWindow(initialHash = '') {
  return {
    location: { hash: initialHash },
    history: {
      pushed: [],
      replaced: [],
      pushState(_state, _title, url) {
        this.pushed.push(url);
        this.lastUrl = url;
      },
      replaceState(_state, _title, url) {
        this.replaced.push(url);
        this.lastUrl = url;
      }
    }
  };
}

describe('router', () => {
  it('arranca en la portada', () => {
    const router = createRouter({ win: fakeWindow() });
    expect(router.current).toBe(ROUTES.HOME);
  });

  it('navega a una ruta válida y apila el retroceso', () => {
    const router = createRouter({ win: fakeWindow() });
    expect(router.go(ROUTES.DASHBOARD)).toBe(true);
    expect(router.current).toBe(ROUTES.DASHBOARD);
    expect(router.depth).toBe(1);
  });

  it('rechaza rutas desconocidas sin romperse', () => {
    const router = createRouter({ win: fakeWindow() });
    expect(router.go('no-existe')).toBe(false);
    expect(router.current).toBe(ROUTES.HOME);
  });

  it('con replace no apila retroceso', () => {
    const router = createRouter({ win: fakeWindow() });
    router.go(ROUTES.DASHBOARD, { replace: true });
    expect(router.depth).toBe(0);
    expect(router.back()).toBe(false);
  });

  it('vuelve a la pantalla anterior', () => {
    const router = createRouter({ win: fakeWindow() });
    router.go(ROUTES.DASHBOARD);
    router.go(ROUTES.SHOP);
    expect(router.back()).toBe(true);
    expect(router.current).toBe(ROUTES.DASHBOARD);
  });

  it('el interceptor consume el botón Atrás antes que la navegación', () => {
    const router = createRouter({ win: fakeWindow() });
    router.go(ROUTES.DASHBOARD);
    let consumed = 0;
    const off = router.addBackGuard(() => {
      consumed += 1;
      return true;
    });

    expect(router.back()).toBe(true);
    expect(consumed).toBe(1);
    expect(router.current).toBe(ROUTES.DASHBOARD);

    off();
    expect(router.back()).toBe(true);
    expect(router.current).toBe(ROUTES.HOME);
  });

  it('avisa a los suscriptores de cada cambio', () => {
    const router = createRouter({ win: fakeWindow() });
    const seen = [];
    router.subscribe((next, previous) => seen.push([previous, next]));
    router.go(ROUTES.HERO);
    expect(seen).toEqual([[ROUTES.HOME, ROUTES.HERO]]);
  });

  it('sincroniza el hash de la URL', () => {
    const win = fakeWindow();
    const router = createRouter({ win });
    router.go(ROUTES.PVP);
    expect(win.history.lastUrl).toBe('#/pvp');
  });

  it('apila historial al navegar y lo sustituye al reemplazar o volver', () => {
    const win = fakeWindow();
    const router = createRouter({ win });
    router.go(ROUTES.DASHBOARD);
    expect(win.history.pushed).toEqual(['#/dashboard']);

    router.go(ROUTES.SHOP, { replace: true });
    expect(win.history.pushed).toEqual(['#/dashboard']);
    expect(win.history.replaced.at(-1)).toBe('#/shop');
  });

  it('lee una ruta del hash y descarta las inválidas', () => {
    expect(createRouter({ win: fakeWindow('#/shop') }).readHash()).toBe(ROUTES.SHOP);
    expect(createRouter({ win: fakeWindow('#/pirata') }).readHash()).toBeNull();
  });

  it('define las seis secciones correctas y los modos inmersivos', () => {
    expect(NAV_TABS.map((tab) => tab.route)).toEqual([
      ROUTES.HERO,
      ROUTES.EQUIPMENT,
      ROUTES.SKILLS,
      ROUTES.EVENTS,
      ROUTES.PVP,
      ROUTES.SHOP
    ]);
    expect(new Set(NAV_TABS.map((tab) => tab.route)).size).toBe(6);
    expect(IMMERSIVE_ROUTES).toEqual(expect.arrayContaining([
      ROUTES.HOME,
      ROUTES.CLASS_SELECT,
      ROUTES.TUTORIAL,
      ROUTES.COMBAT,
      ROUTES.EVENT_PLAY,
      ROUTES.RESULT
    ]));
  });
});
