# Checklist de Calidad y Criterios de Aceptación — Ring de Campeones

Este documento reúne las condiciones de aceptación obligatorias que deben cumplirse para cada paso del proyecto.

---

## Matriz de Calidad por Pasos

- [x] **Paso 1 — Cerrar reglas, contradicciones y arquitectura:**
  - Todas las contradicciones resueltas y documentadas en `docs/reglas.md`.
  - Fórmulas matemáticas completas en `docs/balance.md`.
  - Modelo de guardado validado en `docs/modelo-guardado.md`.
  - Constantes inmutables inicializadas en `js/config/game-config.js` y `js/config/classes.js`.

- [ ] **Paso 2 — Proyecto base, HTML, CSS, JavaScript y PWA:**
  - `package.json`, Vite, Vitest y Playwright configurados.
  - `index.html` con meta tags de viewport y PWA.
  - `styles.css` con `100dvh`, cero scroll y soporte para 320px a 540px.
  - `service-worker.js` funcional y cacheando assets.

- [ ] **Paso 3 — Estado, configuración y guardado seguro:**
  - `initial-state.js`, `store.js`, `actions.js`, `selectors.js` y `migrations.js`.
  - Pruebas unitarias de guardado, recuperación de backup y prevención de saldo negativo.

- [ ] **Paso 4 — Interfaz completa y navegación sin scroll:**
  - Portada, Tutorial y las 6 pantallas (`HÉROE`, `EQUIPO`, `HABILIDAD`, `EVENTOS`, `PVP`, `TIENDA`).
  - Navegación inferior con badges, modales accesibles y cero scroll verificado.

- [ ] **Paso 5 — Progreso, economía, equipo y habilidades:**
  - Nivel 1 a 200, 7 slots de equipo, 6 rarezas, mejoras +0 a +15, 12 sets, 40+ habilidades pasivas.
  - Venta con 25% y ventana de deshacer de 5s, bloqueo con candado de ítems.

- [ ] **Paso 6 — Motor y pantalla de combate:**
  - Motor determinista en ticks de 50 ms.
  - Remate al <=20% de HP (×1.5), cuenta 1-2-3 y KO.
  - Campaña con jefes cada 5 combates. Más de 10.000 simulaciones sin errores.

- [ ] **Paso 7 — Los siete eventos diarios:**
  - Calendario de 7 bloques de 3h a partir de las 06:00 local.
  - Ranking de rivales fantasma deterministas y premios por buzón.

- [ ] **Paso 8 — PVP local y torneos de 32:**
  - Salas Bronce, Plata y Oro. Retención 20%, reparto top 7 (50/25/10/6/4/3/2).
  - Bracket de 32 participantes y apuestas entre rondas.

- [ ] **Paso 9 — Tienda, misiones, logros, audio y ajustes:**
  - Tienda diaria/semanal, 7 misiones diarias, 5 semanales, 100+ logros.
  - Audio sintetizado y Web Audio API con fallback seguro, vibración háptica.

- [ ] **Paso 10 — Pruebas finales, offline y verificación:**
  - 100% de tests unitarios, de integración y E2E pasando.
  - Cero errores en consola.
