/* SELECCIÓN DE RIVAL — 1 de 3 tarjetas (06.04)
   06.12 nivel + poder · 05.05 clase visible
   Sugerencia #2: aviso de contra-clase en la tarjeta
   Sugerencia #3: barra de progreso hacia el jefe */

import { el, toast } from '../core/dom.js';
import { fmt } from '../core/format.js';
import { S } from '../core/state.js';
import { ir } from '../core/router.js';
import { emit } from '../core/events-bus.js';
import { CLASES, relacionClase } from '../data/clases.js';
import { RIVALES } from '../data/constants.js';
import { generarCartas } from '../systems/rival-gen.js';
import { heroeDesdeEstado } from '../systems/fighter.js';
import { probabilidadVictoria, pronostico } from '../systems/power.js';
import { etiquetaDificultad, esJefe, esCampeon } from '../systems/difficulty.js';
import { divisionPorIndice, indiceLocal } from '../data/divisiones.js';
import { RAREZA_RASGO } from '../systems/rival-gen.js';

export function render(root) {
  if (!S.perfil.clase) {
    root.append(el('div.empty', {},
      el('div.em-ico', { text: '🎭' }),
      el('h2', { text: 'Primero elige tu clase' })
    ));
    return;
  }

  const heroe = heroeDesdeEstado();
  const i = S.progreso.rivalIndice;
  const div = divisionPorIndice(i);
  const local = indiceLocal(i);
  const jefe = esJefe(i), campeon = esCampeon(i);

  // Cachear las cartas para que no cambien al repintar (06.04)
  if (!S.progreso.cartasOfrecidas || S.progreso.cartasOfrecidas.indice !== i) {
    S.progreso.cartasOfrecidas = { indice: i, generado: Date.now() };
  }

  const cartas = generarCartas(i, {
    semillaPartida: S.meta.semilla,
    statsHeroe: S.stats,
    nivelHeroe: S.perfil.nivel,
    piso: S.progreso.torrePiso
  });

  /* --- Cabecera de división y progreso al jefe (Sugerencia #3) --- */
  const haciaJefe = RIVALES.JEFE_CADA - ((local + 1) % RIVALES.JEFE_CADA || RIVALES.JEFE_CADA);
  const pasosJefe = (local + 1) % RIVALES.JEFE_CADA || RIVALES.JEFE_CADA;

  root.append(
    el('div.card.div-head', { style: { borderColor: div.color } },
      el('div.dh-top', {},
        el('span.dh-ico', { text: div.ico }),
        el('div', {},
          el('b', { text: `División ${div.n} — ${div.nombre}` }),
          el('small', { text: div.desc })
        )
      ),
      el('div.dh-prog', {},
        el('div.bar', {}, el('i', {
          style: { width: `${(pasosJefe / RIVALES.JEFE_CADA) * 100}%`, background: div.color }
        })),
        el('small', {
          text: campeon ? '👑 ¡Lucha por el campeonato de división!'
              : jefe    ? '💀 ¡Esta lucha es contra un JEFE!'
              : `Lucha ${pasosJefe}/${RIVALES.JEFE_CADA} · faltan ${haciaJefe} para el jefe`
        })
      )
    ),

    el('div.sec-title', { text: 'Elige a tu próximo rival' }),
    el('p.card-sub', { style: { marginBottom: '12px' },
      text: 'Solo puedes enfrentarte a uno. Si pierdes, no avanzas: tendrás que mejorar y volver a intentarlo.' }),

    el('div.cartas', {}, ...cartas.map(r => tarjetaRival(r, heroe, jefe, campeon)))
  );
}

function tarjetaRival(r, heroe, jefe, campeon) {
  const cl = CLASES[r.clase];
  const rel = relacionClase(heroe.clase, r.clase);       // Sugerencia #2
  const prob = probabilidadVictoria(heroe.poder, r.poder);
  const pron = pronostico(prob);
  const dif = etiquetaDificultad(r.poder, heroe.poder);

  const flechaClase = rel === 'ventaja'
    ? el('span.chip.ok', { title: 'Tu clase le hace +10% de daño' }, '⬆ Ventaja de clase')
    : rel === 'desventaja'
      ? el('span.chip.bad', { title: 'Su clase te hace +10% de daño a ti' }, '⬇ Desventaja de clase')
      : null;

  return el(`div.carta.${r.perfil.id}`, {},
    el('div.carta-cinta', { style: { background: r.perfil.id === 'seguro' ? '#2c6b45' : r.perfil.id === 'parejo' ? '#4a3c18' : '#6b2c2c' } },
      `${r.perfil.ico} ${r.perfil.etiqueta}`),

    el('div.carta-top', {},
      el('div.carta-ava', { style: { borderColor: cl.color }, text: cl.ico }),
      el('div.carta-id', {},
        el('b', { text: r.nombre }),
        el('small', {}, `${cl.nombre} · Nivel ${r.nivel}`),
        el('div.carta-tags', {},
          r.esCampeon ? el('span.chip', { style:{borderColor:'#e8b64c',color:'#e8b64c'} }, '👑 Campeón') : null,
          r.esJefe ? el('span.chip', { style:{borderColor:'#c0202a',color:'#e2564f'} }, '💀 Jefe') : null,
          r.esElite ? el('span.chip', { style:{borderColor:'#a765e8',color:'#a765e8'} }, '✨ Élite') : null
        )
      )
    ),

    // 06.12 nivel + poder
    el('div.carta-datos', {},
      dato('⚡ Poder', fmt(r.poder), r.poder > heroe.poder ? 'bad' : 'ok'),
      dato('📊 Pronóstico', `${pron.flecha} ${Math.round(prob * 100)}%`, pron.clase),
      dato('🎯 Dificultad', dif.txt, dif.clase),
      dato('🪙 Recompensa', fmt(r.oro), 'oro')
    ),

    flechaClase ? el('div', { style: { marginTop: '8px' } }, flechaClase) : null,

    // Rasgos (06.13)
    r.rasgos.length
      ? el('div.carta-rasgos', {}, ...r.rasgos.map(g => {
          const rz = RAREZA_RASGO[g.rareza];
          return el('span.chip', { style: { borderColor: rz.color, color: rz.color }, title: g.desc },
            `${g.ico} ${g.nombre}`);
        }))
      : null,

    el('button.btn.primary.block', {
      style: { marginTop: '12px' },
      onclick: () => elegir(r)
    }, 'Luchar contra él')
  );
}

function dato(k, v, clase = '') {
  return el('div.cd', {},
    el('small', { text: k }),
    el(`b${clase ? '.' + clase : ''}`, { text: v })
  );
}

function elegir(r) {
  S.progreso.rivalActual = {
    indice: r.indice, nombre: r.nombre, clase: r.clase, nivel: r.nivel,
    stats: r.stats, poder: r.poder, oro: r.oro, tipo: r.tipo,
    personalidad: r.personalidad, especial: r.especial,
    rasgos: r.rasgos.map(x => x.id)
  };
  emit('rival:elegido', S.progreso.rivalActual);
  toast(`Rival elegido: ${r.nombre}`, 'ok');
  ir('arena');
}
