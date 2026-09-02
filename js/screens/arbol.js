/* PANTALLA ÁRBOL DE HABILIDADES — Paso 10
   17.15 los bloqueados enseñan requisitos · 18.13 cada nodo muestra tu valor
   17.10 sin resumen global de efecto acumulado
   Sugerencias: #1 planificador de ruta · #2 minimapa · #3 doble confirmación
   en keystones · #4 búsqueda por texto · #5 puntos por rama */

import { el, toast } from '../core/dom.js';
import { fmt } from '../core/format.js';
import { on, emit } from '../core/events-bus.js';
import { S } from '../core/state.js';
import { RAMAS, CLAVES_RAMAS } from '../data/pasivas.js';
import { nodosDeTier, TIERS_BASE, nivelRequerido } from '../data/arbol.js';
import * as AR from '../systems/skilltree.js';

let ramaActiva = 'potencia';
let tierVista = 1;
let seleccionado = null;
let textoBusqueda = '';
let resaltados = new Set();

export function render(root) {
  const cabecera = el('div.card');
  const ramasBox = el('div.ramas-scroll');
  const buscaBox = el('div.card');
  const lienzo   = el('div.card');
  const detalle  = el('div', { id: 'nodo-detalle' });

  /* ---------- Cabecera: puntos y gasto por rama (Sugerencia #5) ---------- */
  const pintarCabecera = () => {
    const gasto = AR.gastoPorRama();
    const total = AR.gastoTotal();
    const disp = AR.puntosDisponibles();

    cabecera.replaceChildren(
      el('div.card-hd', {},
        el('h3', { text: '🌳 Árbol de habilidades' }),
        el('span.chip', { style:{ color: disp ? 'var(--ok)' : 'var(--txt-3)' } },
          `${disp} punto${disp === 1 ? '' : 's'}`)
      ),
      el('p.card-sub', {},
        `Has invertido ${total} puntos. Cada nivel te da uno. `,
        el('b', { text: 'No hay reasignación: piensa antes de gastar.' })),

      // Sugerencia #5: barra de reparto por rama
      el('div.reparto', {}, ...CLAVES_RAMAS.map(id => {
        const r = RAMAS[id];
        const pct = total ? (gasto[id] / total) * 100 : 0;
        return gasto[id] > 0
          ? el('div.rep-seg', { style:{ width:`${pct}%`, background:r.color },
                                title:`${r.nombre}: ${gasto[id]}` })
          : null;
      })),
      el('div.rep-leyenda', {}, ...CLAVES_RAMAS.filter(id => gasto[id] > 0).map(id =>
        el('small', {}, el('i', { style:{background:RAMAS[id].color} }), `${RAMAS[id].ico} ${gasto[id]}`)
      ))
    );
  };

  /* ---------- Selector de ramas (17.13 apertura progresiva) ---------- */
  const pintarRamas = () => {
    ramasBox.replaceChildren(...AR.estadoRamas().map(r =>
      el(`button.rama-btn${ramaActiva === r.id ? '.sel' : ''}${r.abierta ? '' : '.cerrada'}`, {
        style: { borderColor: r.abierta ? r.color : 'var(--linea)' },
        onclick: () => {
          if (!r.abierta) return toast(`Se abre al nivel ${r.nivelRama}`, 'bad');
          ramaActiva = r.id; tierVista = AR.tierAlcanzado(r.id); seleccionado = null; refrescar();
        }
      },
        el('span.rb-ico', { text: r.abierta ? r.ico : '🔒' }),
        el('b', { style:{ color: r.abierta ? r.color : 'var(--txt-3)' }, text: r.nombre }),
        el('small', { text: r.abierta ? `${r.nodosComprados} nodos · ${r.gastado} pts` : `Nivel ${r.nivelRama}` })
      )
    ));
  };

  /* ---------- Búsqueda (Sugerencia #4) ---------- */
  const pintarBusqueda = () => {
    const input = el('input.busca-input', {
      type: 'search', placeholder: 'Buscar: crítico, oro, escudo, esquiva...',
      value: textoBusqueda,
      oninput: (e) => {
        textoBusqueda = e.target.value;
        const res = AR.buscar(textoBusqueda, TIERS_BASE + 2);
        resaltados = new Set(res.map(n => n.id));
        pintarResultados(res);
        pintarLienzo();
      }
    });
    const resultados = el('div.busca-res');

    const pintarResultados = (res) => {
      if (!textoBusqueda.trim()) { resultados.replaceChildren(); return; }
      resultados.replaceChildren(
        el('p.card-sub', { text: `${res.length} nodos coinciden.` }),
        ...res.slice(0, 8).map(n =>
          el('button.busca-item', {
            style:{ borderColor: RAMAS[n.rama].color },
            onclick: () => {
              ramaActiva = n.rama; tierVista = n.tier; seleccionado = n; refrescar();
            }
          },
            el('span', { text: n.ico }),
            el('div', {},
              el('b', { text: n.nombre }),
              el('small', { text: `${RAMAS[n.rama].ico} ${RAMAS[n.rama].nombre} · Tier ${n.tier}` })
            )
          )
        )
      );
    };

    buscaBox.replaceChildren(input, resultados);
    if (textoBusqueda) pintarResultados(AR.buscar(textoBusqueda, TIERS_BASE + 2));
  };

  /* ---------- Lienzo: los nodos del tier actual ---------- */
  const pintarLienzo = () => {
    const rama = RAMAS[ramaActiva];
    const maxTier = TIERS_BASE + 3;
    const nodos = nodosDeTier(ramaActiva, tierVista);

    lienzo.replaceChildren(
      el('div.tier-nav', {},
        el('button.btn.sm', {
          disabled: tierVista <= 1,
          onclick: () => { tierVista--; pintarLienzo(); }
        }, '◀'),
        el('div.tier-info', {},
          el('b', { style:{color:rama.color} }, `${rama.ico} ${rama.nombre}`),
          el('small', { text: `Tier ${tierVista} · nivel ${nivelRequerido(ramaActiva, tierVista)}+` })
        ),
        el('button.btn.sm', {
          disabled: tierVista >= maxTier,
          onclick: () => { tierVista++; pintarLienzo(); }
        }, '▶')
      ),

      // Sugerencia #2: minimapa de tiers
      el('div.minimapa', {}, ...Array.from({ length: maxTier }, (_, i) => {
        const t = i + 1;
        const comprados = AR.comprasEnTier(ramaActiva, t);
        return el(`div.mm-tier${t === tierVista ? '.aqui' : ''}${comprados ? '.hecho' : ''}`, {
          style: comprados ? { background: rama.color } : {},
          title: `Tier ${t}: ${comprados} nodos`,
          onclick: () => { tierVista = t; pintarLienzo(); }
        });
      })),

      el('div.nodo-grid', {}, ...nodos.map(n => tarjetaNodo(n, rama)))
    );
  };

  const tarjetaNodo = (n, rama) => {
    const rango = AR.rangoDe(n.id);
    const req = AR.requisitos(n);
    const puede = AR.puedeComprar(n);
    const coste = AR.costeSiguiente(n);
    const esKey = n.tipo === 'keystone';
    const alMax = rango >= n.rangosMax;
    const marcado = resaltados.has(n.id) && textoBusqueda.trim();

    let clase = 'nodo';
    if (esKey) clase += ' key';
    if (rango > 0) clase += ' comprado';
    if (!req.ok) clase += ' bloqueado';
    if (seleccionado?.id === n.id) clase += ' sel';
    if (marcado) clase += ' marcado';

    return el(`button.${clase.split(' ').join('.')}`, {
      style: { borderColor: rango > 0 ? rama.color : undefined },
      onclick: () => { seleccionado = n; pintarDetalle(); pintarLienzo(); }
    },
      el('span.nodo-ico', { text: req.ok ? n.ico : '🔒' }),
      el('small.nodo-nom', { text: n.nombre }),
      el('div.nodo-pips', {}, ...Array.from({ length: n.rangosMax }, (_, i) =>
        el(`i${i < rango ? '.on' : ''}`, { style: i < rango ? { background: rama.color } : {} })
      )),
      el('small.nodo-coste', {
        style: { color: alMax ? 'var(--oro)' : puede.ok ? 'var(--ok)' : 'var(--txt-3)' }
      }, alMax ? 'MÁX' : `${coste} pt`)
    );
  };

  /* ---------- Detalle del nodo ---------- */
  const pintarDetalle = () => {
    if (!seleccionado) { detalle.replaceChildren(); return; }
    const n = seleccionado;
    const rama = RAMAS[n.rama];
    const rango = AR.rangoDe(n.id);
    const req = AR.requisitos(n);
    const puede = AR.puedeComprar(n);
    const desc = AR.descripcion(n);
    const ruta = !req.ok ? AR.rutaHasta(n) : null;
    const esKey = n.tipo === 'keystone';

    detalle.replaceChildren(
      el('div.sec-title', { text: esKey ? '⭐ Keystone' : 'Nodo' }),
      el('div.card.nodo-det', { style:{ borderColor: rama.color } },
        el('div.nd-top', {},
          el('span.nd-ico', { style:{ borderColor: rama.color }, text: n.ico }),
          el('div', {},
            el('b', { text: n.nombre }),
            el('div.nd-meta', {},
              el('span.chip', { style:{ color:rama.color, borderColor:rama.color, background:'transparent' } },
                `${rama.ico} ${rama.nombre}`),
              el('span.chip', { text: `Tier ${n.tier}` }),
              rango > 0 ? el('span.chip.ok', { text: `Rango ${rango}/${n.rangosMax}` }) : null
            )
          )
        ),

        esKey
          ? el('div.nd-key', {},
              el('b', { text: '⚠️ Cambia una regla del combate' }),
              el('small', { text: n.desc })
            )
          : null,

        // 18.13 tu valor actual
        el('div.nd-valores', {},
          el('div.nv-fila', {},
            el('small', { text: 'Ahora' }),
            el('b', { style:{ color: rango ? 'var(--ok)' : 'var(--txt-3)' }, text: desc.actual })
          ),
          desc.siguiente
            ? el('div.nv-fila', {},
                el('small', { text: 'Siguiente rango' }),
                el('b', { style:{ color:'var(--acento)' }, text: desc.siguiente })
              )
            : el('div.nv-fila', {},
                el('small', { text: 'Estado' }),
                el('b', { style:{ color:'var(--oro)' }, text: 'Rango máximo' })
              )
        ),

        // 17.15 requisitos visibles
        !req.ok
          ? el('div.nd-bloqueo', {},
              el('b', { text: '🔒 Requisitos que faltan' }),
              el('ul', {}, ...req.faltan.map(f => el('li', { text: f })))
            )
          : null,

        // Sugerencia #1: planificador de ruta
        ruta && ruta.pasos.length > 1
          ? el('div.nd-ruta', {},
              el('b', { text: `🗺️ Ruta hasta aquí — ${ruta.coste} puntos` }),
              el('ol', {}, ...ruta.pasos.map(p =>
                el('li', {}, `${p.nodo.ico} ${p.nodo.nombre} (${p.coste} pt)`)
              )),
              el('small', {
                style:{ color: ruta.alcanzable ? 'var(--ok)' : 'var(--mal)' },
                text: ruta.alcanzable
                  ? '✅ Puedes recorrerla ahora mismo.'
                  : `Faltan ${ruta.faltanPuntos} puntos${ruta.faltanNiveles ? ` y ${ruta.faltanNiveles} niveles` : ''}.`
              })
            )
          : null,

        el('button.btn.block', {
          class: puede.ok ? 'btn block primary' : 'btn block',
          disabled: !puede.ok,
          onclick: () => comprar(n, esKey)
        },
          puede.ok ? `Comprar rango ${rango + 1} · ${puede.coste} pt`
          : puede.motivo === 'maximo' ? 'Rango máximo alcanzado'
          : puede.motivo === 'puntos' ? `Faltan ${puede.coste - AR.puntosDisponibles()} puntos`
          : 'Bloqueado')
      )
    );
  };

  /* ---------- Sugerencia #3: doble confirmación solo en keystones ---------- */
  const comprar = (n, esKey) => {
    if (esKey) {
      const ok = confirm(
        `⭐ KEYSTONE: ${n.nombre}\n\n${n.desc}\n\n` +
        `Cambia una regla del combate y NO se puede reasignar. ¿Continuar?`
      );
      if (!ok) return;
    }
    const r = AR.comprar(n);
    if (!r.ok) return toast('No se pudo comprar', 'bad');
    toast(`${n.ico} ${n.nombre} → rango ${r.rango}`, 'ok');
    refrescar();
  };

  const refrescar = () => {
    pintarCabecera(); pintarRamas(); pintarBusqueda(); pintarLienzo(); pintarDetalle();
    emit('hud:refresh');
  };

  root.append(cabecera, ramasBox, buscaBox, lienzo, detalle);
  // arranca en la rama con más inversión, o en la primera abierta
  const abiertas = AR.estadoRamas().filter(r => r.abierta);
  if (abiertas.length && !abiertas.some(r => r.id === ramaActiva)) ramaActiva = abiertas[0].id;
  tierVista = AR.tierAlcanzado(ramaActiva);
  refrescar();
  on('nivel:up', refrescar);
}
