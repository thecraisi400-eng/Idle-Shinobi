/* ===== FÓRMULA DE DAÑO =====
   02.03 varianza + críticos + tipos de golpe
   02.04 crítico 10% x1.5 (fijo para todos, 03.04)
   05.02 multiplicador del círculo de clases */

import { COMBATE } from '../../data/constants.js';
import { multiplicadorClase } from '../../data/clases.js';

/* Tres tipos de golpe (02.03). La IA elige según su personalidad. */
export const TIPOS_GOLPE = {
  potencia: {
    id: 'potencia', nombre: 'Golpe de poder', ico: '💥',
    mult: 1.35, coste: 1.5, penetraExtra: 0, precisionMod: -0.05,
    verbos: ['lanza un antebrazo', 'suelta una lanza', 'conecta un powerslam', 'descarga un martillo']
  },
  tecnica: {
    id: 'tecnica', nombre: 'Llave técnica', ico: '🎯',
    mult: 0.85, coste: 0.8, penetraExtra: 0.25, precisionMod: 0.10,
    verbos: ['aplica una llave', 'ejecuta un candado', 'encadena un armbar', 'clava una palanca']
  },
  agilidad: {
    id: 'agilidad', nombre: 'Golpe rápido', ico: '🌀',
    mult: 0.65, coste: 0.5, penetraExtra: 0, precisionMod: 0.05,
    verbos: ['encadena un jab', 'suelta una patada rápida', 'conecta un codazo', 'lanza un dropkick']
  }
};

export const CLAVES_TIPOS = Object.keys(TIPOS_GOLPE);

/**
 * Calcula un golpe completo.
 * Devuelve { dano, critico, esquivado, tipo, bloqueadoPct }
 */
export function calcularGolpe(atacante, defensor, tipoId, rng, extras = {}) {
  const tipo = TIPOS_GOLPE[tipoId] || TIPOS_GOLPE.potencia;
  const A = atacante.der, D = defensor.der;

  // --- 1) Esquiva (agilidad del defensor vs precisión del atacante) ---
  const esquivaReal = Math.max(0, D.esquiva - A.antiEsquiva + (tipo.precisionMod * -1) * 0.5);
  if (rng.chance(esquivaReal)) {
    return { dano: 0, critico: false, esquivado: true, tipo: tipoId, bloqueadoPct: 0 };
  }

  // --- 2) Daño base con el tipo de golpe ---
  let dano = A.danoBase * tipo.mult;

  // --- 3) Varianza (02.03) — la precisión la reduce ---
  const amp = (COMBATE.VARIANZA_MAX - COMBATE.VARIANZA_MIN) * (1 - A.antiEsquiva * 0.8);
  const centro = (COMBATE.VARIANZA_MAX + COMBATE.VARIANZA_MIN) / 2;
  dano *= rng.rango(centro - amp / 2, centro + amp / 2);

  // --- 4) Fatiga del atacante: golpea más flojo cansado ---
  const fatigaPct = atacante.fatiga / COMBATE.FATIGA_MAX;
  dano *= 1 - fatigaPct * 0.20;

  // --- 5) Círculo de clases (05.02) ---
  dano *= multiplicadorClase(atacante.clase, defensor.clase);

  // --- 6) Modificadores externos (estados, especial, pasivas) ---
  dano *= extras.mult || 1;

  // --- 6b) PASIVAS DEL ÁRBOL (Paso 10, 18.04) ---
  const pas = atacante.pasivas;
  if (pas) {
    dano *= 1 + (pas.danoMult || 0);
    if (tipoId === 'potencia') dano *= 1 + (pas.danoPotencia || 0);
    if (tipoId === 'tecnica')  dano *= 1 + (pas.danoTecnica  || 0);
  }
  // Keystone Ejecutor: remate a rivales heridos
  const remate = atacante.reglas?.remate;
  if (remate && (defensor.vida / defensor.der.vidaMax) < 0.30) dano *= remate.mult;

  // --- 7) Crítico: 10% fijo x1.5 (02.04 / 03.04) ---
  let critico = false;
  const probCrit = (extras.critProbExtra != null
    ? COMBATE.CRIT_PROB + extras.critProbExtra
    : COMBATE.CRIT_PROB) + (pas?.critProb || 0);
  if (rng.chance(probCrit)) {
    critico = true;
    // La Presencia potencia el daño crítico; la rama Potencia también
    let multCrit = COMBATE.CRIT_MULT * (1 + (A.especialMult - 1) * 0.5) + (pas?.critMult || 0);
    // 18.05 Cuello de toro: el defensor reduce el daño crítico recibido
    const red = defensor.pasivas?.reduccionCrit || 0;
    if (red > 0) multCrit = 1 + (multCrit - 1) * (1 - Math.min(0.80, red));
    dano *= multCrit;
  }

  // --- 8) Defensa: penetración de Técnica + tipo de golpe ---
  const penetracion = Math.min(0.85, A.penetracion + tipo.penetraExtra);
  const mitigacion = D.mitigacion * (1 - penetracion) * (extras.mitigacionMult ?? 1);
  const antes = dano;
  dano = Math.max(dano * 0.10, dano - mitigacion);   // nunca se bloquea más del 90%

  const bloqueadoPct = antes > 0 ? 1 - dano / antes : 0;

  return {
    dano: Math.max(1, Math.round(dano)),
    critico,
    esquivado: false,
    tipo: tipoId,
    bloqueadoPct
  };
}

/** Puntuación de jueces para el desempate (02.08). */
export function puntuacionJueces(f) {
  const s = f._sesion;
  const agresividad = s.golpes * 1.0 + s.criticos * 3 + s.especiales * 5;
  const tecnica = s.golpesTecnica * 2 + s.esquivasLogradas * 1.5 + (f.stats.tecnica || 0) * 0.15;
  const dano = s.danoInfligido * 0.05;
  return agresividad + tecnica + dano;
}
