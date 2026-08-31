# Guía completa de implementación en 10 pasos — Ring de Campeones

**Documento base:** `ring-de-campeones-plan-completo.md`  
**Objetivo:** construir desde cero un juego HTML5 vertical, instalable en Android, jugable sin conexión y con progreso local.  
**Tecnologías:** HTML5, CSS3, JavaScript moderno (ES Modules), PWA, Vitest y Playwright.  
**Idioma del juego:** español.

---

## 0. Qué se va a construir y qué significa “sin errores”

El resultado será una **aplicación web progresiva (PWA)**. Se podrá abrir en un navegador Android y también instalar desde el navegador como si fuera una aplicación. La primera versión no necesitará servidor ni cuentas: el progreso, los rivales “fantasma”, los rankings simulados y los torneos se ejecutarán en el dispositivo.

Ningún proyecto de software puede prometer literalmente que nunca tendrá un error en todos los teléfonos posibles. Lo que sí se puede exigir es una salida controlada mediante:

- validación de todos los datos;
- motor de combate determinista y cubierto por pruebas;
- guardado con copia de seguridad y migraciones;
- pruebas unitarias, de integración y de interfaz;
- prueba en varios tamaños de pantalla;
- ausencia de errores y advertencias en consola;
- criterios de aceptación obligatorios al terminar cada paso.

No se pasará al siguiente paso si los criterios del actual fallan. Al finalizar el paso 10, todos los comandos de calidad deberán terminar correctamente.

### Alcance técnico de esta versión

Incluye:

- portada, creación inicial del héroe y tutorial;
- panel principal y seis pestañas;
- héroe, estadísticas, equipo, inventario y habilidades;
- combate automático, campaña, jefes y progreso;
- siete eventos diarios;
- PVP local contra rivales fantasma y torneos de 32;
- tienda, materiales, consumibles, misiones y logros;
- ajustes, audio, vibración, exportación/importación y reinicio;
- funcionamiento sin conexión después de la primera carga.

No incluye un multijugador real ni rankings globales compartidos. Eso exigiría API, base de datos, autenticación, moderación y medidas contra trampas. El plan solicita rivales fantasma, por lo que la implementación local es suficiente y coherente.

---

# Paso 1 — Cerrar reglas, contradicciones y arquitectura

## Objetivo

Convertir las 350 respuestas del plan en reglas que una computadora pueda aplicar sin ambigüedades. Este paso evita que dos apartados incompatibles produzcan comportamientos distintos.

## Decisiones definitivas ante contradicciones

| Tema | Respuestas en conflicto | Decisión implementable |
|---|---|---|
| Portada | Logo con luchador / el luchador no aparece | La portada muestra logo, nivel y botones; no muestra luchador. El héroe aparece en el panel. |
| Energía | Mostrar energía / sistema sin energía / recarga | No existe energía ni se limita la cantidad de combates. El tercer indicador superior será **materiales**. Se eliminan compra y recarga de energía. |
| Robo de vida | Se enumera como secundaria / después se indica que no existe | No habrá robo de vida. Las secundarias serán suerte, esquiva, precisión, resistencia crítica y anulación crítica. |
| Quinta clase | Se piden 5 clases / el jugador elige entre 4 | Pesado, Técnico, Ágil y Equilibrado son jugables. **Leyenda** queda reservada a jefes y rivales especiales. |
| Remates | Hay remate / no hay barra / después vuelve a existir | Sí hay remate automático, pero no tiene barra ni estadística independiente. Se activa cuando el rival queda al 20% de vida o menos, una vez por lucha, y causa ×1,5. |
| Cofres | Se usan cofres premium / después “no habrá cofres” | No habrá cofres ni recompensas aleatorias ocultas. Las Gemas compran directamente equipo premium visible. Los materiales vienen de luchas, eventos y tienda. |
| Equipo de combate | Solo se consigue en tienda / habilidad aumenta el drop | El equipo solo se compra. La antigua pasiva de drop aumenta un 1% la obtención de **materiales**, no de equipo. |
| Rachas | No hay rachas / hay bonus de racha / calendario | No hay rachas de combate ni de misiones. Sí hay calendario de siete entradas, que no aumenta indefinidamente y vuelve al día 1. |
| PVP | Ecosistema con ligas / no existe rango ni ligas | Hay torneos, bracket, bolsa y campeones recientes, pero no liga, temporada ni rango persistente. |
| Versiones | Versiones ligera y completa / juego cerrado | Se publica una sola PWA con calidad visual configurable: baja, media y alta. |
| Sin scroll | Mucha información en pantallas pequeñas | El documento completo no desplaza la página. Cada pantalla usa tarjetas paginadas, pestañas y modales; nunca se depende de scroll vertical para jugar. |

Estas decisiones deben copiarse como comentarios de negocio en `docs/reglas.md` y representarse en `js/config/game-config.js`. Si en el futuro se cambia una regla, primero se cambia la documentación, luego la configuración, las pruebas y finalmente la interfaz.

## Arquitectura elegida

Se utilizará una arquitectura por capas:

1. **Datos/configuración:** catálogos, fórmulas y textos que no modifican el DOM.
2. **Dominio:** combate, economía, progreso, eventos y PVP; funciones puras siempre que sea posible.
3. **Estado:** almacén central, acciones, guardado y migraciones.
4. **Interfaz:** vistas, componentes, modal y navegación.
5. **Plataforma:** audio, vibración, reloj, almacenamiento, importación/exportación y PWA.

La interfaz nunca deberá editar el estado directamente. Deberá ejecutar una acción, por ejemplo `buyItem(id)` o `startFight(enemyId)`. La acción valida la operación, genera un nuevo estado y solicita guardarlo.

## Estructura final de archivos

```text
Idle-Shinobi/
├── index.html                    # Único documento HTML y contenedor de la aplicación
├── styles.css                    # Estilos globales, diseño vertical y accesibilidad
├── script.js                     # Arranque de la aplicación
├── manifest.webmanifest          # Instalación PWA
├── service-worker.js             # Caché y funcionamiento sin conexión
├── favicon.svg
├── package.json                  # Comandos de desarrollo, pruebas y calidad
├── vite.config.js
├── playwright.config.js
├── assets/
│   ├── icons/                    # Iconos 192 y 512 para la PWA
│   ├── images/                   # Logo, héroe, rivales, rings y objetos optimizados
│   └── audio/                    # Música y efectos en ogg/mp3
├── js/
│   ├── app.js                    # Coordinación general
│   ├── config/
│   │   ├── game-config.js        # Balance y constantes
│   │   ├── classes.js            # Clases y ventajas
│   │   ├── enemies.js            # Plantillas de enemigos
│   │   ├── equipment.js          # Catálogo y rarezas
│   │   ├── skills.js             # Árbol de 40+ habilidades
│   │   ├── events.js             # Definición de siete eventos
│   │   ├── missions.js           # Plantillas diarias y semanales
│   │   └── achievements.js       # 100+ logros
│   ├── core/
│   │   ├── rng.js                # Aleatoriedad reproducible con semilla
│   │   ├── formulas.js           # EXP, poder, daño, precios y escalado
│   │   ├── validators.js         # Validación y límites
│   │   └── formatters.js         # 120K, fechas, porcentajes
│   ├── state/
│   │   ├── initial-state.js
│   │   ├── store.js
│   │   ├── actions.js
│   │   ├── selectors.js
│   │   └── migrations.js
│   ├── systems/
│   │   ├── combat.js
│   │   ├── campaign.js
│   │   ├── progression.js
│   │   ├── economy.js
│   │   ├── inventory.js
│   │   ├── skill-tree.js
│   │   ├── event-schedule.js
│   │   ├── event-engine.js
│   │   ├── pvp.js
│   │   ├── shop.js
│   │   ├── missions.js
│   │   └── achievements.js
│   ├── platform/
│   │   ├── storage.js
│   │   ├── clock.js
│   │   ├── audio.js
│   │   ├── vibration.js
│   │   └── file-transfer.js
│   └── ui/
│       ├── router.js
│       ├── render.js
│       ├── events.js
│       ├── components/
│       │   ├── resource-bar.js
│       │   ├── bottom-nav.js
│       │   ├── modal.js
│       │   ├── toast.js
│       │   ├── pagination.js
│       │   └── stat-bar.js
│       └── screens/
│           ├── home.js
│           ├── dashboard.js
│           ├── hero.js
│           ├── equipment.js
│           ├── skills.js
│           ├── events.js
│           ├── combat.js
│           ├── pvp.js
│           ├── shop.js
│           ├── missions.js
│           └── settings.js
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── docs/
    ├── reglas.md
    ├── balance.md
    ├── modelo-guardado.md
    └── checklist-publicacion.md
```

## Entregables del paso

- `docs/reglas.md` con las decisiones anteriores.
- `docs/balance.md` con todas las constantes ajustables.
- Árbol de archivos acordado.
- Lista de funcionalidades “incluidas” y “no incluidas”.

## Criterio de aceptación

No queda ninguna regla contradictoria sin una decisión explícita y toda regla variable tiene un único lugar de configuración.

---

# Paso 2 — Crear el proyecto base, HTML, CSS, JavaScript y PWA

## Objetivo

Obtener una aplicación vacía pero instalable, responsiva y navegable sobre la que construir los sistemas.

## 2.1. Inicialización

Crear `package.json` con módulos ES y estos comandos:

```json
{
  "type": "module",
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "vite build",
    "preview": "vite preview --host 0.0.0.0",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "check": "npm run test && npm run build && npm run test:e2e"
  }
}
```

Dependencias de desarrollo: `vite`, `vitest`, `jsdom`, `@playwright/test` y `eslint`. Se fijarán versiones exactas en el archivo de bloqueo generado por npm.

## 2.2. `index.html`

Debe contener metadatos para Android, área segura, un contenedor único y plantillas de elementos globales:

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#0b0b0d">
  <meta name="description" content="Ring de Campeones, juego de lucha libre y progreso">
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/styles.css">
  <title>Ring de Campeones</title>
</head>
<body>
  <noscript>Este juego necesita JavaScript para funcionar.</noscript>
  <div id="app" class="app-shell" aria-live="polite"></div>
  <div id="modal-root"></div>
  <div id="toast-root" aria-live="assertive"></div>
  <script type="module" src="/script.js"></script>
</body>
</html>
```

No se colocará lógica del juego ni estilos en línea.

## 2.3. `styles.css`

La aplicación ocupará exactamente el área visible. Se usarán unidades dinámicas y áreas seguras:

```css
:root {
  --bg: #08090c;
  --surface: #16171d;
  --surface-2: #22242c;
  --gold: #d6a928;
  --gold-light: #ffe28a;
  --danger: #e64b4b;
  --success: #39c977;
  --text: #f8f4e7;
  --muted: #b9b5aa;
  --font-scale: 1;
  --tap-size: 48px;
}

* { box-sizing: border-box; }
html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; }
body {
  color: var(--text);
  background: radial-gradient(circle at top, #29200d 0, var(--bg) 42%);
  font: calc(16px * var(--font-scale))/1.25 system-ui, sans-serif;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
.app-shell {
  width: min(100%, 540px);
  height: 100dvh;
  margin: 0 auto;
  padding: env(safe-area-inset-top) env(safe-area-inset-right)
           env(safe-area-inset-bottom) env(safe-area-inset-left);
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  overflow: hidden;
}
button, [role="button"] { min-width: var(--tap-size); min-height: var(--tap-size); }
.screen { min-height: 0; overflow: hidden; }
```

Habrá tres escalas de texto: `0.9`, `1` y `1.12`. Antes de aceptar la escala grande, las pruebas visuales deben confirmar que los controles no se cortan. Las listas largas se dividen en páginas de 4–6 elementos, según altura disponible.

Añadir:

- `:focus-visible` claramente dorado;
- `@media (prefers-reduced-motion: reduce)` para desactivar movimientos;
- contraste mínimo WCAG AA;
- orientación vertical prioritaria, con mensaje no bloqueante en horizontal;
- clases de calidad baja/media/alta que reduzcan sombras y partículas.

## 2.4. `script.js`

Solo realiza el arranque seguro:

```js
import { createApp } from './js/app.js';

window.addEventListener('DOMContentLoaded', async () => {
  try {
    const app = await createApp(document.querySelector('#app'));
    await app.start();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(console.warn);
    }
  } catch (error) {
    console.error(error);
    document.querySelector('#app').textContent =
      'No se pudo iniciar el juego. Recarga la página o restaura tu respaldo.';
  }
});
```

## 2.5. PWA

`manifest.webmanifest` incluirá nombre, nombre corto, modo `standalone`, orientación `portrait`, colores e iconos de 192 y 512 píxeles. El service worker usará una versión de caché, guardará únicamente archivos estáticos y aplicará:

- **cache first** para imágenes, audio y fuentes;
- **network first con fallback** para HTML;
- borrado de cachés anteriores al activar una versión.

Durante desarrollo no se debe permitir que un service worker antiguo oculte cambios; Vite lo sirve sin depender del caché de producción.

## Entregables del paso

`index.html`, `styles.css`, `script.js`, `manifest.webmanifest`, `service-worker.js`, iconos, configuración de Vite y una pantalla temporal con navegación.

## Criterio de aceptación

- La app abre sin errores de consola.
- Se adapta a 320×568, 360×640, 390×844 y 412×915.
- No hay scroll del documento.
- Se puede instalar como PWA y abrir sin red después de una primera visita.
- Todos los botones tienen al menos 48×48 CSS píxeles.

---

# Paso 3 — Diseñar el estado, configuración y guardado seguro

## Objetivo

Crear una única fuente de verdad para que progreso, compras, premios y configuración no se contradigan ni se pierdan.

## 3.1. Estado inicial

`js/state/initial-state.js` expondrá una función, no un objeto reutilizado:

```js
export function createInitialState(now = Date.now()) {
  return {
    schemaVersion: 1,
    profile: {
      createdAt: now,
      heroName: 'El Campeón del Pueblo',
      classId: null,
      tutorialDone: false
    },
    progression: {
      level: 1, exp: 0, statPoints: 0, skillPoints: 0,
      chapter: 1, fight: 1, victories: 0, defeats: 0
    },
    resources: { gold: 500, gems: 0, materials: 0 },
    baseStats: {
      health: 120, attack: 18, defense: 10,
      speed: 10, criticalChance: 0.05, luck: 0,
      dodge: 0.01, accuracy: 0.95,
      criticalResistance: 0, criticalNullify: 0
    },
    inventory: { capacity: 50, equipment: [], materials: {}, consumables: [] },
    equipped: {
      head: null, torso: null, arms: null, legs: null,
      boots: null, belt: null, amulet: null
    },
    skills: { unlocked: {}, spent: 0 },
    campaign: { currentEnemyId: null, bossWins: 0 },
    events: { dayKey: null, order: [], progress: {}, history: [] },
    pvp: { activeTournament: null, recentChampions: [] },
    missions: { dayKey: null, weekKey: null, daily: [], weekly: [] },
    achievements: { progress: {}, claimed: [] },
    shop: { dayKey: null, weekKey: null, offers: [] },
    loginCalendar: { lastClaimKey: null, day: 0 },
    inbox: [],
    settings: {
      textSize: 'normal', quality: 'medium', reducedMotion: false,
      musicVolume: 0.5, effectsVolume: 0.7, vibration: true
    },
    meta: { lastSavedAt: now, playTimeSeconds: 0 }
  };
}
```

No se guardarán objetos del DOM, temporizadores, nodos de audio ni funciones.

## 3.2. Store y acciones atómicas

`store.dispatch(action)` será el único método para modificar datos. Cada compra o premio debe ser atómico: o se aplican todos sus cambios o no se aplica ninguno.

Ejemplo de compra:

1. localizar el producto por ID en el catálogo confiable;
2. comprobar moneda, precio, stock y capacidad;
3. descontar el precio definido en catálogo, nunca uno recibido desde HTML;
4. añadir el objeto;
5. actualizar misión/logro;
6. guardar;
7. emitir un evento para renderizar.

Nunca se aceptarán `NaN`, infinitos, cantidades negativas, identificadores desconocidos ni porcentajes fuera de `0..1`.

## 3.3. Configuración y fórmulas

Valores iniciales recomendados en `game-config.js`:

```js
export const GAME_CONFIG = Object.freeze({
  maxLevel: 200,
  inventoryCapacity: 50,
  bossEvery: 5,
  finisherThreshold: 0.20,
  finisherMultiplier: 1.5,
  criticalMultiplier: 2,
  sellReturnRate: 0.25,
  pvpHouseRate: 0.20,
  pvpPayoutRates: [0.50, 0.25, 0.10, 0.06, 0.04, 0.03, 0.02],
  classAdvantage: 1.12,
  classDisadvantage: 0.90,
  maxCombatSeconds: 180
});
```

Fórmulas iniciales, documentadas y probadas:

```text
EXP para siguiente nivel = redondear(100 × nivel^1,55)
Poder = vida×0,22 + ataque×4 + defensa×3,2 + velocidad×2,5
        + crítico%×180 + esquiva%×120
Costo de stat = redondear(75 × 1,18^mejorasCompradas × nivel^0,35)
Vida enemigo = 105 × 1,11^(capítulo-1) × factorDeLucha
Ataque enemigo = 15 × 1,095^(capítulo-1) × factorDeLucha
Oro base = redondear(55 × capítulo^1,18 × dificultad)
EXP base = redondear(35 × capítulo^1,16 × dificultad)
```

Las fórmulas usarán límites defensivos y redondeo consistente. Llegar al nivel 200 detiene la EXP, pero no impide mejorar equipo o participar en modos.

## 3.4. Persistencia

Claves de `localStorage`:

```text
ringDeCampeones.save.current
ringDeCampeones.save.backup
ringDeCampeones.installationId
```

Proceso de guardado:

1. clonar y validar el estado;
2. serializarlo;
3. mover el guardado actual a `backup`;
4. escribir el nuevo en `current`;
5. releer y comprobar que se puede analizar;
6. conservar la copia anterior si algo falla.

Guardar tras compras, ventas, mejoras, combates, premios, cambios de habilidad, evento y ajustes. Los cambios frecuentes, como tiempo jugado, se agrupan con un retraso corto para no escribir constantemente.

## 3.5. Migraciones e importación

Cada guardado incluye `schemaVersion`. `migrations.js` convierte secuencialmente `v1 → v2 → v3`; nunca salta versiones. Una importación se analiza en memoria, se valida, se muestra un resumen y solo después de confirmar reemplaza el estado.

El respaldo puede incluir suma de comprobación para detectar daños accidentales, pero **no es una protección real contra trampas**, porque el juego no tiene servidor.

## Pruebas del paso

- guardar/cargar conserva todos los campos;
- JSON roto recupera la copia anterior;
- una versión antigua migra sin perder recursos;
- una importación inválida no cambia el estado;
- ninguna acción deja oro, Gemas o materiales negativos;
- reiniciar requiere escribir una confirmación explícita y genera un estado nuevo.

## Criterio de aceptación

Cerrar y volver a abrir recupera exactamente el progreso; una interrupción de guardado no destruye la copia anterior.

---

# Paso 4 — Construir la interfaz completa y la navegación sin scroll

## Objetivo

Implementar todas las pantallas antes de conectar sistemas complejos, usando datos simulados. Así se valida temprano que el juego cabe y es táctil.

## 4.1. Flujo de navegación

Estados principales:

```text
PORTADA → ELECCIÓN DE CLASE → TUTORIAL → PANEL
                                      ├─ HÉROE
                                      ├─ EQUIPO
                                      ├─ HABILIDAD
                                      ├─ EVENTOS
                                      ├─ LUCHA PVP
                                      └─ TIENDA
PANEL → PRECOMBATE → COMBATE → RESULTADO → PANEL
```

El botón Atrás del dispositivo cierra primero un modal, luego vuelve de una subpantalla al panel y nunca abandona accidentalmente una lucha activa. `router.js` controla las rutas en memoria y sincroniza una ruta sencilla en el hash.

## 4.2. Distribución común

- **Cabecera:** nivel, oro, Gemas, materiales, botón de ajustes y próximo evento.
- **Área principal:** una única pantalla activa.
- **Navegación inferior:** seis botones con icono, texto, subrayado activo y aviso numerado.
- **Capas globales:** modal, confirmación y mensajes breves.

En combate y eventos inmersivos se ocultan cabecera y navegación inferior.

## 4.3. Pantallas

### Portada

Logo, nivel del guardado, `Continuar`, `Nueva partida` y `Ajustes`. Si no existe partida, `Continuar` estará deshabilitado. Nueva partida no borra una existente sin confirmación.

### Panel

Retrato del héroe, clase, nivel, EXP exacta y barra, cinco stats principales, evento activo y tarjeta de rival con nombre, clase, poder, comparación, premios y botón `¡LUCHAR!`.

### Héroe

Retrato fijo, poder, lista de stats mejorables, puntos disponibles, radar accesible con equivalencia textual, clase no modificable, insignias y próxima meta. Las mejoras múltiples deben mostrar costo total antes de confirmar.

### Equipo

Siete huecos, poder antes/después, inventario paginado, filtros Equipo/Materiales, comparación con flechas, mejorar, equipar y vender. Aunque el plan pedía vender sin confirmación, se incluirá un botón separado y una ventana de **deshacer de cinco segundos** para evitar pérdidas por error táctil sin añadir recuperación permanente.

### Habilidad

Cuatro ramas: Ataque, Defensa, Fortuna y Gloria. En pantallas pequeñas cada rama es una vista paginada con conexiones simplificadas. Un nodo indica nivel requerido, prerequisito, costo, efecto y estado. Resetear requiere Gemas y confirmación.

### Eventos

Tarjeta del evento actual, tiempo restante, próximo evento, siete eventos del día, historial y buzón. Al entrar, aparece tutorial solo la primera vez para ese tipo.

### PVP

Salas Bronce, Plata y Oro, precio, bolsa neta, distribución, bracket, rival siguiente y campeones recientes. La confirmación de entrada explica que se pierde al quedar eliminado.

### Tienda

Pestañas Equipo, Materiales, Consumibles y Premium; rejilla paginada; tres ofertas diarias; temporizador; stats completos; moneda y confirmación obligatoria para Gemas.

### Misiones, logros, buzón y ajustes

Se abren desde accesos secundarios del panel/ajustes. Todo listado será paginado. El buzón permite reclamar individualmente o todo si hay capacidad; si no cabe un objeto, conserva el mensaje.

## 4.4. Renderizado seguro

El texto variable se asignará con `textContent`, no con `innerHTML`. Los componentes que necesitan HTML usarán plantillas internas controladas, nunca cadenas provenientes del guardado.

Los listeners se delegarán desde el contenedor principal mediante atributos `data-action`. Cada render debe limpiar temporizadores y listeners propios de la vista anterior para evitar duplicados.

## 4.5. Accesibilidad

- Botones reales en vez de `div` pulsables.
- Etiquetas accesibles para iconos.
- Barras con `role="progressbar"`, mínimo, máximo y valor.
- El color nunca será la única señal: se acompaña de texto o icono.
- Modales con foco atrapado, cierre controlado y retorno al elemento anterior.
- Respeto a reducción de movimiento y volumen cero.

## Pruebas E2E del paso

- crear partida y elegir cada clase;
- recorrer seis pestañas;
- abrir y cerrar cada modal;
- usar tamaño de texto grande en pantalla 320×568;
- comprobar que no existe desbordamiento horizontal ni scroll del documento;
- navegar solo con teclado en navegador de escritorio.

## Criterio de aceptación

Todas las pantallas y estados vacíos/de error son visibles, utilizables y no se cortan en los tamaños definidos.

---

# Paso 5 — Implementar progreso, economía, héroe, equipo y habilidades

## Objetivo

Hacer funcional todo lo que modifica el poder del héroe antes de desarrollar el combate visual.

## 5.1. Clases

| Clase | Bonus | Penalización | Ventaja |
|---|---|---|---|
| Pesado | +18% vida, +8% defensa | −10% velocidad | vence a Ágil |
| Técnico | +10% precisión, +5% crítico | −5% vida | vence a Pesado |
| Ágil | +18% velocidad, +3% esquiva | −8% defensa | vence a Técnico |
| Equilibrado | +4% a vida/ataque/defensa/velocidad | ninguna | no tiene ventaja ni desventaja |
| Leyenda | configuración especial por rival | no seleccionable | solo CPU |

Pesado → Ágil → Técnico → Pesado. El multiplicador se aplica una sola vez y no altera permanentemente los stats.

## 5.2. Subida de nivel

Al ganar EXP:

1. sumar la recompensa;
2. mientras alcance el requisito y el nivel sea menor que 200, subir un nivel;
3. descontar el requisito de ese nivel;
4. dar oro, un punto de stat y un punto de habilidad;
5. aplicar crecimiento base fijo + porcentaje;
6. registrar misión/logro;
7. mostrar una celebración textual agrupada si subió varios niveles.

El jugador distribuye los puntos desde HÉROE. Comprar con oro respeta un límite derivado del nivel y rareza de clase. “Sin tope de stats” significa que no hay máximo absoluto global, no que se pueda ignorar el límite de mejora actual.

## 5.3. Equipo e inventario

Siete huecos: cabeza, torso, brazos, piernas, botas, cinturón y amuleto. Rarezas:

```text
común (gris) → poco común (verde) → raro (azul)
→ épico (violeta) → legendario (dorado) → divino (arcoíris)
```

Cada pieza contiene:

```js
{
  uid: 'eq_...', templateId: 'boots_thunder', slot: 'boots',
  rarity: 'epic', level: 0, primary: { speed: 12 },
  secondary: { criticalChance: 0.01 }, setId: 'tempestad',
  rerolls: 0, acquiredAt: 0
}
```

`uid` identifica esa copia; `templateId` identifica el catálogo. Se ordena por rareza, nivel y fecha. Equipar intercambia piezas sin superar capacidad.

Hay 12 sets. Los bonus se calculan a partir de piezas equipadas y no se escriben en stats base, evitando duplicarlos al cargar.

## 5.4. Mejora y recambio

- Niveles `+0` a `+15`.
- Hitos en `+5`, `+10` y `+15`.
- Costo por rareza y nivel.
- Probabilidad de éxito visible.
- Un objeto de protección garantiza el intento y se consume solo al intentarlo.
- Un fallo no baja nivel ni destruye la pieza.
- Recambiar secundaria cuesta oro y muestra todas las probabilidades.
- La rareza nunca cambia.

Para que una operación fallida pueda probarse, su resultado se genera con el RNG central y queda registrado en un historial breve de sesión.

## 5.5. Árbol de habilidades

Crear al menos diez nodos por rama. Cada nodo define:

```js
{
  id: 'attack_critical_1', branch: 'attack', maxRank: 1,
  requiredLevel: 12, prerequisites: ['attack_power_2'],
  baseCost: 2, effect: { criticalChance: 0.01 }
}
```

Reglas:

- todos son pasivos;
- se compran en cadena;
- el costo aumenta dentro de la rama;
- sus efectos se calculan dinámicamente;
- resetear devuelve puntos, no oro, y cuesta Gemas;
- una habilidad de “drop” aumenta materiales;
- no existen curación, ejecución ni robo de vida;
- los bonus pequeños se documentan como valores decimales, evitando confundir `1%` con `100%`.

## 5.6. Stats calculados

Usar un selector sin efectos laterales:

```text
stats efectivos = base
                + puntos asignados
                + equipo
                + hitos de equipo
                + bonus de set
                + habilidades
                + bonus de clase
                + consumible precombate
```

No guardar los stats efectivos. Siempre se recalculan para impedir acumulaciones dobles.

## Pruebas obligatorias

- EXP puede subir varios niveles y se detiene en 200;
- comprar sin oro no modifica nada;
- inventario 50/50 impide comprar una pieza;
- equipar y desequipar conserva todas las copias;
- venta devuelve exactamente 25% y cancela la ventana de deshacer correctamente;
- mejora nunca supera +15;
- prerequisitos y costos de habilidades se respetan;
- recalcular 100 veces produce el mismo poder y no duplica bonus.

## Criterio de aceptación

Toda mejora se refleja inmediatamente en el poder, persiste al recargar y no permite recursos negativos ni objetos duplicados.

---

# Paso 6 — Crear el motor y la pantalla de combate

## Objetivo

Implementar un combate automático justo, reproducible, rápido y separado de sus animaciones.

## 6.1. Modelo del combate

`createCombat(player, enemy, seed)` crea una instantánea. Ningún cambio de inventario durante la animación puede modificar una lucha ya iniciada.

Cada luchador posee:

- vida actual y máxima;
- ataque, defensa, velocidad, crítico, precisión y esquiva;
- clase y multiplicador de clase;
- medidor de acción `0..100`;
- estado de remate usado/no usado;
- efectos de una sola lucha.

El motor trabaja en pasos fijos de 50 ms simulados. La velocidad x2 cambia cuánto tiempo real tarda en reproducirse, **no el resultado**.

## 6.2. Turnos por carga

```text
cargaPorPaso = (8 + velocidad × 0,32) × bonusCarga
```

Cuando llega a 100, ataca y resta 100. Si ambos llegan en el mismo paso, actúa primero quien tenga más velocidad; si empatan, la semilla decide. Se limita el número de acciones para evitar un bucle infinito.

## 6.3. Resolución de golpe

Orden estricto:

1. seleccionar uno de 8+ nombres de movimiento permitidos por clase;
2. comprobar impacto con precisión contra esquiva;
3. calcular daño base;
4. aplicar ventaja de clase;
5. comprobar crítico y defensa crítica;
6. aplicar variación sembrada de 95% a 105%;
7. redondear y limitar a un mínimo de 1;
8. restar vida sin bajar de cero;
9. emitir un evento de combate inmutable.

Fórmula inicial:

```text
dañoBase = máximo(1, ataque × poderMovimiento − defensa × 0,55)
daño = dañoBase × clase × crítico × variación
```

La anulación crítica convierte un crítico en golpe normal. La resistencia crítica reduce el multiplicador, pero nunca por debajo de `1`. La precisión y esquiva se limitan para mantener como mínimo un 5% de posibilidad de impacto y como máximo un 35% de esquiva.

## 6.4. Remate, KO y cuenta

Cuando el objetivo está a 20% o menos, el atacante no ha usado su remate y llena su siguiente barra, ejecuta el remate ×1,5. Si la vida llega a cero:

1. se reproduce caída;
2. aparece cuenta 1, 2 y 3;
3. existe una posibilidad mínima configurable de levantarse con 1% de vida, como máximo una vez por lucha;
4. si no se levanta, termina por KO.

Para evitar una pelea interminable, a los 180 segundos simulados gana quien tenga mayor porcentaje de vida; un empate se resuelve por daño total.

## 6.5. Registro de eventos

El motor devuelve algo como:

```js
{
  winnerId: 'player',
  durationMs: 42350,
  events: [
    { at: 850, type: 'attack', actor: 'player', move: 'lariat' },
    { at: 850, type: 'damage', target: 'enemy', amount: 24, critical: false }
  ],
  summary: { playerDamage: 310, enemyDamage: 214 }
}
```

La UI reproduce estos eventos. No decide daños. Así una animación omitida o un teléfono lento no altera premios ni resultado.

## 6.6. Pantalla

- héroe a la izquierda y rival a la derecha;
- nombre y barra de vida por colores;
- carga bajo cada luchador;
- daño dorado al rival, rojo al héroe y color brillante para crítico;
- destello de impacto y sacudida moderada;
- registro paginado en vivo de las últimas líneas;
- botón x1/x2 y pausa solo si se decide permitirla;
- público estático y escenario por capítulo/evento;
- `¡KO!`, cuenta y resultado;
- reducción de movimiento reemplaza sacudidas por cambios de borde.

Los premios se conceden **una sola vez** al cerrar el resultado, usando un `combatId` reclamable. Recargar durante la animación reanuda o resuelve la lucha pendiente; nunca permite cobrar dos veces.

## 6.7. Campaña

- Rival normal en luchas 1–4 de cada bloque.
- Jefe en cada quinta victoria.
- Si se pierde, permanece el mismo rival.
- Al ganar, aumenta capítulo/progreso y se genera el siguiente.
- Enemigos escalan por capítulo y ligeramente por victorias.
- Dificultad adaptativa solo ajusta dentro de ±8%; nunca altera una lucha ya creada.
- Jefes dan ×2 oro.

## Pruebas obligatorias

- misma semilla + mismos stats = mismos eventos y ganador;
- x1 y x2 dan exactamente el mismo resultado;
- vida nunca es negativa;
- esquiva no causa daño;
- crítico aplica el multiplicador correcto;
- ventaja de clase funciona en las tres direcciones;
- remate ocurre como máximo una vez por luchador;
- límite de duración siempre cierra la pelea;
- perder no quita oro y no avanza rival;
- reclamar resultado dos veces no duplica premios.

## Criterio de aceptación

Ejecutar al menos 10.000 combates simulados sin excepción, bloqueo, `NaN`, vida negativa ni combate inconcluso.

---

# Paso 7 — Implementar los siete eventos diarios

## Objetivo

Crear el calendario basado en la hora local del dispositivo y reutilizar el motor de combate con reglas especiales.

## 7.1. Día operativo y orden diario

Cada día operativo empieza a las 06:00 del teléfono. Hay siete bloques de tres horas:

```text
06:00–09:00 · 09:00–12:00 · 12:00–15:00 · 15:00–18:00
18:00–21:00 · 21:00–00:00 · 00:00–03:00
```

Entre 03:00 y 06:00 no hay evento activo; se muestra el próximo. El bloque de medianoche pertenece al día operativo que comenzó a las 06:00 anterior.

`dayKey` se calcula con fecha local y comienzo a las 06:00. El orden se baraja una sola vez usando una semilla derivada de `dayKey + installationId`, se guarda y no cambia si se recarga. Cambiar el reloj puede afectar eventos en un juego local; se detectarán saltos grandes y se mostrará aviso, pero no se fingirá seguridad de servidor.

Se debe escuchar `visibilitychange`: al volver a primer plano se recalcula evento y tiempo restante. No se confía únicamente en un `setInterval`.

## 7.2. Reglas por evento

### 1. Torneo Relámpago

Rivales infinitos hasta perder. Puntaje = victorias y bonus por rapidez. Al perder finaliza el intento. Se guarda récord del bloque.

### 2. Derriba al Gigante

Tres intentos. Jefe con mucha vida y fases al 70%, 40% y 15%. Se registra la suma de daño de los tres intentos. La tabla simulada muestra top 10 y posición del jugador.

### 3. Maratón de Victorias

Intentos limitados por bloque, dificultad creciente, +1 por victoria y −1 por derrota sin bajar de cero. Premio único al alcanzar 20, reclamable una vez.

### 4. Supervivencia Extrema

Oleadas infinitas; el héroe conserva vida y cura 10% de vida máxima tras superar cada oleada, sin exceder el máximo. Hitos conceden materiales raros una sola vez por evento.

### 5. Golpe Maestro

Diez ataques contra muñeco inmóvil. Solo puntúa el daño crítico. Se muestran intentos, críticos y mejor marca. Si no sale crítico, ese intento vale cero.

### 6. Escalera al Cielo

Tabla de 200 CPU. Empieza en puesto 200, gana un puesto al vencer y pierde uno al caer, sin pasar de 200. Premios por tramos son reclamables una vez.

### 7. Rey del Ring

Simulación de 30 participantes con entrada escalonada. El jugador tiene tres entradas y conserva el mejor resultado. Puntuación combina eliminaciones y supervivencia. Ganar concede corona y Gemas mediante buzón.

## 7.3. Rankings simulados

Como no hay servidor, los demás puestos son CPU deterministas. Se generan al comenzar el bloque, progresan de forma predecible según tiempo transcurrido y no cambian arbitrariamente cada vez que se abre la pantalla. Deben etiquetarse como “rivales fantasma”, sin sugerir que son usuarios en vivo.

## 7.4. Premios y buzón

- Top 10 según tabla de cada evento.
- Gran diferencia para primer lugar.
- Gemas solo en puestos altos y cantidades pequeñas.
- Participar da EXP y oro mínimo.
- Los premios se calculan al cerrar el bloque o el intento y se envían con `mailId` único.
- Reclamar es idempotente: el mismo correo no paga dos veces.
- Historial limitado a los resultados del día; los datos antiguos se resumen para no crecer sin límite.

## Pruebas obligatorias

- todas las horas frontera seleccionan el bloque correcto;
- cambio de mes/año y año bisiesto;
- tramo 00:00–03:00 usa el día operativo anterior;
- 03:00–06:00 no tiene evento activo;
- orden diario contiene los siete eventos exactamente una vez;
- recargar conserva orden y progreso;
- cada límite de intentos se respeta;
- hitos y buzón no pagan doble;
- cambio de zona horaria no rompe el guardado.

## Criterio de aceptación

Simular siete días completos con reloj falso sin perder progresos, repetir eventos, entregar premios duplicados ni mostrar tiempos negativos.

---

# Paso 8 — Implementar el PVP local y los torneos de 32

## Objetivo

Crear la experiencia competitiva descrita en el plan sin depender de jugadores conectados ni de un backend.

## 8.1. Salas

Configuración inicial ajustable:

| Sala | Entrada | Moneda | Fuerza CPU | Bolsa bruta |
|---|---:|---|---|---:|
| Bronce | 500 | Oro | amplia | 16.000 |
| Plata | 2.500 | Oro | amplia/alta | 80.000 |
| Oro | 25 | Gemas | alta/especial | 800 Gemas |

La bolsa bruta es `entrada × 32`. La casa retiene 20%. El 80% restante se reparte con porcentajes `50-25-10-6-4-3-2`, cuya suma debe probarse como 100%.

Ejemplo Bronce:

```text
32 × 500 = 16.000 oro bruto
Comisión 20% = 3.200
Bolsa distribuible = 12.800
1º = 6.400; 2º = 3.200; 3º = 1.280; etc.
```

Por redondeo, cualquier residuo va al primer puesto para que la suma pagada sea exactamente la bolsa neta.

## 8.2. Creación del torneo

Al confirmar entrada:

1. comprobar saldo;
2. descontar una sola vez;
3. crear `tournamentId` y semilla;
4. capturar una instantánea del héroe;
5. generar 31 rivales fantasma con nombre, apodo, clase, estilo y poder variado;
6. barajar bracket;
7. guardar antes de mostrar la primera ronda.

Los rivales no se regeneran al recargar. “Todos contra todos” se interpreta como ausencia de restricción de emparejamiento, no como formato de liga, porque el plan define eliminación de 32.

## 8.3. Rondas

32 → 16 → 8 → 4 → 2 → campeón. Las luchas ajenas se simulan con el mismo RNG. Entre rondas se muestra próximo rival y se permite apostar oro por la propia victoria, con un límite para evitar valores negativos. La apuesta es opcional y no altera al rival.

Si el jugador pierde, el resto del torneo se simula para determinar sus puestos estadísticos y campeón. Para asignar top 7:

- campeón y finalista ocupan 1–2;
- semifinalistas se ordenan por porcentaje de vida y daño, ocupando 3–4;
- los mejores tres eliminados en cuartos ocupan 5–7.

Solo esos siete reciben bolsa. Si el jugador queda fuera, no recibe nada.

## 8.4. CPU adaptativa justa

La generación puede observar un resumen histórico previo, nunca el resultado futuro ni decisiones durante la pelea. Debe mantenerse dentro de rangos públicos de poder por sala. El jugador siempre ve nombre y poder antes de luchar.

No se modificará un rival después de generarlo para forzar victoria o derrota.

## 8.5. Reanudación y campeones recientes

Guardar al terminar cada ronda. Al reabrir, se retoma el mismo bracket. `recentChampions` conserva los últimos diez campeones, sin ranking, liga o tarjeta pública.

## Pruebas obligatorias

- se generan exactamente 32 participantes únicos;
- cada ronda tiene la mitad de participantes;
- nadie pelea dos veces en la misma ronda;
- entrada se descuenta una sola vez;
- bolsa neta y siete pagos cuadran en cualquier precio;
- un jugador eliminado no puede volver al bracket;
- recarga reanuda semilla, rivales y ronda;
- terminar registra un solo campeón;
- otra entrada exige pagar de nuevo.

## Criterio de aceptación

Simular 1.000 torneos completos sin bracket inválido, saldo negativo, ganador duplicado ni diferencia entre bolsa neta y premios.

---

# Paso 9 — Completar tienda, misiones, logros, audio, ajustes y tutorial

## Objetivo

Conectar los sistemas complementarios que convierten el prototipo en un juego completo.

## 9.1. Tienda

El catálogo diario se genera por `dayKey`, instalación y nivel. El semanal usa `weekKey`. Debe mostrar:

- piezas de cualquier rareza permitida, incluidas exclusivas;
- estadísticas exactas antes de comprar;
- materiales de mejora y protección;
- tres consumibles equipables antes de una lucha;
- tres descuentos diarios;
- sección Premium con legendarios rotativos y precio en Gemas;
- probabilidades visibles solo donde haya recambio o mejora aleatoria.

No habrá cofres, paquetes, pagos reales, conversión oro/Gemas ni anuncios. Un producto comprado se añade si hay espacio. Las compras ilimitadas significan que no hay límite diario general; una oferta concreta puede regenerar otra copia con un nuevo `uid`.

Los consumibles duran una lucha y pueden modificar ataque, defensa, velocidad, crítico o suerte. Nunca generan Gemas directamente. Las recetas permiten crear consumibles si hay materiales.

## 9.2. Misiones

Generar siete diarias y cinco semanales a partir de plantillas compatibles con las funciones existentes: combatir, ganar, mejorar, comprar, vender, usar materiales, desbloquear habilidad, participar en evento y entrar en PVP.

Cada misión tiene ID de instancia, tipo, objetivo, progreso, recompensa y estado. Los sistemas publican eventos de dominio como `FIGHT_WON` o `ITEM_UPGRADED`; misiones y logros los escuchan. No leen texto de la UI.

Al cambiar de día/semana:

1. finalizar el período anterior;
2. conservar recompensas reclamadas;
3. no pagar automáticamente misiones sin reclamar, salvo decisión documentada;
4. generar nuevas sin duplicar IDs;
5. guardar.

## 9.3. Logros

Crear al menos 100 definiciones repartidas entre campaña, economía, equipo, habilidad, eventos y PVP. Cada logro es visible y tiene barra. Reclamar concede pocas Gemas y marca su ID permanentemente.

Evitar guardar una copia completa de las 100 definiciones; solo guardar progreso y reclamados. Los textos viven en catálogo.

## 9.4. Calendario y buzón

El calendario de siete días da recursos modestos y algunas Gemas al final. Solo puede reclamarse una vez por fecha local. No exige una racha perfecta: si se omite un día, continúa o reinicia según una única regla documentada; para esta versión se recomienda **continuar en el siguiente día de calendario reclamado** y reiniciar después del séptimo.

El buzón guarda premios de eventos e incidencias de inventario. Límite recomendado: 50 mensajes; correos reclamados se eliminan y los no reclamados nunca se borran automáticamente sin aviso.

## 9.5. Audio y vibración

`audio.js` crea `AudioContext` únicamente tras el primer gesto del usuario para cumplir las políticas móviles. Canales separados:

- música;
- efectos;
- ambiente.

Volúmenes se guardan de `0` a `1`. Si falta un archivo, el juego continúa sin audio y registra advertencia, no excepción fatal. Pausar audio cuando la pestaña queda oculta.

`vibration.js` comprueba `navigator.vibrate`; si no existe, no hace nada. Patrones breves para impacto, crítico, KO y nivel, respetando el ajuste del usuario.

## 9.6. Ajustes

- tamaño de texto pequeño/normal/grande;
- calidad baja/media/alta;
- volumen por canal y perfiles;
- vibración por momento;
- reducción de movimiento;
- exportar respaldo;
- importar respaldo con vista previa;
- reiniciar con confirmación fuerte;
- información de versión.

Los cambios visuales se aplican de inmediato. Exportar genera un archivo JSON con fecha, versión y estado validado. Importar no ejecuta código ni acepta HTML.

## 9.7. Tutorial

Duración objetivo: dos minutos, sin bloquear permanentemente al usuario.

1. bienvenida y elección de clase;
2. explicación del panel y poder;
3. primera lucha guiada;
4. mejora de un stat gratuita;
5. explicación de equipo y habilidad;
6. indicación de eventos, PVP y tienda;
7. guardado y finalización.

Debe poder omitirse y repetirse desde ajustes. Cada evento tiene una ayuda breve la primera vez.

## Pruebas obligatorias

- cambio diario/semanal correcto;
- misión progresa una sola vez por evento de dominio;
- logro reclamado no vuelve a pagar;
- compra premium siempre confirma;
- consumible se consume exactamente en una lucha;
- receta no fabrica sin materiales;
- ausencia de API de audio/vibración no bloquea;
- exportar/importar realiza ida y vuelta idéntica;
- tutorial puede completar, omitir y repetir.

## Criterio de aceptación

Todos los botones visibles realizan una acción válida, informan por qué no pueden realizarla o están correctamente deshabilitados; no existen controles de adorno.

---

# Paso 10 — Pruebas finales, rendimiento, publicación y definición de terminado

## Objetivo

Demostrar de forma repetible que el juego funciona como conjunto, no solo que cada archivo parece correcto.

## 10.1. Pirámide de pruebas

### Unitarias — Vitest

Cubrir como mínimo:

- fórmulas y formateadores;
- RNG y barajado;
- validadores y migraciones;
- progreso, nivel 200 y costos;
- inventario, sets, mejora y venta;
- habilidades y prerequisitos;
- motor de combate;
- horarios y siete eventos;
- reparto PVP;
- misiones y logros.

Objetivo: 90% de líneas en `core`, `state` y `systems`, y 100% en rutas críticas de dinero, Gemas, guardado y premios.

### Integración

- victoria → premio → EXP → nivel → misión → logro → guardado;
- compra → inventario → equipar → poder → combate;
- evento → ranking → buzón → reclamación;
- torneo → rondas → bolsa → campeón reciente;
- exportar → reiniciar → importar → recuperar.

### E2E — Playwright

Flujo principal completo en Chromium móvil:

1. nueva partida;
2. clase;
3. tutorial;
4. lucha normal;
5. mejora de héroe;
6. compra/equipamiento;
7. habilidad;
8. evento;
9. PVP;
10. recargar y comprobar progreso.

Ejecutar también estados de derrota, falta de saldo, inventario lleno, guardado corrupto y aplicación sin conexión.

## 10.2. Matriz visual y dispositivos

Probar al menos:

| Vista | Tamaño CSS | Texto |
|---|---:|---|
| Android pequeño | 320×568 | normal y grande |
| Android común | 360×640 | normal y grande |
| Android moderno | 390×844 | normal y grande |
| Android grande | 412×915 | normal y grande |
| Escritorio estrecho | 540×960 | normal |

Comprobar áreas seguras con notch, teclado virtual en importación/confirmación, orientación horizontal, zoom de accesibilidad y reducción de movimiento.

Una prueba automática debe verificar en cada pantalla:

```js
const noDocumentScroll = await page.evaluate(() =>
  document.documentElement.scrollHeight <= window.innerHeight + 1 &&
  document.documentElement.scrollWidth <= window.innerWidth + 1
);
```

La paginación interna no debe ocultar el botón para pasar de página.

## 10.3. Rendimiento

Presupuestos iniciales:

- JavaScript propio inicial comprimido: menos de 250 KB;
- CSS comprimido: menos de 60 KB;
- ninguna imagen individual mayor de 300 KB sin justificación;
- audio cargado bajo demanda;
- pantalla interactiva en menos de 3 s en móvil medio;
- animación cercana a 60 FPS y modo bajo estable;
- no más de un bucle de animación activo;
- historial y logs con límites para evitar crecimiento de memoria.

Usar WebP/AVIF con fallback cuando sea conveniente, sprites o SVG para iconos y carga diferida para rings/audio. No precargar toda la biblioteca musical.

## 10.4. Robustez

Probar manualmente:

- cerrar app durante combate, compra, mejora y torneo;
- cambiar de día con la app abierta y cerrada;
- almacenamiento lleno o no disponible;
- audio bloqueado por navegador;
- sin conexión;
- actualización del service worker;
- archivo importado roto, enorme o de otra versión;
- tocar muy rápido un botón de compra/reclamo;
- mantener abierta la app varias horas.

Los botones de transacción se bloquean mientras la acción está en curso. Además, la lógica usa IDs de operación, por lo que un doble toque tampoco duplica la recompensa.

## 10.5. Seguridad y privacidad local

- No cargar scripts desde CDN en producción.
- Política de Seguridad de Contenido compatible con módulos propios.
- No usar `eval`, `new Function` ni HTML proveniente del guardado.
- No solicitar datos personales.
- No usar analítica sin consentimiento.
- Explicar que el progreso reside en el dispositivo y recomendar exportar respaldo.

Al ser local, un usuario técnicamente puede editar su guardado. Evitar trampas reales requiere servidor autoritativo y está fuera de este alcance.

## 10.6. Empaquetado

Primero publicar la PWA estática generada por `npm run build`. Para distribución opcional como APK, envolver esa misma compilación con Capacitor en una fase posterior, sin duplicar lógica. Antes del APK se necesitan iconos definitivos, identificador de aplicación, firma y pruebas Android reales.

No se debe publicar la carpeta de desarrollo ni secretos; solo los archivos de compilación estática.

## Comandos finales

```bash
npm ci
npm run test
npm run build
npm run test:e2e
npm run check
```

Además:

- Lighthouse en modo móvil y PWA;
- revisión de consola sin errores;
- prueba offline;
- prueba de instalación;
- validación de `manifest.webmanifest`;
- recorrido manual del checklist.

## Definición de “terminado”

El juego se considera correctamente implementado únicamente si:

- [ ] Las seis pestañas, portada, panel, combate, resultado y ajustes funcionan.
- [ ] Las cuatro clases jugables y la clase Leyenda de CPU respetan reglas.
- [ ] Campaña, jefes, nivel, EXP, oro, Gemas y materiales persisten.
- [ ] Equipo, 6 rarezas, 12 sets, +15, venta e inventario funcionan.
- [ ] Hay 40 o más habilidades válidas y cuatro ramas.
- [ ] El motor supera 10.000 simulaciones sin estados inválidos.
- [ ] Los siete eventos aparecen una vez por día operativo y pagan una vez.
- [ ] El torneo PVP siempre produce un bracket y reparto correctos.
- [ ] Existen 7 misiones diarias, 5 semanales y 100 o más logros.
- [ ] Guardado, respaldo, migración, exportación, importación y reinicio están probados.
- [ ] No hay scroll del documento ni contenido cortado en la matriz móvil.
- [ ] Texto grande, controles táctiles y reducción de movimiento son utilizables.
- [ ] Audio/vibración fallan de forma segura si el dispositivo no los admite.
- [ ] La PWA instala, actualiza y funciona sin conexión.
- [ ] `npm run check` termina con código 0.
- [ ] No hay errores de consola en todos los flujos E2E.
- [ ] `docs/reglas.md`, `docs/balance.md` y versión del guardado coinciden con el código.

---

# Orden práctico de ejecución

No se recomienda intentar construir las 350 decisiones simultáneamente. Dentro de cada paso se trabaja en una rama funcional pequeña y se integra solo cuando sus pruebas pasan:

```text
1. Reglas cerradas
2. Aplicación abre e instala
3. Estado guarda y recupera
4. Pantallas navegan y caben
5. Poder y economía funcionan
6. Combate y campaña funcionan
7. Eventos funcionan con reloj falso
8. PVP produce torneos válidos
9. Sistemas secundarios completan el juego
10. Calidad, offline y publicación
```

## Hitos jugables

- **Tras paso 4:** prototipo visual navegable.
- **Tras paso 6:** versión mínima jugable con campaña.
- **Tras paso 8:** versión beta con eventos y PVP local.
- **Tras paso 10:** versión candidata a publicación.

## Regla final de mantenimiento

Toda nueva funcionalidad debe incluir, en el mismo cambio:

1. regla documentada;
2. configuración o catálogo;
3. lógica de dominio;
4. representación visual;
5. validación de guardado si añade datos;
6. prueba positiva;
7. prueba de error o límite.

Siguiendo este orden, cada etapa produce una base verificable para la siguiente y reduce de forma importante el riesgo de errores funcionales, pérdidas de progreso y contradicciones con el plan maestro.
