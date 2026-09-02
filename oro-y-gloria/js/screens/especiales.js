/* SELECTOR DE MOVIMIENTO ESPECIAL (12.14 catálogo + evolución)
   Sugerencia #2 del Paso 6: vista previa animada de cada movimiento.
   Sugerencia #3: contador de usos que desbloquea la evolución. */

import { el, toast } from '../core/dom.js';
import { S } from '../core/state.js';
import { emit } from '../core/events-bus.js';
import { ESTADOS } from '../data/estados.js';
import {
  ESPECIALES, listaEspeciales, nivelPorUsos, usosParaSiguiente,
  estaDesbloqueado, NIVELES_EVOLUCION
} from '../data/especiales.js';

export function render(root) {
  const lista = el('div.esp-lista');

  const pintar = () => {
    lista.replaceChildren(...listaEspeciales().map(e => tarjeta(e, pintar)));
  };

  root.append(
    el('div.sec-title', { text: 'Movimiento especial' }),
    el('p.card-sub', {
      style: { marginBottom: '12px' },
      text: 'Se ejecuta solo al llenarse tu barra de momentum. Cada movimiento evoluciona con el uso: cuanto más lo ejecutas, más potente y más estados aplica.'
    }),
    lista
  );
  pintar();
}

function tarjeta(e, repintar) {
  const usos = S.especial.usos[e.id] || 0;
  const nivel = nivelPorUsos(usos);
  const faltan = usosParaSiguiente(usos);
  const activo = S.especial.actual === e.id;
  const abierto = estaDesbloqueado(e.id, S.perfil.nivel);

  // Barra de progreso hacia la siguiente evolución
  const objetivo = faltan == null ? usos : NIVELES_EVOLUCION[nivel];
  const previo = NIVELES_EVOLUCION[nivel - 1] || 0;
  const prog = faltan == null ? 1 : (usos - previo) / (objetivo - previo);

  const datos = e.aplicar(nivel);
  const estadosQueAplica = [...(datos.estados || []), ...(datos.estadosPropios || [])];

  return el(`div.esp-card${activo ? '.activo' : ''}${abierto ? '' : '.bloqueado'}`, {},
    el('div.esp-head', {},
      el('div.esp-demo', { text: e.ico }),          // Sugerencia #2: vista previa animada
      el('div.esp-tit', {},
        el('b', { text: e.nombre }),
        el('small', { text: e.desc })
      ),
      el('div.esp-nivel', {},
        el('span.chip.oro', { text: `Nv ${nivel}/4` })
      )
    ),

    abierto
      ? el('div', {},
          el('div.esp-efecto', { text: e.evolucion[nivel - 1] }),
          estadosQueAplica.length
            ? el('div.esp-estados', {}, ...estadosQueAplica.map(x => {
                const d = ESTADOS[x.id];
                return el('span.chip', {
                  style: { borderColor: d.color, color: d.color },
                  title: d.desc
                }, `${d.ico} ${d.nombre}${x.prob ? ` ${Math.round(x.prob * 100)}%` : ''}`);
              }))
            : null,
          el('div.esp-prog', {},
            el('div.bar', {}, el('i', { style: { width: `${prog * 100}%`, background: 'var(--oro)' } })),
            el('small', {
              text: faltan == null
                ? `⭐ Evolución máxima · ${usos} usos`
                : `${usos} usos · faltan ${faltan} para el nivel ${nivel + 1}`
            })
          ),
          activo
            ? el('div.chip.ok', { style: { marginTop: '10px' }, text: '✔ Equipado' })
            : el('button.btn.sm.block', {
                style: { marginTop: '10px' },
                onclick: () => {
                  S.especial.actual = e.id;
                  if (!S.especial.desbloqueados.includes(e.id)) S.especial.desbloqueados.push(e.id);
                  emit('especial:change', e.id);
                  toast(`${e.ico} ${e.nombre} equipado`, 'ok');
                  repintar();
                }
              }, 'Equipar')
        )
      : el('div.esp-lock', { text: `🔒 Se desbloquea en el nivel ${e.desbloqueo.nivel}` })
  );
}
