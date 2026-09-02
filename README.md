# 🥊 Oro y Gloria

Juego de **lucha libre por autobatalla** para móvil. HTML, CSS y JavaScript
puros: sin frameworks, sin compilación, sin dependencias. Se instala como
aplicación en Android y funciona sin conexión.

- **Versión:** 1.0.0
- **Idioma:** español (único, *30.10*)
- **Orientación:** vertical (*28.09*)
- **Sonido:** ninguno, por decisión de diseño (*29.01*)
- **Pagos:** ninguno. Las gemas se ganan jugando (*08.14*)

---

## ▶️ Cómo ejecutarlo

El juego usa **módulos ES** y un **service worker**. El navegador los bloquea
si abres `index.html` con doble clic (protocolo `file:`), así que **no abras
el archivo suelto**: necesitas un servidor local, aunque sea el más simple.

```bash
cd oro-y-gloria
python3 -m http.server 8080
```

Y abre <http://localhost:8080>.

Cualquier alternativa vale igual de bien:

```bash
npx serve .          # Node
php -S localhost:8080  # PHP
```

### Instalarlo en el móvil

1. Sirve la carpeta por **HTTPS** (GitHub Pages, Netlify, Cloudflare Pages…).
2. Ábrela en Chrome Android → menú → **Instalar aplicación**.
3. A partir de ahí abre sin internet: el service worker guarda todo el juego.

> El service worker solo se registra bajo `http://localhost` o HTTPS. En
> local por IP no se activará, y es normal.

---

## 📁 Estructura

```
index.html            Shell: HUD, pantalla, menú de 6 pestañas
manifest.json         PWA: nombre, iconos, vertical, standalone
service-worker.js     Precache de todo el juego + aviso de actualización
README.md             Este archivo

assets/icons/         Iconos 192, 512 y maskable
styles/               Una hoja por pantalla + reset, variables y layout
tests/                13 suites de pruebas, una por paso del plan

js/main.js            Arranque: carga, estado, rutas, PWA, tutorial
js/core/              Cimientos: estado, router, DOM, RNG, bus, formato,
                      HUD y migraciones de guardado
js/data/              Números puros: constantes, clases, stats, equipo,
                      árbol, eventos, ligas, tienda, logros, misiones
js/systems/           Reglas: combate, poder, botín, forja, árbol,
                      eventos, PVP, tienda, guardado, logros, misiones,
                      tutorial, rendimiento y encuesta
js/screens/           Las 12 pantallas
js/render/            Dibujo del ring y de los luchadores
```

**Regla de dependencias:** `data` no importa nada, `systems` importa `data` y
`core`, `screens` importa de todo. Nunca al revés.

---

## 🎮 Qué hay dentro

| Sistema | Resumen |
|---|---|
| Combate | Autobatalla por ticks de 0,5 s, 10 estadísticas, 8 estados alterados |
| Progresión | Niveles, 3 puntos libres por nivel, 6 divisiones y luego la Torre |
| Equipo | 8 huecos, 6 rarezas, mejora con material, 8 piezas exóticas |
| Árbol | 6 ramas, 158 nodos, 8 nodos clave. Sin reasignación |
| Eventos | 7 formatos rotando cada 3 horas, premios al top 10, domingos al doble |
| Coliseo | PVP asíncrono contra fantasmas, 5 ligas, temporadas semanales |
| Tienda | Pociones, consumibles y una vitrina de equipo que rota cada hora |
| Meta | 150 logros, 5 misiones diarias, 3 semanales, estadísticas con gráficos |
| Guardado | Autoguardado, 5 respaldos, exportación a `.md` legible con checksum |

---

## 💾 Tus datos

La partida vive en el `localStorage` de tu navegador. **Si borras los datos de
navegación, se pierde.** Por eso el juego insiste en que exportes:

**Perfil → Datos → Descargar .md**

Ese archivo es Markdown normal: puedes abrirlo y leer tu progreso en texto. Al
final lleva un bloque con los datos codificados y un *checksum* que detecta si
alguien lo ha manipulado. Para recuperar la partida, impórtalo desde la misma
pantalla.

---

## 🧪 Pruebas

Cada paso del desarrollo tiene su suite. No necesitan nada instalado:

```bash
cd tests
for f in paso*.test.mjs; do node "$f"; done
```

Cada suite sale con código `0` si todo pasa y `1` si algo falla.

---

## 🔄 Publicar una versión nueva

1. Cambia `VERSION` en `service-worker.js` (por ejemplo `og-v1.0.1`).
2. Sube los archivos.

Los jugadores verán el aviso *«Nueva versión disponible»*. El juego guarda su
partida antes de recargar: nunca se pierde nada por actualizar.

---

## 🗳️ Qué viene después

El plan de la versión 1 está entregado entero. Lo siguiente se decide por
votación de los jugadores desde **Perfil → Datos → ¿Qué quieres que llegue
primero?**: más eventos, parejas, prestigio, modo historia o establos.
