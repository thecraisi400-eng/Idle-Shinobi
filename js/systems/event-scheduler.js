/* ===== RUEDA HORARIA DE EVENTOS =====
   19.01 siete eventos de 3h · 19.02 de 00:00 a 21:00
   19.03 orden aleatorio cada día (pero estable durante todo el día)
   19.15 domingos x2 · 19.14 se guarda el último evento
   20.13 cronómetro siempre visible

   La clave del diseño: el orden se deriva de una SEMILLA DIARIA.
   Así el jugador ve lo mismo aunque recargue, y no hay que guardar nada. */

import { rngDe } from '../core/rng.js';
import { CLAVES_EVENTOS, TIPOS_EVENTO, HORAS_INICIO, DURACION_MS, etiquetaFranja } from '../data/eventos.js';
import { EVENTOS } from '../data/constants.js';

/** Clave del día: "2026-09-02". Cambia a medianoche local. */
export function claveDia(fecha = new Date()) {
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  const dos = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

/** 19.15 — ¿es domingo? Entonces los premios se duplican. */
export function esDomingo(fecha = new Date()) {
  const d = fecha instanceof Date ? fecha : new Date(fecha);
  return d.getDay() === 0;
}

export function multiplicadorDia(fecha = new Date()) {
  return esDomingo(fecha) ? EVENTOS.MULT_DOMINGO : 1;
}

/**
 * 19.03 — orden de los 7 eventos para un día concreto.
 * Determinista: el mismo día siempre da el mismo orden.
 */
export function ordenDelDia(fecha = new Date()) {
  const rng = rngDe('eventos', claveDia(fecha));
  return rng.barajar(CLAVES_EVENTOS);
}

/**
 * Agenda completa del día: 7 franjas de 3 horas con su evento.
 * Devuelve objetos con inicio/fin absolutos en milisegundos.
 */
export function agendaDelDia(fecha = new Date()) {
  const d = fecha instanceof Date ? new Date(fecha) : new Date(fecha);
  const orden = ordenDelDia(d);
  const base = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime();

  return orden.map((idEvento, i) => ({
    indice: i,
    id: idEvento,
    evento: TIPOS_EVENTO[idEvento],
    horaInicio: HORAS_INICIO[i],
    inicio: base + HORAS_INICIO[i] * 3600 * 1000,
    fin: base + HORAS_INICIO[i] * 3600 * 1000 + DURACION_MS,
    etiqueta: etiquetaFranja(i),
    dia: claveDia(d)
  }));
}

/** El evento que está corriendo AHORA (o null si estamos fuera de horario). */
export function eventoActivo(ahora = Date.now()) {
  const agenda = agendaDelDia(new Date(ahora));
  return agenda.find(f => ahora >= f.inicio && ahora < f.fin) || null;
}

/** El siguiente evento que empezará (puede ser de mañana). */
export function proximoEvento(ahora = Date.now()) {
  const agenda = agendaDelDia(new Date(ahora));
  const siguiente = agenda.find(f => f.inicio > ahora);
  if (siguiente) return siguiente;
  // Después de las 21:00 ya no queda nada hoy: el primero de mañana
  const manana = new Date(ahora + 24 * 3600 * 1000);
  return agendaDelDia(manana)[0];
}

/** 20.13 — milisegundos que faltan para que termine el evento activo. */
export function tiempoRestante(ahora = Date.now()) {
  const act = eventoActivo(ahora);
  if (!act) {
    const prox = proximoEvento(ahora);
    return { activo: false, ms: prox.inicio - ahora, franja: prox };
  }
  return { activo: true, ms: act.fin - ahora, franja: act };
}

/* ---------- Sugerencia #5: calendario semanal ---------- */

/** Agenda de los próximos 7 días, para planificar cuándo conectarse. */
export function calendarioSemanal(desde = Date.now()) {
  const out = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(desde + i * 24 * 3600 * 1000);
    out.push({
      dia: claveDia(d),
      fecha: d,
      nombreDia: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][d.getDay()],
      esDomingo: esDomingo(d),
      multiplicador: multiplicadorDia(d),
      franjas: agendaDelDia(d)
    });
  }
  return out;
}

/** Sugerencia #5: ¿cuándo vuelve a tocar un tipo de evento concreto? */
export function proximasVecesDe(idEvento, desde = Date.now(), dias = 7) {
  const out = [];
  for (let i = 0; i < dias; i++) {
    const d = new Date(desde + i * 24 * 3600 * 1000);
    for (const f of agendaDelDia(d)) {
      if (f.id === idEvento && f.fin > desde) out.push(f);
    }
  }
  return out.sort((a, b) => a.inicio - b.inicio);
}

/* ---------- Sugerencia #2: ¿dónde brilla tu build? ---------- */

/**
 * Puntúa cuánto favorece un evento a las stats del jugador.
 * Devuelve 0..1; por encima de 0.6 se marca con estrella.
 */
export function afinidadConBuild(idEvento, stats) {
  const ev = TIPOS_EVENTO[idEvento];
  if (!ev || !stats) return 0;

  const valores = Object.values(stats).filter(v => typeof v === 'number');
  if (!valores.length) return 0;
  const media = valores.reduce((a, b) => a + b, 0) / valores.length;
  if (media <= 0) return 0;

  // Media de las stats que el evento premia, comparada con tu media global
  const relevantes = ev.favorece.map(k => stats[k] || 0);
  const mediaRel = relevantes.reduce((a, b) => a + b, 0) / relevantes.length;

  const ratio = mediaRel / media;                 // 1.0 = justo tu media
  return Math.max(0, Math.min(1, (ratio - 0.85) / 0.45));
}

/** ¿Merece la estrella de "aquí brillas"? */
export function brillaAqui(idEvento, stats) {
  return afinidadConBuild(idEvento, stats) >= 0.6;
}

/* ---------- Sugerencia #1: aviso previo ---------- */

/** Minutos que faltan para que empiece un tipo de evento. */
export function minutosPara(idEvento, ahora = Date.now()) {
  const prox = proximasVecesDe(idEvento, ahora, 2)[0];
  if (!prox) return null;
  if (prox.inicio <= ahora) return 0;
  return Math.round((prox.inicio - ahora) / 60000);
}

/**
 * Eventos que empiezan dentro de `minutos`. La pantalla usa esto para
 * el aviso; la notificación real del PWA llega en el Paso 15.
 */
export function avisosProximos(stats, ahora = Date.now(), minutos = 10) {
  const prox = proximoEvento(ahora);
  const faltan = Math.round((prox.inicio - ahora) / 60000);
  if (faltan > minutos || faltan < 0) return null;
  return {
    franja: prox,
    minutos: faltan,
    brilla: brillaAqui(prox.id, stats)
  };
}
