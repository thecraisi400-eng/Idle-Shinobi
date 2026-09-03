/* PANTALLA HÉROE — Paso 3 (clase) + Paso 8 (progresión completa)
   13.01 lista con botones + · 13.05 efecto en DPS · 13.08 comparación con el rival
   13.10 mejorar todo · 13.15 ficha completa · 14.01 rangos · 14.10 mesa de rasgos
   Sugerencias del Paso 8: confirmación solo para compras enormes, coste hasta
   el tope, compra x1/x10/xMáx, resumen de subida de nivel y aviso de build muerta. */

import { el, toast } from '../core/dom.js';
import { fmt, pct } from '../core/format.js';
import { on, emit } from '../core/events-bus.js';
import { S, topeStat, asignarPunto, costeStat, xpNecesaria } from '../core/state.js';
import { STATS, CLAVES_STATS, derivadas } from '../data/stats.js';
import { CLASES, listaClases, venceA, pierdeCon, aplicarClase, subclasesDe } from '../data/clases.js';
import { poder, dpsEstimado, comparar } from '../systems/power.js';
import { heroeDesdeEstado, bonosDeEquipo, crearLuchador } from '../systems/fighter.js';
import { rangoPorPoder, progresoRango, rasgosDisponibles, RASGOS_HEROE } from '../data/rangos.js';
import { actualizarRango, xpRestante } from '../systems/xp.js';
import {
  comprarStat, costeDeVarias, cuantasPuedoPagar, costeHastaTope,
  mejorarTodoEquilibrado, efectoDe, requiereConfirmar, avisoBuildMuerta
} from '../systems/upgrades.js';
import { generarRival } from '../systems/rival-gen.js';

export function render(root) {
  root.classList.add('hero-screen');
  if (!S.perfil.clase) return pintarSelector(root);
  return pintarFicha(root);
}

/* ================= SELECTOR DE CLASE (Paso 3) ================= */
function pintarSelector(root) {
  let elegida = null, sub = null;
  const grid = el('div.clase-grid');
  const detalle = el('div', { id: 'clase-detalle' });

  const refrescar = () => {
    [...grid.children].forEach(c => c.classList.toggle('sel', c.dataset.id === elegida));
    detalle.replaceChildren(elegida ? bloqueDetalle() : el('p.card-sub', {
      text: 'Elige una clase para ver sus modificadores. Esta decisión es permanente: no se puede cambiar de clase más adelante.'
    }));
  };

  const bloqueDetalle = () => {
    const cl = CLASES[elegida];
    const preview = aplicarClase(S.stats, elegida, sub);
    return el('div', {},
      el('div.card', {},
        el('div.card-hd', {},
          el('h3', {}, `${cl.ico} ${cl.nombre}`),
          el('span.chip', { text: cl.personalidad })
        ),
        el('p.card-sub', { text: cl.desc }),
        el('div.mods', {}, ...Object.entries(cl.mods).map(([k, m]) =>
          el(`span.chip.${m > 1 ? 'ok' : 'bad'}`, {}, `${STATS[k].ico} ${STATS[k].nombre} ${m > 1 ? '+' : ''}${Math.round((m - 1) * 100)}%`)
        )),
        rueda(elegida)
      ),
      el('div.sec-title', { text: 'Subclase' }),
      el('div.sub-grid', {}, ...subclasesDe(elegida).map(sc =>
        el(`button.sub-card${sub === sc.id ? '.sel' : ''}`, {
          onclick: () => { sub = sc.id; refrescar(); }
        },
          el('span.sub-ico', { text: sc.ico }),
          el('b', { text: sc.nombre }),
          el('small', { text: sc.desc })
        )
      )),
      el('div.sec-title', { text: 'Tus stats con esta clase' }),
      el('div.card', {}, ...CLAVES_STATS.map(k => {
        const d = preview[k] - S.stats[k];
        return el('div.row', {},
          el('span.k', {}, `${STATS[k].ico} ${STATS[k].nombre}`),
          el('span.v', {},
            el('span', { text: String(preview[k]) }),
            d !== 0 ? el(`small.${d > 0 ? 'up' : 'down'}`, { text: ` (${d > 0 ? '+' : ''}${d})` }) : null
          )
        );
      })),
      el('div.card', { style: { marginTop: '12px' } },
        el('div.row', {},
          el('span.k', { text: '⚡ Poder resultante' }),
          el('span.v', { text: fmt(poder(preview)), style: { color: 'var(--oro)' } })
        )
      ),
      el('button.btn.primary.block', {
        style: { marginTop: '16px' },
        disabled: !sub,
        onclick: () => confirmar(elegida, sub)
      }, sub ? '✔ Confirmar clase (permanente)' : 'Elige una subclase')
    );
  };

  grid.append(...listaClases().map(cl =>
    el('button.clase-card', {
      dataset: { id: cl.id },
      onclick: () => { elegida = cl.id; sub = null; refrescar(); }
    },
      el('span.cl-ico', { text: cl.ico }),
      el('b', { text: cl.nombre }),
      el('small', { text: cl.lema })
    )
  ));

  root.append(
    el('div.empty', { style: { marginBottom: '16px' } },
      el('div.em-ico', { text: '🎭' }),
      el('h2', { text: 'Elige tu estilo de lucha' }),
      el('p', { text: 'Seis clases forman un círculo: cada una vence a otra y pierde con otra. Tu elección es para siempre.' })
    ),
    grid, detalle
  );
  refrescar();
}

function confirmar(clase, sub) {
  if (!confirm(`¿Confirmas ser ${CLASES[clase].nombre}? No podrás cambiar de clase nunca más.`)) return;
  S.perfil.clase = clase;
  S.perfil.subclase = sub;
  S.perfil.nombre = nombreDeClase(clase);
  emit('perfil:change');
  emit('hud:refresh');
  toast(`¡Ahora eres ${CLASES[clase].nombre}!`, 'ok');
  location.hash = '#heroe';
  location.reload();
}

function nombreDeClase(c) {
  return { bestia:'La Bestia', tecnico:'El Profesor', volador:'El Halcón',
           rudo:'El Rudo', showman:'El Ídolo', coloso:'El Coloso' }[c] || 'Luchador';
}

/* ================= RUEDA DE CLASES ================= */
function rueda(claseId) {
  const gana = venceA(claseId), pierde = pierdeCon(claseId);
  const cont = el('div.rueda');
  for (const cl of listaClases()) {
    const rel = cl.id === claseId ? 'yo' : cl.id === gana ? 'gana' : cl.id === pierde ? 'pierde' : 'neutro';
    cont.append(el(`div.rueda-n.${rel}`, { title: cl.nombre },
      el('span', { text: cl.ico }),
      el('small', { text: rel === 'yo' ? 'TÚ' : rel === 'gana' ? '+10%' : rel === 'pierde' ? '−10%' : '=' })
    ));
  }
  return el('div', {},
    el('div.sec-title', { text: 'Círculo de clases' }),
    cont,
    el('p.card-sub', { style:{marginTop:'6px'}, text: 'Verde: le haces +10% de daño. Rojo: te hace +10% a ti.' })
  );
}

/* ================= FICHA COMPLETA (Paso 8) ================= */
function pintarFicha(root) {
  const cl = CLASES[S.perfil.clase];
  const sc = subclasesDe(S.perfil.clase).find(x => x.id === S.perfil.subclase);

  let cantidadCompra = 1;               // Sugerencia #3: x1 / x10 / xMáx

  const cabecera  = el('div.card.ficha-card');
  const avisoBox  = el('div');
  const rasgosBox = el('div');
  const listaSt   = el('div.card');
  const compBox   = el('div.card');

  /* ---------- Cabecera: identidad, rango y récord ---------- */
  const pintarCabecera = () => {
    const h = heroeDesdeEstado();
    actualizarRango(h.poder);
    const pr = progresoRango(h.poder);
    const rg = pr.actual;
    const c = S.carrera;
    const total = c.victorias + c.derrotas;
    const wr = total ? c.victorias / total : 0;

    cabecera.replaceChildren(
      el('div.ficha-top', {},
        el('div.ficha-ava', {
          style: { border: rg.marco, boxShadow: rg.aura, color: cl.color }
        }, cl.ico),
        el('div.ficha-id', {},
          el('h3', { text: S.perfil.nombre }),
          el('p.card-sub', {}, `${cl.nombre}${sc ? ' · ' + sc.nombre : ''} · Nivel ${S.perfil.nivel}`),
          el('div.ficha-chips', {},
            el('span.chip.rango', { style: { color: rg.color, borderColor: rg.color } },
              `${rg.ico} Rango ${rg.id} · ${rg.nombre}`),
            S.perfil.puntosLibres
              ? el('span.chip.ok', { text: `🎓 ${S.perfil.puntosLibres} puntos libres` })
              : null
          )
        )
      ),
      el('p.rango-lema', { text: `"${rg.lema}"` }),

      // Progreso hacia el siguiente rango
      pr.siguiente
        ? el('div.rango-prog', {},
            el('div.rp-lbl', {},
              el('small', { text: `Hacia ${pr.siguiente.ico} Rango ${pr.siguiente.id}` }),
              el('small', { text: `faltan ⚡ ${fmt(pr.falta)}` })
            ),
            el('div.bar', {}, el('i', { style: { width: `${pr.pct}%`, background: pr.siguiente.color } }))
          )
        : el('p.card-sub', { text: '👑 Rango máximo alcanzado. Solo queda la Torre Infinita.' }),

      // Barra de XP explícita
      el('div.rango-prog', {},
        el('div.rp-lbl', {},
          el('small', { text: `📊 Experiencia nivel ${S.perfil.nivel}` }),
          el('small', { text: `${fmt(S.perfil.xp)} / ${fmt(xpNecesaria())} · faltan ${fmt(xpRestante())}` })
        ),
        el('div.bar', {}, el('i', { style: { width: `${Math.min(100, S.perfil.xp / xpNecesaria() * 100)}%`, background: 'var(--acento)' } }))
      ),

      el('div.ficha-grid', {},
        celda('⚡ Poder', fmt(h.poder), 'var(--oro)'),
        celda('❤️ Vida', fmt(h.der.vidaMax)),
        celda('🗡️ DPS', dpsEstimado(h.stats, h.bonos).toFixed(1)),
        celda('🏆 Récord', `${c.victorias}V — ${c.derrotas}D`),
        celda('📈 Winrate', pct(wr), wr >= 0.5 ? 'var(--ok)' : 'var(--mal)'),
        celda('🔥 Mejor racha', String(c.mejorRacha)),
        celda('💥 KOs', String(c.kos)),
        celda('🔖 Build', h.firma, 'var(--txt-2)')
      ),
      rueda(S.perfil.clase)
    );
  };

  /* ---------- Sugerencia #5: aviso de build muerta ---------- */
  const pintarAviso = () => {
    const av = avisoBuildMuerta();
    avisoBox.replaceChildren(av
      ? el('div.aviso-build', {},
          el('span.ab-ico', { text: '⚠️' }),
          el('p', { text: av.texto })
        )
      : el('span'));
  };

  /* ---------- Mesa de rasgos (14.10) ---------- */
  const pintarRasgos = () => {
    const pendientes = rasgosDisponibles(S.perfil.nivel, S.perfil.rasgos);
    const tengo = (S.perfil.rasgos || []).map(id => RASGOS_HEROE[id]).filter(Boolean);

    rasgosBox.replaceChildren(
      el('div.sec-title', {}, '🧬 Mesa de rasgos',
        pendientes.length ? el('span.chip.ok', { text: `${pendientes.length} por elegir` }) : null),

      tengo.length
        ? el('div.card', {}, ...tengo.map(r =>
            el('div.rasgo-mio', {},
              el('span.rm-ico', { text: r.ico }),
              el('div', {}, el('b', { text: r.nombre }), el('small', { text: r.desc }))
            )
          ))
        : null,

      ...pendientes.map(p =>
        el('div.card.rasgo-oferta', {},
          el('p.card-sub', { text: `Rasgo de nivel ${p.nivel} — elige uno. La decisión es permanente.` }),
          el('div.rasgo-grid', {}, ...p.opciones.map(o =>
            el('button.rasgo-card', {
              onclick: () => elegirRasgo(o)
            },
              el('span.rc-ico', { text: o.ico }),
              el('b', { text: o.nombre }),
              el('small', { text: o.desc })
            )
          ))
        )
      ),

      !tengo.length && !pendientes.length
        ? el('p.card-sub', { text: 'Tu primer rasgo de carrera se desbloquea al nivel 5.' })
        : null
    );
  };

  const elegirRasgo = (r) => {
    if (!confirm(`¿Adoptar el rasgo "${r.nombre}"? Es permanente: no hay reasignación.`)) return;
    S.perfil.rasgos.push(r.id);
    toast(`Rasgo adquirido: ${r.ico} ${r.nombre}`, 'ok');
    emit('perfil:change');
    refrescarTodo();
  };

  /* ---------- Lista de estadísticas con compra ---------- */
  const pintarStats = () => {
    const h = heroeDesdeEstado();
    const tope = topeStat();

    const selCant = el('div.cant-sel', {}, ...[1, 10, 'max'].map(v =>
      el(`button.chip${cantidadCompra === v ? '.ok' : ''}`, {
        onclick: () => { cantidadCompra = v; pintarStats(); }
      }, v === 'max' ? 'xMáx' : `x${v}`)
    ));

    const cabeceraMejora = el('div.mejora-hd', {},
      el('div', {},
        el('b', { text: '🪙 ' + fmt(S.monedas.oro) }),
        el('small', { text: ` · tope actual ${tope} (sube ${8} por nivel)` })
      ),
      selCant
    );

    // 13.10 — mejorar todo equilibrado
    const btnTodo = el('button.btn.block', {
      style: { marginBottom: '12px' },
      onclick: () => {
        const r = mejorarTodoEquilibrado();
        if (!r.pasos) return toast('No alcanza para ninguna mejora', 'bad');
        const resumen = Object.entries(r.detalle)
          .map(([k, n]) => `${STATS[k].ico}+${n}`).join(' ');
        toast(`⚖️ ${r.pasos} mejoras por ${fmt(r.gastado)} oro · ${resumen}`, 'ok', 4200);
        refrescarTodo();
      }
    }, '⚖️ Mejorar todo equilibrado (gasta el oro en lo más barato)');

    const filas = CLAVES_STATS.map(k => {
      const st = STATS[k];
      const v = h.stats[k];
      const base = S.stats[k];
      const enTope = base >= tope;

      const cant = cantidadCompra === 'max'
        ? cuantasPuedoPagar(k).cantidad
        : cantidadCompra;
      const { total: coste, cantidad: real } = costeDeVarias(k, Math.max(1, cant));
      const puede = real > 0 && S.monedas.oro >= coste && !enTope;
      const ef = efectoDe(k, Math.max(1, real));
      const hastaTope = costeHastaTope(k);

      return el('div.stat-fila', {},
        el('div.sf-head', {},
          el('span.sf-nom', {}, `${st.ico} ${st.nombre}`),
          el('span.sf-val', { style: { color: st.color } },
            fmt(base, 2),
            v !== base ? el('small', { text: ` → ${fmt(v, 2)}` }) : null,
            enTope ? el('small.tope', { text: ' MAX' }) : null
          )
        ),
        el('div.bar', {}, el('i', { style: { width: `${Math.min(100, base / tope * 100)}%`, background: st.color } })),
        el('div.sf-efecto', {}, `${st.efecto(v)} — ${st.desc}`),

        // 13.05 efecto exacto en DPS antes de comprar
        !enTope
          ? el('div.sf-dps', {},
              el('small', {},
                `+${real || 1} → 🗡️ ${ef.dpsDelta >= 0 ? '+' : ''}${ef.dpsDelta.toFixed(2)} DPS `,
                el('span', { style: { color: ef.dpsDelta > 0 ? 'var(--ok)' : 'var(--txt-3)' } },
                  `(${ef.dpsPct >= 0 ? '+' : ''}${ef.dpsPct.toFixed(1)}%)`),
                ` · ⚡ +${ef.poderDelta}`
              )
            )
          : null,

        el('div.sf-acciones', {},
          el(`button.btn.sm${puede ? '.primary' : ''}`, {
            disabled: !puede,
            onclick: () => comprar(k, real, coste)
          }, enTope ? 'En el tope' : `+${real || 1} · 🪙 ${fmt(coste)}`),

          S.perfil.puntosLibres > 0 && !enTope
            ? el('button.btn.sm.ok', {
                onclick: () => { asignarPunto(k); toast(`${st.nombre} +1 (punto libre)`, 'ok'); refrescarTodo(); }
              }, '🎓 Punto libre')
            : null,

          // Sugerencia #2: coste hasta el tope
          !enTope && hastaTope.cantidad > 0
            ? el('small.hasta-tope', { text: `al tope: +${hastaTope.cantidad} por 🪙 ${fmt(hastaTope.total)}` })
            : null
        )
      );
    });

    listaSt.replaceChildren(cabeceraMejora, btnTodo, ...filas);
  };

  /* ---------- Sugerencia #1 + compra ---------- */
  const comprar = (clave, cantidad, coste) => {
    if (requiereConfirmar(coste)) {
      const ok = confirm(
        `Esta compra cuesta ${fmt(coste)} de oro: más del 25% de los ${fmt(S.monedas.oro)} que tienes.\n\n` +
        `${STATS[clave].nombre} +${cantidad}. No se puede deshacer. ¿Confirmas?`
      );
      if (!ok) return;
    }
    const r = comprarStat(clave, Math.max(1, cantidad));
    if (!r.ok) {
      return toast(r.motivo === 'tope' ? 'Esa estadística está en su tope' : 'No tienes oro suficiente', 'bad');
    }
    toast(`${STATS[clave].ico} ${STATS[clave].nombre} +${r.compradas} por 🪙 ${fmt(r.gastado)}`, 'ok');
    refrescarTodo();
  };

  /* ---------- 13.08 comparación con el próximo rival ---------- */
  const pintarComparacion = () => {
    const h = heroeDesdeEstado();
    let rival = S.progreso.rivalActual;
    if (rival) {
      rival = crearLuchador({
        nombre: rival.nombre, clase: rival.clase, nivel: rival.nivel,
        stats: rival.stats, personalidad: rival.personalidad
      });
    } else {
      rival = generarRival(S.progreso.rivalIndice, {
        semillaPartida: S.meta.semilla, statsHeroe: S.stats,
        nivelHeroe: S.perfil.nivel, piso: S.progreso.torrePiso
      });
    }

    const c = comparar(h, rival);
    const rcl = CLASES[rival.clase];

    compBox.replaceChildren(
      el('div.card-hd', {},
        el('h3', {}, `${rcl.ico} ${rival.nombre}`),
        el('span.chip', { class: `chip ${c.pronostico.clase}` }, `${c.pronostico.flecha} ${c.pronostico.txt}`)
      ),
      el('p.card-sub', {}, `${rcl.nombre} · Nivel ${rival.nivel} · probabilidad estimada de victoria ${pct(c.prob)}`),
      el('div.cmp-poder', {},
        el('div.cp-lado', {}, el('small', { text: 'Tú' }), el('b', { style:{color:'var(--ok)'}, text: fmt(c.poderMio) })),
        el('div.cp-vs', { text: 'VS' }),
        el('div.cp-lado', {}, el('small', { text: 'Él' }), el('b', { style:{color:'var(--mal)'}, text: fmt(c.poderRival) }))
      ),
      ...c.filas.map(f =>
        el(`div.cmp-fila${f.delta > 0 ? '.gano' : f.delta < 0 ? '.pierdo' : ''}`, {},
          el('span.cf-mio', { text: String(f.mio) }),
          el('span.cf-nom', {}, `${f.ico} ${f.nombre}`),
          el('span.cf-suyo', { text: String(f.suyo) })
        )
      ),
      el('p.card-sub', { style:{marginTop:'8px'}, text: 'Verde: le ganas en esa estadística. Rojo: te supera.' })
    );
  };

  const refrescarTodo = () => {
    pintarCabecera(); pintarAviso(); pintarRasgos(); pintarStats(); pintarComparacion();
    emit('hud:refresh');
  };

  root.append(
    el('section.hero-overview', {},
      el('div.sec-title', { text: 'Ficha del luchador' }), cabecera, avisoBox, rasgosBox
    ),
    el('section.hero-panel', {},
      el('div.sec-title', { text: '💪 Mejorar estadísticas' }), listaSt
    ),
    el('section.hero-panel', {},
      el('div.sec-title', { text: '⚔️ Tu próximo rival' }), compBox
    )
  );

  refrescarTodo();
  on('nivel:up', refrescarTodo);
  on('rango:up', () => toast('¡Has subido de rango!', 'ok'));
}

function celda(k, v, color) {
  return el('div.fg-celda', {},
    el('small', { text: k }),
    el('b', { style: color ? { color } : {}, text: String(v) })
  );
}
