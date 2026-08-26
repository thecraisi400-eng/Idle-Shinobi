// Service worker de Idle Shinobi.
// Caché-first: una vez visitado el juego, se abre sin conexión a internet.
// Solo se registra cuando la página llega por http(s) — en file:// el navegador
// no lo permite, y ahí no hace falta porque los sprites ya van dentro del HTML.

importScripts('sw-manifest.js');

const CACHE_NAME = self.__PRECACHE_NAME__ || 'idle-shinobi-v1';
const PRECACHE_URLS = self.__PRECACHE_URLS__ || ['./', 'index.html', 'assets-embedded.js'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        cache.addAll(PRECACHE_URLS.map((url) => new Request(url, { cache: 'reload' })))
      )
      // Un fallo puntual (p. ej. un icono que falta) no debe tumbar la instalación.
      .catch((error) => console.warn('Precaché incompleta:', error))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response && response.ok && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          // Sin red y sin copia: para una navegación devolvemos la página ya cacheada.
          request.mode === 'navigate'
            ? caches.match('index.html').then((fallback) => fallback || Response.error())
            : Response.error()
        );
    })
  );
});
