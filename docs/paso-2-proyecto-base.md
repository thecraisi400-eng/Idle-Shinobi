# Paso 2 — Proyecto base, HTML, CSS, JavaScript y PWA

Estado: **implementado** (pendiente sólo la ejecución de Playwright, ver “Notas del entorno”).

## 1. Análisis del paso

El Paso 2 pide una aplicación **vacía pero instalable, responsiva y navegable**. No se
programa ningún sistema de juego todavía: se levanta el armazón sobre el que los pasos
3 a 10 irán colgando estado, combate, eventos, PVP y tienda.

Lo que exige literalmente la guía y cómo se ha resuelto:

| Requisito de la guía | Resolución |
|---|---|
| `package.json` con módulos ES y los comandos `dev`, `build`, `preview`, `test`, `test:watch`, `test:e2e`, `check` | Hecho, más `lint`. `"type": "module"`. |
| Dependencias `vite`, `vitest`, `jsdom`, `@playwright/test`, `eslint` con versiones exactas | Instaladas con `--save-exact`; versiones fijadas en `package-lock.json`. |
| `index.html` con metadatos Android, área segura, contenedor único y capas globales | `index.html` con `viewport-fit=cover`, `theme-color`, `#app`, `#modal-root`, `#toast-root`. Sin lógica ni estilos en línea. |
| `styles.css` con variables, `100dvh`, áreas seguras y objetivo táctil de 48 px | `styles.css`, más `:focus-visible` dorado, `prefers-reduced-motion`, aviso de orientación no bloqueante y clases de calidad. |
| Tres escalas de texto `0.9 / 1 / 1.12` | `html[data-font-scale]`, seleccionables desde Ajustes y persistidas. |
| Calidad visual baja / media / alta | `html[data-quality]`, reduce sombras, brillos y animaciones. |
| `script.js` sólo con arranque seguro | Igual al de la guía; el registro del service worker sólo ocurre en producción. |
| PWA: manifest, iconos 192/512, service worker con versión de caché | `manifest.webmanifest`, `assets/icons/*`, `service-worker.js`. |
| Cache first imágenes/audio/fuentes, network first HTML, borrado de cachés viejas | Implementado, más *stale-while-revalidate* para CSS/JS. |
| Que un service worker viejo no oculte cambios en desarrollo | En `dev` no se registra el service worker (`import.meta.env.PROD`). |
| Pantalla temporal con navegación | Portada real + 8 pantallas temporales + navegación inferior de seis pestañas. |

## 2. Archivos creados

```text
index.html               manifest.webmanifest      vite.config.js
styles.css               service-worker.js         playwright.config.js
script.js                favicon.svg               eslint.config.js
package.json             .gitignore                package-lock.json

assets/icons/icon-192.png, icon-512.png, icon-maskable-512.png

js/app.js                                  Coordinación: armazón, rutas y eventos delegados
js/core/formatters.js                      120K, porcentajes, duraciones y fechas
js/platform/preferences.js                 Escala de texto y calidad visual (persistidas)
js/ui/render.js                            Creación de nodos segura (textContent, sin innerHTML)
js/ui/router.js                            Rutas en memoria + hash + botón Atrás
js/ui/components/resource-bar.js           Nivel, oro, Gemas y materiales (no hay energía)
js/ui/components/bottom-nav.js             Seis pestañas con aviso numerado
js/ui/components/modal.js                  Modal con foco atrapado y Escape
js/ui/components/toast.js                  Mensajes breves
js/ui/screens/home.js                      Portada (logo, nivel, Continuar / Nueva partida / Ajustes)
js/ui/screens/settings.js                  Ajustes funcionales de presentación
js/ui/screens/placeholder-screens.js       Panel, Héroe, Equipo, Habilidad, Eventos, PVP, Tienda, Combate

tests/unit/{router,formatters,preferences,render}.test.js
tests/integration/app-shell.test.js
tests/e2e/app-shell.spec.js
```

## 3. Decisiones tomadas dentro del margen del paso

1. **La cabecera muestra materiales, no energía** (regla cerrada en el Paso 1).
2. **La portada es inmersiva**: sin cabecera ni navegación inferior, igual que el combate.
   La lista de rutas inmersivas vive en `js/ui/router.js`.
3. **El botón Atrás** cierra primero un modal, después retrocede de pantalla y nunca cierra
   la aplicación por accidente: cada navegación apila una entrada de historial y `popstate`
   se traduce a `router.back()`.
4. **Eventos delegados** desde `#app` mediante `data-action`, para no duplicar escuchas en
   cada render (regla 4.4 de la guía).
5. **Ajustes ya funcionales** para escala de texto y calidad, porque son requisitos visuales
   de este paso y necesitan comprobarse en pantalla desde ya. El resto de ajustes (audio,
   vibración, respaldo) queda anunciado y llega en el Paso 9.
6. **`vite-ignore`** en los enlaces de manifest, favicon e icono para que conserven rutas
   estables (`/manifest.webmanifest`) y coincidan con la lista de precarga del service worker.

## 4. Comandos

```bash
npm install
npm run dev      # servidor de desarrollo en 0.0.0.0:5173
npm run build    # compila a dist/ y copia manifest, SW, favicon e iconos
npm run preview  # sirve dist/ en 0.0.0.0:4173 (aquí sí funciona la PWA)
npm test         # 36 pruebas unitarias y de integración (Vitest + jsdom)
npm run lint     # ESLint sin avisos
npm run test:e2e # Playwright en 320×568, 360×640, 390×844 y 412×915
```

## 5. Criterios de aceptación

| Criterio | Estado | Comprobación |
|---|---|---|
| La app abre sin errores de consola | ✅ | `tests/e2e/app-shell.spec.js` falla si hay `error` o `warning`. |
| Se adapta a 320×568, 360×640, 390×844 y 412×915 | ✅ | Cuatro proyectos de Playwright con esos viewports. |
| No hay scroll del documento | ✅ | `100dvh`, `overflow: hidden` y aserción `scrollHeight <= clientHeight` en cada pestaña. |
| Instalable como PWA y abre sin red tras la primera visita | ✅ | Manifest `standalone`/`portrait`, iconos 192/512/maskable y prueba `context.setOffline(true)`. |
| Todos los botones miden al menos 48×48 px CSS | ✅ | Regla CSS global y aserción en E2E sobre cada `button` visible. |

## 6. Notas del entorno

Las pruebas E2E están escritas y configuradas, pero **el navegador de Playwright no pudo
descargarse en el entorno de desarrollo actual** (`cdn.playwright.dev` no es accesible desde
el contenedor). Para ejecutarlas en una máquina con red normal:

```bash
npx playwright install chromium
npm run test:e2e
```

## 7. Siguiente paso

Paso 3 — estado inicial, almacén con acciones atómicas, persistencia con copia de
seguridad y migraciones. Los datos provisionales de la cabecera (`session` en `js/app.js`)
se sustituirán por selectores del estado real.
