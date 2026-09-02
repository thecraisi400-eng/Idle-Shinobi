/* ===== LOS 8 ESTADOS ALTERADOS (02.05) =====
   "Los 4 anteriores + Curación por turno, Escudo, Debilitado y Vendido".
   11.07: NO se dibujan sobre el luchador; aparecen en el log y en una
   fila de iconos del HUD, manteniendo la escena limpia.

   Cada estado define:
   - dur: duración en ticks
   - acumula: 'refresca' (renueva duración) | 'apila' (suma capas)
     Sugerencia #5 del Paso 6: por defecto REFRESCA, para evitar
     builds degeneradas de aturdimiento perpetuo.
   - maxCapas: tope duro cuando apila
   - alAplicar / porTick / alExpirar: efectos
*/

export const ESTADOS = {
  aturdir: {
    id: 'aturdir', nombre: 'Aturdido', ico: '💫', color: '#f0d24c',
    tipo: 'malo',
    desc: 'Pierde su próxima acción.',
    dur: 3, acumula: 'refresca', maxCapas: 1,
    bloqueaAccion: true
  },

  sangrar: {
    id: 'sangrar', nombre: 'Sangrando', ico: '🩸', color: '#c0202a',
    tipo: 'malo',
    desc: 'Pierde vida cada tick. Se acumula hasta 3 veces.',
    dur: 10, acumula: 'apila', maxCapas: 3,
    porTick: (obj, capas) => ({ dano: Math.max(1, Math.round(obj.der.vidaMax * 0.006 * capas)) })
  },

  quemar: {
    id: 'quemar', nombre: 'Quemado', ico: '🔥', color: '#f0872f',
    tipo: 'malo',
    desc: 'Daño por tick que además reduce su daño un 12%.',
    dur: 8, acumula: 'refresca', maxCapas: 1,
    porTick: obj => ({ dano: Math.max(1, Math.round(obj.der.vidaMax * 0.006)) }),
    modDanoInfligido: 0.88
  },

  ralentizar: {
    id: 'ralentizar', nombre: 'Ralentizado', ico: '🐌', color: '#6ec8ff',
    tipo: 'malo',
    desc: 'Su velocidad de acción baja un 30%.',
    dur: 8, acumula: 'refresca', maxCapas: 1,
    modVelocidad: 0.70
  },

  curacion: {
    id: 'curacion', nombre: 'Recuperándose', ico: '💚', color: '#4ec97a',
    tipo: 'bueno',
    desc: 'Recupera vida cada tick.',
    dur: 10, acumula: 'refresca', maxCapas: 1,
    porTick: obj => ({ cura: Math.max(1, Math.round(obj.der.vidaMax * 0.007)) })
  },

  escudo: {
    id: 'escudo', nombre: 'Escudo', ico: '🛡️', color: '#8b8b93',
    tipo: 'bueno',
    desc: 'Absorbe daño hasta agotarse.',
    dur: 10, acumula: 'refresca', maxCapas: 1,
    escudoInicial: obj => Math.round(obj.der.vidaMax * 0.09)
  },

  debilitado: {
    id: 'debilitado', nombre: 'Debilitado', ico: '📉', color: '#a765e8',
    tipo: 'malo',
    desc: 'Inflige un 25% menos de daño.',
    dur: 10, acumula: 'refresca', maxCapas: 1,
    modDanoInfligido: 0.75
  },

  vendido: {
    id: 'vendido', nombre: 'Vendido', ico: '🎯', color: '#e8b64c',
    tipo: 'malo',
    desc: 'Recibe un 20% más de probabilidad de crítico en su contra.',
    dur: 10, acumula: 'refresca', maxCapas: 1,
    critExtraRecibido: 0.20
  }
};

export const CLAVES_ESTADOS = Object.keys(ESTADOS);
export const listaEstados = () => Object.values(ESTADOS);
export const esBueno = id => ESTADOS[id]?.tipo === 'bueno';
