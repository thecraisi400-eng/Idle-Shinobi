# Idle Shinobi — 100 % offline

Las imágenes cargan **sin conexión a internet** por dos vías:

1. **`index.html` autocontenido.** Los 10 sprites de `assets/sprites/` van
   *embebidos dentro del propio HTML* como `data:` URIs (≈166 KB). Por eso el
   juego funciona abriendo el archivo con doble clic (`file://`), sin servidor
   web y sin red: el administrador de sprites lee primero la copia embebida y
   solo usaría `fetch()` como respaldo si alguien eliminara los embebidos.
   Además ya no se carga Tailwind desde ningún CDN; todo el CSS vive en el HTML.

2. **Service worker (`sw.js`).** Cuando el juego se sirve por `http(s)`
   (p. ej. `npm start`), el SW pre-cachea `index.html`, los sprites, el
   manifiesto y los iconos en la primera visita; a partir de ahí la página se
   abre también sin internet y es instalable como PWA (`manifest.webmanifest`).
   En `file://` los navegadores no permiten SW, pero ahí no hace falta gracias
   al punto 1.

## Comandos

| Comando         | Qué hace                                                                 |
| --------------- | ------------------------------------------------------------------------ |
| `npm run build` | Regenera `index.html`, `assets-embedded.js` y `sw-manifest.js` desde `src/index.html` + `assets/sprites/` (`tools/build.py`). |
| `npm run icons` | Regenera `icons/icon-192.png` / `icon-512.png` (`tools/make-icons.py`).  |
| `npm test`      | Ejecuta `test/offline.test.js`: carga el `index.html` real con jsdom, verifica que las 10 hojas se decodifiquen desde los `data:` URIs con **0 peticiones de red**, que la ruta de respaldo por `fetch` funcione y que no quede ninguna URL remota (CDN). |
| `npm start`     | Sirve el juego en `http://0.0.0.0:8080` para probar el service worker.   |

## Edición

- La página editable es `src/index.html` (con los marcadores
  `<!--ASSETS_EMBEDDED-->` y `<!--SW_REGISTER-->`); el `index.html` de la raíz
  es el artefacto generado: **no lo edites a mano**.
- Para añadir o cambiar un sprite, deja el `.webp` en `assets/sprites/` y corre
  `npm run build`.

## Estructura

```
index.html            <- generado (autocontenido, offline por data: URIs)
assets-embedded.js    <- generado (misma copia embebida, para src/index.html)
sw.js / sw-manifest.js<- caché offline cuando se sirve por http(s)
manifest.webmanifest  <- PWA instalable
src/index.html        <- fuente editable del HTML
tools/                <- generadores (build.py, make-icons.py)
test/offline.test.js  <- prueba de la carga offline
assets/sprites/       <- las 10 hojas de sprites originales
```
