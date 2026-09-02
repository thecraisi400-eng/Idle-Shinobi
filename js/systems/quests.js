/* ===== MOTOR DE MISIONES =====
   30.02 5 diarias con 1 refresco gratis · 30.03 3 semanales
   10.13 contador simple para el panel

   Las misiones miden el DELTA de un contador desde que se generaron:
   se guarda la "línea base" al crearlas. Así "gana 5 luchas hoy" no
   se completa sola con las 300 luchas de ayer. */

import { S, ganarOro, ganarGemas } from '../core/state.js';
import { rngDe } from '../core/rng.js';
import { emit } from '../core/events-bus.js';
import {
  DIARIAS, SEMANALES, N_DIARIAS, N_SEMANALES, REFRESCOS_DIARIOS, getPlantilla
} from '../data/misiones.js';

/* ---------- Claves de periodo ---------- */

export function claveDia(ahora = Date.now()) {
  const d = new Date(ahora);
  const dos = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
}

/** Semana ISO simplificada: el lunes de esa semana. */
export function claveSemana(ahora = Date.now()) {
  const d = new Date(ahora);
  const dia = (d.getDay() + 6) % 7;
  const lunes = new Date(d.getFullYear(), d.getMonth(), d.getDate() - dia);
  return claveDia(lunes.getTime());
}

/* ---------- Generación ---------- */

function instanciar(plantilla, rng, estado) {
  const paso = plantilla.paso || 1;
  const bruto = rng.int(plantilla.min, plantilla.max);
  const objetivo = Math.max(paso, Math.round(bruto / paso) * paso);
  return {
    id: plantilla.id,
    ico: plantilla.ico,
    texto: plantilla.texto(objetivo.toLocaleString('es')),
    contador: plantilla.contador,
    objetivo,
    // línea base: el valor del contador AHORA
    base: estado.carrera[plantilla.contador] || 0,
    oro: plantilla.oro,
    gemas: plantilla.gemas || 0,
    zona: plantilla.zona,
    cobrada: false
  };
}

/** 30.02 — genera las 5 diarias del día. */
export function generarDiarias(estado = S, ahora = Date.now()) {
  const rng = rngDe('diarias', claveDia(ahora), estado.meta.semilla);
  const elegidas = rng.barajar(DIARIAS).slice(0, N_DIARIAS);
  return elegidas.map(p => instanciar(p, rng, estado));
}

/** 30.03 — genera las 3 semanales. */
export function generarSemanales(estado = S, ahora = Date.now()) {
  const rng = rngDe('semanales', claveSemana(ahora), estado.meta.semilla);
  const elegidas = rng.barajar(SEMANALES).slice(0, N_SEMANALES);
  return elegidas.map(p => instanciar(p, rng, estado));
}

/**
 * Comprueba si cambió el día o la semana y regenera lo que toque.
 * Se llama al abrir el juego y al entrar en el panel.
 */
export function sincronizar(estado = S, ahora = Date.now()) {
  const hoy = claveDia(ahora);
  const semana = claveSemana(ahora);
  let cambios = { diarias: false, semanales: false };

  if (estado.misiones.diaReset !== hoy || !estado.misiones.diarias?.length) {
    estado.misiones.diarias = generarDiarias(estado, ahora);
    estado.misiones.diaReset = hoy;
    estado.misiones.refrescos = REFRESCOS_DIARIOS;    // 30.02 refresco gratis
    cambios.diarias = true;
  }
  if (estado.misiones.semanaReset !== semana || !estado.misiones.semanales?.length) {
    estado.misiones.semanales = generarSemanales(estado, ahora);
    estado.misiones.semanaReset = semana;
    cambios.semanales = true;
  }
  if (cambios.diarias || cambios.semanales) emit('misiones:nuevas', cambios);
  return cambios;
}

/* ---------- Progreso ---------- */

/** Progreso de una misión: {hecho, objetivo, pct, completa}. */
export function progreso(mision, estado = S) {
  const actual = estado.carrera[mision.contador] || 0;
  const hecho = Math.max(0, actual - mision.base);
  return {
    hecho: Math.min(hecho, mision.objetivo),
    objetivo: mision.objetivo,
    pct: Math.min(1, hecho / mision.objetivo),
    completa: hecho >= mision.objetivo
  };
}

export function todas(estado = S) {
  return [...(estado.misiones.diarias || []), ...(estado.misiones.semanales || [])];
}

/** 10.13 — el contador simple del panel: "3/5". */
export function contadorPanel(estado = S) {
  const d = estado.misiones.diarias || [];
  const listas = d.filter(m => progreso(m, estado).completa && !m.cobrada).length;
  const hechas = d.filter(m => m.cobrada).length;
  return { total: d.length, listas, hechas, texto: `${hechas}/${d.length}` };
}

/** ¿Hay algo que cobrar? Para el puntito rojo del menú. */
export function hayRecompensas(estado = S) {
  return todas(estado).some(m => !m.cobrada && progreso(m, estado).completa);
}

/* ---------- Cobro ---------- */

/** Cobra una misión completada. */
export function cobrar(idMision, estado = S) {
  const m = todas(estado).find(x => x.id === idMision);
  if (!m) return { ok: false, motivo: 'Misión inexistente' };
  if (m.cobrada) return { ok: false, motivo: 'Ya la cobraste' };

  const p = progreso(m, estado);
  if (!p.completa) return { ok: false, motivo: 'Todavía no está completa' };

  m.cobrada = true;
  ganarOro(m.oro, 'mision');
  if (m.gemas) ganarGemas(m.gemas, 'mision');
  emit('mision:cobrada', { id: m.id, oro: m.oro, gemas: m.gemas });
  return { ok: true, oro: m.oro, gemas: m.gemas };
}

/** Cobra todas las que estén listas. */
export function cobrarTodas(estado = S) {
  const listas = todas(estado).filter(m => !m.cobrada && progreso(m, estado).completa);
  let oro = 0, gemas = 0;
  for (const m of listas) {
    const r = cobrar(m.id, estado);
    if (r.ok) { oro += r.oro; gemas += r.gemas; }
  }
  return { n: listas.length, oro, gemas };
}

/* ---------- 30.02 Refresco gratis ---------- */

export function refrescosRestantes(estado = S) {
  return estado.misiones.refrescos ?? 0;
}

/**
 * Cambia una misión diaria por otra distinta. Solo una vez al día.
 * No se puede refrescar una ya cobrada (sería farmear recompensas).
 */
export function refrescar(idMision, estado = S, ahora = Date.now()) {
  if (refrescosRestantes(estado) <= 0) {
    return { ok: false, motivo: 'Ya usaste tu refresco de hoy' };
  }
  const i = (estado.misiones.diarias || []).findIndex(m => m.id === idMision);
  if (i < 0) return { ok: false, motivo: 'Esa misión no es diaria' };
  if (estado.misiones.diarias[i].cobrada) {
    return { ok: false, motivo: 'No puedes refrescar una misión ya cobrada' };
  }

  // Elegir una plantilla que no esté ya en la lista
  const usadas = new Set(estado.misiones.diarias.map(m => m.id));
  const libres = DIARIAS.filter(p => !usadas.has(p.id));
  if (!libres.length) return { ok: false, motivo: 'No hay más misiones disponibles' };

  const rng = rngDe('refresco', claveDia(ahora), idMision, estado.meta.semilla);
  const nueva = instanciar(rng.elegir(libres), rng, estado);

  estado.misiones.diarias[i] = nueva;
  estado.misiones.refrescos--;
  emit('mision:refrescada', { vieja: idMision, nueva: nueva.id });
  return { ok: true, mision: nueva };
}
