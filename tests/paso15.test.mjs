/* PASO 15 — Tutorial, PWA, rendimiento, splash, encuesta y cierre del proyecto */
globalThis.location = { hostname: 'localhost', hash: '', protocol: 'http:' };

class MemStorage {
  constructor() { this.m = new Map(); }
  getItem(k) { return this.m.has(k) ? this.m.get(k) : null; }
  setItem(k, v) { this.m.set(k, String(v)); }
  removeItem(k) { this.m.delete(k); }
  clear() { this.m.clear(); }
}
globalThis.localStorage = new MemStorage();
globalThis.btoa = s => Buffer.from(s, 'binary').toString('base64');
globalThis.atob = s => Buffer.from(s, 'base64').toString('binary');

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

let ok = 0, mal = 0;
const t = (nombre, cond) => { if (cond) ok++; else { mal++; console.log(`❌ ${nombre}`); } };
const RAIZ = new URL('../', import.meta.url).pathname;
const leer = f => readFileSync(join(RAIZ, f), 'utf8');
const hay = f => existsSync(join(RAIZ, f));

const TUT = await import('../js/systems/tutorial.js');
const PERF = await import('../js/systems/perf.js');
const VOTO = await import('../js/systems/encuesta.js');
const SPLASH = await import('../js/screens/splash.js');
const ST = await import('../js/core/state.js');

/* ============ 1. TUTORIAL FORZADO DE 8 PASOS (01.14) ============ */
t('01.14 el tutorial tiene exactamente 8 pasos', TUT.PASOS.length === 8);
t('todos los pasos tienen id único', new Set(TUT.PASOS.map(p => p.id)).size === 8);
t('todos los pasos tienen título y texto',
  TUT.PASOS.every(p => p.titulo?.length > 3 && p.texto?.length > 30));
t('todos los pasos declaran su pantalla', TUT.PASOS.every(p => p.pantalla));
t('todos los pasos apuntan a un objetivo', TUT.PASOS.every(p => p.objetivo));
t('las posiciones del globo son válidas',
  TUT.PASOS.every(p => ['arriba', 'abajo'].includes(p.posicion)));

/* el orden que pide el plan */
const orden = TUT.PASOS.map(p => p.id);
t('01.14 paso 1: tu luchador', orden[0] === 'luchador');
t('01.14 paso 2: elegir rival', orden[1] === 'rival');
t('01.14 paso 3: ver la lucha', orden[2] === 'lucha');
t('01.14 paso 4: cobrar el botín', orden[3] === 'botin');
t('01.14 paso 5: subir una stat', orden[4] === 'stat');
t('01.14 paso 6: equipar objeto', orden[5] === 'equipo');
t('01.14 paso 7: el árbol', orden[6] === 'arbol');
t('01.14 paso 8: la rueda de eventos', orden[7] === 'eventos');

/* persistencia */
localStorage.clear();
t('el tutorial arranca sin hacer', TUT.tutorialHecho() === false);
TUT.marcarHecho();
t('marcar hecho persiste', TUT.tutorialHecho() === true);
TUT.reiniciarTutorial();
t('se puede repetir la guía', TUT.tutorialHecho() === false);

/* cuándo arranca */
ST.iniciarEstado();
localStorage.clear();
t('no arranca sin clase elegida', TUT.debeArrancar(ST.S) === false);
ST.S.perfil.clase = 'tecnico';
t('arranca con clase elegida y sin haberlo visto', TUT.debeArrancar(ST.S) === true);
TUT.marcarHecho();
t('no vuelve a arrancar una vez hecho', TUT.debeArrancar(ST.S) === false);
t('10.14 no hay ayudas por pantalla tras el tutorial',
  !leer('js/systems/tutorial.js').includes('ayudaPantalla'));

/* Sugerencia #1: saltable desde el paso 3 */
t('Sug#1 el umbral para saltar es el paso 3', TUT.PASO_SALTABLE === 3);
t('Sug#1 no se puede saltar en el paso 1', TUT.puedeSaltar(0) === false);
t('Sug#1 no se puede saltar en el paso 2', TUT.puedeSaltar(1) === false);
t('Sug#1 no se puede saltar en el paso 3', TUT.puedeSaltar(2) === false);
t('Sug#1 sí se puede saltar en el paso 4', TUT.puedeSaltar(3) === true);
t('Sug#1 se puede saltar en el último paso', TUT.puedeSaltar(7) === true);

t('el tutorial no está activo al importarlo', TUT.estadoTutorial().activo === false);
t('el estado conoce el total de pasos', TUT.estadoTutorial().total === 8);

/* ============ 2. MODO BAJO RENDIMIENTO (29.14) ============ */
const nav = (nucleos, ram, dpr = 2) =>
  ({ hardwareConcurrency: nucleos, deviceMemory: ram });
const win = (dpr = 2, reduce = false) =>
  ({ devicePixelRatio: dpr, matchMedia: () => ({ matches: reduce }) });

t('29.14 hay tres modos', PERF.MODOS.length === 3);
t('29.14 los modos son auto, alto y bajo',
  PERF.MODOS.join() === 'auto,alto,bajo');

t('un móvil potente puntúa alto', PERF.puntuarAparato(nav(8, 8), win(3)) >= 5);
t('un móvil de gama baja puntúa poco', PERF.puntuarAparato(nav(2, 1), win(2)) <= 2);
t('29.14 el móvil de gama baja pide ahorro', PERF.aparatoLento(nav(2, 1), win(2)) === true);
t('29.14 el móvil potente no pide ahorro', PERF.aparatoLento(nav(8, 8), win(3)) === false);
t('un móvil medio no pide ahorro', PERF.aparatoLento(nav(4, 4), win(2)) === false);
t('mucha densidad con pocos núcleos penaliza',
  PERF.puntuarAparato(nav(4, 4), win(3)) < PERF.puntuarAparato(nav(4, 4), win(2)));

t('se respeta la preferencia de menos movimiento',
  PERF.prefiereMenosMovimiento(win(2, true)) === true);
t('sin preferencia declarada no se fuerza',
  PERF.prefiereMenosMovimiento(win(2, false)) === false);
t('si matchMedia no existe no revienta',
  PERF.prefiereMenosMovimiento({}) === false);

localStorage.clear();
t('el modo por defecto es automático', PERF.leerModo() === 'auto');
t('un modo inválido no se guarda', PERF.guardarModo('turbo') === false);
t('tras el intento inválido sigue en auto', PERF.leerModo() === 'auto');
t('se puede forzar el modo ahorro', PERF.guardarModo('bajo') === true);
t('el modo forzado persiste', PERF.leerModo() === 'bajo');
t('29.14 forzar ahorro manda sobre el aparato',
  PERF.modoEfectivo('bajo', nav(8, 8), win(3)) === 'bajo');
t('forzar calidad manda sobre un aparato lento',
  PERF.modoEfectivo('alto', nav(2, 1), win(2)) === 'alto');
t('en automático un aparato lento va a ahorro',
  PERF.modoEfectivo('auto', nav(2, 1), win(2)) === 'bajo');
t('en automático un aparato potente va a calidad',
  PERF.modoEfectivo('auto', nav(8, 8), win(3)) === 'alto');
t('la descripción explica el modo activo',
  PERF.describir('bajo').includes('sombras'));
t('la descripción del automático menciona el aparato',
  /[Aa]utomático/.test(PERF.describir('auto')));

/* la clase CSS que apaga los efectos */
const cssT = leer('styles/tutorial.css');
t('29.14 el CSS define el modo bajo rendimiento', cssT.includes('body.perf-low'));
t('29.14 el modo bajo apaga las sombras', /perf-low[\s\S]*box-shadow:\s*none/.test(cssT));
t('29.14 el modo bajo esconde el público', cssT.includes('body.perf-low .publico'));
t('29.14 el modo bajo esconde las partículas', cssT.includes('.fx-particula'));
t('29.14 el modo bajo deja legibles las barras de vida',
  cssT.includes('body.perf-low .barra-vida i'));

/* ============ 3. SPLASH (28.14) ============ */
t('28.14 la pantalla de carga tiene arte', leer('js/screens/splash.js').includes('<svg'));
t('28.14 el arte es SVG inline, sin peticiones de red',
  !leer('js/screens/splash.js').includes('<img'));
t('28.14 hay un tiempo mínimo visible', SPLASH.MINIMO_VISIBLE_MS >= 500);
t('el splash no está visible al importarlo', SPLASH.visible() === false);
t('el arte dibuja el ring', leer('js/screens/splash.js').includes('cuerdas'));
t('el CSS del splash existe', cssT.includes('#splash'));
t('el splash se va con transición', cssT.includes('#splash.fuera'));

/* ============ 4. PWA: MANIFEST (28.09, 28.15) ============ */
t('28.15 existe el manifest', hay('manifest.json'));
const man = JSON.parse(leer('manifest.json'));
t('el manifest es JSON válido', typeof man === 'object');
t('28.15 el manifest declara display standalone', man.display === 'standalone');
t('28.09 el manifest bloquea la orientación vertical', man.orientation === 'portrait');
t('el manifest tiene nombre', man.name?.includes('Oro y Gloria'));
t('el manifest tiene nombre corto de 12 caracteres o menos',
  man.short_name && man.short_name.length <= 12);
t('el manifest declara el idioma español', man.lang === 'es');
t('30.10 todo el juego está en español', man.lang === 'es' && man.description?.length > 20);
t('el color de fondo es el tema oscuro', man.background_color === '#0e0e12');
t('el theme_color coincide con el del HTML', man.theme_color === '#0e0e12');
t('el start_url es relativo (funciona en subcarpeta)', man.start_url.startsWith('./'));
t('el scope es relativo', man.scope === './');

const iconos = man.icons || [];
t('28.15 el manifest declara iconos', iconos.length >= 3);
t('28.15 hay icono de 192', iconos.some(i => i.sizes === '192x192'));
t('28.15 hay icono de 512', iconos.some(i => i.sizes === '512x512'));
t('28.15 hay icono maskable para Android',
  iconos.some(i => i.purpose === 'maskable'));
t('todos los iconos declaran tipo PNG', iconos.every(i => i.type === 'image/png'));
t('todos los archivos de icono existen', iconos.every(i => hay(i.src)));
t('los iconos no están vacíos',
  iconos.every(i => statSync(join(RAIZ, i.src)).size > 500));
t('hay accesos directos a las zonas clave', (man.shortcuts || []).length >= 3);
t('los accesos directos apuntan a rutas del juego',
  man.shortcuts.every(s => /#(arena|eventos|coliseo)/.test(s.url)));

/* ============ 5. PWA: SERVICE WORKER (28.15) ============ */
t('28.15 existe el service worker', hay('service-worker.js'));
const sw = leer('service-worker.js');
t('el SW declara una versión', /const VERSION = 'og-v[\d.]+'/.test(sw));
t('Sug#2 la caché lleva la versión en el nombre', sw.includes('${VERSION}'));
t('28.15 el SW precachea en la instalación', sw.includes("addEventListener('install'"));
t('28.15 el SW intercepta las peticiones', sw.includes("addEventListener('fetch'"));
t('el SW limpia las cachés viejas', sw.includes("addEventListener('activate'"));
t('el SW borra solo sus propias cachés', sw.includes("k.startsWith('oro-y-gloria-')"));
t('el SW ignora peticiones que no son GET', sw.includes("req.method !== 'GET'"));
t('el SW ignora dominios externos', sw.includes('url.origin !== self.location.origin'));
t('28.15 el SW sirve la caché primero (abre sin internet)',
  sw.indexOf('cache.match(req') < sw.indexOf('await fetch(req)'));
t('el SW tiene respaldo para la navegación sin red',
  sw.includes("req.mode === 'navigate'"));
t('Sug#2 el SW no se salta la espera por su cuenta',
  !/install[\s\S]{0,400}self\.skipWaiting\(\)/.test(sw));
t('Sug#2 el SW espera la orden del jugador para actualizar',
  sw.includes("e.data === 'ACTUALIZAR_YA'") && sw.includes('self.skipWaiting()'));
t('el SW cachea archivo por archivo, tolerante a fallos',
  sw.includes('cache.add(') && !sw.includes('cache.addAll('));

/* el precache debe cubrir TODO el juego */
const enSW = [...sw.matchAll(/'\.\/([^']+)'/g)].map(m => m[1]);
const listar = (dir) => readdirSync(join(RAIZ, dir), { withFileTypes: true })
  .flatMap(d => d.isDirectory() ? listar(`${dir}/${d.name}`) : [`${dir}/${d.name}`]);
const jsReales = listar('js').filter(f => f.endsWith('.js'));
const cssReales = listar('styles').filter(f => f.endsWith('.css'));
const faltan = [...jsReales, ...cssReales].filter(f => !enSW.includes(f));
t('28.15 el precache incluye TODOS los .js del juego',
  faltan.filter(f => f.endsWith('.js')).length === 0);
t('28.15 el precache incluye TODAS las hojas de estilo',
  faltan.filter(f => f.endsWith('.css')).length === 0);
if (faltan.length) console.log('   faltan en el SW:', faltan.join(', '));
t('el precache incluye el index', enSW.includes('index.html'));
t('el precache incluye el manifest', enSW.includes('manifest.json'));
t('el precache incluye los iconos', enSW.some(f => f.includes('icon-512')));
t('el precache no lista archivos inexistentes',
  enSW.filter(f => !f.startsWith('assets/')).every(f => hay(f)));

/* ============ 6. INDEX.HTML (28.01, 28.09, 30.13) ============ */
const html = leer('index.html');
t('28.15 el HTML enlaza el manifest', html.includes('rel="manifest"'));
t('el HTML declara el icono', html.includes('rel="icon"'));
t('el HTML declara el icono de Apple', html.includes('apple-touch-icon'));
t('el HTML declara el theme-color', html.includes('name="theme-color"'));
t('el HTML declara el idioma español', html.includes('<html lang="es">'));
t('28.01 el viewport se adapta al dispositivo',
  html.includes('width=device-width') && html.includes('viewport-fit=cover'));
t('el HTML impide el zoom accidental', html.includes('user-scalable=no'));
t('el HTML declara el esquema oscuro', html.includes('content="dark"'));
t('el HTML enlaza el CSS del tutorial', html.includes('styles/tutorial.css'));
t('el HTML tiene descripción para compartir', html.includes('name="description"'));
t('28.09 hay aviso de girar el dispositivo', html.includes('rotate-lock'));
t('30.13 no hay pantalla de créditos', !/créditos|creditos/i.test(html));
t('el HTML carga el juego como módulo', html.includes('type="module"'));

/* todas las hojas enlazadas existen */
const cssEnlazados = [...html.matchAll(/href="(styles\/[^"]+)"/g)].map(m => m[1]);
t('todas las hojas enlazadas existen', cssEnlazados.every(f => hay(f)));
t('todas las hojas del proyecto están enlazadas',
  cssReales.every(f => cssEnlazados.includes(f)));

/* ============ 7. MAIN.JS: ARRANQUE COMPLETO ============ */
const main = leer('js/main.js');
t('la versión final es la 1.0.0', main.includes("VERSION = '1.0.0'"));
t('28.14 el arranque muestra la pantalla de carga', main.includes('splash.mostrar()'));
t('28.14 la pantalla de carga se retira al final', main.includes('await splash.ocultar()'));
t('29.14 el arranque aplica el modo de rendimiento', main.includes('PERF.aplicar()'));
t('01.14 el arranque lanza el tutorial si toca',
  main.includes('TUT.debeArrancar(S)') && main.includes('TUT.iniciarTutorial'));
t('28.15 el arranque registra el service worker',
  main.includes("navigator.serviceWorker.register('service-worker.js')"));
t('el SW no se registra al abrir el archivo en local',
  main.includes("location.protocol === 'file:'"));
t('Sug#2 hay aviso de nueva versión', main.includes('avisarActualizacion'));
t('Sug#2 el aviso solo salta si ya había una versión previa',
  main.includes('navigator.serviceWorker.controller'));
t('Sug#2 se guarda la partida antes de actualizar',
  main.includes("SAVE.guardar('antes-de-actualizar')"));
t('Sug#2 la recarga tras actualizar ocurre una sola vez',
  main.includes('recargando') && main.includes('controllerchange'));
t('la pantalla de perfil está registrada', main.includes("registrar('perfil'"));
t('27.01 el guardado automático queda conectado',
  main.includes('SAVE.conectarGuardadoAutomatico'));

/* ============ 8. ENCUESTA DE PRIORIDADES (30.15) ============ */
t('30.15 hay opciones para votar', VOTO.OPCIONES.length >= 4);
t('todas las opciones tienen id único',
  new Set(VOTO.OPCIONES.map(o => o.id)).size === VOTO.OPCIONES.length);
t('todas las opciones se explican',
  VOTO.OPCIONES.every(o => o.nombre && o.desc.length > 20 && o.ico));
t('30.15 se puede votar más eventos', VOTO.esOpcion('eventos'));
t('30.15 se puede votar tag team', VOTO.esOpcion('tagteam'));
t('30.15 se puede votar prestigio', VOTO.esOpcion('prestigio'));
t('una opción inventada no existe', VOTO.esOpcion('naves-espaciales') === false);

localStorage.clear();
t('se empieza sin voto', VOTO.votoActual() === null);
t('sin voto el texto lo dice', VOTO.textoVoto() === 'sin voto');
t('votar una opción falsa falla', VOTO.votar('naves').ok === false);
t('tras el voto falso sigue sin voto', VOTO.votoActual() === null);
t('30.15 votar funciona', VOTO.votar('tagteam').ok === true);
t('el voto persiste', VOTO.votoActual() === 'tagteam');
t('el voto se puede cambiar',
  (VOTO.votar('prestigio'), VOTO.votoActual() === 'prestigio'));
t('el texto del voto es legible', VOTO.textoVoto() === 'Prestigio');
t('un solo voto guardado a la vez', VOTO.OPCIONES.filter(o => VOTO.votoActual() === o.id).length === 1);
VOTO.borrarVoto();
t('se puede retirar el voto', VOTO.votoActual() === null);
// un valor basura en el almacén (versión vieja, manipulación) se ignora
localStorage.setItem(VOTO.CLAVE_VOTO, 'opcion-que-ya-no-existe');
t('un voto guardado que ya no existe se descarta', VOTO.votoActual() === null);
t('un voto descartado no rompe el texto', VOTO.textoVoto() === 'sin voto');
localStorage.removeItem(VOTO.CLAVE_VOTO);

/* ============ 9. PULIDO DEL PANEL (Grupo 10) ============ */
const panel = leer('js/screens/panel.js');
t('10.01 el panel tiene el botón de luchar', panel.includes('btn-fight'));
t('10.02 el panel muestra la mini-ficha', panel.includes('ministat'));
t('10.12 el panel avisa del próximo evento', panel.includes('pintarEvento'));
t('10.12 el aviso usa el calendario real', panel.includes('tiempoRestante'));
t('10.12 el contador del evento se actualiza solo', panel.includes('setInterval'));
t('10.12 el contador se limpia al salir del panel', panel.includes('clearInterval'));
t('10.13 el panel cuenta las misiones diarias', panel.includes('contadorPanel'));
t('29.09 el banco de pruebas solo se ve en desarrollo',
  panel.includes('DEV ? [') && panel.includes('if (!DEV) return;'));
t('el panel enlaza con el perfil', panel.includes("irA('perfil')"));

const layout = leer('styles/layout.css');
t('10.03 el HUD lleva las monedas', html.includes('hud-oro') && html.includes('hud-gemas'));
t('10.05 el poder va junto al nivel', html.includes('hud-poder'));
t('28.05 el marco está centrado y acotado', /#app[\s\S]{0,300}max-width/.test(layout));

/* ============ 10. AUTO-ESCALA Y TEXTO (28.01, 28.02, 28.12) ============ */
t('28.01 hay ajustes para pantallas pequeñas (360px)',
  cssT.includes('@media (max-width: 360px)'));
t('28.01 hay ajustes para pantallas bajas',
  cssT.includes('@media (max-height: 640px)'));
t('28.02 el texto se reduce en pantallas pequeñas',
  /max-width: 360px[\s\S]{0,300}--fs-base/.test(cssT));
t('28.12 la rejilla de estadísticas se adapta a 2 columnas',
  /max-width: 360px[\s\S]{0,400}grid-template-columns:repeat\(2/.test(cssT));

/* ============ 11. SUGERENCIA #4: MODO CAPTURA ============ */
const perfilJs = leer('js/screens/perfil.js');
t('Sug#4 hay modo captura', perfilJs.includes('modoCaptura'));
t('Sug#4 el modo captura oculta la interfaz', cssT.includes('body.capturando #hud'));
t('Sug#4 el modo captura oculta el menú', cssT.includes('body.capturando #menu'));
t('Sug#4 se puede salir del modo captura',
  perfilJs.includes("classList.remove('capturando')"));
t('el perfil ofrece cambiar el rendimiento', perfilJs.includes('PERF.guardarModo'));
t('el perfil permite repetir la guía', perfilJs.includes('TUT.reiniciarTutorial'));
t('el perfil muestra la encuesta', perfilJs.includes('VOTO.OPCIONES'));

/* ============ 12. CIERRE: EL JUEGO ESTÁ COMPLETO ============ */
t('existen las 12 pantallas del juego',
  listar('js/screens').filter(f => f.endsWith('.js')).length === 12);
t('están las 6 pestañas del menú',
  ['panel','arena','heroe','eventos','coliseo','tienda']
    .every(p => hay(`js/screens/${p}.js`)));
t('el README explica cómo ejecutarlo', hay('README.md'));
const readme = hay('README.md') ? leer('README.md') : '';
t('el README explica el arranque local', /python3 -m http\.server|servidor/i.test(readme));
t('el README avisa de que no vale abrir el archivo suelto',
  /file:|doble clic|no abras/i.test(readme));
t('el README documenta la estructura', readme.includes('js/systems'));

t('29.01 no hay sonido en todo el proyecto',
  !jsReales.some(f => /new Audio\(|\.play\(\)|AudioContext/.test(leer(f))));
t('no quedan frameworks: es HTML, CSS y JS puros',
  !html.includes('cdn') && !hay('package.json') && !hay('node_modules'));
t('el juego no depende de red externa',
  !html.includes('https://') || !/<script[^>]+https:/.test(html));

console.log(`\n${mal === 0 ? '✅' : '⚠️'} Paso 15: ${ok} correctas, ${mal} fallidas`);
process.exit(mal === 0 ? 0 : 1);
