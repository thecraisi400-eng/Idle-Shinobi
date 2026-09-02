/* ===== HUD superior — conectado al GameState (Paso 2) =====
   Se actualiza SOLO por eventos del bus: nada de re-renderizar pantallas. */

import { $ } from './dom.js';
import { fmt } from './format.js';
import { on } from './events-bus.js';
import { S, xpPct } from './state.js';
import { poder } from '../systems/power.js';
import { aplicarClase } from '../data/clases.js';

export function pintarHUD() {
  if (!S) return;
  set('#hud-name',  S.perfil.nombre);
  set('#hud-nivel', S.perfil.nivel);
  set('#hud-poder', fmt(poderProvisional()));
  set('#hud-oro',   fmt(S.monedas.oro));
  set('#hud-gemas', fmt(S.monedas.gemas));
  const fill = $('#xpbar-fill');
  if (fill) fill.style.width = `${xpPct()}%`;
}

/** Índice de Poder real (Paso 3, 03.14). */
export function poderProvisional() {
  if (!S) return 0;
  const st = S.perfil.clase
    ? aplicarClase(S.stats, S.perfil.clase, S.perfil.subclase)
    : S.stats;
  return poder(st);
}

export function pulsoMoneda(cual = 'oro') {
  const nodo = $(cual === 'oro' ? '.coin-oro' : '.coin-gema');
  if (!nodo) return;
  nodo.classList.remove('bump');
  void nodo.offsetWidth;
  nodo.classList.add('bump');
}

/** Suscribe el HUD a todos los cambios relevantes del estado. */
export function conectarHUD() {
  on('oro:change',   () => { pintarHUD(); pulsoMoneda('oro'); });
  on('gemas:change', () => { pintarHUD(); pulsoMoneda('gemas'); });
  on('xp:change',    pintarHUD);
  on('nivel:up',     pintarHUD);
  on('stat:change',  pintarHUD);
  on('perfil:change',pintarHUD);
  on('hud:refresh',  pintarHUD);
  on('estado:listo', pintarHUD);
  pintarHUD();
}

function set(sel, valor) {
  const n = $(sel);
  if (n && n.textContent !== String(valor)) n.textContent = valor;
}

export { fmt };
