/* ===== CATÁLOGO DE MOVIMIENTOS ESPECIALES =====
   12.04 / 12.14 "Catálogo + evolución": elegible y mejorable.
   12.05 potencia base x1.5 · 12.15 su nombre se muestra al ejecutarlo

   Sugerencia #1 del Paso 6: cada especial tiene IDENTIDAD MECÁNICA,
   no solo daño. Con 8 estados disponibles sería un desperdicio que
   todos fueran "x1.5 y ya".

   Sugerencia #3: cada movimiento evoluciona por USOS acumulados,
   convirtiendo el uso en progresión. */

export const NIVELES_EVOLUCION = [0, 25, 75, 200];   // usos para llegar a nivel 1..4

export const ESPECIALES = {
  plancha: {
    id: 'plancha', nombre: 'Plancha Suicida', ico: '🕊️',
    desbloqueo: { nivel: 1 },
    desc: 'Un salto limpio desde la tercera cuerda.',
    mult: 1.50,
    efecto: null,
    evolucion: [
      'Golpe x1.50',
      'Golpe x1.65',
      'Golpe x1.80 y aplica Sangrado',
      'Golpe x2.00 y aplica Sangrado doble'
    ],
    aplicar: (nivel) => ({
      mult: [1.50, 1.65, 1.80, 2.00][nivel - 1],
      estados: nivel >= 3 ? [{ id: 'sangrar', veces: nivel >= 4 ? 2 : 1 }] : []
    })
  },

  powerbomb: {
    id: 'powerbomb', nombre: 'Powerbomb Brutal', ico: '💣',
    desbloqueo: { nivel: 4 },
    desc: 'Lo estrella contra la lona. Puede dejarlo aturdido.',
    mult: 1.35,
    evolucion: [
      'Golpe x1.35 · 30% de Aturdir',
      'Golpe x1.45 · 45% de Aturdir',
      'Golpe x1.55 · 60% de Aturdir',
      'Golpe x1.70 · Aturdir garantizado'
    ],
    aplicar: (nivel) => ({
      mult: [1.35, 1.45, 1.55, 1.70][nivel - 1],
      estados: [{ id: 'aturdir', prob: [0.30, 0.45, 0.60, 1.0][nivel - 1] }]
    })
  },

  candado: {
    id: 'candado', nombre: 'Candado Invertido', ico: '🔗',
    desbloqueo: { nivel: 7 },
    desc: 'Una llave que desgasta: debilita y ralentiza.',
    mult: 1.10,
    evolucion: [
      'Golpe x1.10 · Debilitado',
      'Golpe x1.20 · Debilitado + Ralentizado',
      'Golpe x1.30 · Debilitado + Ralentizado largos',
      'Golpe x1.40 · Debilitado + Ralentizado + Vendido'
    ],
    aplicar: (nivel) => {
      const est = [{ id: 'debilitado' }];
      if (nivel >= 2) est.push({ id: 'ralentizar', dur: nivel >= 3 ? 12 : 8 });
      if (nivel >= 4) est.push({ id: 'vendido' });
      return { mult: [1.10, 1.20, 1.30, 1.40][nivel - 1], estados: est };
    }
  },

  topeSuicida: {
    id: 'topeSuicida', nombre: 'Tope Suicida', ico: '🚀',
    desbloqueo: { nivel: 10 },
    desc: 'Todo o nada: daño enorme a cambio de tu propia salud.',
    mult: 2.10,
    evolucion: [
      'Golpe x2.10 · te cuesta 8% de tu vida',
      'Golpe x2.30 · te cuesta 7% de tu vida',
      'Golpe x2.55 · te cuesta 6% de tu vida',
      'Golpe x2.85 · te cuesta 5% de tu vida'
    ],
    aplicar: (nivel) => ({
      mult: [2.10, 2.30, 2.55, 2.85][nivel - 1],
      autoDanoPct: [0.08, 0.07, 0.06, 0.05][nivel - 1],
      estados: []
    })
  },

  martinete: {
    id: 'martinete', nombre: 'Martinete', ico: '🔨',
    desbloqueo: { nivel: 14 },
    desc: 'Ignora buena parte de la defensa rival.',
    mult: 1.40,
    evolucion: [
      'Golpe x1.40 · penetra 40%',
      'Golpe x1.50 · penetra 55%',
      'Golpe x1.60 · penetra 70%',
      'Golpe x1.75 · penetra 85% y aplica Vendido'
    ],
    aplicar: (nivel) => ({
      mult: [1.40, 1.50, 1.60, 1.75][nivel - 1],
      penetracionExtra: [0.40, 0.55, 0.70, 0.85][nivel - 1],
      estados: nivel >= 4 ? [{ id: 'vendido' }] : []
    })
  },

  lanzaLlamas: {
    id: 'lanzaLlamas', nombre: 'Golpe Ardiente', ico: '🔥',
    desbloqueo: { nivel: 18 },
    desc: 'Deja al rival quemándose durante varios turnos.',
    mult: 1.25,
    evolucion: [
      'Golpe x1.25 · Quemadura',
      'Golpe x1.35 · Quemadura larga',
      'Golpe x1.45 · Quemadura + Debilitado',
      'Golpe x1.50 · Quemadura larga + Debilitado'
    ],
    aplicar: (nivel) => {
      const est = [{ id: 'quemar', dur: nivel >= 2 ? 12 : 8 }];
      if (nivel >= 3) est.push({ id: 'debilitado' });
      return { mult: [1.25, 1.32, 1.40, 1.50][nivel - 1], estados: est };
    }
  },

  abrazoOso: {
    id: 'abrazoOso', nombre: 'Abrazo de Oso', ico: '🐻',
    desbloqueo: { nivel: 22 },
    desc: 'Aprieta y te recupera parte del daño causado.',
    mult: 1.30,
    evolucion: [
      'Golpe x1.30 · robas 20% del daño',
      'Golpe x1.40 · robas 30% del daño',
      'Golpe x1.50 · robas 40% del daño',
      'Golpe x1.65 · robas 55% y te da Curación'
    ],
    aplicar: (nivel) => ({
      mult: [1.30, 1.40, 1.50, 1.65][nivel - 1],
      roboVidaPct: [0.20, 0.30, 0.40, 0.55][nivel - 1],
      estadosPropios: nivel >= 4 ? [{ id: 'curacion' }] : [],
      estados: []
    })
  },

  muroAcero: {
    id: 'muroAcero', nombre: 'Muro de Acero', ico: '🛡️',
    desbloqueo: { nivel: 26 },
    desc: 'Golpea y te cubre con un escudo protector.',
    mult: 1.15,
    evolucion: [
      'Golpe x1.15 · Escudo',
      'Golpe x1.25 · Escudo mayor',
      'Golpe x1.35 · Escudo + Curación',
      'Golpe x1.20 · Escudo mayor + Curación (defensivo puro)'
    ],
    aplicar: (nivel) => ({
      mult: [1.00, 1.06, 1.12, 1.20][nivel - 1],
      escudoMult: [1, 1.1, 1.2, 1.35][nivel - 1],
      estadosPropios: nivel >= 3
        ? [{ id: 'escudo' }, { id: 'curacion' }]
        : [{ id: 'escudo' }],
      estados: []
    })
  },

  tornado: {
    id: 'tornado', nombre: 'Tornado DDT', ico: '🌪️',
    desbloqueo: { nivel: 30 },
    desc: 'Ráfaga que marca al rival para tus críticos.',
    mult: 1.45,
    evolucion: [
      'Golpe x1.45 · Vendido',
      'Golpe x1.55 · Vendido + Ralentizado',
      'Golpe x1.70 · Vendido largo + Ralentizado',
      'Golpe x1.90 · Vendido + Ralentizado + Aturdir'
    ],
    aplicar: (nivel) => {
      const est = [{ id: 'vendido', dur: nivel >= 3 ? 14 : 10 }];
      if (nivel >= 2) est.push({ id: 'ralentizar' });
      if (nivel >= 4) est.push({ id: 'aturdir', prob: 0.5 });
      return { mult: [1.45, 1.55, 1.70, 1.90][nivel - 1], estados: est };
    }
  },

  juicioFinal: {
    id: 'juicioFinal', nombre: 'Juicio Final', ico: '⚡',
    desbloqueo: { nivel: 35 },
    desc: 'Cuanto más herido está el rival, más devastador es.',
    mult: 1.20,
    evolucion: [
      'Golpe x1.20 · +60% si el rival está bajo 30% de vida',
      'Golpe x1.30 · +80% bajo 35% de vida',
      'Golpe x1.40 · +100% bajo 40% de vida',
      'Golpe x1.55 · +130% bajo 45% de vida'
    ],
    aplicar: (nivel) => ({
      mult: [1.20, 1.30, 1.40, 1.55][nivel - 1],
      ejecucion: {
        umbral: [0.30, 0.35, 0.40, 0.45][nivel - 1],
        bonus: [0.60, 0.80, 1.00, 1.30][nivel - 1]
      },
      estados: []
    })
  }
};

export const CLAVES_ESPECIALES = Object.keys(ESPECIALES);
export const listaEspeciales = () => Object.values(ESPECIALES);

/** Nivel de evolución (1..4) según usos acumulados. */
export function nivelPorUsos(usos = 0) {
  let n = 1;
  for (let i = 1; i < NIVELES_EVOLUCION.length; i++) {
    if (usos >= NIVELES_EVOLUCION[i]) n = i + 1;
  }
  return n;
}

/** Usos que faltan para la siguiente evolución (null si está al máximo). */
export function usosParaSiguiente(usos = 0) {
  const n = nivelPorUsos(usos);
  if (n >= NIVELES_EVOLUCION.length) return null;
  return NIVELES_EVOLUCION[n] - usos;
}

/** ¿Está desbloqueado a ese nivel de héroe? */
export function estaDesbloqueado(id, nivelHeroe) {
  const e = ESPECIALES[id];
  return !!e && nivelHeroe >= (e.desbloqueo?.nivel || 1);
}

/** Datos resueltos del especial listo para el motor. */
export function resolverEspecial(id, usos = 0) {
  const e = ESPECIALES[id] || ESPECIALES.plancha;
  const nivel = nivelPorUsos(usos);
  return { ...e.aplicar(nivel), id: e.id, nombre: e.nombre, ico: e.ico, nivel };
}
