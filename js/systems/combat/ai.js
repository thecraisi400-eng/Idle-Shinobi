/* ===== IA CON PERSONALIDADES (02.07) =====
   "Cada luchador tiene rasgos (agresivo, oportunista, defensivo)
    que cambian su estilo."
   La IA decide QUÉ TIPO DE GOLPE usar en cada acción. */

import { CLAVES_TIPOS } from './damage.js';
import { fatigaPct } from './fatigue.js';

export const PERSONALIDADES = {
  agresivo: {
    id: 'agresivo', nombre: 'Agresivo', ico: '😤',
    desc: 'Busca el golpe de poder aunque se agote.',
    base: { potencia: 6, tecnica: 2, agilidad: 2 }
  },
  oportunista: {
    id: 'oportunista', nombre: 'Oportunista', ico: '🦊',
    desc: 'Golpea rápido y castiga cuando te ve débil o cansado.',
    base: { potencia: 3, tecnica: 3, agilidad: 4 }
  },
  defensivo: {
    id: 'defensivo', nombre: 'Defensivo', ico: '🛡️',
    desc: 'Prefiere la técnica y espera a que el rival se fatigue.',
    base: { potencia: 2, tecnica: 6, agilidad: 2 }
  }
};

/**
 * Elige el tipo de golpe según personalidad y situación.
 * Devuelve 'potencia' | 'tecnica' | 'agilidad'
 */
export function elegirGolpe(atacante, defensor, rng) {
  const pers = PERSONALIDADES[atacante.personalidad] || PERSONALIDADES.agresivo;
  const pesos = { ...pers.base };

  const miFatiga = fatigaPct(atacante);
  const suFatiga = fatigaPct(defensor);
  const suVida = defensor.vida / defensor.der.vidaMax;
  const miVida = atacante.vida / atacante.der.vidaMax;

  // --- Reglas comunes a todos ---
  // Muy cansado: los golpes baratos ganan peso
  if (miFatiga > 0.6) { pesos.agilidad += 4; pesos.potencia -= 3; }
  // El rival tiene mucha defensa: la técnica penetra
  if (defensor.der.mitigacion > atacante.der.danoBase * 0.45) pesos.tecnica += 3;
  // El rival esquiva mucho: golpes rápidos y precisos
  if (defensor.der.esquiva > 0.18) { pesos.agilidad += 2; pesos.potencia -= 1; }

  // --- Reglas por personalidad ---
  switch (pers.id) {
    case 'agresivo':
      if (suVida < 0.35) pesos.potencia += 5;          // huele sangre
      if (miVida < 0.25) pesos.potencia += 3;          // todo o nada
      break;
    case 'oportunista':
      if (suFatiga > 0.5) pesos.potencia += 5;         // castiga al cansado
      if (suVida < 0.30) pesos.potencia += 4;          // remata
      if (miVida < 0.35) pesos.agilidad += 3;          // aguanta
      break;
    case 'defensivo':
      if (miVida < 0.40) pesos.tecnica += 4;           // se refugia en la técnica
      if (suFatiga > 0.6) pesos.potencia += 3;         // ahora sí arriesga
      break;
  }

  const lista = CLAVES_TIPOS.map(k => ({ v: k, p: Math.max(0.2, pesos[k] || 0) }));
  return rng.pesos(lista);
}

/** ¿Guarda el especial para un mejor momento? Solo el oportunista lo hace. */
export function retieneEspecial(atacante, defensor) {
  // 12.03 el especial se activa solo al llenarse la barra.
  // El oportunista es el único que puede esperar un instante mejor.
  if (atacante.personalidad !== 'oportunista') return false;
  const suVida = defensor.vida / defensor.der.vidaMax;
  return suVida > 0.55;   // espera a que baje para rematar
}

export function descripcionIA(id) {
  return PERSONALIDADES[id] || PERSONALIDADES.agresivo;
}
