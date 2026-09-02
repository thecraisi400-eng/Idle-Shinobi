/* ===== MIGRACIONES DE GUARDADO =====
   Sugerencia #2 del Paso 2: versionado desde el día uno (27.09).
   Cada entrada lleva un guardado de la versión N a la N+1.
   Así una partida vieja NUNCA se rompe al actualizar el juego. */

import { META } from '../data/constants.js';
import { crearPartidaNueva } from './state.js';

export const MIGRACIONES = [
  // Ejemplo de la forma que tendrán las futuras migraciones:
  // { desde: 1, hasta: 2, aplicar(s){ s.pvp.puntos = 0; return s; } },
];

/** Rellena claves nuevas que no existían en el guardado antiguo. */
function completarFaltantes(guardado, plantilla) {
  for (const [k, v] of Object.entries(plantilla)) {
    if (!(k in guardado)) {
      guardado[k] = structuredClone(v);
    } else if (v && typeof v === 'object' && !Array.isArray(v)
            && guardado[k] && typeof guardado[k] === 'object') {
      completarFaltantes(guardado[k], v);
    }
  }
  return guardado;
}

/** Lleva cualquier guardado a la versión actual. */
export function migrar(guardado) {
  if (!guardado || typeof guardado !== 'object') return null;

  let v = guardado.meta?.version ?? 0;
  let s = guardado;

  while (v < META.VERSION_SAVE) {
    const paso = MIGRACIONES.find(m => m.desde === v);
    if (!paso) break;                 // sin ruta: se completa por plantilla
    s = paso.aplicar(s);
    v = paso.hasta;
    s.meta.version = v;
  }

  // Red de seguridad: añade cualquier campo nuevo del juego
  s = completarFaltantes(s, crearPartidaNueva(s.meta?.semilla ?? Date.now()));
  s.meta.version = META.VERSION_SAVE;
  return s;
}

/** Comprobación rápida de que el objeto parece una partida válida. */
export function esGuardadoValido(o) {
  return !!(o && o.meta && o.perfil && o.monedas && o.stats
            && typeof o.monedas.oro === 'number');
}
