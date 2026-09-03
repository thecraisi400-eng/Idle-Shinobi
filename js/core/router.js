/* ===== ROUTER de pantallas =====
   - Cambio con fundido (28.11)
   - Integrado con history.pushState → el botón ATRÁS de Android
     vuelve a la pestaña previa en vez de cerrar el juego (Sugerencia #1)
   - Caché de nodos ya renderizados (Sugerencia #5) */

import { $, $$ } from './dom.js';

const rutas = new Map();
const cache = new Map();
let actual = null;
let navegando = false;

export function registrar(nombre, render, opciones = {}) {
  rutas.set(nombre, { render, cacheable: opciones.cacheable !== false });
}

export function pantallaActual() { return actual; }

/** Repinta la pantalla activa (invalida su caché). */
export function refrescar(nombre = actual) {
  cache.delete(nombre);
  if (nombre === actual) ir(nombre, { push: false, animar: false });
}

export async function ir(nombre, { push = true, animar = true } = {}) {
  if (!rutas.has(nombre) || navegando) return;
  if (nombre === actual && animar) return;
  navegando = true;

  const cont = $('#screen');
  const ruta = rutas.get(nombre);

  if (animar && actual) {
    cont.classList.remove('fade-in');
    cont.classList.add('fade-out');
    await esperar(140);
  }

  // Vaciar sin destruir nodos cacheados
  cont.replaceChildren();

  let nodo = ruta.cacheable ? cache.get(nombre) : null;
  if (!nodo) {
    nodo = document.createElement('div');
    nodo.className = 'screen-root';
    await ruta.render(nodo);
    if (ruta.cacheable) cache.set(nombre, nodo);
  }
  cont.append(nodo);
  cont.classList.remove('fade-out');
  cont.classList.add('fade-in');

  actual = nombre;
  marcarTab(nombre);

  if (push) {
    const url = `#${nombre}`;
    if (location.hash !== url) history.pushState({ pantalla: nombre }, '', url);
  }

  navegando = false;
  window.dispatchEvent(new CustomEvent('pantalla:cambio', { detail: nombre }));
}

function marcarTab(nombre) {
  $$('#menu .tab').forEach(t => {
    const on = t.dataset.screen === nombre;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', on ? 'true' : 'false');
  });
}

/** Muestra u oculta el punto rojo de novedad de una pestaña (Sugerencia #3). */
export function marcarNovedad(nombre, activo = true) {
  const tab = document.querySelector(`#menu .tab[data-screen="${nombre}"] .dot-new`);
  if (tab) tab.hidden = !activo;
}

export function iniciarRouter(inicial = 'panel') {
  $$('#menu .tab').forEach(tab => {
    tab.addEventListener('click', () => ir(tab.dataset.screen));
  });

  window.addEventListener('popstate', e => {
    const destino = e.state?.pantalla || (location.hash || '').slice(1) || inicial;
    if (rutas.has(destino)) ir(destino, { push: false });
  });

  const hash = (location.hash || '').slice(1);
  const arranque = rutas.has(hash) ? hash : inicial;
  history.replaceState({ pantalla: arranque }, '', `#${arranque}`);
  ir(arranque, { push: false, animar: false });
}

const esperar = ms => new Promise(r => setTimeout(r, ms));
