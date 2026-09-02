/* ===== EXPORTAR / IMPORTAR .MD =====
   27.03 .md legible CON los datos incrustados para re-importar
   27.13 .md para leer + JSON para restaurar: ambos en el mismo archivo
   27.02 archivo descargable · 27.09 versionado
   Sugerencia #1: checksum de integridad, para no cargar una partida rota.

   El archivo es un informe de tu carrera que un humano puede leer,
   con el estado real escondido al final en un bloque de código. */

import { S } from '../core/state.js';
import { META } from '../data/constants.js';
import { migrar, esGuardadoValido } from '../core/migrations.js';
import { fmt } from '../core/format.js';
import { getLiga } from '../data/ligas.js';

export const MARCA_INICIO = '<!-- OG:DATOS';
export const MARCA_FIN = 'OG:FIN -->';

/* ---------- Sugerencia #1: checksum ---------- */

/**
 * Suma de verificación simple (FNV-1a de 32 bits en hex).
 * No es criptografía: solo detecta corrupción y ediciones a mano.
 */
export function checksum(texto) {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

/* ---------- Exportar ---------- */

function duracion(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}

function tabla(filas) {
  return filas.map(([k, v]) => `| ${k} | ${v} |`).join('\n');
}

/**
 * Genera el .md completo: informe legible + bloque de datos.
 * @returns {string}
 */
export function generarMD(estado = S) {
  const e = estado;
  const fecha = new Date();
  const json = JSON.stringify(e);
  const suma = checksum(json);
  const codificado = codificar(json);

  const winrate = e.carrera.luchas > 0
    ? ((e.carrera.victorias / e.carrera.luchas) * 100).toFixed(1) + '%'
    : '—';

  const equipadas = Object.values(e.equipo.slots).filter(Boolean).length;

  return `# 🥊 Oro y Gloria — Partida guardada

> Exportado el ${fecha.toLocaleString('es')}
> Guarda este archivo. Para restaurar tu partida, impórtalo desde la pantalla de Perfil.

## 👤 Tu luchador

${tabla([
  ['Nombre', e.perfil.nombre],
  ['Clase', e.perfil.clase || 'sin elegir'],
  ['Subclase', e.perfil.subclase || '—'],
  ['Nivel', e.perfil.nivel],
  ['Experiencia', `${fmt(e.perfil.xp)} XP`],
  ['Puntos sin gastar', e.perfil.puntos ?? 0]
])}

## 📊 Estadísticas

${tabla(Object.entries(e.stats).map(([k, v]) => [k.charAt(0).toUpperCase() + k.slice(1), v]))}

## 💰 Bolsillo

${tabla([
  ['Oro', fmt(e.monedas.oro)],
  ['Gemas', fmt(e.monedas.gemas)],
  ['Material (vendas)', e.equipo.material ?? 0]
])}

## 🏆 Carrera

${tabla([
  ['Luchas', fmt(e.carrera.luchas)],
  ['Victorias', fmt(e.carrera.victorias)],
  ['Derrotas', fmt(e.carrera.derrotas)],
  ['Ratio de victoria', winrate],
  ['KOs dados', fmt(e.carrera.kos)],
  ['Críticos', fmt(e.carrera.criticos)],
  ['Oro ganado en total', fmt(e.carrera.oroGanado)],
  ['Eventos jugados', fmt(e.carrera.eventosJugados)],
  ['Torneos ganados', fmt(e.carrera.torneosGanados)],
  ['Tiempo jugado', duracion(e.meta.tiempoJugadoMs || 0)]
])}

## 🛡️ Equipo

${tabla([
  ['Piezas equipadas', `${equipadas} de 8`],
  ['En el inventario', `${e.equipo.inventario.length} piezas`],
  ['Liga del Coliseo', getLiga(e.pvp.liga).nombre],
  ['Logros completados', (e.logros?.completados || []).length]
])}

---

### ⚙️ Datos de restauración

No edites nada de aquí abajo: el archivo dejaría de ser válido.

${MARCA_INICIO}
version: ${META.VERSION_SAVE}
checksum: ${suma}
fecha: ${fecha.toISOString()}
datos: ${codificado}
${MARCA_FIN}
`;
}

/* ---------- Codificación ----------
   Base64 para que el JSON no rompa el markdown ni se estropee al
   copiar y pegar. Con soporte de acentos (los nombres los llevan). */

export function codificar(texto) {
  const bytes = new TextEncoder().encode(texto);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export function decodificar(b64) {
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/* ---------- Importar ---------- */

/**
 * Extrae y valida el estado de un .md exportado.
 * Devuelve {ok, estado, motivo, aviso}.
 * 27.09 — migra la versión si hace falta.
 * Sug#1 — si el checksum no cuadra, avisa en vez de cargar basura.
 */
export function parsearMD(texto) {
  if (!texto || typeof texto !== 'string') {
    return { ok: false, motivo: 'Archivo vacío' };
  }

  const i = texto.indexOf(MARCA_INICIO);
  const f = texto.indexOf(MARCA_FIN);
  if (i < 0 || f < 0 || f <= i) {
    return { ok: false, motivo: 'No es un archivo de Oro y Gloria (falta el bloque de datos)' };
  }

  const bloque = texto.slice(i + MARCA_INICIO.length, f);
  const campo = (nombre) => {
    const m = bloque.match(new RegExp(`^\\s*${nombre}:\\s*(.+)$`, 'm'));
    return m ? m[1].trim() : null;
  };

  const b64 = campo('datos');
  if (!b64) return { ok: false, motivo: 'El bloque de datos está incompleto' };

  let json;
  try { json = decodificar(b64); }
  catch { return { ok: false, motivo: 'Los datos están dañados y no se pueden leer' }; }

  // Sugerencia #1: verificación de integridad
  const esperado = campo('checksum');
  const real = checksum(json);
  let aviso = null;
  if (esperado && esperado !== real) {
    return {
      ok: false,
      motivo: 'El archivo ha sido modificado o está corrupto (la verificación no coincide)',
      checksumEsperado: esperado, checksumReal: real
    };
  }
  if (!esperado) aviso = 'El archivo no trae verificación de integridad.';

  let datos;
  try { datos = JSON.parse(json); }
  catch { return { ok: false, motivo: 'Los datos no son una partida válida' }; }

  if (!esGuardadoValido(datos)) {
    return { ok: false, motivo: 'El archivo no contiene una partida completa' };
  }

  const version = Number(campo('version') || datos.meta?.version || 0);
  if (version > META.VERSION_SAVE) {
    return { ok: false, motivo: `La partida es de una versión más nueva del juego (v${version})` };
  }

  const migrado = migrar(datos);              // 27.09
  if (!migrado) return { ok: false, motivo: 'No se pudo adaptar la partida a esta versión' };

  return {
    ok: true,
    estado: migrado,
    aviso,
    version,
    fecha: campo('fecha'),
    resumen: {
      nombre: migrado.perfil.nombre,
      nivel: migrado.perfil.nivel,
      oro: migrado.monedas.oro,
      luchas: migrado.carrera.luchas
    }
  };
}

/* ---------- Descarga ---------- */

export function nombreArchivo(estado = S) {
  const d = new Date();
  const dos = n => String(n).padStart(2, '0');
  const fecha = `${d.getFullYear()}${dos(d.getMonth() + 1)}${dos(d.getDate())}`;
  return `oro-y-gloria-nv${estado.perfil.nivel}-${fecha}.md`;
}

/** Dispara la descarga del .md en el navegador. */
export function descargar(estado = S) {
  const md = generarMD(estado);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo(estado);
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return { ok: true, nombre: a.download, bytes: md.length };
}
