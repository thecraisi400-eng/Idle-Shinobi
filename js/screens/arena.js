/* ARENA — Paso 5: escena visual completa.
   11.01 escena + HUD inferior · 11.03 cuerpo + animaciones
   11.08 barras + retratos · 11.09 barra pequeña de momentum
   11.10 rondas + tiempo · 11.11 victoria con botín animado
   11.12 derrota instantánea · 02.02 velocidad 1x/2x */

import { el, toast } from '../core/dom.js';
import { ir as irA } from '../core/router.js';
import { fmt, pct, mmss } from '../core/format.js';
import { S } from '../core/state.js';
import { CLASES } from '../data/clases.js';
import { COMBATE } from '../data/constants.js';
import { heroeDesdeEstado, crearLuchador } from '../systems/fighter.js';
import { generarRival } from '../systems/rival-gen.js';
import { recompensar, avanzarProgreso } from '../systems/xp.js';
import { botinDeCombate } from '../systems/loot.js';
import { recoger, darMaterial } from '../systems/inventory.js';
import { getRareza } from '../data/equipo.js';
import { simularLucha, simularMasivo, FIN } from '../systems/combat/engine.js';
import { textoLinea } from '../systems/combat/log.js';
import { descripcionIA } from '../systems/combat/ai.js';
import { ESTADOS } from '../data/estados.js';
import { resolverEspecial } from '../data/especiales.js';
import { svgRing, svgCuerdasFrente } from '../render/ring.js';
import { svgLuchador, svgRetrato, estadoPorVida } from '../render/fighter-sprite.js';
import * as FX from '../render/fx.js';

let repro = null;   // temporizador de reproducción activo

export function render(root) {
  if (repro) { clearTimeout(repro); repro = null; }

  if (!S.perfil.clase) {
    root.append(el('div.empty', {},
      el('div.em-ico', { text: '🎭' }),
      el('h2', { text: 'Primero elige tu clase' }),
      el('p', { text: 'Ve a la pestaña Héroe para crear tu luchador antes de subir al ring.' })
    ));
    return;
  }

  const heroe = heroeDesdeEstado();
  const rival = rivalActual(heroe);

  /* ---------- ESCENA (11.01 arriba) ---------- */
  const spriteH = el('div.luchador.izq', { html: svgLuchador(heroe.clase, 'izq') });
  const spriteR = el('div.luchador.der', { html: svgLuchador(rival.clase, 'der') });
  const marcador = el('div.marcador', { text: 'Ronda 1 · 0:00' });
  const banner = el('div.escena-banner');

  const escena = el('div.escena', {},
    el('div.ring-fondo', { html: svgRing() }),
    el('div.capa-luchadores', {}, spriteH, spriteR),
    el('div.ring-frente', { html: svgCuerdasFrente() }),
    marcador,
    banner
  );

  /* ---------- HUD INFERIOR (11.01) ---------- */
  const hudH = crearHUD(heroe, 'mio');
  const hudR = crearHUD(rival, 'suyo');
  const hud = el('div.combate-hud', {}, hudH.nodo, el('div.hud-vs', { text: 'VS' }), hudR.nodo);

  /* ---------- CONTROLES ---------- */
  const btn1x = el('button.btn.vel', { onclick: () => lanzar(1) }, '▶ 1x');
  const btn2x = el('button.btn.vel', { onclick: () => lanzar(2) }, '⏩ 2x');
  const btnSkip = el('button.btn.vel', { onclick: () => lanzar(0) }, '⏭ Saltar');
  const btnLuchar = el('button.btn-fight', { onclick: () => lanzar(velocidadPreferida()) }, 'Luchar');

  const feed = el('div.feed');
  const logBox = el('div');
  const resultado = el('div');

  root.append(
    escena,
    hud,
    el('div.sec-title', { text: 'Acción' }),
    feed,
    el('div', { style: { display: 'grid', gap: '8px', marginTop: '12px' } },
      btnLuchar,
      el('div.vel-row', {}, btn1x, btn2x, btnSkip),
      (() => {
        const esp = resolverEspecial(S.especial.actual, S.especial.usos[S.especial.actual] || 0);
        return el('button.btn.sm', { onclick: () => irA('especiales') },
          `${esp.ico} ${esp.nombre} · Nv ${esp.nivel}/4 — cambiar`);
      })(),
      el('button.btn.sm', { onclick: () => irA('seleccion') }, '🔀 Elegir otro rival'),
      el('button.btn.ghost.sm', { onclick: () => balancear(heroe, rival) }, '🔬 Simular 1000 luchas'),
      el('label.check', {},
        el('input', {
          type: 'checkbox', checked: S.ajustes.modoSimple,
          onchange: e => { S.ajustes.modoSimple = e.target.checked; escena.classList.toggle('oculta', e.target.checked); }
        }),
        el('span', { text: '⚡ Modo simple (sin escena, para farmear)' })
      )
    ),
    resultado,
    logBox
  );

  if (S.ajustes.modoSimple) escena.classList.add('oculta');
  hudH.pintar(heroe.der.vidaMax, 0, 0, [], 0);
  hudR.pintar(rival.der.vidaMax, 0, 0, [], 0);

  /* ---------- REPRODUCCIÓN ---------- */
  function lanzar(velocidad) {
    if (repro) { clearTimeout(repro); repro = null; }
    feed.replaceChildren();
    logBox.replaceChildren();
    resultado.replaceChildren();
    banner.replaceChildren();
    FX.limpiarKO(spriteH); FX.limpiarKO(spriteR);
    spriteH.classList.remove('gana'); spriteR.classList.remove('gana');

    const res = simularLucha(heroe, rival, {
      semilla: Date.now(),
      especialHeroe: S.especial.actual,
      usosHeroe: S.especial.usos[S.especial.actual] || 0,
      especialRival: rival.especial || 'plancha'
    });

    if (velocidad === 0) {   // Sugerencia #1: saltar al resultado
      const ult = res.eventos.at(-1);
      hudH.pintar(ult.vidaHeroe, 0, 0);
      hudR.pintar(ult.vidaRival, 0, 0);
      terminar(res);
      return;
    }

    // Presentación del rival (Sugerencia #5)
    presentar(banner, rival, () => reproducir(res, velocidad));
  }

  function reproducir(res, velocidad) {
    let i = 0;
    const paso = COMBATE.TICK_MS / velocidad / 2.6;

    const siguiente = () => {
      if (i >= res.eventos.length) { repro = null; terminar(res); return; }
      const ev = res.eventos[i++];
      let espera = paso;

      switch (ev.tipo) {
        case 'ronda':
          marcador.textContent = `Ronda ${ev.ronda} · ${mmss(ev.t * COMBATE.TICK_MS / 1000)}`;
          feed.append(el('div.fe.aviso', { text: `— Ronda ${ev.ronda} —` }));
          espera = paso * 2.2;
          break;

        case 'golpe': case 'especial': {
          const atacante = ev.atacante === 'heroe' ? spriteH : spriteR;
          const defensor = ev.atacante === 'heroe' ? spriteR : spriteH;
          const lado = ev.atacante === 'heroe' ? 'der' : 'izq';

          FX.animarGolpe(atacante, ev.tipoGolpe || 'potencia');

          if (ev.esquivado) {
            defensor.classList.add('fx-esquiva');
            setTimeout(() => defensor.classList.remove('fx-esquiva'), 300);
          } else {
            FX.sacudir(defensor, ev.critico ? 2 : 1);
            FX.flashImpacto(defensor);
            FX.chispa(escena, lado, ev.critico);
            if (ev.critico) {                       // 29.06 / 29.07
              FX.flashBlanco(escena);
              FX.screenShake(escena, 2);
            } else if (ev.tipo === 'especial') {
              FX.screenShake(escena, 1);
            }
          }

          if (ev.tipo === 'especial') {
            FX.mostrarNombreEspecial(escena, `${ev.ico || '⭐'} ${ev.nombre}`);   // 12.15
            espera = paso * 2;
          }

          hudH.pintar(ev.vidaHeroe, ev.momentumHeroe ?? 0, ev.fatigaHeroe ?? 0, ev.estadosHeroe, ev.escudoHeroe);
          hudR.pintar(ev.vidaRival, ev.momentumRival ?? 0, ev.fatigaRival ?? 0, ev.estadosRival, ev.escudoRival);
          marcador.textContent = `Ronda ${res.log.rondas.length ? Math.min(res.rondas, Math.ceil(ev.t / COMBATE.RONDA_TICKS)) : 1} · ${mmss(ev.t * COMBATE.TICK_MS / 1000)}`;

          const linea = lineaFeed(ev, heroe, rival);
          if (linea) feed.append(linea);
          break;
        }

        case 'estadoAplicado': {
          const d = ESTADOS[ev.estado];
          feed.append(el(`div.fe.estado.${d.tipo}`, { text: `${ev.ico} ${ev.quien === 'heroe' ? heroe.nombre : rival.nombre}: ${ev.nombre}${ev.capas > 1 ? ` x${ev.capas}` : ''}` }));
          break;
        }
        case 'estadoTick': {
          hudH.pintar(ev.vidaHeroe, undefined, undefined, null, undefined);
          hudR.pintar(ev.vidaRival, undefined, undefined, null, undefined);
          const txt = ev.dano ? `−${ev.dano}` : `+${ev.cura}`;
          feed.append(el(`div.fe.estado.${ev.cura ? 'bueno' : 'malo'}`, { text: `${ev.ico} ${ev.nombre} ${txt}` }));
          espera = paso * 0.35;
          break;
        }
        case 'aturdido':
          feed.append(el('div.fe.aturdido', { text: `💫 ${ev.quien === 'heroe' ? heroe.nombre : rival.nombre} está aturdido y pierde el turno` }));
          break;
        case 'robo':
          feed.append(el('div.fe.estado.bueno', { text: `🩸 Roba ${ev.cura} de vida` }));
          break;
        case 'autoDano':
          feed.append(el('div.fe.estado.malo', { text: `💥 Se lastima: −${ev.dano}` }));
          break;
        case 'momentumLleno':
          feed.append(el('div.fe.aviso', { text: `🔥 ${ev.quien === 'heroe' ? heroe.nombre : rival.nombre} carga su momentum` }));
          break;

        case 'caida':
          feed.append(el('div.fe.aviso', { text: `⬇️ Caída ${ev.total}` }));
          espera = paso * 3;
          break;

        case 'jueces':
          feed.append(el('div.fe.aviso', { text: `⚖️ Jueces: ${ev.puntosHeroe} — ${ev.puntosRival}` }));
          break;
      }

      feed.scrollTop = feed.scrollHeight;
      while (feed.children.length > 30) feed.firstChild.remove();
      repro = setTimeout(siguiente, Math.max(28, espera));
    };
    siguiente();
  }

  function terminar(res) {
    const gano = res.ganador === 'heroe';
    const perdedor = gano ? spriteR : spriteH;
    const ganador = gano ? spriteH : spriteR;

    if (res.ganador !== null) {
      FX.animarKO(perdedor);
      ganador.classList.add('gana');
    }

    // Sugerencia #3: cada ejecución cuenta para la evolución
    const usados = res.resumen.heroe.especiales || 0;
    if (usados > 0) {
      const id = S.especial.actual;
      S.especial.usos[id] = (S.especial.usos[id] || 0) + usados;
    }

    logBox.replaceChildren(pintarLog(res));

    if (res.ganador === null) {
      resultado.replaceChildren(el('div.card', {}, el('h3', { text: '🤝 Empate' }),
        el('p.card-sub', { text: 'Los jueces no pudieron decidir. En el Coliseo esta lucha se repetiría.' })));
      return;
    }
    // ===== PASO 8: recompensas REALES =====
    const botin = recompensar(rival, res, heroe, gano);

    // ===== PASO 9: botín de equipo =====
    const drop = botinDeCombate(rival, {
      nivelHeroe: S.perfil.nivel, clase: S.perfil.clase, gano,
      materialMult: (heroe.pasivas?.materialMult || 0)     // 18.06 Chatarrero
    });
    botin.piezas = [];
    botin.vendidas = [];
    for (const pieza of drop.piezas) {
      const r = recoger(pieza);
      if (r.vendida) botin.vendidas.push({ pieza, oro: r.oro });
      else if (r.entro) botin.piezas.push(pieza);
      else botin.inventarioLleno = true;
    }
    botin.material = drop.material;
    if (drop.material) darMaterial(drop.material);

    if (gano) avanzarProgreso(true);
    gano ? pantallaVictoria(resultado, res, escena, botin)
         : pantallaDerrota(resultado, res, botin);
  }
}

/* ---------- Presentación del rival (Sugerencia #5) ---------- */
function presentar(banner, rival, alTerminar) {
  const cl = CLASES[rival.clase];
  banner.replaceChildren(
    el('div.presenta', {},
      el('div.pres-ico', { text: cl.ico }),
      el('b', { text: rival.nombre }),
      el('small', { text: `${cl.nombre} · Nivel ${rival.nivel} · ⚡ ${fmt(rival.poder)}` }),
      rival.tipo && rival.tipo !== 'normal'
        ? el('span.chip', { style:{marginTop:'4px'} },
            rival.tipo === 'campeon' ? '👑 Campeón de división'
            : rival.tipo === 'jefe' ? '💀 Jefe'
            : rival.tipo === 'elite' ? '✨ Élite' : '⚔️ Némesis')
        : null
    )
  );
  setTimeout(() => { banner.replaceChildren(); alTerminar(); }, 1100);
}

/* ---------- HUD de un luchador (11.08 barras + retratos) ---------- */
function crearHUD(f, cls) {
  const cl = CLASES[f.clase];
  const retrato = el('div.retrato', { html: svgRetrato(f.clase, 'fresco') });
  const barraVida = el('i');
  const barraMom = el('i');
  const txtVida = el('b');
  const txtFat = el('small');
  const filaEstados = el('div.chud-estados');
  const barraEscudo = el('i');
  const contEscudo = el('div.bar.escudo', {}, barraEscudo);
  contEscudo.hidden = true;

  const nodo = el(`div.chud.${cls}`, {},
    retrato,
    el('div.chud-info', {},
      el('div.chud-nom', {},
        el('span', { text: f.nombre }),
        txtVida
      ),
      el('div.bar.hp', {}, barraVida),
      el('div.chud-min', {},
        el('div.bar.mom', {}, barraMom),   // 11.09 barra pequeña de momentum
        txtFat
      ),
      contEscudo,
      filaEstados          // 11.07 los estados van AQUÍ, no sobre el luchador
    )
  );

  let estadoActual = 'fresco';
  const pintar = (vida, momentum = 0, fatiga = 0, estados = null, escudo = 0) => {
    const v = Math.max(0, vida);
    const p = v / f.der.vidaMax;
    barraVida.style.width = `${p * 100}%`;
    barraVida.className = p < 0.25 ? 'critica' : p < 0.5 ? 'baja' : '';
    barraMom.style.width = `${momentum}%`;
    txtVida.textContent = `${Math.round(v)}`;
    txtFat.textContent = `😮‍💨${Math.round(fatiga)}%`;
    // Escudo (02.05)
    if (escudo > 0) {
      contEscudo.hidden = false;
      barraEscudo.style.width = `${Math.min(100, escudo / (f.der.vidaMax * 0.12) * 100)}%`;
    } else contEscudo.hidden = true;

    // Fila de iconos de estado (11.07)
    if (estados) {
      filaEstados.replaceChildren(...estados.map(e =>
        el(`span.est-ico.${e.tipo}`, { title: `${e.nombre}: ${ESTADOS[e.id]?.desc || ''}`, style: { color: e.color } },
          el('span', { text: e.ico }),
          el('b', { text: String(e.restante) }),
          e.capas > 1 ? el('b', { text: `x${e.capas}` }) : null
        )
      ));
    }

    // Sugerencia #2: el retrato reacciona
    const nuevo = estadoPorVida(p);
    if (nuevo !== estadoActual) {
      estadoActual = nuevo;
      retrato.innerHTML = svgRetrato(f.clase, nuevo);
      retrato.classList.toggle('herido', nuevo === 'alBorde');
    }
  };

  return { nodo, pintar };
}

/* ---------- Pantalla de VICTORIA (11.11 banner + botín animado) ---------- */
function pantallaVictoria(cont, res, escena, botin) {
  const nOro = el('b.botin-num', { text: '0' });
  const nXp  = el('b.botin-num', { text: '0' });

  cont.replaceChildren(
    el('div.victoria', {},
      el('div.vic-banner', { text: '¡VICTORIA!' }),
      el('p.card-sub', { style: { textAlign: 'center' },
        text: `${motivoTexto(res.motivo)} · ${res.rondas} rondas · ${mmss(res.resumen.duracionSeg)}` }),

      el('div.botin', {},
        el('div.botin-item', {}, el('span', { text: '🪙' }), nOro),
        el('div.botin-item', {}, el('span', { text: '📊' }), nXp),
        botin.gemas ? el('div.botin-item', {}, el('span', { text: '💎' }), el('b.botin-num', { text: '+' + botin.gemas })) : null
      ),

      botin.multCarisma > 1.01
        ? el('p.card-sub', { style:{textAlign:'center'},
            text: `🎤 El público te adora: +${Math.round((botin.multCarisma - 1) * 100)}% de oro por carisma.` })
        : null,

      // Piezas obtenidas (Paso 9)
      botin.piezas && botin.piezas.length ? bloqueBotin(botin) : null,
      botin.material
        ? el('p.card-sub', { style:{textAlign:'center'}, text: `🩹 +${botin.material} vendas de campeón` })
        : null,
      botin.inventarioLleno
        ? el('p.card-sub', { style:{textAlign:'center',color:'var(--mal)'},
            text: '📦 ¡Inventario lleno! Se perdió una pieza.' })
        : null,

      // Sugerencia #4: resumen de subida de nivel
      botin.subioNivel ? bloqueNivel(botin) : null,
      botin.subioRango
        ? el('div.rango-up', {}, `${botin.rango.ico} ¡NUEVO RANGO ${botin.rango.id} — ${botin.rango.nombre}!`)
        : null,
      botin.rasgosPendientes.length
        ? el('div.aviso-build', {},
            el('span.ab-ico', { text: '🧬' }),
            el('p', { text: 'Tienes un rasgo de carrera por elegir en la pestaña HÉROE.' }))
        : null,

      el('div.vic-acciones', {},
        el('button.btn.primary', { onclick: () => irA('seleccion') }, '⚔️ Siguiente rival'),
        el('button.btn', { onclick: () => irA('heroe') }, '💪 Mejorar')
      )
    )
  );
  FX.contadorRodante(nOro, 0, botin.oro, 900);
  FX.contadorRodante(nXp, 0, botin.xp, 900);
}

/* Piezas caídas en la lucha (Paso 9) */
function bloqueBotin(botin) {
  return el('div.botin-piezas', {},
    el('div.bp-titulo', { text: '🎁 Botín' }),
    ...botin.piezas.map(p => {
      const r = getRareza(p.rareza);
      return el('div.bp-item', { style: { borderColor: r.color } },
        el('span', { text: p.ico }),
        el('div', {},
          el('b', { style:{color:r.color}, text: p.nombre }),
          el('small', { text: `${r.nombre} · Nv.${p.nivel}` })
        )
      );
    }),
    ...(botin.vendidas || []).map(v =>
      el('small.bp-auto', { text: `🔥 ${v.pieza.nombre} vendida sola por ${v.oro}` })
    ),
    el('button.btn.sm.block', { style:{marginTop:'8px'}, onclick: () => irA('equipo') }, '🎒 Ver equipo')
  );
}

/* Sugerencia #4 del Paso 8: celebración con resumen exacto (13.13 sin bonus extra) */
function bloqueNivel(botin) {
  const topeNuevo = 30 + 8 * (botin.nivelAhora - 1);
  const topeViejo = 30 + 8 * (botin.nivelAntes - 1);
  return el('div.nivel-up', {},
    el('div.nu-titulo', { text: botin.nivelesGanados > 1
      ? `⬆️ ¡${botin.nivelesGanados} NIVELES! ${botin.nivelAntes} → ${botin.nivelAhora}`
      : `⬆️ ¡NIVEL ${botin.nivelAhora}!` }),
    el('ul.nu-lista', {},
      el('li', { text: `🎓 +${botin.puntosGanados} puntos libres para repartir` }),
      el('li', { text: `📈 Tope de cada estadística: ${topeViejo} → ${topeNuevo}` }),
      el('li', { text: '🌳 +1 punto de árbol de habilidades' })
    )
  );
}

/* ---------- Pantalla de DERROTA (11.12 instantánea) ---------- */
function pantallaDerrota(cont, res, botin) {
  cont.replaceChildren(
    el('div.derrota', {},
      el('h3', { text: '💀 Derrota' }),
      el('p.card-sub', { text: `${motivoTexto(res.motivo)}. No avanzas de rival: necesitas más poder.` }),
      el('div.botin', {},
        el('div.botin-item', {}, el('span', { text: '🪙' }), el('b.botin-num', { text: '+' + fmt(botin.oro) })),
        el('div.botin-item', {}, el('span', { text: '📊' }), el('b.botin-num', { text: '+' + fmt(botin.xp) }))
      ),
      el('p.card-sub', { style:{textAlign:'center'}, text: 'Cobras el 25% de la bolsa aunque pierdas.' }),
      botin.subioNivel ? bloqueNivel(botin) : null,
      el('div.vic-acciones', {},
        el('button.btn.primary', { onclick: () => irA('heroe') }, '💪 Mejorar estadísticas'),
        el('button.btn', { onclick: () => irA('seleccion') }, '🔀 Cambiar de rival')
      )
    )
  );
}

function motivoTexto(m) {
  return {
    [FIN.KO]: 'Por KO', [FIN.JUECES]: 'Por decisión de los jueces',
    [FIN.LIMITE]: 'Por límite de tiempo', [FIN.CAIDAS]: 'Por caídas',
    [FIN.DESCALIFICACION]: 'Por descalificación'
  }[m] || '';
}

/* ---------- Feed ---------- */
function lineaFeed(ev, heroe, rival) {
  const nom = q => q === 'heroe' ? heroe.nombre : rival.nombre;
  const cls = ev.atacante === 'heroe' ? 'mio' : 'suyo';
  if (ev.esquivado) return el('div.fe.esq', { text: `💨 ${nom(ev.atacante === 'heroe' ? 'rival' : 'heroe')} esquiva` });
  if (ev.tipo === 'especial') {
    return el(`div.fe.${cls}.esp`, {}, el('span', { text: `⭐ ${ev.nombre}` }), el('b', { text: `−${ev.dano}` }));
  }
  const ico = { potencia: '💥', tecnica: '🎯', agilidad: '🌀' }[ev.tipoGolpe] || '👊';
  // 02.14 números de daño configurables
  if (!S.ajustes.numerosDano) return el(`div.fe.${cls}`, { text: `${ico} ${nom(ev.atacante)} conecta` });
  return el(`div.fe.${cls}${ev.critico ? '.crit' : ''}`, {},
    el('span', { text: `${ico} ${nom(ev.atacante)}` }),
    el('b', { text: `−${ev.dano}${ev.critico ? ' ¡CRÍTICO!' : ''}` })
  );
}

/* ---------- Log plegable (02.13) ---------- */
function pintarLog(res) {
  const cont = el('div', {}, el('div.sec-title', { text: 'Registro de combate' }));
  for (const r of res.log.rondas) {
    if (!r.lineas.length) continue;
    const cuerpo = el('div.log-body', {}, ...r.lineas.map(l => el('div.log-line', { text: textoLinea(l) })));
    cuerpo.hidden = true;
    const cab = el('button.log-head', {
      onclick: () => { cuerpo.hidden = !cuerpo.hidden; cab.classList.toggle('open', !cuerpo.hidden); }
    }, el('span', {}, `Ronda ${r.numero} — ${r.titulo}`), el('small', { text: `${r.resumen.dano[0]} / ${r.resumen.dano[1]}` }));
    cont.append(el('div.log-round', {}, cab, cuerpo));
  }
  const s = res.resumen;
  cont.append(el('div.card', { style: { marginTop: '12px' } },
    fila('👊 Golpes', `${s.heroe.golpes} / ${s.rival.golpes}`),
    fila('💥 Críticos', `${s.heroe.criticos} / ${s.rival.criticos}`),
    fila('⭐ Especiales', `${s.heroe.especiales} / ${s.rival.especiales}`),
    fila('💨 Esquivas', `${s.heroe.esquivasLogradas} / ${s.rival.esquivasLogradas}`),
    fila('🩸 Daño total', `${fmt(s.heroe.danoInfligido)} / ${fmt(s.rival.danoInfligido)}`),
    fila('🔑 Semilla', String(res.semilla))
  ));
  return cont;
}

const fila = (k, v) => el('div.row', {}, el('span.k', { text: k }), el('span.v', { text: v }));

/* ---------- Auxiliares ---------- */
function velocidadPreferida() { return S.ajustes.velocidad || 1; }

function rivalActual(heroe) {
  const r = S.progreso.rivalActual;
  if (r) {
    const l = crearLuchador({
      nombre: r.nombre, clase: r.clase, nivel: r.nivel,
      stats: r.stats, personalidad: r.personalidad
    });
    return Object.assign(l, { tipo: r.tipo, oro: r.oro, especial: r.especial, indice: r.indice });
  }
  // Sin rival elegido: se genera uno del índice actual
  const g = generarRival(S.progreso.rivalIndice, {
    semillaPartida: S.meta.semilla, statsHeroe: S.stats,
    nivelHeroe: S.perfil.nivel, piso: S.progreso.torrePiso
  });
  return g;
}

function balancear(heroe, rival) {
  toast('Simulando 1000 luchas...', 'info', 1200);
  setTimeout(() => {
    const r = simularMasivo(heroe, rival, 1000);
    toast(`Winrate ${pct(r.winrate)} · ${r.duracionMediaSeg.toFixed(1)}s por lucha`, 'ok', 4500);
    console.table({ winrate: pct(r.winrate), empates: r.empates, 'duración (s)': r.duracionMediaSeg.toFixed(1) });
    console.table(r.motivos);
  }, 30);
}
