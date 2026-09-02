/* ===== SERVICE WORKER — Oro y Gloria (28.15 PWA offline) =====
   Estrategia:
     · Cachea todo el juego en la instalación (precaching completo).
     · Sirve desde caché primero: el juego abre sin internet, al instante.
     · Actualiza en segundo plano y avisa al jugador (Sugerencia #2 del Paso 15).
   Cambiar VERSION en cada despliegue: eso invalida la caché anterior. */

const VERSION = 'og-v1.0.0';
const CACHE = `oro-y-gloria-${VERSION}`;

const ARCHIVOS = [
  './',
  './index.html',
  './manifest.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/maskable-512.png',
  './assets/icons/favicon-64.png',
  './js/core/dom.js',
  './js/core/events-bus.js',
  './js/core/format.js',
  './js/core/hud.js',
  './js/core/migrations.js',
  './js/core/rng.js',
  './js/core/router.js',
  './js/core/state.js',
  './js/data/arbol.js',
  './js/data/clases.js',
  './js/data/constants.js',
  './js/data/divisiones.js',
  './js/data/equipo.js',
  './js/data/especiales.js',
  './js/data/estados.js',
  './js/data/eventos.js',
  './js/data/ligas.js',
  './js/data/logros.js',
  './js/data/misiones.js',
  './js/data/nombres.js',
  './js/data/pasivas.js',
  './js/data/rangos.js',
  './js/data/stats.js',
  './js/data/tienda.js',
  './js/main.js',
  './js/render/fighter-sprite.js',
  './js/render/fx.js',
  './js/render/ring.js',
  './js/screens/arbol.js',
  './js/screens/arena.js',
  './js/screens/coliseo.js',
  './js/screens/equipo.js',
  './js/screens/especiales.js',
  './js/screens/eventos.js',
  './js/screens/heroe.js',
  './js/screens/panel.js',
  './js/screens/perfil.js',
  './js/screens/seleccion.js',
  './js/screens/splash.js',
  './js/screens/tienda.js',
  './js/systems/achievements.js',
  './js/systems/combat/ai.js',
  './js/systems/combat/damage.js',
  './js/systems/combat/engine.js',
  './js/systems/combat/fatigue.js',
  './js/systems/combat/log.js',
  './js/systems/combat/status.js',
  './js/systems/consumables.js',
  './js/systems/difficulty.js',
  './js/systems/encuesta.js',
  './js/systems/event-runner.js',
  './js/systems/event-scheduler.js',
  './js/systems/export-md.js',
  './js/systems/fighter.js',
  './js/systems/forge.js',
  './js/systems/inventory.js',
  './js/systems/leaderboard.js',
  './js/systems/loot.js',
  './js/systems/perf.js',
  './js/systems/power.js',
  './js/systems/pvp/bracket.js',
  './js/systems/pvp/ghosts.js',
  './js/systems/pvp/prizepool.js',
  './js/systems/quests.js',
  './js/systems/rival-gen.js',
  './js/systems/save.js',
  './js/systems/shop.js',
  './js/systems/skilltree.js',
  './js/systems/tutorial.js',
  './js/systems/upgrades.js',
  './js/systems/xp.js',
  './styles/arbol.css',
  './styles/arena.css',
  './styles/coliseo.css',
  './styles/components.css',
  './styles/equipo.css',
  './styles/eventos.css',
  './styles/heroe.css',
  './styles/layout.css',
  './styles/perfil.css',
  './styles/reset.css',
  './styles/seleccion.css',
  './styles/tienda.css',
  './styles/tutorial.css',
  './styles/variables.css',
];

/* ---------- Instalación: se guarda todo el juego ---------- */
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // addAll falla entero si un archivo falla; se añaden de uno en uno
    // para que un asset opcional ausente no rompa la instalación.
    await Promise.all(ARCHIVOS.map(async (url) => {
      try { await cache.add(new Request(url, { cache: 'reload' })); }
      catch (err) { console.warn('[sw] no se pudo cachear', url); }
    }));
  })());
  // No saltamos de inmediato: esperamos a que el jugador acepte la actualización.
});

/* ---------- Activación: se borran las cachés viejas ---------- */
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const claves = await caches.keys();
    await Promise.all(claves
      .filter(k => k.startsWith('oro-y-gloria-') && k !== CACHE)
      .map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

/* ---------- Fetch: caché primero, red como respaldo ---------- */
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;   // nada externo

  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const guardado = await cache.match(req, { ignoreSearch: true });
    if (guardado) {
      // refresco silencioso en segundo plano
      e.waitUntil((async () => {
        try {
          const fresco = await fetch(req);
          if (fresco && fresco.ok) await cache.put(req, fresco.clone());
        } catch (_) { /* sin red: da igual, ya servimos la copia */ }
      })());
      return guardado;
    }

    try {
      const red = await fetch(req);
      if (red && red.ok) cache.put(req, red.clone());
      return red;
    } catch (_) {
      // navegación sin red y sin copia exacta: se devuelve el index
      if (req.mode === 'navigate') {
        const idx = await cache.match('./index.html');
        if (idx) return idx;
      }
      return new Response('Sin conexión y sin copia guardada.', {
        status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  })());
});

/* ---------- Mensajes de la página ---------- */
self.addEventListener('message', (e) => {
  if (e.data === 'ACTUALIZAR_YA') self.skipWaiting();   // Sugerencia #2
  if (e.data === 'VERSION') {
    e.source?.postMessage({ tipo: 'version', version: VERSION });
  }
});
