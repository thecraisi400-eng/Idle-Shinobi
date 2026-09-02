/* ===== ORO Y GLORIA — arranque =====
   PASO 1: shell navegable de 6 pestañas.
   PASO 2: GameState, notación numérica, RNG con semilla, bus de eventos. */

import { registrar, iniciarRouter, marcarNovedad, ir } from './core/router.js';
import { conectarHUD } from './core/hud.js';
import { toast } from './core/dom.js';
import { iniciarEstado, S, sellarTiempo, DEV } from './core/state.js';
import * as SAVE from './systems/save.js';
import * as ACH from './systems/achievements.js';
import * as Q from './systems/quests.js';
import * as bus from './core/events-bus.js';
import { META } from './data/constants.js';
import { fmt } from './core/format.js';

import * as panel   from './screens/panel.js';
import * as arena   from './screens/arena.js';
import * as heroe   from './screens/heroe.js';
import * as eventos from './screens/eventos.js';
import * as coliseo from './screens/coliseo.js';
import * as tienda  from './screens/tienda.js';
import * as especiales from './screens/especiales.js';
import * as seleccion  from './screens/seleccion.js';
import * as equipo     from './screens/equipo.js';
import * as arbol      from './screens/arbol.js';
import * as perfil     from './screens/perfil.js';

import * as splash from './screens/splash.js';
import * as TUT from './systems/tutorial.js';
import * as PERF from './systems/perf.js';

const VERSION = '1.0.0';

async function iniciar() {
  // 28.14 la pantalla de carga aparece antes que nada
  splash.mostrar();

  PERF.aplicar();                      // 29.14 modo bajo rendimiento

  // 1) Estado: se intenta cargar la partida guardada (27.01)
  iniciarEstado();
  if (SAVE.hayPartida()) {
    const r = SAVE.cargar({ respaldar: false });
    if (!r.ok) console.warn('[save] no se pudo cargar:', r.motivo);
  }
  splash.estado('Recuperando tu carrera…');
  perfil.inicializarSesion();          // Sugerencia #5 del P14: foto de sesión
  Q.sincronizar();                     // 30.02/30.03 misiones del día
  ACH.revisar();                       // 30.01 logros ya cumplidos

  // 2) HUD suscrito al bus
  conectarHUD();

  // 3) Pantallas
  registrar('panel',   panel.render,   { cacheable: false });
  registrar('arena',   arena.render);
  registrar('heroe',   heroe.render);
  registrar('eventos', eventos.render, { cacheable: false });
  registrar('coliseo', coliseo.render, { cacheable: false });
  registrar('tienda',  tienda.render, { cacheable: false });
  registrar('especiales', especiales.render, { cacheable: false });
  registrar('seleccion',  seleccion.render,  { cacheable: false });
  registrar('equipo',     equipo.render,     { cacheable: false });
  registrar('arbol',      arbol.render,      { cacheable: false });
  registrar('perfil',     perfil.render,     { cacheable: false });

  splash.estado('Abriendo el pabellón…');
  iniciarRouter('panel');
  marcarNovedad('eventos', true);

  // 27.01 / 27.11 la triple red: heartbeat + eventos + cierre
  SAVE.conectarGuardadoAutomatico(bus);

  // Los logros se revisan tras cada suceso relevante
  for (const ev of ['combate:fin', 'nivel:subida', 'oro:change', 'equipo:cambio',
                    'pvp:fin', 'evento:fin', 'tienda:compra']) {
    bus.on(ev, () => ACH.revisar());
  }

  // Sella el tiempo jugado al salir o cambiar de app
  document.addEventListener('visibilitychange', () => { if (document.hidden) sellarTiempo(); });
  window.addEventListener('pagehide', sellarTiempo);

  console.log(`%c🥊 ${META.NOMBRE_JUEGO} v${VERSION}`, 'color:#e8b64c;font-weight:bold');
  console.log('Semilla de la partida:', S.meta.semilla, '· Oro:', fmt(S.monedas.oro));
  if (DEV) window.OG = { S, fmt };   // consola de depuración

  // 4) Fuera la pantalla de carga y, si toca, arranca el tutorial (01.14)
  await splash.ocultar();
  if (TUT.debeArrancar(S)) {
    TUT.iniciarTutorial({ navegar: (p) => ir(p) });
  }

  registrarServiceWorker();
}

/* ===== PWA: service worker + aviso de actualización (28.15, Sug#2) ===== */
function registrarServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol === 'file:') return;   // no funciona abriendo el archivo

  navigator.serviceWorker.register('service-worker.js').then((reg) => {
    // Si ya hay una versión esperando, avisamos de inmediato
    if (reg.waiting) avisarActualizacion(reg.waiting);

    reg.addEventListener('updatefound', () => {
      const nuevo = reg.installing;
      if (!nuevo) return;
      nuevo.addEventListener('statechange', () => {
        // Solo es "actualización" si ya había un SW controlando la página
        if (nuevo.state === 'installed' && navigator.serviceWorker.controller) {
          avisarActualizacion(nuevo);
        }
      });
    });
  }).catch(err => console.warn('[pwa] no se pudo registrar el SW:', err));

  // Cuando el SW nuevo toma el control, se recarga una sola vez
  let recargando = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (recargando) return;
    recargando = true;
    location.reload();
  });
}

/** Sugerencia #2: nada de infierno de caché — el jugador decide cuándo. */
function avisarActualizacion(worker) {
  if (document.getElementById('actualizacion')) return;

  const caja = document.createElement('div');
  caja.id = 'actualizacion';
  caja.innerHTML = `
    <span>🎁</span>
    <div class="act-txt">
      <b>Nueva versión disponible</b>
      <small>Tu progreso está a salvo, se guarda antes de recargar.</small>
    </div>
    <button class="btn primary sm">Actualizar</button>`;

  caja.querySelector('button').addEventListener('click', () => {
    SAVE.guardar('antes-de-actualizar');    // el progreso primero
    worker.postMessage('ACTUALIZAR_YA');
    caja.remove();
  });

  document.body.appendChild(caja);
}

document.addEventListener('DOMContentLoaded', iniciar);
