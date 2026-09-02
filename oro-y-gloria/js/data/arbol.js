/* ===== EL ÁRBOL: 6 RAMAS, TIERS Y NODOS =====
   17.01/17.02 multi-árbol de 6 ramas · 17.04 desbloqueo mixto (nivel + nodos)
   17.06 tiers infinitos · 17.09 coste escalado por tier
   17.11 nodos de varios rangos con overcharge · 17.13 ramas progresivas
   17.15 los nodos bloqueados se ven con sus requisitos

   El árbol NO se escribe a mano nodo por nodo: se GENERA a partir de las
   plantillas. 6 ramas x 5 plantillas x 5 tiers + 8 keystones = 158 nodos.
   Los tiers 6+ existen igual (17.06) y se generan bajo demanda. */

import { RAMAS, CLAVES_RAMAS, PLANTILLAS, plantillasDeRama, KEYSTONES, keystonesDeRama } from './pasivas.js';
import { PROG } from './constants.js';

/** Cuántos tiers se generan "de fábrica". Más allá se crean al vuelo (17.06). */
export const TIERS_BASE = 5;

/** Cuánto crece el valor de una pasiva por cada tier. */
export const TIER_EXP = 1.45;

/** Nodos normales por tier y rama. */
export const NODOS_POR_TIER = 5;

/* ---------- Escalado ---------- */

/** Factor global de potencia del árbol (17.08: solo hay ~200 puntos).
    Calibrado por barrido de 6 ramas x 700 luchas: con 1.0 una rama llena
    daba 98-99% de winrate (roto). Con 0.35 el reparto queda en 59-79%
    segun la rama: la inversion se nota, pero no te vuelve invencible. */
export const ESCALA_PASIVA = 0.35;

/** El valor de una pasiva crece con el tier. */
export function valorEnTier(plantilla, tier, rango = 1) {
  const escalaTier = Math.pow(TIER_EXP, tier - 1) * ESCALA_PASIVA;
  const base = plantilla.base * escalaTier;
  const extra = plantilla.porRango * escalaTier * (rango - 1);
  return base + extra;
}

/** Coste en puntos de un rango concreto (17.09 escalado por tier, 17.11 overcharge). */
export function costeRango(tier, rango) {
  // El tier encarece la entrada; cada rango extra del mismo nodo cuesta más
  return Math.max(1, Math.round(tier + (rango - 1) * (1 + tier * 0.5)));
}

/** Coste total de llevar un nodo del rango 0 al rango N. */
export function costeAcumulado(tier, hastaRango) {
  let total = 0;
  for (let r = 1; r <= hastaRango; r++) total += costeRango(tier, r);
  return total;
}

/** Coste de un keystone: caro y fijo por rango. */
export function costeKeystone(tier, rango) {
  return Math.max(3, Math.round(4 + tier * 2 + (rango - 1) * 3));
}

/* ---------- Nivel requerido ---------- */

/** Nivel de héroe necesario para tocar un tier de una rama (17.04, 17.13). */
export function nivelRequerido(ramaId, tier) {
  const rama = RAMAS[ramaId];
  return (rama?.nivelRama || 1) + (tier - 1) * 4;
}

/* ---------- Construcción de nodos ---------- */

/** Id estable de un nodo. */
export const idNodo = (rama, tier, slot) => `${rama}.t${tier}.${slot}`;

/**
 * Construye el nodo de una posición concreta.
 * Los tiers por encima de TIERS_BASE reutilizan las plantillas cíclicamente,
 * así el árbol es realmente infinito (17.06) sin datos infinitos.
 */
export function construirNodo(ramaId, tier, slot) {
  const plantillas = plantillasDeRama(ramaId);
  const p = plantillas[slot % plantillas.length];
  if (!p) return null;

  return {
    id: idNodo(ramaId, tier, slot),
    tipo: 'pasiva',
    rama: ramaId,
    tier, slot,
    plantilla: p.id,
    nombre: tier > 1 ? `${p.nombre} ${romano(tier)}` : p.nombre,
    ico: p.ico,
    bonus: p.bonus,
    rangosMax: p.rangos,
    nivelReq: nivelRequerido(ramaId, tier),
    valorPara: rango => valorEnTier(p, tier, rango),
    texto: p.texto
  };
}

/** El keystone de una rama vive en un tier concreto. */
export function keystoneDeTier(ramaId, tier) {
  const ks = keystonesDeRama(ramaId);
  if (!ks.length) return null;
  // Un keystone cada 3 tiers: tiers 2, 5, 8...
  if (tier < 2 || (tier - 2) % 3 !== 0) return null;
  const k = ks[Math.floor((tier - 2) / 3) % ks.length];
  return {
    id: `${ramaId}.t${tier}.key`,
    tipo: 'keystone',
    rama: ramaId,
    tier, slot: 'key',
    keystone: k.id,
    regla: k.regla,
    nombre: k.nombre,
    ico: k.ico,
    desc: k.desc,
    rangosMax: k.rangos,
    nivelReq: nivelRequerido(ramaId, tier) + 2,
    porRango: k.porRango,
    valor: k.valor
  };
}

/** Todos los nodos de un tier de una rama (incluido su keystone si toca). */
export function nodosDeTier(ramaId, tier) {
  const out = [];
  for (let s = 0; s < NODOS_POR_TIER; s++) {
    const n = construirNodo(ramaId, tier, s);
    if (n) out.push(n);
  }
  const k = keystoneDeTier(ramaId, tier);
  if (k) out.push(k);
  return out;
}

/** Todos los nodos de una rama hasta cierto tier. */
export function nodosDeRama(ramaId, hastaTier = TIERS_BASE) {
  const out = [];
  for (let t = 1; t <= hastaTier; t++) out.push(...nodosDeTier(ramaId, t));
  return out;
}

/** El árbol completo hasta cierto tier (para pruebas y búsqueda). */
export function arbolCompleto(hastaTier = TIERS_BASE) {
  const out = [];
  for (const r of CLAVES_RAMAS) out.push(...nodosDeRama(r, hastaTier));
  return out;
}

/** Busca un nodo por su id, generándolo si hace falta (tiers infinitos). */
export function nodoPorId(id) {
  const m = /^([a-z]+)\.t(\d+)\.(.+)$/.exec(id || '');
  if (!m) return null;
  const [, rama, tierStr, slot] = m;
  if (!RAMAS[rama]) return null;
  const tier = Number(tierStr);
  if (!Number.isFinite(tier) || tier < 1) return null;
  return slot === 'key' ? keystoneDeTier(rama, tier) : construirNodo(rama, tier, Number(slot));
}

/* ---------- Números romanos para los nombres de tier ---------- */
const ROMANOS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
export function romano(n) {
  if (n <= 10) return ROMANOS[n];
  return `T${n}`;
}

/* ---------- Presupuesto total (17.08 ~200 puntos) ---------- */
export const PUNTOS_TOTALES_ESPERADOS = PROG.PUNTOS_ARBOL_TOTALES;

/** Cuántos puntos de árbol tendrá el jugador a cierto nivel (1 por nivel). */
export const puntosAlNivel = nivel => Math.max(0, nivel - 1);
