/* PANEL PRINCIPAL (Grupo 10) — ya leyendo del GameState real */

import { el, toast } from '../core/dom.js';
import { ir } from '../core/router.js';
import { fmt, fmtLargo, hms } from '../core/format.js';
import { on } from '../core/events-bus.js';
import {
  S, ganarOro, ganarGemas, ganarXP, mejorarStat, costeStat,
  topeStat, xpNecesaria, registrarResultado, tiempoJugado, DEV
} from '../core/state.js';
import { poderProvisional } from '../core/hud.js';
import { CLASES } from '../data/clases.js';
import { ir as irA } from '../core/router.js';
import * as QUESTS from '../systems/quests.js';
import { tiempoRestante } from '../systems/event-scheduler.js';

export function render(root) {
  const misionesBox = el('div');
  const eventoBox = el('div');
  // Sin clase elegida: el panel invita a crear el luchador (Paso 3)
  if (!S.perfil.clase) {
    root.append(
      el('div.empty', {},
        el('div.em-ico', { text: '🎭' }),
        el('h2', { text: 'Crea tu luchador' }),
        el('p', { text: 'Antes de pisar el ring debes elegir tu clase y subclase. Es una decisión permanente que definirá todo tu estilo de lucha.' }),
        el('button.btn.primary.block', { style:{marginTop:'18px'}, onclick: () => irA('heroe') }, 'Elegir clase')
      )
    );
    return;
  }

  const cl = CLASES[S.perfil.clase];
  const stage = el('div.hero-stage', {},
    el('div.hero-body', { text: cl.ico }),
    el('div.hero-rank', { text: `${cl.nombre} · Rango ${S.perfil.rango} · División ${S.progreso.division}` })
  );

  const ficha = el('div.card');
  const carrera = el('div.card');
  const diag = el('div.card');

  root.append(
    stage,
    el('div.sec-title', { text: 'Tu luchador' }), ficha,
    el('button.btn-fight', {
      style: { marginTop: '16px' },
      onclick: () => irA(S.progreso.rivalActual ? 'arena' : 'seleccion')
    }, 'Luchar'),
    el('div.accesos', {},
      el('button.btn.sm', { onclick: () => irA('equipo') }, '🎒 Equipo'),
      el('button.btn.sm', { onclick: () => irA('arbol') }, '🌳 Árbol'),
      el('button.btn.sm', { onclick: () => irA('especiales') }, '⭐ Especiales'),
      el('button.btn.sm', { onclick: () => irA('seleccion') }, '⚔️ Rivales'),
      el('button.btn.sm', { onclick: () => irA('perfil') }, '👤 Perfil')
    ),
    // 10.12 próximo evento · 10.13 contador de misiones
    eventoBox,
    misionesBox,
    el('div.sec-title', { text: 'Carrera' }), carrera,
    // El banco de pruebas solo se ve en desarrollo (29.09: sin panel de debug)
    ...(DEV ? [el('div.sec-title', { text: '🔧 Banco de pruebas' }), diag] : [])
  );

  /** 10.12 — qué evento hay ahora o cuándo empieza el siguiente. */
  const pintarEvento = () => {
    const t = tiempoRestante();
    const ev = t.franja?.evento;
    eventoBox.replaceChildren(
      el(`div.card.mis-panel${t.activo ? '.ev-vivo' : ''}`, { onclick: () => irA('eventos') },
        el('span', { text: ev?.ico || '🏟️' }),
        el('div', {},
          el('b', { text: t.activo ? `En directo: ${ev?.nombre || 'evento'}` : `Siguiente: ${ev?.nombre || 'evento'}` }),
          el('small', { text: t.activo ? `Termina en ${hms(t.ms)}` : `Empieza en ${hms(t.ms)}` })
        ),
        el('span.fr-chevron', { text: '›' })
      )
    );
  };

  const pintarMisiones = () => {
    const c = QUESTS.contadorPanel();
    misionesBox.replaceChildren(
      el('div.card.mis-panel', { onclick: () => irA('perfil') },
        el('span', { text: '📋' }),
        el('div', {},
          el('b', { text: `Misiones diarias ${c.texto}` }),
          el('small', { text: c.listas > 0 ? `¡${c.listas} lista(s) para cobrar!` : 'Toca para ver tus objetivos de hoy' })
        ),
        c.listas > 0 ? el('span.mis-badge', { text: String(c.listas) }) : el('span.fr-chevron', { text: '›' })
      )
    );
  };

  const pintarFicha = () => {
    ficha.replaceChildren(
      el('div.ministats', {},
        ministat('💪', 'Potencia', S.stats.potencia),
        ministat('🛡️', 'Aguante',  S.stats.aguante),
        ministat('🎯', 'Técnica',  S.stats.tecnica),
        ministat('🌀', 'Agilidad', S.stats.agilidad)
      ),
      fila('⚡ Poder total', fmt(poderProvisional()), 'var(--oro)'),
      fila('🎚️ Tope de stat actual', topeStat()),
      fila('🎓 Puntos libres', S.perfil.puntosLibres),
      fila('🌳 Puntos de árbol', S.perfil.puntosArbol),
      fila('📊 XP', `${fmtLargo(S.perfil.xp)} / ${fmtLargo(xpNecesaria())}`)
    );
  };

  const pintarCarrera = () => {
    const c = S.carrera;
    carrera.replaceChildren(
      fila('🏆 Victorias / Derrotas', `${c.victorias} — ${c.derrotas}`),
      fila('🔥 Mejor racha', c.mejorRacha),
      fila('🪙 Oro ganado en total', fmt(c.oroGanado)),
      fila('💎 Gemas ganadas', fmt(c.gemasGanadas)),
      fila('⏱️ Tiempo jugado', hms(tiempoJugado() / 1000))
    );
  };

  // Banco de pruebas: valida estado + bus + formato + costes reales
  const pintarDiag = () => {
    if (!DEV) return;
    diag.replaceChildren(
      el('p.card-sub', { text: 'Botones temporales para comprobar que el estado, el bus de eventos y la notación numérica funcionan. Desaparecen en el Paso 8.' }),
      el('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' } },
        el('button.btn.sm', { onclick: () => { ganarOro(250, 'test'); toast('+250 de oro', 'ok'); } }, '🪙 +250 oro'),
        el('button.btn.sm', { onclick: () => { ganarOro(1_250_000, 'test'); toast('+1.25M de oro', 'ok'); } }, '🪙 +1.25M'),
        el('button.btn.sm', { onclick: () => { ganarGemas(3, 'test'); toast('+3 gemas', 'ok'); } }, '💎 +3 gemas'),
        el('button.btn.sm', { onclick: () => { ganarXP(160); toast('+160 XP', 'ok'); } }, '📊 +160 XP'),
        el('button.btn.sm', {
          onclick: () => {
            const c = costeStat('potencia');
            mejorarStat('potencia')
              ? toast(`Potencia +1 por ${fmt(c)} de oro`, 'ok')
              : toast('Oro insuficiente o tope alcanzado', 'bad');
          }
        }, `💪 Subir potencia`),
        el('button.btn.sm', { onclick: () => { registrarResultado(true); toast('Victoria registrada', 'ok'); } }, '🏆 Victoria'),
        el('button.btn.sm', { onclick: () => { registrarResultado(false); toast('Derrota registrada', 'bad'); } }, '💀 Derrota'),
        el('button.btn.sm', { onclick: probarNotacion }, '🔢 Ver notación')
      )
    );
  };

  QUESTS.sincronizar();
  pintarFicha(); pintarCarrera(); pintarDiag(); pintarMisiones(); pintarEvento();

  // el contador del próximo evento avanza solo
  const reloj = setInterval(() => {
    if (!document.body.contains(eventoBox)) return clearInterval(reloj);
    pintarEvento();
  }, 1000);

  // Reacción a eventos del bus (sin re-renderizar la pantalla entera)
  on('stat:change', pintarFicha);
  on('xp:change', pintarFicha);
  on('nivel:up', () => { pintarFicha(); toast(`¡Nivel ${S.perfil.nivel}! +3 puntos libres`, 'ok'); });
  on('oro:change', pintarDiag);
  on('carrera:change', pintarCarrera);
  on('gemas:change', pintarCarrera);
}

function probarNotacion() {
  const muestras = [999, 12400, 3_200_000, 1.8e9, 4.5e12, 7.7e15, 6.1e18, 9.9e33];
  toast(muestras.map(n => fmt(n)).join(' · '), 'info', 5000);
  console.table(muestras.map(n => ({ crudo: n, formateado: fmt(n) })));
}

function ministat(ico, nombre, valor) {
  return el('div.ministat', {},
    el('span.ms-ico', { text: ico }),
    el('div', {}, el('span.ms-k', { text: nombre }), el('span.ms-v', { text: valor }))
  );
}

function fila(k, v, color) {
  return el('div.row', {},
    el('span.k', { text: k }),
    el('span.v', { text: String(v), style: color ? { color } : {} })
  );
}
