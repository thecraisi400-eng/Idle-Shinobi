# Paso 4 — Interfaz completa y navegación sin scroll

Estado: **implementado en código; validación E2E pendiente del navegador de Playwright**.

## Alcance implementado

- Flujo `Portada → Elección de clase → Tutorial → Panel` con reanudación de partidas incompletas.
- Cuatro clases jugables y clase permanente guardada de forma atómica.
- Tutorial paginado y estado de finalización persistente.
- Panel con héroe, EXP exacta, cinco stats, evento activo, rival, comparación y premios.
- Seis secciones inferiores: Héroe, Equipo, Habilidad, Eventos, PVP y Tienda.
- El indicador de nivel de la cabecera funciona como acceso de regreso al Panel.
- Pantallas paginadas de Héroe, Equipo, Habilidades, Eventos, PVP y Tienda.
- Accesos secundarios para Misiones, Logros y Buzón.
- Flujo visual de Precombate, Combate y Resultado.
- Ejecución visual inmersiva de eventos con tutorial de primera entrada por sesión.
- Ajustes paginados de imagen, audio, accesibilidad y respaldo.
- Confirmaciones para Gemas, PVP, reseteo de habilidades y abandono de modos activos.
- Venta visual con ventana de deshacer de cinco segundos.
- Estados informativos, vacíos y de error reutilizables.
- Conteos regresivos con ciclo de vida y limpieza al cambiar de pantalla.

## Límite intencional del paso

Las pantallas usan catálogos simulados definidos en `js/ui/mock-data.js`. Las acciones de
mejorar, equipar, comprar, reclamar, combatir y competir validan navegación, modales y
feedback, pero no modifican progreso ni recursos. Sus sistemas reales corresponden a los
pasos posteriores.

Sólo se persisten las decisiones necesarias para poder iniciar correctamente una partida:

- clase seleccionada;
- tutorial completado;
- preferencias que ya pertenecían al estado y al sistema de ajustes.

## Arquitectura de interfaz

```text
js/ui/components/ui-kit.js            Progreso, segmentos, paginación y estados
js/ui/mock-data.js                    Catálogos visuales simulados
js/ui/view-lifecycle.js               Limpieza de temporizadores de la vista
js/ui/screens/onboarding.js           Clase y tutorial
js/ui/screens/dashboard.js            Panel
js/ui/screens/progression-screens.js  Héroe, Equipo y Habilidad
js/ui/screens/activity-screens.js     Eventos, PVP y Tienda
js/ui/screens/secondary-screens.js    Misiones, Logros y Buzón
js/ui/screens/combat-screens.js       Precombate, Combate, Evento y Resultado
```

## Comprobaciones

```bash
npm test       # 61 pruebas unitarias y de integración
npm run lint   # ESLint
npm run build  # compilación de producción
npm run test:e2e
```

Las tres primeras comprobaciones pasan. `npm run test:e2e` contiene la matriz
`320×568`, `360×640`, `390×844` y `412×915`, incluyendo texto grande, objetivos de
48 px, controles dentro del viewport, teclado, modales y cero scroll. En este entorno no
se pudo descargar Chromium desde `cdn.playwright.dev` por un error de red `ECONNRESET`;
por eso la ejecución visual automatizada queda pendiente.
