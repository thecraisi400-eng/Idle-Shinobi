/* ===== ENCUESTA DE PRIORIZACIÓN (30.15) =====
   El plan de la versión 1 está entero en el juego. Lo que venga después se
   decide por votación interna: una pantalla simple, un voto por jugador,
   cambiable cuando quiera. No hay servidor, así que el voto se guarda en
   local y viaja dentro del .md exportado: quien recoja los archivos tiene
   el recuento.

   Sugerencia #5 del Paso 15. */

export const CLAVE_VOTO = 'oro-y-gloria:voto';

export const OPCIONES = [
  { id: 'eventos',  ico: '🏟️', nombre: 'Más eventos',
    desc: 'Nuevos formatos en la rueda: jaula, escaleras, batalla real.' },
  { id: 'tagteam',  ico: '🤝', nombre: 'Parejas (tag team)',
    desc: 'Ficha a un compañero y lucha combates de dos contra dos.' },
  { id: 'prestigio', ico: '♻️', nombre: 'Prestigio',
    desc: 'Reiniciar la carrera con bonos permanentes y nuevas metas.' },
  { id: 'historia', ico: '📖', nombre: 'Modo historia',
    desc: 'Rivalidades con guion, traiciones y combates de venganza.' },
  { id: 'gremios',  ico: '🏛️', nombre: 'Establos',
    desc: 'Únete a un establo con otros jugadores y competid por temporada.' }
];

export function esOpcion(id) {
  return OPCIONES.some(o => o.id === id);
}

export function votoActual() {
  try {
    const v = localStorage.getItem(CLAVE_VOTO);
    return esOpcion(v) ? v : null;
  } catch (_) { return null; }
}

export function votar(id) {
  if (!esOpcion(id)) return { ok: false, motivo: 'Esa opción no existe.' };
  try { localStorage.setItem(CLAVE_VOTO, id); } catch (_) {}
  return { ok: true, id };
}

export function borrarVoto() {
  try { localStorage.removeItem(CLAVE_VOTO); } catch (_) {}
}

/** Texto corto para incluir en el .md exportado. */
export function textoVoto() {
  const v = votoActual();
  if (!v) return 'sin voto';
  return OPCIONES.find(o => o.id === v).nombre;
}
