/* PANTALLA EQUIPO — Paso 9
   Vista de muñeco con los 8 slots (Sugerencia #3), inventario con
   ordenación (16.10), comparación con delta (16.12), forja (16.01),
   venta con confirmación (16.03), auto-venta (16.05) y candado (Sug. #2). */

import { el, toast } from '../core/dom.js';
import { fmt } from '../core/format.js';
import { on, emit } from '../core/events-bus.js';
import { S } from '../core/state.js';
import { EQUIPO } from '../data/constants.js';
import { STATS, CLAVES_STATS } from '../data/stats.js';
import {
  SLOTS, CLAVES_SLOTS, getRareza, listaRarezas, EXOTICOS,
  textoRequisitos, MATERIAL
} from '../data/equipo.js';
import * as INV from '../systems/inventory.js';
import * as FORJA from '../systems/forge.js';
import { puntuacion, generarPieza } from '../systems/loot.js';
import { DEV } from '../core/state.js';

let orden = 'rareza';
let filtroSlot = null;
let seleccion = null;

export function render(root) {
  const muneco   = el('div.card');
  const avisoBox = el('div');
  const acciones = el('div.card');
  const invBox   = el('div.card');
  const detalle  = el('div', { id: 'pieza-detalle' });

  /* ---------- Muñeco de 8 slots (Sugerencia #3) ---------- */
  const pintarMuneco = () => {
    const mejoras = INV.mejorasDisponibles();
    const poderAct = INV.poderActual();

    muneco.replaceChildren(
      el('div.card-hd', {},
        el('h3', { text: '🧍 Equipo' }),
        el('span.chip', { style:{color:'var(--oro)'}, text: `⚡ ${fmt(poderAct)}` })
      ),
      el('div.muneco', {}, ...CLAVES_SLOTS.map(sid => {
        const s = SLOTS[sid];
        const p = S.equipo.slots[sid];
        const r = p ? getRareza(p.rareza) : null;
        const tieneMejora = mejoras.includes(sid);

        return el(`button.slot${p ? '.lleno' : '.vacio'}`, {
          style: p ? { borderColor: r.color } : {},
          onclick: () => { seleccion = p ? { pieza: p, equipado: true } : null; pintarDetalle(); }
        },
          tieneMejora ? el('span.slot-up', { text: '⬆' }) : null,   // Sugerencia #1
          el('span.slot-ico', { text: p ? p.ico : s.ico }),
          el('small.slot-nom', { text: s.nombre }),
          p
            ? el('small.slot-val', { style:{color:r.color} }, `${'★'.repeat(p.estrellas)}${p.estrellas ? ' ' : ''}+${puntuacion(p)}`)
            : el('small.slot-val', { style:{color:'var(--txt-3)'}, text: 'vacío' })
        );
      })),
      el('p.card-sub', { style:{marginTop:'8px'},
        text: 'Toca un slot para ver la pieza. El ⬆ verde significa que tienes algo mejor guardado.' })
    );
  };

  /* ---------- Avisos (Sugerencia #5) ---------- */
  const pintarAviso = () => {
    const av = INV.avisoInventario();
    avisoBox.replaceChildren(av
      ? el('div.aviso-build', {},
          el('span.ab-ico', { text: '📦' }),
          el('div', {},
            el('p', { text: av.texto }),
            av.basura
              ? el('button.btn.sm.primary', {
                  style:{marginTop:'6px'},
                  onclick: () => {
                    const r = INV.venderBasura(2);
                    toast(`Vendidas ${r.cantidad} piezas por 🪙 ${fmt(r.oro)}`, 'ok');
                    refrescar();
                  }
                }, `🧹 Vender ${av.basura} piezas comunes/raras`)
              : null
          ))
      : el('span'));
  };

  /* ---------- Acciones globales ---------- */
  const pintarAcciones = () => {
    const selStat = el('select.sel-stat', {},
      el('option', { value: '' , text: 'Maximizar Poder' }),
      ...CLAVES_STATS.map(k => el('option', { value: k, text: `Maximizar ${STATS[k].nombre}` }))
    );

    acciones.replaceChildren(
      el('div.card-hd', {},
        el('h3', { text: '⚙️ Gestión' }),
        el('span.chip', {}, `${MATERIAL.ico} ${fmt(INV.material())}`)
      ),

      // 16.11 equipar-mejor por stat objetivo
      el('div.fila-accion', {},
        selStat,
        el('button.btn.sm.primary', {
          onclick: () => {
            const r = INV.equiparMejor(selStat.value || null);
            r.cambios
              ? toast(`✅ ${r.cambios} piezas equipadas`, 'ok')
              : toast('Ya llevas lo mejor que tienes', 'info');
            refrescar();
          }
        }, '🎯 Equipar lo mejor')
      ),

      // 16.05 auto-venta configurable por rareza
      el('div.sec-mini', { text: '🔥 Auto-venta por rareza' }),
      el('div.autoventa', {}, ...listaRarezas().map(r =>
        el(`button.av-chip${S.equipo.autoVenta['r' + r.n] ? '.on' : ''}`, {
          style: { borderColor: r.color, color: S.equipo.autoVenta['r' + r.n] ? '#fff' : r.color,
                   background: S.equipo.autoVenta['r' + r.n] ? r.color : 'transparent' },
          onclick: () => {
            S.equipo.autoVenta['r' + r.n] = !S.equipo.autoVenta['r' + r.n];
            toast(`Auto-venta ${r.nombre}: ${S.equipo.autoVenta['r' + r.n] ? 'ON' : 'OFF'}`,
                  S.equipo.autoVenta['r' + r.n] ? 'bad' : 'ok');
            refrescar();
          }
        }, r.nombre)
      )),
      el('p.card-sub', { text: 'Lo que actives se venderá solo al caer. Las piezas con 🔒 candado nunca se venden solas.' }),

      DEV
        ? el('button.btn.sm', {
            style:{marginTop:'10px'},
            onclick: () => {
              for (let i = 0; i < 5; i++) {
                INV.recoger(generarPieza({ nivel: S.perfil.nivel, clase: S.perfil.clase, suerte: 1.6 }));
              }
              toast('5 piezas de prueba generadas', 'info'); refrescar();
            }
          }, '🧪 DEV: generar 5 piezas')
        : null
    );
  };

  /* ---------- Inventario (16.09, 16.10) ---------- */
  const pintarInventario = () => {
    const inv = S.equipo.inventario;
    const lista = filtroSlot ? inv.filter(p => p.slot === filtroSlot) : inv;

    invBox.replaceChildren(
      el('div.card-hd', {},
        el('h3', { text: '🎒 Inventario' }),
        el('span.chip', {
          style: { color: INV.libres() <= 5 ? 'var(--mal)' : 'var(--txt-2)' }
        }, `${inv.length} / ${EQUIPO.INVENTARIO_MAX}`)
      ),

      // 16.10 ordenación
      el('div.orden-fila', {}, ...Object.values(INV.ORDENES).map(o =>
        el(`button.chip${orden === o.id ? '.ok' : ''}`, {
          onclick: () => { orden = o.id; INV.ordenar(o.id); refrescar(); }
        }, o.nombre)
      )),

      // filtro por slot
      el('div.orden-fila', {},
        el(`button.chip${!filtroSlot ? '.ok' : ''}`, {
          onclick: () => { filtroSlot = null; refrescar(); }
        }, 'Todo'),
        ...CLAVES_SLOTS.map(sid =>
          el(`button.chip${filtroSlot === sid ? '.ok' : ''}`, {
            onclick: () => { filtroSlot = sid; refrescar(); }
          }, SLOTS[sid].ico)
        )
      ),

      lista.length
        ? el('div.inv-grid', {}, ...lista.map(p => tarjetaInv(p)))
        : el('p.card-sub', { style:{padding:'18px 0',textAlign:'center'},
            text: filtroSlot ? 'Nada de ese tipo.' : 'Inventario vacío. Gana luchas para conseguir equipo.' })
    );
  };

  const tarjetaInv = (p) => {
    const r = getRareza(p.rareza);
    const d = INV.delta(p);
    const req = INV.puedeEquipar(p);
    const mejor = d.poderDelta > 0;

    return el(`button.inv-item${seleccion?.pieza?.id === p.id ? '.sel' : ''}`, {
      style: { borderColor: r.color },
      onclick: () => { seleccion = { pieza: p, equipado: false }; pintarDetalle(); }
    },
      p.bloqueado ? el('span.inv-lock', { text: '🔒' }) : null,
      mejor && req.ok ? el('span.inv-up', { text: '⬆' }) : null,
      !req.ok ? el('span.inv-lock2', { text: '🚫' }) : null,
      el('span.inv-ico', { text: p.ico }),
      el('small.inv-nom', { style:{color:r.color}, text: p.nombre }),
      el('small.inv-est', { text: p.estrellas ? '★'.repeat(p.estrellas) : `Nv.${p.nivel}` })
    );
  };

  /* ---------- Detalle de la pieza seleccionada ---------- */
  const pintarDetalle = () => {
    if (!seleccion?.pieza) { detalle.replaceChildren(); return; }
    const p = seleccion.pieza;
    const equipado = seleccion.equipado;
    const r = getRareza(p.rareza);
    const exo = p.exotico ? EXOTICOS[p.exotico] : null;
    const d = equipado ? null : INV.delta(p);
    const req = INV.puedeEquipar(p);
    const prev = FORJA.previsualizar(p);
    const pm = FORJA.puedeMejorar(p);

    detalle.replaceChildren(
      el('div.sec-title', { text: 'Detalle' }),
      el('div.card.pieza-det', { style: { borderColor: r.color } },

        el('div.pd-top', {},
          el('span.pd-ico', { style:{borderColor:r.color}, text: p.ico }),
          el('div', {},
            el('b', { style:{color:r.color}, text: p.nombre }),
            el('div.pd-meta', {},
              el('span.chip', { style:{color:r.color,borderColor:r.color,background:'transparent'}, text: r.nombre }),
              el('span.chip', { text: `Nv.${p.nivel}` }),
              equipado ? el('span.chip.ok', { text: 'Equipado' }) : null
            ),
            el('div.pd-estrellas', { style:{color:'var(--oro)'}, text: FORJA.estrellasTexto(p) })
          )
        ),

        exo ? el('div.pd-exo', {},
          el('b', {}, `${exo.ico} Exótico ${exo.nombre}`),
          el('small', { text: exo.desc })
        ) : null,

        // Stats con delta (16.12)
        el('div.sec-mini', { text: 'Estadísticas' }),
        ...Object.entries(p.stats).map(([k, v]) => {
          const st = STATS[k];
          const cambio = d?.cambios?.[k];
          return el('div.row', {},
            el('span.k', {}, `${st.ico} ${st.nombre}`),
            el('span.v', {},
              el('span', { style:{color: v >= 0 ? 'var(--ok)' : 'var(--mal)'},
                           text: `${v >= 0 ? '+' : ''}${v}` }),
              cambio != null && cambio !== 0
                ? el('small', { style:{color: cambio > 0 ? 'var(--ok)' : 'var(--mal)'},
                                text: ` (${cambio > 0 ? '+' : ''}${cambio})` })
                : null
            )
          );
        }),

        // Sugerencia #4: poder resultante
        !equipado
          ? el('div.pd-poder', {},
              el('span', { text: '⚡ Poder si la equipas' }),
              el('b', { style:{ color: d.poderDelta > 0 ? 'var(--ok)' : d.poderDelta < 0 ? 'var(--mal)' : 'var(--txt-2)' } },
                `${d.poderDelta >= 0 ? '+' : ''}${fmt(d.poderDelta)}`)
            )
          : null,

        el('div.row', {},
          el('span.k', { text: '📋 Requisitos' }),
          el('span.v', { style:{ color: req.ok ? 'var(--ok)' : 'var(--mal)' }, text: textoRequisitos(p) })
        ),
        !req.ok
          ? el('p.card-sub', { style:{color:'var(--mal)'}, text: `Te falta: ${req.faltan.join(', ')}` })
          : null,
        el('div.row', {},
          el('span.k', { text: '🪙 Venta (25%)' }),
          el('span.v', { text: fmt(Math.round(p.valor * 0.25)) })
        ),

        /* ----- Forja (16.01, 16.02) ----- */
        el('div.sec-mini', { text: `${MATERIAL.ico} Forja` }),
        el('p.card-sub', {},
          `Siguiente estrella: 🪙 ${fmt(pm.coste.oro)} + ${MATERIAL.ico} ${pm.coste.material}. `,
          `Tienes ${MATERIAL.ico} ${fmt(INV.material())}.`),
        prev
          ? el('div.pd-prev', {}, ...Object.entries(prev.stats).map(([k, v]) =>
              el('small', {}, `${STATS[k].ico} ${p.stats[k]} → `, el('b', { style:{color:'var(--ok)'}, text: String(v) }))
            ))
          : null,
        el('button.btn.sm.block', {
          disabled: !pm.ok,
          class: pm.ok ? 'btn sm block primary' : 'btn sm block',
          onclick: () => {
            const res = FORJA.mejorar(p.id);
            if (!res.ok) return toast(res.motivo === 'material' ? 'Faltan vendas' : 'Falta oro', 'bad');
            toast(`⭐ ${p.nombre} mejorada a ${p.estrellas}★`, 'ok');
            refrescar();
          }
        }, pm.ok ? `⭐ Mejorar a ${p.estrellas + 1}★` : `Faltan ${pm.faltaOro ? 'oro' : ''}${pm.faltaOro && pm.faltaMat ? ' y ' : ''}${pm.faltaMat ? 'vendas' : ''}`),

        /* ----- Acciones ----- */
        el('div.pd-acciones', {},
          equipado
            ? el('button.btn.sm', {
                onclick: () => {
                  const r2 = INV.quitar(p.slot);
                  if (!r2.ok) return toast('El inventario está lleno', 'bad');
                  toast('Pieza guardada (quitar es gratis)', 'ok');
                  seleccion = null; refrescar();
                }
              }, '📤 Quitar')
            : el('button.btn.sm.primary', {
                disabled: !req.ok,
                onclick: () => {
                  const r2 = INV.equipar(p.id);
                  if (!r2.ok) return toast(`Requisitos: ${(r2.faltan || []).join(', ')}`, 'bad');
                  toast(`${p.nombre} equipada`, 'ok');
                  seleccion = { pieza: p, equipado: true }; refrescar();
                }
              }, '✅ Equipar'),

          !equipado
            ? el('button.btn.sm', {
                onclick: () => {
                  const bloq = INV.alternarBloqueo(p.id);
                  toast(bloq ? '🔒 Protegida de la auto-venta' : '🔓 Desprotegida', 'info');
                  refrescar();
                }
              }, p.bloqueado ? '🔓 Quitar candado' : '🔒 Proteger')
            : null,

          !equipado
            ? el('button.btn.sm.bad', {
                onclick: () => {
                  // 16.03 venta CON confirmación
                  const oro = Math.round(p.valor * 0.25);
                  if (!confirm(`¿Vender ${p.nombre} por ${oro} de oro?\n\nEsta acción no se puede deshacer.`)) return;
                  INV.vender(p);
                  toast(`Vendida por 🪙 ${fmt(oro)}`, 'ok');
                  seleccion = null; refrescar();
                }
              }, '💰 Vender')
            : null
        )
      )
    );
  };

  const refrescar = () => {
    // si la pieza seleccionada ya no existe, se limpia
    if (seleccion?.pieza) {
      const { pieza } = FORJA.localizar(seleccion.pieza.id);
      if (!pieza) seleccion = null;
      else seleccion = { pieza, equipado: S.equipo.slots[pieza.slot]?.id === pieza.id };
    }
    pintarMuneco(); pintarAviso(); pintarAcciones(); pintarInventario(); pintarDetalle();
    emit('hud:refresh');
  };

  root.append(muneco, avisoBox, detalle, acciones, invBox);
  refrescar();
  on('inventario:change', () => { pintarMuneco(); pintarInventario(); });
  on('equipo:change', () => { pintarMuneco(); pintarInventario(); });
}
