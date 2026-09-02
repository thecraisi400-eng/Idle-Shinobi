/* ===== GUARDADO PARANOICO =====
   27.01 auto + botón + respaldo interno + recordatorio de exportación
   27.02 localStorage + archivo descargable · 27.05 un solo perfil
   27.07 historial de 5 respaldos previos a cargar
   27.09 guardado versionado · 27.10 fecha y hora del último guardado
   27.11 heartbeat + cierre + botón: triple red
   10.15 se guarda tras cada lucha

   Regla de oro: NUNCA se pierde progreso. Antes de cualquier operación
   destructiva (cargar, importar, reiniciar) se hace un respaldo. */

import { S, reemplazarEstado, sellarTiempo } from '../core/state.js';
import { migrar, esGuardadoValido } from '../core/migrations.js';
import { UI, META } from '../data/constants.js';
import { emit } from '../core/events-bus.js';

export const CLAVE = 'oro-y-gloria:save';        // 27.05 un único perfil
export const CLAVE_BACKUPS = 'oro-y-gloria:backups';
export const CLAVE_AVISO = 'oro-y-gloria:ultimoExport';

let timerAuto = null;
let ultimoGuardado = 0;

/* ---------- Acceso tolerante a localStorage ----------
   En modo incógnito o con cuota llena, localStorage lanza. El juego
   debe seguir funcionando aunque no pueda guardar. */

export function almacenDisponible() {
  try {
    const k = '__og_test__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch { return false; }
}

function leerCrudo(clave) {
  try { return localStorage.getItem(clave); } catch { return null; }
}

function escribirCrudo(clave, valor) {
  try { localStorage.setItem(clave, valor); return true; }
  catch (e) { console.warn('[save] no se pudo escribir:', e); return false; }
}

/* ---------- Guardar ---------- */

/**
 * Guarda la partida actual.
 * @param {string} motivo para el log y las estadísticas
 */
export function guardar(motivo = 'auto', estado = S) {
  if (!estado) return { ok: false, motivo: 'sin estado' };

  sellarTiempo();
  estado.meta.guardado = Date.now();          // 27.10
  estado.meta.version = META.VERSION_SAVE;    // 27.09

  const json = JSON.stringify(estado);
  const ok = escribirCrudo(CLAVE, json);
  if (ok) {
    ultimoGuardado = Date.now();
    emit('save:guardado', { motivo, cuando: ultimoGuardado, bytes: json.length });
  }
  return { ok, motivo, bytes: json.length, cuando: ultimoGuardado };
}

/** ¿Hay una partida guardada? */
export function hayPartida() {
  return !!leerCrudo(CLAVE);
}

/** Lee el guardado sin aplicarlo. */
export function leerGuardado() {
  const crudo = leerCrudo(CLAVE);
  if (!crudo) return null;
  try { return JSON.parse(crudo); } catch { return null; }
}

/**
 * Carga la partida guardada y la aplica.
 * 27.04 — la pantalla debe confirmar ANTES de llamar aquí.
 * 27.07 — antes de pisar nada, respalda lo que hay.
 */
export function cargar({ respaldar = true } = {}) {
  const datos = leerGuardado();
  if (!datos) return { ok: false, motivo: 'No hay partida guardada' };
  if (!esGuardadoValido(datos)) return { ok: false, motivo: 'El guardado está corrupto' };

  if (respaldar && S) crearRespaldo('antes-de-cargar');

  const migrado = migrar(datos);              // 27.09
  if (!migrado) return { ok: false, motivo: 'No se pudo migrar' };

  reemplazarEstado(migrado);
  emit('save:cargado', { cuando: migrado.meta.guardado });
  return { ok: true, estado: migrado };
}

/* ---------- 27.07 Historial de 5 respaldos ---------- */

export function listarRespaldos() {
  const crudo = leerCrudo(CLAVE_BACKUPS);
  if (!crudo) return [];
  try { return JSON.parse(crudo) || []; } catch { return []; }
}

/**
 * Guarda una copia del estado ACTUAL en el historial.
 * Se llama antes de cargar, importar o reiniciar.
 */
export function crearRespaldo(motivo = 'manual', estado = S) {
  if (!estado) return [];
  const lista = listarRespaldos();

  lista.unshift({
    cuando: Date.now(),
    motivo,
    nivel: estado.perfil?.nivel ?? 1,
    oro: estado.monedas?.oro ?? 0,
    luchas: estado.carrera?.luchas ?? 0,
    datos: JSON.stringify(estado)
  });

  const recortada = lista.slice(0, UI.BACKUPS);    // 27.07 solo los 5 últimos
  escribirCrudo(CLAVE_BACKUPS, JSON.stringify(recortada));
  emit('save:respaldo', { motivo, total: recortada.length });
  return recortada;
}

/** Restaura uno de los respaldos del historial. */
export function restaurarRespaldo(indice) {
  const lista = listarRespaldos();
  const b = lista[indice];
  if (!b) return { ok: false, motivo: 'Respaldo inexistente' };

  let datos;
  try { datos = JSON.parse(b.datos); } catch { return { ok: false, motivo: 'Respaldo corrupto' }; }
  if (!esGuardadoValido(datos)) return { ok: false, motivo: 'Respaldo inválido' };

  // el propio acto de restaurar también se respalda: nunca se pierde nada
  crearRespaldo('antes-de-restaurar');

  const migrado = migrar(datos);
  reemplazarEstado(migrado);
  guardar('restauracion', migrado);
  emit('save:restaurado', { indice, cuando: b.cuando });
  return { ok: true, estado: migrado };
}

/* ---------- 27.08 Reinicio con doble confirmación ----------
   La función pide el testigo de la primera confirmación: así es
   imposible borrar por accidente desde consola o por un solo click. */

export const TESTIGO_REINICIO = 'BORRAR-TODO';

export function reiniciar(testigo) {
  if (testigo !== TESTIGO_REINICIO) {
    return { ok: false, motivo: 'Falta la segunda confirmación' };
  }
  crearRespaldo('antes-de-reiniciar');    // ni siquiera al borrar se pierde
  try { localStorage.removeItem(CLAVE); } catch {}
  emit('save:reiniciado', {});
  return { ok: true };
}

/* ---------- 27.01 / 27.11 La triple red ---------- */

/** Arranca el heartbeat de autoguardado. */
export function iniciarAutoguardado(ms = UI.AUTOSAVE_MS) {
  detenerAutoguardado();
  timerAuto = setInterval(() => guardar('heartbeat'), ms);
  return timerAuto;
}

export function detenerAutoguardado() {
  if (timerAuto) { clearInterval(timerAuto); timerAuto = null; }
}

/**
 * Conecta las tres redes: heartbeat, eventos del juego y cierre.
 * 10.15 tras cada lucha · 27.11 al ocultar la pestaña y al cerrar.
 */
export function conectarGuardadoAutomatico(bus) {
  iniciarAutoguardado();

  // Momentos críticos: lo que el jugador odiaría repetir
  const momentos = ['combate:fin', 'nivel:subida', 'tienda:compra',
                    'pvp:fin', 'evento:fin', 'equipo:cambio'];
  for (const ev of momentos) bus.on(ev, () => guardar(ev));

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) guardar('oculto');       // 27.11
    });
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', () => guardar('cierre'));
    window.addEventListener('beforeunload', () => guardar('cierre'));
  }
}

/* ---------- 27.10 Información del guardado ---------- */

export function infoGuardado() {
  const datos = leerGuardado();
  if (!datos) return { existe: false };
  const cuando = datos.meta?.guardado || 0;
  return {
    existe: true,
    cuando,
    fecha: cuando ? new Date(cuando) : null,
    version: datos.meta?.version ?? 0,
    nivel: datos.perfil?.nivel ?? 1,
    oro: datos.monedas?.oro ?? 0,
    luchas: datos.carrera?.luchas ?? 0,
    tiempoJugadoMs: datos.meta?.tiempoJugadoMs ?? 0,
    bytes: (leerCrudo(CLAVE) || '').length
  };
}

/** Texto humano del "hace cuánto". */
export function haceCuanto(ms) {
  if (!ms) return 'nunca';
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (s < 60) return 'hace un momento';
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
  return `hace ${Math.floor(s / 86400)} días`;
}

/* ---------- Sugerencia #2: recordatorio de exportar ---------- */

export const AVISO_EXPORT_MS = 3 * 3600 * 1000;   // cada 3 h de juego

export function marcarExportado(cuando = Date.now()) {
  escribirCrudo(CLAVE_AVISO, String(cuando));
}

export function ultimoExport() {
  const v = leerCrudo(CLAVE_AVISO);
  return v ? Number(v) : 0;
}

/**
 * ¿Toca recordar que exporte? localStorage se borra al limpiar el
 * navegador: perder 40 horas de progreso por no avisar es imperdonable.
 */
export function tocaRecordarExport(estado = S) {
  const ultimo = ultimoExport();
  const jugado = estado?.meta?.tiempoJugadoMs || 0;
  if (jugado < AVISO_EXPORT_MS) return false;      // aún es pronto
  if (!ultimo) return true;                        // nunca exportó
  return Date.now() - ultimo > 7 * 24 * 3600 * 1000;  // 27.01 recordatorio semanal
}

/* ---------- Sugerencia #5: resumen de sesión ---------- */

/** Foto del estado al abrir, para comparar al volver. */
export function tomarFoto(estado = S) {
  if (!estado) return null;
  return {
    cuando: Date.now(),
    oro: estado.monedas.oro,
    gemas: estado.monedas.gemas,
    nivel: estado.perfil.nivel,
    luchas: estado.carrera.luchas,
    victorias: estado.carrera.victorias
  };
}

/**
 * Compara la foto con el estado actual: "en tus últimos 45 minutos
 * ganaste 12.4K de oro y 3 niveles". Cierra el bucle del idle (01.05).
 */
export function resumenSesion(foto, estado = S) {
  if (!foto || !estado) return null;
  const minutos = Math.round((Date.now() - foto.cuando) / 60000);
  const d = {
    minutos,
    oro: estado.monedas.oro - foto.oro,
    gemas: estado.monedas.gemas - foto.gemas,
    niveles: estado.perfil.nivel - foto.nivel,
    luchas: estado.carrera.luchas - foto.luchas,
    victorias: estado.carrera.victorias - foto.victorias
  };
  d.huboProgreso = d.oro > 0 || d.niveles > 0 || d.luchas > 0;
  return d;
}
