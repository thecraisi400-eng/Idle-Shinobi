/* PANTALLA EL COLISEO — Paso 12
   22.05 nombre "El Coliseo" · 22.11 abierto 24/7 · 22.10 torneos ilimitados
   22.09 nivel mínimo 10 · 22.12 desglose del pozo antes de pagar
   23.02 tus luchas una a una · 23.03 de las demás solo el resultado
   23.11 tu mitad del cuadro · 22.08 sin reentrada
   Sugerencias: #1 sorteo animado · #2 ficha del oponente · #3 aviso de riesgo
   #4 cuadro compartible · #5 sala rápida */

import { el, toast } from '../core/dom.js';
import { fmt } from '../core/format.js';
import { S, gastarOro, ganarOro, gastarGemas, ganarGemas } from '../core/state.js';
import { PROG } from '../data/constants.js';
import {
  LIGAS, getLiga, salasDisponibles, construirSala, esSabado,
  temporadaCaducada, inicioTemporada, premioTemporada, nombreRonda, FINAL_AL_MEJOR_DE
} from '../data/ligas.js';
import * as PP from '../systems/pvp/prizepool.js';
import * as BR from '../systems/pvp/bracket.js';
import { fichaDe, compararCon } from '../systems/pvp/ghosts.js';
import { heroeDesdeEstado } from '../systems/fighter.js';
import { resolverRapido } from '../systems/combat/engine.js';

let cuadro = null;          // torneo en curso (vive en memoria, 23.15 sin historial)
let salaActual = null;
let vista = 'salas';        // 'salas' | 'inscripcion' | 'torneo' | 'final'

export function render(root) {
  const cuerpo = el('div');

  /* 24.02 — al entrar, comprobar si cambió la semana */
  cerrarTemporadaSiToca();

  /* ---------- 22.09 puerta de nivel ---------- */
  if (S.perfil.nivel < PROG.NIVEL_MIN_PVP) {
    root.append(
      el('div.sec-title', { text: 'El Coliseo' }),
      el('div.card.bloqueo', {},
        el('span.bloqueo-ico', { text: '🔒' }),
        el('b', { text: `Nivel ${PROG.NIVEL_MIN_PVP} requerido` }),
        el('p.card-sub', { text: `Primero aprende lo básico en la Arena. Vas por el nivel ${S.perfil.nivel}.` }),
        el('div.barra-bloqueo', {},
          el('i', { style: { width: `${Math.min(100, S.perfil.nivel / PROG.NIVEL_MIN_PVP * 100)}%` } }))
      )
    );
    return;
  }

  /* ---------- Lista de salas (22.06, 22.11) ---------- */
  const pintarSalas = () => {
    const salas = salasDisponibles(S.perfil.nivel);
    const liga = getLiga(S.pvp.liga);
    const finSem = new Date(inicioTemporada() + 7 * 864e5);

    cuerpo.replaceChildren(
      el('div.card.liga-card', { style: { borderColor: liga.color } },
        el('span.liga-ico', { text: liga.ico }),
        el('div', {},
          el('b', { style: { color: liga.color }, text: `Liga ${liga.nombre}` }),
          el('small', { text: liga.lema })
        ),
        el('div.liga-stats', {},
          el('b', { text: `${S.pvp.ganadosSemana}🏆` }),
          el('small', { text: `${S.pvp.torneosSemana} torneos` })
        )
      ),
      el('p.card-sub', {},
        `Temporada semanal: cierra el ${finSem.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'short' })}. `,
        el('b', { text: `Premio actual: 🪙 ${fmt(premioTemporada(S.pvp.liga, S.pvp.ganadosSemana).oro)}` })),

      esSabado() ? el('div.xl-banner', { text: '🎪 ¡Es sábado! Cuadros XL de 64 con pozo aumentado' }) : null,

      el('div.sec-title', { text: 'Salas abiertas' }),
      el('p.card-sub', { text: 'Abierto 24/7 y sin límite de torneos. Cada sala tiene su entrada y su cuadro.' }),
      ...salas.map(tarjetaSala),

      // Sugerencia #5: sala rápida
      el('button.btn.primary.block', { style: { marginTop: '10px' }, onclick: salaRapida },
        '⚡ Empezar ya (la mejor sala que puedo pagar)')
    );
  };

  const tarjetaSala = (sala) => {
    const { pozo } = PP.calcularPozo(sala.buyIn, sala.cuadro, sala.multPozo);
    const moneda = sala.moneda === 'gemas' ? '💎' : '🪙';
    const saldo = sala.moneda === 'gemas' ? S.monedas.gemas : S.monedas.oro;
    const puedo = sala.abierta && saldo >= sala.buyIn;

    return el(`div.sala${sala.abierta ? '' : '.cerrada'}${sala.xl ? '.xl' : ''}`, {
      style: { borderLeftColor: sala.color },
      onclick: () => sala.abierta ? abrirInscripcion(sala) : toast(`Necesitas nivel ${sala.liga.nivelMin}`, 'info')
    },
      el('span.sala-ico', { text: sala.ico }),
      el('div.sala-info', {},
        el('b', { text: sala.nombre }),
        el('small', { text: `Cuadro de ${sala.cuadro} · ${sala.rondas} rondas · pozo ${moneda} ${fmt(pozo)}` })
      ),
      el('div.sala-buy', {},
        el('b', { class: puedo ? '' : 'sin-saldo', text: `${moneda} ${fmt(sala.buyIn)}` }),
        el('small', { text: sala.abierta ? (puedo ? 'entrar' : 'sin saldo') : `nivel ${sala.liga.nivelMin}` })
      )
    );
  };

  /* ---------- Sugerencia #5: sala rápida ---------- */
  function salaRapida() {
    const salas = salasDisponibles(S.perfil.nivel)
      .filter(s => s.abierta && !s.xl && s.moneda === 'oro' && S.monedas.oro >= s.buyIn)
      .sort((a, b) => b.buyIn - a.buyIn);
    if (!salas.length) return toast('No tienes oro para ninguna sala', 'mal');
    abrirInscripcion(salas[0]);
  }

  /* ---------- 22.12 inscripción con desglose completo ---------- */
  const abrirInscripcion = (sala) => {
    salaActual = sala;
    vista = 'inscripcion';
    const { recaudado, rake, pozo } = PP.calcularPozo(sala.buyIn, sala.cuadro, sala.multPozo);
    const tabla = PP.tablaPremios(sala.buyIn, sala.cuadro, sala.multPozo);
    const moneda = sala.moneda === 'gemas' ? '💎' : '🪙';
    const saldo = sala.moneda === 'gemas' ? S.monedas.gemas : S.monedas.oro;
    const riesgo = PP.riesgoBuyIn(sala.buyIn, saldo);   // Sugerencia #3

    cuerpo.replaceChildren(
      el('button.btn.sm', { onclick: () => { vista = 'salas'; pintarSalas(); } }, '‹ Volver a las salas'),

      el('div.card.inscripcion', { style: { borderColor: sala.color } },
        el('div.ins-hd', {},
          el('span.ins-ico', { style: { borderColor: sala.color }, text: sala.ico }),
          el('div', {},
            el('b', { style: { color: sala.color }, text: sala.nombre }),
            el('small', { text: `${sala.cuadro} luchadores · ${sala.rondas} rondas · eliminación simple` })
          )
        ),

        el('div.sec-mini', { text: '💰 Cómo se forma el pozo' }),
        el('div.desglose-pozo', {},
          fila('Entradas', `${sala.cuadro} × ${fmt(sala.buyIn)}`, `${moneda} ${fmt(recaudado)}`),
          fila('Comisión de la casa', '5%', `− ${fmt(rake)}`, 'rake'),
          sala.multPozo > 1 ? fila('Bonus XL', `×${sala.multPozo}`, 'aumentado', 'bonus') : null,
          fila('POZO A REPARTIR', '', `${moneda} ${fmt(pozo)}`, 'total')
        ),

        el('div.sec-mini', { text: `🏆 Reparto (top ${tabla.length} de ${sala.cuadro})` }),
        el('div.tabla-premios', {}, ...tabla.map(p =>
          el('div.tp-fila', {},
            el('span.tp-p', { text: `${p.puesto}º` }),
            el('span.tp-pct', { text: `${Math.round(p.pct * 100)}%` }),
            el('b', { text: `${moneda} ${fmt(p.oro)}` }),
            p.rentable ? el('small.tp-ok', { text: '✓ recuperas' }) : el('small.tp-no', { text: 'pérdida' })
          )
        )),
        el('p.card-sub', { text: `Fuera del top ${tabla.length} no hay premio: pierdes la entrada. Sin reentrada.` }),

        // Sugerencia #3: aviso de riesgo
        el(`div.riesgo.r-${riesgo.nivel}`, {},
          el('b', { text: riesgo.nivel === 'alto' ? '⚠️ ' : riesgo.nivel === 'imposible' ? '🚫 ' : '💡 ' }),
          riesgo.texto),

        riesgo.nivel === 'imposible'
          ? el('button.btn.block', { disabled: true }, 'Saldo insuficiente')
          : el('button.btn.primary.block', { onclick: () => inscribirse(sala) },
              `Pagar ${moneda} ${fmt(sala.buyIn)} y entrar`)
      )
    );
  };

  const fila = (etiqueta, medio, valor, clase = '') =>
    el(`div.dp-fila${clase ? '.' + clase : ''}`, {},
      el('span', { text: etiqueta }),
      el('small', { text: medio }),
      el('b', { text: valor }));

  /* ---------- Inscripción + Sugerencia #1: sorteo animado ---------- */
  const inscribirse = (sala) => {
    const pago = sala.moneda === 'gemas' ? gastarGemas(sala.buyIn, 'pvp') : gastarOro(sala.buyIn, 'pvp');
    if (!pago) return toast('No tienes saldo suficiente', 'mal');

    const heroe = heroeDesdeEstado();
    cuadro = BR.sortearCuadro(heroe, sala, {
      semilla: Date.now(),
      nivelHeroe: S.perfil.nivel,
      statsHeroe: S.stats
    });
    S.pvp.torneosSemana++;
    S.carrera.torneosJugados++;
    vista = 'torneo';
    animarSorteo(sala);
  };

  /** Sugerencia #1 — 3 segundos de nombres barajándose antes de revelar el cruce. */
  const animarSorteo = (sala) => {
    const nombres = cuadro.participantes.map(p => p.nombre);
    const caja = el('div.sorteo-nombre', { text: '...' });
    cuerpo.replaceChildren(
      el('div.card.sorteo', {},
        el('div.sec-title', { style: { textAlign: 'center' }, text: '🎲 Sorteando el cuadro' }),
        el('p.card-sub', { style: { textAlign: 'center' }, text: 'Sorteo puro: sin cabezas de serie.' }),
        caja
      )
    );

    let n = 0;
    const iv = setInterval(() => {
      caja.textContent = nombres[Math.floor(Math.random() * nombres.length)];
      if (++n > 22) {
        clearInterval(iv);
        const rival = BR.rivalActual(cuadro);
        caja.textContent = `⚔️ ${rival ? rival.nombre : ''}`;
        caja.classList.add('revelado');
        setTimeout(pintarTorneo, 700);
      }
    }, 130);
  };

  /* ---------- El cuadro en curso ---------- */
  const pintarTorneo = () => {
    if (!cuadro) { vista = 'salas'; return pintarSalas(); }
    const rival = BR.rivalActual(cuadro);
    const ficha = fichaDe(rival);
    const heroe = cuadro.jugador;
    const cmp = compararCon(heroe, rival);
    const esFinal = BR.esFinal(cuadro);

    cuerpo.replaceChildren(
      el('div.card.torneo-hd', { style: { borderColor: salaActual.color } },
        el('div', {},
          el('b', { text: salaActual.nombre }),
          el('small', { text: `${BR.nombreRondaActual(cuadro)} · ronda ${cuadro.rondaActual} de ${cuadro.totalRondas}` })
        ),
        el('span.torneo-vivos', { text: `${cuadro.rondas[cuadro.rondaActual - 1].length * 2} vivos` })
      ),

      cuadro.eliminado
        ? panelEliminado()
        : el('div', {},
            // Sugerencia #2: ficha del oponente antes de luchar
            ficha ? el('div.card.ficha', { style: { borderColor: ficha.color } },
              el('div.sec-mini', { text: esFinal ? `🏁 FINAL · al mejor de ${FINAL_AL_MEJOR_DE} caídas` : 'Tu próximo rival' }),
              el('div.ficha-top', {},
                el('span.ficha-ico', { style: { borderColor: ficha.color }, text: ficha.ico }),
                el('div', {},
                  el('b', { text: ficha.nombre }),
                  el('small', { text: `${ficha.apodo} · ${ficha.procedencia}` }),
                  el('div.ficha-chips', {},
                    el('span.chip', { text: ficha.clase }),
                    el('span.chip', { text: `Nv ${ficha.nivel}` })
                  )
                )
              ),
              el('div.ficha-nums', {},
                dato('Poder', fmt(ficha.poder), cmp?.tono),
                dato('Vida', fmt(ficha.vidaMax)),
                dato('Daño', fmt(ficha.dano))
              ),
              cmp ? el(`div.veredicto.v-${cmp.tono}`, { text: cmp.veredicto }) : null,
              el('p.card-sub', { text: 'Puedes cambiar de equipo antes de aceptar.' })
            ) : null,

            el('button.btn.primary.block', { onclick: lucharRonda },
              esFinal ? '🏁 Disputar la final' : '⚔️ Luchar esta ronda')
          ),

      // 23.11 tu mitad del cuadro
      pintarMitad()
    );
  };

  const dato = (k, v, tono) => el('div.dato', {},
    el('small', { text: k }),
    el('b', { class: tono ? `t-${tono}` : '', text: v }));

  /* 23.02 — la lucha del jugador se resuelve aparte; 23.03 el resto en silencio */
  const lucharRonda = () => {
    const llave = BR.llaveDelJugador(cuadro);
    const rival = BR.rivalActual(cuadro);
    if (!llave || !rival) return;

    const esFinal = BR.esFinal(cuadro);
    const necesarias = esFinal ? Math.ceil(FINAL_AL_MEJOR_DE / 2) : 1;
    let vYo = 0, vRival = 0, caidas = [], repes = 0;

    // 23.08 empate = se repite; 23.05 final al mejor de 3
    while (vYo < necesarias && vRival < necesarias && repes < 20) {
      const res = resolverRapido(cuadro.jugador, rival, { semilla: Date.now() + repes * 977 });
      repes++;
      if (res.ganador === 'heroe') { vYo++; caidas.push({ gano: true, motivo: res.motivo }); }
      else if (res.ganador === 'rival') { vRival++; caidas.push({ gano: false, motivo: res.motivo }); }
      else caidas.push({ gano: null, motivo: 'empate', repetida: true });
    }
    if (vYo === vRival) (cuadro.jugador.poder >= rival.poder ? vYo++ : vRival++);

    const gano = vYo > vRival;
    BR.registrarLuchaDelJugador(cuadro, gano, {
      caidas, vA: vYo, vB: vRival, repeticiones: repes,
      empatesRepetidos: caidas.filter(c => c.repetida).length
    });

    // 23.03 el resto de llaves se resuelven sin verlas
    BR.jugarRonda(cuadro);
    const av = BR.avanzarRonda(cuadro);

    mostrarResultadoRonda(gano, caidas, rival, av);
  };

  const mostrarResultadoRonda = (gano, caidas, rival, av) => {
    const empates = caidas.filter(c => c.repetida).length;
    cuerpo.replaceChildren(
      el(`div.card.res-ronda${gano ? '.gano' : '.perdio'}`, {},
        el('div.res-ico', { text: gano ? '🎉' : '💀' }),
        el('h3', { style: { textAlign: 'center' }, text: gano ? '¡Victoria!' : 'Eliminado' }),
        el('p.card-sub', { style: { textAlign: 'center' },
          text: `${gano ? 'Superaste a' : 'Caíste ante'} ${rival.nombre}` }),
        empates ? el('p.card-sub', { style: { textAlign: 'center' },
          text: `Hubo ${empates} empate(s): la lucha se repitió.` }) : null,
        caidas.length > 1 ? el('div.caidas', {}, ...caidas.map((c, i) =>
          el(`span.caida${c.gano === true ? '.ok' : c.gano === false ? '.mal' : '.emp'}`,
            { text: c.gano === null ? '=' : c.gano ? 'V' : 'D' })
        )) : null,
        el('button.btn.primary.block', {
          onclick: () => {
            if (av.terminado || cuadro.eliminado) pintarFinal();
            else pintarTorneo();
          }
        }, av.terminado || cuadro.eliminado ? 'Ver resultado final' : 'Siguiente ronda')
      )
    );
  };

  /* 23.14 — eliminado te quedas mirando */
  const panelEliminado = () => el('div.card.eliminado', {},
    el('b', { text: '💀 Estás eliminado' }),
    el('p.card-sub', { text: 'Sin reentrada ni duelos extra. Puedes seguir el resto del cuadro hasta la final.' }),
    el('button.btn.block', { onclick: verResto }, '👁️ Ver cómo acaba el torneo')
  );

  const verResto = () => {
    BR.simularTorneoCompleto(cuadro);
    pintarFinal();
  };

  /* ---------- Resultado final y cobro ---------- */
  const pintarFinal = () => {
    if (!cuadro.terminado) BR.simularTorneoCompleto(cuadro);

    const puesto = PP.puestoPorRonda(cuadro.rondaEliminado, cuadro.plazas);
    const bal = PP.balanceTorneo({
      puesto, buyIn: salaActual.buyIn, plazas: cuadro.plazas, multPozo: salaActual.multPozo
    });
    const moneda = salaActual.moneda === 'gemas' ? '💎' : '🪙';

    // Cobro (una sola vez)
    if (!cuadro.cobrado) {
      cuadro.cobrado = true;
      if (bal.premio > 0) {
        salaActual.moneda === 'gemas' ? ganarGemas(bal.premio, 'pvp') : ganarOro(bal.premio, 'pvp');
      }
      if (bal.campeon) { S.pvp.ganadosSemana++; S.carrera.torneosGanados++; }
      S.pvp.ultimoTorneo = {
        sala: salaActual.nombre, puesto, premio: bal.premio,
        buyIn: salaActual.buyIn, moneda: salaActual.moneda, cuando: Date.now()
      };
    }

    const camino = BR.caminoDelJugador(cuadro);

    cuerpo.replaceChildren(
      el(`div.card.final-card${bal.campeon ? '.campeon' : ''}`, {},
        el('div.final-ico', { text: bal.campeon ? '👑' : puesto <= 3 ? '🏅' : '🤕' }),
        el('h2', { style: { textAlign: 'center' }, text: bal.campeon ? '¡CAMPEÓN!' : `${puesto}º puesto` }),
        el('p.card-sub', { style: { textAlign: 'center' },
          text: bal.campeon ? `Ganaste el ${salaActual.nombre}` : `De ${cuadro.plazas} luchadores` }),

        el('div.balance', {},
          el('div', {}, el('small', { text: 'Entrada' }), el('b.neg', { text: `−${fmt(bal.buyIn)}` })),
          el('div', {}, el('small', { text: 'Premio' }), el('b.pos', { text: `+${fmt(bal.premio)}` })),
          el('div', {}, el('small', { text: 'Neto' }),
            el('b', { class: bal.neto >= 0 ? 'pos' : 'neg', text: `${bal.neto >= 0 ? '+' : ''}${fmt(bal.neto)} ${moneda}` }))
        ),

        el('div.sec-mini', { text: 'Tu camino' }),
        el('div.camino', {}, ...camino.map(c =>
          el(`div.cm-fila${c.gano ? '.gano' : '.perdio'}`, {},
            el('small', { text: c.nombreRonda }),
            el('span', {}, `${c.ico} ${c.rival}`),
            el('b', { text: c.gano ? '✓' : '✗' })
          )
        )),

        el('div.sec-mini', { text: 'Campeón del torneo' }),
        el('div.campeon-fila', {},
          el('span', { text: cuadro.campeon?.ico || '🏆' }),
          el('b', { text: cuadro.campeon?.esJugador ? 'TÚ' : (cuadro.campeon?.nombre || '—') })
        ),

        // Sugerencia #4: cuadro compartible
        el('button.btn.block', { onclick: () => compartirCuadro(puesto, camino) }, '📸 Guardar cuadro como imagen'),
        el('button.btn.primary.block', {
          style: { marginTop: '8px' },
          onclick: () => { cuadro = null; vista = 'salas'; pintarSalas(); }
        }, 'Volver al Coliseo')
      )
    );
  };

  /* ---------- Sugerencia #4: imagen del cuadro en canvas ---------- */
  function compartirCuadro(puesto, camino) {
    const W = 720, H = 420 + camino.length * 46;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const x = c.getContext('2d');

    x.fillStyle = '#12131a'; x.fillRect(0, 0, W, H);
    x.fillStyle = salaActual.color; x.fillRect(0, 0, W, 8);

    x.fillStyle = '#e8b64c'; x.font = 'bold 40px system-ui, sans-serif'; x.textAlign = 'center';
    x.fillText('ORO Y GLORIA', W / 2, 70);
    x.fillStyle = '#9aa0ad'; x.font = '22px system-ui, sans-serif';
    x.fillText(salaActual.nombre, W / 2, 105);

    x.fillStyle = puesto === 1 ? '#e8b64c' : '#f2f3f5';
    x.font = 'bold 64px system-ui, sans-serif';
    x.fillText(puesto === 1 ? 'CAMPEON' : `${puesto}º de ${cuadro.plazas}`, W / 2, 185);

    x.font = '20px system-ui, sans-serif'; x.textAlign = 'left';
    camino.forEach((cm, i) => {
      const y = 250 + i * 46;
      x.fillStyle = cm.gano ? '#4ec97a' : '#e2564f';
      x.fillRect(60, y - 22, 5, 32);
      x.fillStyle = '#9aa0ad'; x.font = '15px system-ui, sans-serif';
      x.fillText(cm.nombreRonda, 80, y - 6);
      x.fillStyle = '#f2f3f5'; x.font = '20px system-ui, sans-serif';
      x.fillText(`${cm.rival}  ${cm.gano ? '✓' : '✗'}`, 80, y + 16);
    });

    x.fillStyle = '#5c6270'; x.font = '16px system-ui, sans-serif'; x.textAlign = 'center';
    x.fillText(new Date().toLocaleDateString('es'), W / 2, H - 24);

    c.toBlob(blob => {
      if (!blob) return toast('No se pudo generar la imagen', 'mal');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `coliseo-${Date.now()}.png`; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast('Imagen guardada', 'ok');
    }, 'image/png');
  }

  /* ---------- 23.11 tu mitad del cuadro ---------- */
  const pintarMitad = () => {
    const mitad = BR.miMitad(cuadro);
    return el('div.card', {},
      el('div.card-hd', {}, el('h3', { text: '🗺️ Tu mitad del cuadro' })),
      el('p.card-sub', { text: 'Solo ves los cruces que podrías llegar a jugar.' }),
      el('div.bracket', {}, ...mitad.map((ronda, i) =>
        el('div.br-col', {},
          el('small.br-tit', { text: nombreRonda(cuadro.rondas[i].length) }),
          ...ronda.map(l => el('div.br-llave', {},
            slotLlave(l.a, l), slotLlave(l.b, l)
          ))
        )
      ))
    );
  };

  const slotLlave = (p, llave) => {
    if (!p) return el('div.br-slot.vacio', { text: '—' });
    const gano = llave.jugada && llave.ganador === p;
    const perdio = llave.jugada && llave.ganador !== p;
    return el(`div.br-slot${p.esJugador ? '.yo' : ''}${gano ? '.gano' : ''}${perdio ? '.perdio' : ''}`, {},
      el('span.br-ico', { text: p.ico || '🤼' }),
      el('span.br-nom', { text: p.esJugador ? 'TÚ' : (p.nombre || '').split(' ').slice(0, 2).join(' ') })
    );
  };

  /* ---------- 24.02 cierre de temporada ---------- */
  function cerrarTemporadaSiToca() {
    if (!S.pvp.temporadaInicio) { S.pvp.temporadaInicio = inicioTemporada(); return; }
    if (!temporadaCaducada(S.pvp.temporadaInicio)) return;

    const pr = premioTemporada(S.pvp.liga, S.pvp.ganadosSemana);
    if (S.pvp.torneosSemana > 0) {
      ganarOro(pr.oro, 'temporada');
      toast(`Fin de temporada ${pr.liga}: 🪙 ${fmt(pr.oro)}`, 'ok', 5000);
      // Ascenso simple: 3+ torneos ganados suben de liga
      if (S.pvp.ganadosSemana >= 3 && S.pvp.liga < LIGAS.length) S.pvp.liga++;
    }
    S.pvp.temporadaInicio = inicioTemporada();
    S.pvp.torneosSemana = 0;
    S.pvp.ganadosSemana = 0;
  }

  root.append(el('div.sec-title', { text: '🏛️ El Coliseo' }), cuerpo);

  // Si había un torneo a medias en memoria, retomarlo
  if (cuadro && !cuadro.terminado && salaActual) pintarTorneo();
  else if (cuadro && cuadro.terminado && salaActual) pintarFinal();
  else pintarSalas();
}
