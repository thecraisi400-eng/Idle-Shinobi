/* PANTALLA EVENTOS — Paso 11
   19.05 inscripción con un botón · 19.12 tarjeta de reglas al entrar
   19.10 clasificación en vivo con brechas · 20.13 cronómetro visible
   20.14 botón salir · 21.10 tabla visible antes de inscribirse
   21.11 premios al cerrar · 21.12 resumen final con tu puntaje
   Sugerencias: #1 aviso previo · #2 estrella de afinidad · #3 nombres
   procedurales · #4 objetivo personal · #5 calendario semanal */

import { el, toast } from '../core/dom.js';
import { fmt, hms, mmss } from '../core/format.js';
import { on, emit } from '../core/events-bus.js';
import { S, ganarOro, ganarGemas } from '../core/state.js';
import { EVENTOS } from '../data/constants.js';
import {
  TIPOS_EVENTO, premioDePuesto, bolsaDelEvento, premioParticipacion, PIRAMIDE
} from '../data/eventos.js';
import * as SCH from '../systems/event-scheduler.js';
import * as LB from '../systems/leaderboard.js';
import { correrIntento, resumenIntento } from '../systems/event-runner.js';
import { heroeDesdeEstado } from '../systems/fighter.js';

let vista = 'hoy';           // 'hoy' | 'semana'
let cronoTimer = null;

export function render(root) {
  const avisoBox  = el('div');
  const cronoBox  = el('div.card');
  const tabsBox   = el('div.ev-tabs');
  const cuerpo    = el('div');

  const pintarTabs = () => {
    tabsBox.replaceChildren(
      el(`button.chip${vista === 'hoy' ? '.ok' : ''}`, {
        onclick: () => { vista = 'hoy'; refrescar(); } }, '📅 Hoy'),
      el(`button.chip${vista === 'semana' ? '.ok' : ''}`, {
        onclick: () => { vista = 'semana'; refrescar(); } }, '🗓️ Semana')
    );
  };

  /* ---------- Sugerencia #1: aviso de evento inminente ---------- */
  const pintarAviso = () => {
    const av = SCH.avisosProximos(S.stats, Date.now(), 10);
    avisoBox.replaceChildren(av
      ? el('div.aviso-build', {},
          el('span.ab-ico', { text: av.brilla ? '⭐' : '🔔' }),
          el('p', {}, `${av.franja.evento.ico} ${av.franja.evento.nombre} empieza en ${av.minutos} min.`,
            av.brilla ? el('b', { text: ' ¡Tu build brilla aquí!' }) : null))
      : el('span'));
  };

  /* ---------- 20.13 cronómetro siempre visible ---------- */
  const pintarCrono = () => {
    const t = SCH.tiempoRestante();
    const f = t.franja;
    const ev = f.evento;
    const dom = SCH.esDomingo();

    cronoBox.replaceChildren(
      el('div.crono', { style: { borderColor: ev.color } },
        el('div.crono-ico', { style: { background: ev.color + '22' }, text: ev.ico }),
        el('div.crono-info', {},
          el('small', { text: t.activo ? 'EN CURSO AHORA' : 'PRÓXIMO EVENTO' }),
          el('b', { style: { color: ev.color }, text: ev.nombre }),
          el('small.crono-lema', { text: ev.lema })
        ),
        el('div.crono-t', {},
          el('small', { text: t.activo ? 'termina en' : 'empieza en' }),
          el('b.crono-num', { text: hms(t.ms / 1000) })
        )
      ),
      dom ? el('div.domingo', { text: '🎉 DOMINGO: todos los premios valen el doble' }) : null
    );
  };

  /* ---------- Vista HOY: las 7 franjas ---------- */
  const pintarHoy = () => {
    const agenda = SCH.agendaDelDia();
    const ahora = Date.now();
    const activa = agenda.find(f => ahora >= f.inicio && ahora < f.fin);

    cuerpo.replaceChildren(
      el('div.sec-title', { text: 'La rueda de hoy' }),
      el('p.card-sub', { text: '7 eventos de 3 horas, de 00:00 a 21:00. El orden cambia cada día.' }),
      ...agenda.map(f => tarjetaFranja(f, ahora, activa)),
      historial()
    );
  };

  const tarjetaFranja = (f, ahora, activa) => {
    const ev = f.evento;
    const enCurso = activa?.indice === f.indice;
    const pasado = ahora >= f.fin;
    const brilla = SCH.brillaAqui(f.id, S.stats);   // Sugerencia #2

    return el(`div.franja${enCurso ? '.activa' : ''}${pasado ? '.pasada' : ''}`, {
      style: enCurso ? { borderColor: ev.color } : {},
      onclick: () => abrirEvento(f, enCurso)
    },
      el('div.fr-hora', {},
        el('b', { text: f.etiqueta.split(' – ')[0] }),
        el('small', { text: pasado ? 'terminado' : enCurso ? 'AHORA' : 'próximo' })
      ),
      el('div.fr-ico', { style: { color: ev.color }, text: ev.ico }),
      el('div.fr-info', {},
        el('b', {}, ev.nombre, brilla ? el('span.estrella', { text: ' ⭐' }) : null),
        el('small', { text: ev.lema })
      ),
      el('span.fr-chevron', { text: '›' })
    );
  };

  /* ---------- Sugerencia #5: calendario semanal ---------- */
  const pintarSemana = () => {
    const cal = SCH.calendarioSemanal();
    cuerpo.replaceChildren(
      el('div.sec-title', { text: 'Calendario de la semana' }),
      el('p.card-sub', { text: 'Planifica a qué hora conectarte. La estrella marca los eventos donde tu build rinde mejor.' }),
      ...cal.map(d =>
        el('div.card.dia-card', {},
          el('div.dia-hd', {},
            el('b', { text: d.nombreDia }),
            d.esDomingo ? el('span.chip.ok', { text: 'x2 premios' }) : null
          ),
          el('div.dia-grid', {}, ...d.franjas.map(f => {
            const brilla = SCH.brillaAqui(f.id, S.stats);
            return el('div.dia-celda', { style: { borderColor: f.evento.color }, title: f.evento.nombre },
              el('small', { text: String(f.horaInicio).padStart(2, '0') }),
              el('span', { text: f.evento.ico }),
              brilla ? el('i.mini-estrella', { text: '⭐' }) : null
            );
          }))
        )
      )
    );
  };

  /* ---------- Detalle de un evento ---------- */
  const abrirEvento = (franja, enCurso) => {
    const ev = franja.evento;
    const dia = franja.dia;
    const inscrito = S.eventos.inscrito === franja.id && S.eventos.diaSemilla === dia;
    const intentos = inscrito ? S.eventos.intentos : 0;
    const puntaje = inscrito ? S.eventos.puntaje : 0;
    const restantes = EVENTOS.INTENTOS - intentos;

    // 21.10 la tabla se ve ANTES de inscribirse
    const tablaCPU = LB.generarTabla(franja.id, { dia, nivelHeroe: S.perfil.nivel });
    const clasif = LB.clasificar(tablaCPU, puntaje, S.perfil.nombre);
    const obj = LB.objetivoPersonal(clasif, restantes, puntaje);
    const multDom = SCH.multiplicadorDia();

    cuerpo.replaceChildren(
      el('button.btn.sm', { onclick: () => refrescar() }, '‹ Volver a la rueda'),

      // 19.12 tarjeta visual de reglas
      el('div.card.ev-detalle', { style: { borderColor: ev.color } },
        el('div.evd-top', {},
          el('span.evd-ico', { style: { borderColor: ev.color }, text: ev.ico }),
          el('div', {},
            el('b', { style: { color: ev.color }, text: ev.nombre }),
            el('small', { text: ev.lema }),
            el('div.evd-chips', {},
              el('span.chip', { text: franja.etiqueta }),
              enCurso ? el('span.chip.ok', { text: 'EN CURSO' }) : el('span.chip', { text: 'cerrado' }),
              SCH.brillaAqui(franja.id, S.stats) ? el('span.chip.ok', { text: '⭐ Tu build brilla' }) : null
            )
          )
        ),
        el('div.sec-mini', { text: '📋 Reglas' }),
        el('ul.reglas', {}, ...ev.reglas.map(r => el('li', { text: r }))),
        el('div.sec-mini', { text: '🏆 Premios (top 10, pirámide)' }),
        el('div.premios', {}, ...PIRAMIDE.slice(0, 5).map(p => {
          const pr = premioDePuesto(p.puesto, S.perfil.nivel, multDom);
          return el('div.premio-fila', {},
            el('span', { text: `${p.puesto}º` }),
            el('b', { text: `🪙 ${fmt(pr.oro)}` }),
            el('b', { style:{color:'#7fd8ff'}, text: `💎 ${pr.gemas}` })
          );
        })),
        el('p.card-sub', {},
          `Puestos 6º a 10º cobran menos. Todos los participantes reciben `,
          el('b', { text: `🪙 ${fmt(premioParticipacion(S.perfil.nivel) * multDom)}` }), '.'),

        // 19.05 inscripción gratis con un botón
        !enCurso
          ? el('p.card-sub', { style:{color:'var(--txt-3)'}, text: 'Este evento no está activo ahora mismo.' })
          : !inscrito
            ? el('button.btn.primary.block', {
                onclick: () => inscribir(franja)
              }, '✍️ Inscribirme (gratis)')
            : el('div', {},
                el('div.intentos', {},
                  el('span', { text: `Intentos: ${restantes} de ${EVENTOS.INTENTOS}` }),
                  el('b', { text: `Tu mejor puntaje: ${fmt(puntaje)}` })
                ),
                // Sugerencia #4: objetivo personal
                obj ? el(`div.objetivo${obj.enPremios ? '.ok' : ''}`, { text: obj.texto }) : null,
                restantes > 0
                  ? el('button.btn.primary.block', {
                      onclick: () => jugarIntento(franja)
                    }, `🥊 Jugar intento (${restantes} restantes)`)
                  : el('button.btn.block', { disabled: true }, 'Sin intentos: espera al cierre'),
                // 20.14 botón salir
                el('button.btn.sm.block', {
                  style:{marginTop:'8px'},
                  onclick: () => salir(franja)
                }, '🚪 Salir del evento'),
                el('button.btn.sm.block', {
                  style:{marginTop:'6px'},
                  onclick: () => cobrar(franja, clasif)
                }, '🏁 Cerrar y cobrar premios')
              )
      ),

      // 19.10 clasificación en vivo con brechas
      tablaClasificacion(clasif)
    );
  };

  const tablaClasificacion = (clasif) => {
    const b = LB.brechas(clasif);
    const yo = clasif.findIndex(f => f.esJugador);
    // ventana alrededor del jugador + top 10
    const top = clasif.slice(0, EVENTOS.PREMIADOS);
    const cerca = clasif.slice(Math.max(EVENTOS.PREMIADOS, yo - 2), yo + 3);
    const mostrar = [...top, ...cerca.filter(f => !top.includes(f))];

    return el('div.card', {},
      el('div.card-hd', {},
        el('h3', { text: '📊 Clasificación en vivo' }),
        el('span.chip', { text: `${clasif.length} competidores` })
      ),
      b ? el('p.card-sub', {},
        b.arriba ? `A ${b.arriba.diff} puntos del ${b.puesto - 1}º. ` : 'Vas primero. ',
        b.abajo ? `Te persiguen a ${b.abajo.diff}.` : '') : null,
      el('div.tabla', {}, ...mostrar.map(f =>
        el(`div.tb-fila${f.esJugador ? '.yo' : ''}${f.puesto <= EVENTOS.PREMIADOS ? '.premiado' : ''}`, {},
          el('span.tb-p', { text: `${f.puesto}º` }),
          el('span.tb-ico', { text: f.ico }),
          el('span.tb-nom', { text: f.nombre }),
          el('b.tb-pts', { text: fmt(f.puntos) })
        )
      ))
    );
  };

  /* ---------- Acciones ---------- */
  const inscribir = (franja) => {
    S.eventos.inscrito = franja.id;
    S.eventos.diaSemilla = franja.dia;
    S.eventos.intentos = 0;
    S.eventos.puntaje = 0;
    toast(`Inscrito en ${franja.evento.nombre}`, 'ok');
    abrirEvento(franja, true);
  };

  const jugarIntento = (franja) => {
    const heroe = heroeDesdeEstado();
    const r = correrIntento(franja.id, heroe, {
      semilla: Date.now() + S.eventos.intentos,
      nivelHeroe: S.perfil.nivel,
      statsHeroe: S.stats
    });
    S.eventos.intentos++;
    S.carrera.eventosJugados++;
    const mejora = r.puntos > S.eventos.puntaje;
    if (mejora) S.eventos.puntaje = r.puntos;

    mostrarResultado(franja, r, mejora);
  };

  /* ---------- 21.12 resumen del intento ---------- */
  const mostrarResultado = (franja, r, mejora) => {
    const ev = franja.evento;
    cuerpo.replaceChildren(
      el('div.card.resultado-ev', { style:{ borderColor: ev.color } },
        el('h3', { style:{textAlign:'center'}, text: `${ev.ico} ${ev.nombre}` }),
        el('div.puntaje-grande', { style:{ color: ev.color }, text: fmt(r.puntos) }),
        el('p.card-sub', { style:{textAlign:'center'}, text: resumenIntento(r) }),
        mejora
          ? el('div.mejora-badge', { text: '🎉 ¡Nuevo mejor puntaje!' })
          : el('p.card-sub', { style:{textAlign:'center'}, text: `Tu mejor sigue siendo ${fmt(S.eventos.puntaje)}.` }),

        el('div.sec-mini', { text: 'Desglose lucha a lucha' }),
        el('div.desglose', {}, ...r.luchas.map(l =>
          el(`div.dg-fila${l.gano ? '.gano' : '.perdio'}`, {},
            el('span.dg-n', { text: `${l.indice + 1}` }),
            el('span.dg-ico', { text: l.ico }),
            el('div.dg-info', {},
              el('b', {}, l.rival, l.esJefe ? el('span', { text: ' 💀' }) : null),
              el('small', { text: `${l.gano ? 'Victoria' : 'Derrota'} · ${mmss(l.duracion)}` })
            ),
            el('b.dg-pts', { style:{ color: l.puntos ? 'var(--ok)' : 'var(--txt-3)' },
                             text: `+${fmt(l.puntos)}` })
          )
        )),
        el('button.btn.primary.block', {
          style:{marginTop:'12px'},
          onclick: () => abrirEvento(franja, true)
        }, 'Volver al evento')
      )
    );
  };

  const salir = (franja) => {
    if (!confirm('¿Salir del evento? Conservas tu puntaje, pero pierdes los intentos que te queden.')) return;
    S.eventos.intentos = EVENTOS.INTENTOS;
    toast('Has salido del evento', 'info');
    abrirEvento(franja, true);
  };

  /* ---------- 21.11 premios al cerrar ---------- */
  const cobrar = (franja, clasif) => {
    const puesto = LB.puestoDelJugador(clasif);
    const multDom = SCH.multiplicadorDia();
    const premio = premioDePuesto(puesto, S.perfil.nivel, multDom);

    ganarOro(premio.oro, 'evento');
    if (premio.gemas) ganarGemas(premio.gemas, 'evento');
    if (puesto <= EVENTOS.PREMIADOS) S.carrera.eventosTop10++;

    // 19.14 historial del último evento
    S.eventos.ultimo = {
      id: franja.id, nombre: franja.evento.nombre, ico: franja.evento.ico,
      dia: franja.dia, puesto, puntaje: S.eventos.puntaje,
      oro: premio.oro, gemas: premio.gemas, cuando: Date.now()
    };
    S.eventos.inscrito = null;
    S.eventos.intentos = 0;
    S.eventos.puntaje = 0;

    toast(`${puesto}º puesto · 🪙 ${fmt(premio.oro)}${premio.gemas ? ` · 💎 ${premio.gemas}` : ''}`, 'ok', 4500);
    refrescar();
  };

  /* ---------- 19.14 historial ---------- */
  const historial = () => {
    const u = S.eventos.ultimo;
    if (!u) return el('span');
    return el('div', {},
      el('div.sec-title', { text: 'Último evento' }),
      el('div.card.ultimo-ev', {},
        el('span.ue-ico', { text: u.ico }),
        el('div', {},
          el('b', { text: u.nombre }),
          el('small', { text: `${u.puesto}º puesto · ${fmt(u.puntaje)} puntos` })
        ),
        el('div.ue-premio', {},
          el('b', { text: `🪙 ${fmt(u.oro)}` }),
          u.gemas ? el('small', { text: `💎 ${u.gemas}` }) : null
        )
      )
    );
  };

  const refrescar = () => {
    pintarAviso(); pintarCrono(); pintarTabs();
    vista === 'hoy' ? pintarHoy() : pintarSemana();
  };

  root.append(avisoBox, cronoBox, tabsBox, cuerpo);
  refrescar();

  // 20.13 el cronómetro se actualiza solo
  if (cronoTimer) clearInterval(cronoTimer);
  cronoTimer = setInterval(() => {
    if (!document.body.contains(cronoBox)) { clearInterval(cronoTimer); cronoTimer = null; return; }
    pintarCrono();
  }, 1000);
}
