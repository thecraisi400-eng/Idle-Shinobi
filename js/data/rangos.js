/* ===== LOS 5 RANGOS FIJOS D → S (14.01) =====
   El rango NO es una moneda ni un nivel: es un espejo del Poder total.
   Sirve para que el jugador sepa de un vistazo "en qué liga estoy"
   sin leer un número de seis cifras.

   14.13 — la apariencia escala con el rango: cada rango tiene su
   marco, su color y su aura, y el sprite del héroe hereda ese color. */

export const RANGOS = [
  {
    id: 'D', nombre: 'Aprendiz', ico: '🥉', color: '#8b8b93',
    desde: 0,
    lema: 'Nadie sabe tu nombre todavía.',
    aura: 'none', marco: '2px solid #55555e'
  },
  {
    id: 'C', nombre: 'Profesional', ico: '🥈', color: '#4ec97a',
    desde: 520,
    lema: 'Cobras por luchar. Ya es algo.',
    aura: '0 0 10px rgba(78,201,122,.35)', marco: '2px solid #4ec97a'
  },
  {
    id: 'B', nombre: 'Estelar', ico: '🥇', color: '#4d9cf0',
    desde: 1400,
    lema: 'Tu nombre aparece en el cartel.',
    aura: '0 0 14px rgba(77,156,240,.45)', marco: '2px solid #4d9cf0'
  },
  {
    id: 'A', nombre: 'Titular', ico: '⭐', color: '#a765e8',
    desde: 3200,
    lema: 'Cierras la función. La gente viene por ti.',
    aura: '0 0 18px rgba(167,101,232,.5)', marco: '3px solid #a765e8'
  },
  {
    id: 'S', nombre: 'Leyenda', ico: '👑', color: '#e8b64c',
    desde: 7000,
    lema: 'Ya no compites: defines el deporte.',
    aura: '0 0 24px rgba(232,182,76,.6)', marco: '3px solid #e8b64c'
  }
];

export const CLAVES_RANGOS = RANGOS.map(r => r.id);

/** Rango que corresponde a un Poder dado (14.01). */
export function rangoPorPoder(poderTotal) {
  let out = RANGOS[0];
  for (const r of RANGOS) if (poderTotal >= r.desde) out = r;
  return out;
}

export function getRango(id) {
  return RANGOS.find(r => r.id === id) || RANGOS[0];
}

/** Siguiente rango y cuánto Poder falta (motivación visible). */
export function progresoRango(poderTotal) {
  const actual = rangoPorPoder(poderTotal);
  const idx = RANGOS.indexOf(actual);
  const siguiente = RANGOS[idx + 1] || null;
  if (!siguiente) return { actual, siguiente: null, pct: 100, falta: 0 };
  const tramo = siguiente.desde - actual.desde;
  const hecho = poderTotal - actual.desde;
  return {
    actual, siguiente,
    pct: Math.max(0, Math.min(100, (hecho / tramo) * 100)),
    falta: Math.max(0, siguiente.desde - poderTotal)
  };
}

/* ---------- MESA DE RASGOS DEL HÉROE (14.10) ----------
   No son objetos: son marcas de carrera. Se eligen al alcanzar
   ciertos niveles y modifican el ESTILO, no solo los números.
   Como no hay respec (03.10), cada elección pesa. */

export const RASGOS_HEROE = {
  cabezaDura: {
    id:'cabezaDura', nombre:'Cabeza dura', ico:'🪨', nivel:5,
    desc:'+10% de defensa y +5% de aguante. Aguantas lo que sea.',
    mods:{ defensa:1.10, aguante:1.05 }
  },
  puñoDePiedra: {
    id:'puñoDePiedra', nombre:'Puño de piedra', ico:'🥊', nivel:5,
    desc:'+12% de potencia, −5% de precisión. Pegas antes de pensar.',
    mods:{ potencia:1.12, precision:0.95 }
  },
  gatoCallejero: {
    id:'gatoCallejero', nombre:'Gato callejero', ico:'🐈', nivel:5,
    desc:'+12% de agilidad y +5% de recuperación. No te agarran.',
    mods:{ agilidad:1.12, recuperacion:1.05 }
  },

  sangreFria: {
    id:'sangreFria', nombre:'Sangre fría', ico:'🧊', nivel:15,
    desc:'+12% de técnica y +8% de precisión. Nunca te descontrolas.',
    mods:{ tecnica:1.12, precision:1.08 }
  },
  corazonDeLeon: {
    id:'corazonDeLeon', nombre:'Corazón de león', ico:'🦁', nivel:15,
    desc:'+15% de vida. Te levantas siempre.',
    mods:{ vida:1.15 }
  },
  favoritoDelPublico: {
    id:'favoritoDelPublico', nombre:'Favorito del público', ico:'📣', nivel:15,
    desc:'+20% de carisma y +12% de presencia. El oro entra más rápido.',
    mods:{ carisma:1.20, presencia:1.12 }
  },

  monstruoSagrado: {
    id:'monstruoSagrado', nombre:'Monstruo sagrado', ico:'🔥', nivel:30,
    desc:'+10% a TODAS las estadísticas de combate.',
    mods:{ potencia:1.10, aguante:1.10, tecnica:1.10, agilidad:1.10,
           vida:1.10, defensa:1.10, precision:1.10, recuperacion:1.10 }
  },
  inmortal: {
    id:'inmortal', nombre:'Inmortal', ico:'♾️', nivel:30,
    desc:'+25% de vida y +15% de recuperación, −8% de potencia.',
    mods:{ vida:1.25, recuperacion:1.15, potencia:0.92 }
  },
  verdugo: {
    id:'verdugo', nombre:'Verdugo', ico:'⚔️', nivel:30,
    desc:'+22% de potencia, −10% de defensa. Matar o morir.',
    mods:{ potencia:1.22, defensa:0.90 }
  }
};

export const NIVELES_RASGO = [5, 15, 30];

export const listaRasgosHeroe = () => Object.values(RASGOS_HEROE);

/** Rasgos ofrecidos en un nivel concreto. */
export function rasgosDeNivel(nivel) {
  return listaRasgosHeroe().filter(r => r.nivel === nivel);
}

/** Cuántas elecciones de rasgo le tocan al jugador según su nivel. */
export function rasgosDisponibles(nivel, elegidos = []) {
  const pendientes = [];
  for (const n of NIVELES_RASGO) {
    if (nivel < n) continue;
    const opciones = rasgosDeNivel(n);
    const yaTiene = opciones.some(o => elegidos.includes(o.id));
    if (!yaTiene) pendientes.push({ nivel: n, opciones });
  }
  return pendientes;
}

/** Aplica los rasgos elegidos sobre unas stats. */
export function aplicarRasgosHeroe(stats, ids = []) {
  const out = { ...stats };
  for (const id of ids) {
    const r = RASGOS_HEROE[id];
    if (!r) continue;
    for (const [k, m] of Object.entries(r.mods)) {
      if (out[k] != null) out[k] = out[k] * m;
    }
  }
  for (const k of Object.keys(out)) out[k] = Math.round(out[k]);
  return out;
}
