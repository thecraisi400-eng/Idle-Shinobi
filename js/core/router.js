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
let paginaActual = 0;
let paginas = 1;
let observadorPantalla = null;
let recalculoPendiente = 0;

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
  prepararPaginacion(nodo);

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

  const pager = document.querySelector('#screen-pager');
  pager?.addEventListener('click', (e) => {
    const boton = e.target.closest('[data-page-action]');
    if (!boton) return;
    cambiarPagina(boton.dataset.pageAction === 'next' ? paginaActual + 1 : paginaActual - 1);
  });

  window.addEventListener('resize', solicitarRecalculo);

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

/*
 * Las vistas del juego pueden contener inventarios y estadísticas extensas.
 * En móvil se muestran como páginas de alto fijo, no como una columna que
 * obliga a hacer scroll. Así las fichas conservan tipografía y áreas táctiles
 * cómodas; las flechas hacen visible el siguiente tramo de la vista.
 */
function prepararPaginacion(root) {
  paginaActual = 0;
  paginas = 1;
  root.style.setProperty('--screen-page-offset', '0');
  observadorPantalla?.disconnect();
  if ('ResizeObserver' in window) {
    observadorPantalla = new ResizeObserver(solicitarRecalculo);
    observadorPantalla.observe(root);
  }
  requestAnimationFrame(recalcularPaginacion);
}

function solicitarRecalculo() {
  cancelAnimationFrame(recalculoPendiente);
  recalculoPendiente = requestAnimationFrame(recalcularPaginacion);
}

function recalcularPaginacion() {
  const cont = $('#screen');
  const root = cont?.firstElementChild;
  if (!cont || !root) return;
  const altoPagina = cont.clientHeight;
  if (!altoPagina) return;
  paginas = Math.max(1, Math.ceil(root.scrollHeight / altoPagina));
  paginaActual = Math.min(paginaActual, paginas - 1);
  aplicarPagina();
}

function cambiarPagina(destino) {
  paginaActual = Math.max(0, Math.min(destino, paginas - 1));
  aplicarPagina();
}

function aplicarPagina() {
  const cont = $('#screen');
  const root = cont?.firstElementChild;
  const pager = document.querySelector('#screen-pager');
  if (!cont || !root || !pager) return;
  root.style.setProperty('--screen-page-offset', String(paginaActual * cont.clientHeight));
  pager.hidden = paginas < 2;
  const status = document.querySelector('#screen-page-status');
  if (status) status.textContent = `${paginaActual + 1} / ${paginas}`;
  const previo = pager.querySelector('[data-page-action="prev"]');
  const siguiente = pager.querySelector('[data-page-action="next"]');
  if (previo) previo.disabled = paginaActual === 0;
  if (siguiente) siguiente.disabled = paginaActual >= paginas - 1;
}
