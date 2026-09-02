/* PANTALLA TIENDA — Paso 13
   25.01 tres secciones · 25.10 lista simple, sin portada · 25.11 sin búsqueda
   25.07 vista previa con comparación · 25.08 toda compra confirmada
   25.12 stock diario visible · 25.03 oferta diaria · 25.14 mercado negro
   26.14 solo precio, sin "valor relativo" · 26.15 sin vendedores
   Sugerencias: #1 temporizador de rotación · #2 historial · #3 etiqueta
   "mejor que lo tuyo" · #4 lista de deseos · #5 pista del mercado negro */

import { el, toast } from '../core/dom.js';
import { fmt, hms } from '../core/format.js';
import { S } from '../core/state.js';
import { getRareza } from '../data/equipo.js';
import { SECCIONES, LOGRO_MERCADO_NEGRO } from '../data/tienda.js';
import * as SHOP from '../systems/shop.js';
import * as CONS from '../systems/consumables.js';

let seccion = 'pociones';
let relojTimer = null;

export function render(root) {
  const cabecera = el('div');
  const tabs = el('div.tienda-tabs');
  const cuerpo = el('div');

  SHOP.sincronizarDia();

  /* ---------- Sugerencia #1: temporizador de rotación ---------- */
  const pintarCabecera = () => {
    const ms = SHOP.msParaRotacion();
    const deseos = SHOP.deseosEnVitrina();          // Sugerencia #4
    cabecera.replaceChildren(
      el('div.card.rotacion', {},
        el('div', {},
          el('small', { text: 'NUEVO STOCK EN' }),
          el('b.rot-reloj', { text: hms(ms / 1000) })
        ),
        el('div.rot-monedas', {},
          el('b', { text: `🪙 ${fmt(S.monedas.oro)}` }),
          el('b', { style: { color: '#7fd8ff' }, text: `💎 ${fmt(S.monedas.gemas)}` })
        )
      ),
      deseos.length
        ? el('div.deseo-aviso', {},
            `⭐ ${deseos.length} pieza(s) de tu lista de deseos están en la vitrina`)
        : null
    );
  };

  const pintarTabs = () => {
    const abiertas = ['pociones', 'equipo', 'ofertas'];
    const negro = SHOP.mercadoNegroAbierto();
    tabs.replaceChildren(
      ...abiertas.map(id => el(`button.chip${seccion === id ? '.ok' : ''}`, {
        onclick: () => { seccion = id; pintar(); }
      }, `${SECCIONES[id].ico} ${SECCIONES[id].nombre}`)),
      // Sugerencia #5: la puerta cerrada se VE
      negro
        ? el(`button.chip${seccion === 'negro' ? '.ok' : ''}`, {
            onclick: () => { seccion = 'negro'; pintar(); }
          }, '🕯️ Mercado Negro')
        : el('button.chip.bloqueado', {
            onclick: () => toast(`Se abre con el logro "${LOGRO_MERCADO_NEGRO}"`, 'info', 3200)
          }, '🔒 ???')
    );
  };

  /* ---------- Lista simple (25.10) ---------- */
  const pintar = () => {
    pintarCabecera(); pintarTabs();
    const sec = SECCIONES[seccion];
    const items = SHOP.catalogo(seccion);

    cuerpo.replaceChildren(
      el('div.sec-title', { text: `${sec.ico} ${sec.nombre}` }),
      el('p.card-sub', { text: sec.desc }),

      seccion === 'negro' && !SHOP.mercadoNegroAbierto()
        ? el('div.card.negro-cerrado', {},
            el('span', { style: { fontSize: '36px' }, text: '🕯️' }),
            el('b', { text: 'Aquí no hay nada... todavía' }),
            el('p.card-sub', { text: 'Dicen que un coleccionista abre esta puerta.' }))
        : null,

      items.length === 0 && seccion !== 'negro'
        ? el('div.card', {}, el('p.card-sub', { text: 'Todo vendido. Vuelve en la próxima rotación.' }))
        : null,

      ...items.map(p => p.slot ? tarjetaPieza(p) : tarjetaConsumible(p)),

      // Sugerencia #2: historial de rotaciones
      (seccion === 'equipo')
        ? el('button.btn.sm.block', { style: { marginTop: '10px' }, onclick: verHistorial },
            '🕐 Ver las 5 rotaciones anteriores')
        : null
    );
  };

  /* ---------- Consumibles ---------- */
  const tarjetaConsumible = (p) => {
    const moneda = p.moneda === 'gemas' ? '💎' : '🪙';
    const tengo = CONS.cantidad(p.id);
    return el(`div.prod${p.agotado ? '.agotado' : ''}${p.esOferta ? '.oferta' : ''}`, {
      onclick: () => p.agotado ? toast('Agotado por hoy', 'info') : confirmarCompra(p)
    },
      el('span.prod-ico', { text: p.ico }),
      el('div.prod-info', {},
        el('b', {}, p.nombre,
          p.esOferta ? el('span.badge-oferta', { text: ' −50% HOY' }) : null,
          p.comodidad ? el('span.badge-comodidad', { text: ' comodidad' }) : null),
        el('small', { text: p.desc }),
        el('div.prod-meta', {},
          // 25.12 stock diario visible
          el('span.stock', { text: p.agotado ? 'agotado hoy' : `quedan ${p.stockRestante} hoy` }),
          tengo ? el('span.tengo', { text: `llevas ${tengo}` }) : null
        )
      ),
      el('div.prod-precio', {},
        p.esOferta ? el('small.tachado', { text: `${fmt(p.precioOriginal)}` }) : null,
        el('b', { text: `${moneda} ${fmt(p.precio)}` })
      )
    );
  };

  /* ---------- Equipo: 25.07 vista previa con comparación ---------- */
  const tarjetaPieza = (p) => {
    const r = getRareza(p.rareza);
    const cmp = SHOP.comparaConEquipado(p);       // Sugerencia #3
    const deseada = SHOP.enDeseos(p.slot, p.rareza);

    return el('div.prod.prod-pieza', { style: { borderLeftColor: r.color } },
      el('div.pieza-top', { onclick: () => confirmarCompra(p) },
        el('span.prod-ico', { style: { color: r.color }, text: p.ico }),
        el('div.prod-info', {},
          el('b', { style: { color: r.color } }, p.nombre,
            // Sugerencia #3: la etiqueta que decide la compra
            cmp.mejor ? el('span.badge-mejor', { text: ' ▲ MEJOR QUE LO TUYO' }) : null),
          el('small', { text: `${r.nombre} · Nv ${p.nivel} · ${'★'.repeat(p.estrellas)}` }),
          el('div.stats-pieza', {}, ...Object.entries(p.stats).map(([k, v]) =>
            el(`span.st${v < 0 ? '.neg' : ''}`, { text: `${v > 0 ? '+' : ''}${v} ${k.slice(0, 4)}` })))
        ),
        el('div.prod-precio', {}, el('b', { text: `🪙 ${fmt(p.precio)}` }))
      ),
      // 25.07 comparación explícita contra lo equipado
      el('div.comparacion', {},
        cmp.vacio
          ? el('small', { text: 'No llevas nada en este hueco.' })
          : el('small', {}, `Llevas: ${cmp.actual.nombre} (${cmp.puntosActual} pts) · `,
              el('b', { class: cmp.delta >= 0 ? 'pos' : 'neg',
                        text: `${cmp.delta >= 0 ? '+' : ''}${cmp.delta} pts` })),
        // Sugerencia #4: lista de deseos
        el('button.btn-deseo', {
          onclick: (e) => {
            e.stopPropagation();
            const puesto = SHOP.alternarDeseo(p.slot, p.rareza);
            toast(puesto ? 'Añadido a tu lista de deseos' : 'Quitado de la lista', 'ok');
            pintar();
          }
        }, deseada ? '⭐' : '☆')
      )
    );
  };

  /* ---------- 25.08 confirmación de TODA compra ---------- */
  const confirmarCompra = (p) => {
    const check = SHOP.puedeComprar(p);
    const moneda = p.moneda === 'gemas' ? '💎' : '🪙';
    const saldo = p.moneda === 'gemas' ? S.monedas.gemas : S.monedas.oro;

    const overlay = el('div.modal-fondo', {
      onclick: (e) => { if (e.target === overlay) overlay.remove(); }
    },
      el('div.modal', {},
        el('div.modal-hd', {},
          el('span', { style: { fontSize: '30px' }, text: p.ico }),
          el('div', {},
            el('b', { text: p.nombre }),
            el('small', { text: p.desc || `${getRareza(p.rareza)?.nombre || ''} Nv ${p.nivel || ''}` })
          )
        ),
        el('div.modal-precio', {},
          el('div', {}, el('small', { text: 'Precio' }), el('b', { text: `${moneda} ${fmt(p.precio)}` })),
          el('div', {}, el('small', { text: 'Tu saldo' }), el('b', { text: `${moneda} ${fmt(saldo)}` })),
          el('div', {}, el('small', { text: 'Te quedará' }),
            el('b', { class: saldo - p.precio < 0 ? 'neg' : '', text: `${moneda} ${fmt(Math.max(0, saldo - p.precio))}` }))
        ),
        // 25.09 aviso honesto
        el('p.card-sub', { text: 'No hay devoluciones. Lo comprado, comprado está.' }),
        !check.ok ? el('div.modal-error', { text: check.motivo }) : null,
        el('div.modal-botones', {},
          el('button.btn', { onclick: () => overlay.remove() }, 'Cancelar'),
          check.ok
            ? el('button.btn.primary', {
                onclick: () => {
                  const r = SHOP.comprar(p);
                  toast(r.mensaje, r.ok ? 'ok' : 'mal');
                  overlay.remove();
                  pintar();
                }
              }, 'Confirmar compra')
            : el('button.btn', { disabled: true }, 'No disponible')
        )
      )
    );
    document.body.appendChild(overlay);
  };

  /* ---------- Sugerencia #2: historial de rotaciones ---------- */
  const verHistorial = () => {
    const rots = SHOP.rotacionesPasadas(5, Date.now(), S.perfil.nivel);
    const overlay = el('div.modal-fondo', {
      onclick: (e) => { if (e.target === overlay) overlay.remove(); }
    },
      el('div.modal.modal-alto', {},
        el('b', { text: '🕐 Rotaciones anteriores' }),
        el('p.card-sub', { text: 'Lo que hubo en las últimas 5 horas. Sirve para saber si merece la pena esperar.' }),
        ...rots.map(r => el('div.rot-bloque', {},
          el('small.rot-hora', { text: `${String(r.hora).padStart(2, '0')}:00` }),
          el('div.rot-piezas', {}, ...r.piezas.map(p => {
            const rr = getRareza(p.rareza);
            return el('span.rot-pieza', { style: { borderColor: rr.color, color: rr.color },
                                          title: p.nombre, text: p.ico });
          }))
        )),
        el('button.btn.block', { onclick: () => overlay.remove() }, 'Cerrar')
      )
    );
    document.body.appendChild(overlay);
  };

  root.append(cabecera, tabs, cuerpo);
  pintar();

  // Sugerencia #1: el reloj corre solo
  if (relojTimer) clearInterval(relojTimer);
  relojTimer = setInterval(() => {
    if (!document.body.contains(cabecera)) { clearInterval(relojTimer); relojTimer = null; return; }
    const ms = SHOP.msParaRotacion();
    const reloj = cabecera.querySelector('.rot-reloj');
    if (reloj) reloj.textContent = hms(ms / 1000);
    if (ms <= 1000) { SHOP.sincronizarDia(); pintar(); }
  }, 1000);
}
