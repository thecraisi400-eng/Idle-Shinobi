/* ===== CONSTRUCTOR DE LUCHADOR =====
   Objeto unificado que usarán el héroe y los rivales CPU.
   El motor de combate (Paso 4) solo entiende este formato. */

import { CLAVES_STATS, derivadas } from '../data/stats.js';
import { CLASES, aplicarClase } from '../data/clases.js';
import { poder, firmaBuild } from './power.js';
import { S } from '../core/state.js';
import { aplicarRasgosHeroe } from '../data/rangos.js';
import { bonosTotales, reglasActivas } from './skilltree.js';

/** Crea un luchador a partir de stats crudas. */
export function crearLuchador({
  nombre, clase, subclase = null, nivel = 1,
  stats, bonos = {}, esHeroe = false, rasgos = [], personalidad = null,
  pasivas = null, reglas = null
}) {
  const base = { ...stats };
  const finales = aplicarClase(base, clase, subclase);
  const cl = CLASES[clase];

  const f = {
    nombre,
    clase, subclase, nivel, esHeroe, rasgos,
    ico: cl?.ico || '🤼',
    color: cl?.color || '#8b8b93',
    personalidad: personalidad || cl?.personalidad || 'agresivo',   // 02.07
    statsBase: base,
    stats: finales,
    bonos,
    der: derivadas(finales, bonos),
    poder: poder(finales, bonos),
    firma: firmaBuild(finales, clase)
  };

  // 18.14 — las pasivas del árbol modifican las stats DERIVADAS
  f.pasivas = pasivas || pasivasVacias();
  f.reglas = reglas || {};
  aplicarPasivas(f);

  // Estado vivo de combate (lo reinicia el motor en cada lucha)
  f.vida = f.der.vidaMax;
  f.momentum = 0;
  f.fatiga = 0;
  f.estados = [];
  return f;
}

/** Bonos neutros: los rivales CPU no tienen árbol. */
export function pasivasVacias() {
  return {
    danoMult:0, critProb:0, critMult:0, penetracion:0, danoPotencia:0, danoTecnica:0,
    vidaMult:0, mitigacionMult:0, escudoInicial:0, esquivaExtra:0, reduccionCrit:0,
    velocidadMult:0, momentumMult:0, fatigaMult:0, especialMult:0,
    oroMult:0, xpMult:0, materialMult:0
  };
}

/**
 * 18.14 — vuelca las pasivas del árbol sobre las stats derivadas.
 * Se hace UNA vez al crear el luchador, no en cada tick.
 */
export function aplicarPasivas(f) {
  const p = f.pasivas;
  if (!p) return f;
  f.der.vidaMax     = Math.floor(f.der.vidaMax * (1 + (p.vidaMult || 0)));
  f.der.mitigacion  = f.der.mitigacion * (1 + (p.mitigacionMult || 0));
  f.der.penetracion = Math.min(0.85, f.der.penetracion + (p.penetracion || 0));
  f.der.esquiva     = Math.min(0.35, f.der.esquiva + (p.esquivaExtra || 0));
  f.der.velocidad   = f.der.velocidad * (1 + (p.velocidadMult || 0));
  f.der.momentumMult= f.der.momentumMult * (1 + (p.momentumMult || 0));
  f.der.fatigaMult  = Math.max(0.15, f.der.fatigaMult * (1 - (p.fatigaMult || 0)));
  f.der.especialMult= f.der.especialMult * (1 + (p.especialMult || 0));
  return f;
}

/** Construye el luchador del jugador desde el GameState. */
export function heroeDesdeEstado(estado = S) {
  // 14.10 — los rasgos de carrera modifican las stats antes que la clase
  const conRasgos = aplicarRasgosHeroe(estado.stats, estado.perfil.rasgos || []);
  return crearLuchador({
    nombre: estado.perfil.nombre,
    clase: estado.perfil.clase,
    subclase: estado.perfil.subclase,
    nivel: estado.perfil.nivel,
    stats: conRasgos,
    bonos: bonosDeEquipo(estado),
    esHeroe: true,
    rasgos: estado.perfil.rasgos,
    pasivas: bonosTotales(),        // 17.03 el árbol entra en combate
    reglas: reglasActivas()         // 17.07 keystones
  });
}

/** Suma de bonos del equipo (Paso 9 lo llenará; hoy devuelve ceros). */
export function bonosDeEquipo(estado = S) {
  const out = {};
  for (const k of CLAVES_STATS) out[k] = 0;
  for (const pieza of Object.values(estado.equipo?.slots || {})) {
    if (!pieza?.stats) continue;
    for (const [k, v] of Object.entries(pieza.stats)) out[k] = (out[k] || 0) + v;
  }
  return out;
}

/** Reinicia el estado vivo antes de una lucha. */
export function prepararParaLucha(f, vidaPct = 1) {
  f.vida = Math.max(1, Math.floor(f.der.vidaMax * vidaPct));
  f.momentum = 0;
  f.fatiga = 0;
  f.estados = [];
  // 18.05 — escudo inicial de la rama Resistencia
  f.escudo = Math.round(f.pasivas?.escudoInicial || 0);
  return f;
}

export function vidaPct(f) {
  return Math.max(0, Math.min(1, f.vida / f.der.vidaMax));
}
