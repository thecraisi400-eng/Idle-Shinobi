/* ===== MOTOR DE EVENTOS: EJECUTA UN INTENTO =====
   20.08 cura del 30% entre luchas · 20.09 puntos SOLO por victoria
   20.10 rivales invitados temáticos · 20.15 sin consumibles
   19.06 cinco intentos · 19.11 dificultad global fija
   02.11 la descalificación solo existe en eventos

   Un "intento" es una tanda completa: escalera, oleadas o contrarreloj
   según el tipo. Devuelve el desglose para pintarlo paso a paso. */

import { rngDe } from '../core/rng.js';
import { COMBATE, EVENTOS } from '../data/constants.js';
import { TIPOS_EVENTO } from '../data/eventos.js';
import { crearLuchador } from './fighter.js';
import { resolverRapido } from './combat/engine.js';
import { generarNombre } from '../data/nombres.js';
import { CLAVES_CLASES, CLASES } from '../data/clases.js';
import { CLAVES_STATS } from '../data/stats.js';

/** Dificultad global de arranque (19.11): fija, igual para todos. */
export const ARRANQUE = 0.72;

/* ---------- Rivales invitados temáticos (20.10) ---------- */

const APODOS_TEMA = {
  relampago:    ['Chispa', 'Voltio', 'Trueno', 'Centella'],
  coloso:       ['Montaña', 'Titán', 'Mole', 'Bastión'],
  supervivencia:['Carroñero', 'Hiena', 'Chacal', 'Buitre'],
  carreraKO:    ['Bala', 'Flecha', 'Vértigo', 'Ráfaga'],
  leyendas:     ['Maestro', 'Inmortal', 'Eterno', 'Primero'],
  montania:     ['Escalador', 'Cumbre', 'Risco', 'Cóndor'],
  estilo:       ['Diva', 'Galán', 'Estrella', 'Divo']
};

/**
 * Crea el rival número `i` de un evento.
 * 19.11 — la dificultad es GLOBAL y fija: se calcula desde el nivel del
 * jugador pero no se adapta a si vas ganando o perdiendo.
 */
export function rivalDeEvento(idEvento, i, { rng, nivelHeroe, statsHeroe }) {
  const ev = TIPOS_EVENTO[idEvento];
  // ARRANQUE: la primera lucha debe ser asequible. Sin este factor los rivales
  // salen por encima del héroe, porque crearLuchador les aplica bonos de clase
  // sobre las mismas stats base que le pasamos. Calibrado en el Paso 11.
  const mult = ARRANQUE * (ev.dificultadBase || 1) * (1 + (ev.escaladoPorLucha || 0) * i);

  // El nivel NO se escala con la dificultad: eso la duplicaba (stats + nivel).
  // Clase: en Duelo de Leyendas, una por clase en orden (20.05)
  const clase = ev.unaPorClase
    ? CLAVES_CLASES[i % CLAVES_CLASES.length]
    : rng.elegir(CLAVES_CLASES);

  const stats = {};
  for (const k of CLAVES_STATS) {
    const base = statsHeroe?.[k] || 15;
    let v = base * mult * rng.rango(0.9, 1.1);
    if (ev.debilitaRivales) v *= ev.debilitaRivales;
    stats[k] = Math.max(4, Math.round(v));
  }

  // El coloso: vida descomunal, es un saco de arena con guantes (20.02)
  if (ev.vidaColoso) stats.vida = Math.round(stats.vida * ev.vidaColoso);

  // El jefe final de la escalera (20.01)
  const esJefe = ev.jefeFinal && i === ev.luchas - 1;
  if (esJefe) for (const k of CLAVES_STATS) stats[k] = Math.round(stats[k] * 1.3);

  const apodos = APODOS_TEMA[idEvento] || ['Retador'];
  const nombre = `${rng.elegir(apodos)} ${generarNombre(rng).split(' ').slice(-1)[0]}`;

  const l = crearLuchador({
    nombre, clase, nivel: Math.max(1, Math.round(nivelHeroe)),
    stats, personalidad: rng.elegir(['agresivo', 'oportunista', 'defensivo'])
  });
  return Object.assign(l, { esJefe, indiceEvento: i, invitado: true });
}

/* ---------- Puntuación por tipo ---------- */

/**
 * Puntos de UNA lucha. 20.09: solo se puntúa por victoria...
 * excepto en el Asalto al Coloso, donde por diseño se puntúa el daño
 * (allí ganar es imposible: la regla del evento sustituye a la general).
 */
export function puntosDeLucha(idEvento, { gano, res, indice, heroe }) {
  const ev = TIPOS_EVENTO[idEvento];
  let puntos = 0;

  if (ev.modoDano) {
    // 20.02 — se puntúa el daño infligido
    return Math.round((res.resumen?.heroe?.danoInfligido || 0) * ev.puntosPorDano);
  }

  if (!gano) return 0;                      // 20.09 puntos solo por victoria

  puntos += ev.puntosPorVictoria || 0;

  // Bonus creciente por oleada (20.03)
  if (ev.bonusProgresivo) puntos += ev.bonusProgresivo * indice;

  // Defensas del trono valen más (20.06)
  if (ev.subida != null && indice >= ev.subida) {
    puntos = Math.round(puntos * ev.multDefensa * (1 + (indice - ev.subida) * 0.15));
  }

  // Concurso de estilo (20.07): el espectáculo manda
  if (ev.multCarisma) {
    const s = res.resumen?.heroe || {};
    puntos += (s.criticos || 0) * (ev.puntosPorCritico || 0);
    puntos += (s.especiales || 0) * (ev.puntosPorEspecial || 0);
    const car = (heroe?.stats?.carisma || 0) + (heroe?.stats?.presencia || 0);
    puntos = Math.round(puntos * (1 + Math.min(1.2, car * 0.006)));
  }

  return Math.round(puntos);
}

/* ---------- Ejecución de un intento completo ---------- */

/**
 * Corre un intento entero y devuelve el desglose.
 * @param {string} idEvento
 * @param {object} heroe luchador del jugador
 * @param {object} opciones { semilla, nivelHeroe, statsHeroe }
 */
export function correrIntento(idEvento, heroe, opciones = {}) {
  const ev = TIPOS_EVENTO[idEvento];
  if (!ev) return null;

  const { semilla = Date.now(), nivelHeroe = 1, statsHeroe = null } = opciones;
  const rng = rngDe('intento', semilla);

  const luchas = [];
  let puntos = 0;
  let vidaPct = 1;
  let segundosGastados = 0;
  let completado = true;
  let motivoFin = 'completado';

  const maxLuchas = ev.luchas;
  const limiteSeg = ev.segundos || null;

  for (let i = 0; i < maxLuchas; i++) {
    // Contrarreloj: se para al agotar el tiempo (20.04)
    if (limiteSeg && segundosGastados >= limiteSeg) {
      motivoFin = 'tiempo'; completado = false; break;
    }

    const rival = rivalDeEvento(idEvento, i, { rng, nivelHeroe, statsHeroe });

    // Tope de ticks del Asalto al Coloso: 90 s reales (20.02)
    const maxTicks = limiteSeg
      ? Math.max(1, Math.ceil((limiteSeg - segundosGastados) * 1000 / COMBATE.TICK_MS))
      : COMBATE.TICKS_MAX;

    const res = resolverRapido(heroe, rival, {
      semilla: rng.int(1, 1e9),
      vidaHeroePct: vidaPct,
      maxTicks,
      permiteDescalificacion: true      // 02.11 solo en eventos
    });

    const gano = res.ganador === 'heroe';
    const pts = puntosDeLucha(idEvento, { gano, res, indice: i, heroe });
    puntos += pts;

    const dur = (res.ticks || 0) * COMBATE.TICK_MS / 1000;
    segundosGastados += dur;

    luchas.push({
      indice: i, rival: rival.nombre, ico: rival.ico, clase: rival.clase,
      esJefe: rival.esJefe, gano, puntos: pts, duracion: dur,
      motivo: res.motivo,
      dano: res.resumen?.heroe?.danoInfligido || 0,
      criticos: res.resumen?.heroe?.criticos || 0,
      especiales: res.resumen?.heroe?.especiales || 0
    });

    if (!gano && !ev.modoDano) {
      // En la carrera de KOs el reloj sigue: pasas al siguiente rival
      if (ev.contraReloj) {
        vidaPct = 1;                        // te reponen para el siguiente
        continue;
      }
      completado = false; motivoFin = 'derrota';
      break;
    }

    // 20.08 — cura del 30% entre luchas, salvo en Supervivencia (20.03)
    if (ev.sinCura) {
      vidaPct = Math.max(0.05, (res.vidaHeroe ?? 0) / heroe.der.vidaMax);
    } else {
      const restante = (res.vidaHeroe ?? heroe.der.vidaMax) / heroe.der.vidaMax;
      vidaPct = Math.min(1, restante + COMBATE.CURA_ENTRE_LUCHAS_EVENTO);
    }
    if (limiteSeg && segundosGastados >= limiteSeg) { motivoFin = 'tiempo'; break; }
  }

  // Bonus por completar la escalera entera (20.01, 20.05)
  if (completado && ev.bonusFinal && luchas.length >= ev.luchas) {
    puntos += ev.bonusFinal;
  }

  return {
    idEvento, puntos, luchas,
    victorias: luchas.filter(l => l.gano).length,
    completado, motivoFin,
    segundos: Math.round(segundosGastados),
    danoTotal: luchas.reduce((a, l) => a + l.dano, 0)
  };
}

/** Texto corto del resultado, para el historial. */
export function resumenIntento(r) {
  if (!r) return '';
  const ev = TIPOS_EVENTO[r.idEvento];
  if (ev.modoDano) return `${Math.round(r.danoTotal)} de daño en ${r.segundos}s`;
  if (ev.contraReloj) return `${r.victorias} KOs en ${r.segundos}s`;
  if (ev.sinCura) return `${r.victorias} oleadas superadas`;
  return r.completado ? `Completado (${r.victorias}/${ev.luchas})` : `Caíste en la lucha ${r.luchas.length}`;
}
