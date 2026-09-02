/* ===== SISTEMA DEL ÁRBOL DE HABILIDADES =====
   17.03 se paga con puntos de nivel · 17.04 desbloqueo mixto
   17.05 SIN respec · 17.10 no se muestra el efecto acumulado global
   17.12 sin sinergias entre ramas · 17.13 ramas progresivas
   17.15 los bloqueados enseñan sus requisitos
   18.13 cada nodo muestra tu valor actual · 18.14 el efecto llega a las derivadas

   Sugerencias del Paso 10:
   #1 planificador de ruta (`rutaHasta`)
   #4 búsqueda por texto (`buscar`)
   #5 puntos gastados por rama (`gastoPorRama`) */

import { S } from '../core/state.js';
import { emit } from '../core/events-bus.js';
import { RAMAS, CLAVES_RAMAS, PLANTILLAS, KEYSTONES, CLAVES_BONUS } from '../data/pasivas.js';
import {
  nodoPorId, nodosDeTier, nodosDeRama, arbolCompleto, idNodo,
  costeRango, costeAcumulado, costeKeystone, nivelRequerido, TIERS_BASE
} from '../data/arbol.js';

/* ---------- Consultas de estado ---------- */

/** Rango actual comprado de un nodo (0 = no comprado). */
export function rangoDe(idOrNodo) {
  const id = typeof idOrNodo === 'string' ? idOrNodo : idOrNodo?.id;
  return S.arbol.nodos[id] || 0;
}

export const puntosDisponibles = () => S.perfil.puntosArbol || 0;

/** Puntos gastados en total. */
export function gastoTotal() {
  let total = 0;
  for (const [id, rango] of Object.entries(S.arbol.nodos)) {
    const n = nodoPorId(id);
    if (!n) continue;
    total += costeTotalDe(n, rango);
  }
  return total;
}

function costeTotalDe(nodo, rango) {
  let t = 0;
  for (let r = 1; r <= rango; r++) {
    t += nodo.tipo === 'keystone' ? costeKeystone(nodo.tier, r) : costeRango(nodo.tier, r);
  }
  return t;
}

/** Sugerencia #5: puntos invertidos en cada rama. */
export function gastoPorRama() {
  const out = {};
  for (const r of CLAVES_RAMAS) out[r] = 0;
  for (const [id, rango] of Object.entries(S.arbol.nodos)) {
    const n = nodoPorId(id);
    if (!n) continue;
    out[n.rama] = (out[n.rama] || 0) + costeTotalDe(n, rango);
  }
  return out;
}

/* ---------- Requisitos (17.04, 17.13, 17.15) ---------- */

/** ¿Está abierta esta rama? (17.13 apertura progresiva por nivel) */
export function ramaAbierta(ramaId) {
  const r = RAMAS[ramaId];
  if (!r) return false;
  return S.perfil.nivel >= r.nivelRama;
}

/** Nodos comprados en un tier concreto de una rama. */
export function comprasEnTier(ramaId, tier) {
  let n = 0;
  for (const nodo of nodosDeTier(ramaId, tier)) {
    if (rangoDe(nodo.id) > 0) n++;
  }
  return n;
}

/**
 * 17.04 desbloqueo MIXTO: hace falta nivel de héroe Y haber invertido
 * en el tier anterior de la misma rama. Nunca depende de otras ramas (17.12).
 * 17.15 devuelve siempre la lista de requisitos que faltan.
 */
export function requisitos(nodo) {
  if (!nodo) return { ok: false, faltan: ['nodo inexistente'] };
  const faltan = [];

  const rama = RAMAS[nodo.rama];
  if (!ramaAbierta(nodo.rama)) faltan.push(`Rama ${rama.nombre} se abre al nivel ${rama.nivelRama}`);
  if (S.perfil.nivel < nodo.nivelReq) faltan.push(`Nivel ${nodo.nivelReq}`);

  // Puerta de tier: al menos 2 nodos comprados en el tier anterior
  if (nodo.tier > 1) {
    const previos = comprasEnTier(nodo.rama, nodo.tier - 1);
    const necesarios = 2;
    if (previos < necesarios) {
      faltan.push(`${necesarios} nodos del tier ${nodo.tier - 1} (tienes ${previos})`);
    }
  }

  // Los keystones exigen inversión previa en su propio tier
  if (nodo.tipo === 'keystone' && comprasEnTier(nodo.rama, nodo.tier) < 2) {
    faltan.push(`2 nodos del tier ${nodo.tier}`);
  }

  return { ok: faltan.length === 0, faltan };
}

/** Coste del SIGUIENTE rango de un nodo. */
export function costeSiguiente(nodo) {
  const r = rangoDe(nodo.id) + 1;
  if (r > nodo.rangosMax) return null;         // 17.11: el overcharge tiene tope por nodo
  return nodo.tipo === 'keystone' ? costeKeystone(nodo.tier, r) : costeRango(nodo.tier, r);
}

/** ¿Se puede comprar ahora mismo? */
export function puedeComprar(nodo) {
  if (!nodo) return { ok: false, motivo: 'no-existe' };
  const rango = rangoDe(nodo.id);
  if (rango >= nodo.rangosMax) return { ok: false, motivo: 'maximo' };

  const req = requisitos(nodo);
  if (!req.ok) return { ok: false, motivo: 'requisitos', faltan: req.faltan };

  const coste = costeSiguiente(nodo);
  if (puntosDisponibles() < coste) {
    return { ok: false, motivo: 'puntos', coste, faltan: [`${coste - puntosDisponibles()} puntos más`] };
  }
  return { ok: true, coste };
}

/* ---------- Compra (17.03, 17.05 sin respec) ---------- */

export function comprar(idOrNodo) {
  const nodo = typeof idOrNodo === 'string' ? nodoPorId(idOrNodo) : idOrNodo;
  if (!nodo) return { ok: false, motivo: 'no-existe' };

  const check = puedeComprar(nodo);
  if (!check.ok) return check;

  S.perfil.puntosArbol -= check.coste;
  S.arbol.nodos[nodo.id] = rangoDe(nodo.id) + 1;

  // Marca la rama como "vista" para la interfaz
  if (!S.arbol.ramasAbiertas.includes(nodo.rama)) S.arbol.ramasAbiertas.push(nodo.rama);

  emit('arbol:compra', { nodo, rango: S.arbol.nodos[nodo.id], coste: check.coste });
  emit('hud:refresh');
  return { ok: true, rango: S.arbol.nodos[nodo.id], coste: check.coste };
}

/* ---------- Bonificaciones totales (18.14) ---------- */

/**
 * Suma TODAS las pasivas compradas.
 * Los bonus del mismo tipo se suman (no se multiplican entre sí):
 * es predecible y evita explosiones exponenciales.
 */
export function bonosTotales() {
  const out = {};
  for (const k of CLAVES_BONUS) out[k] = 0;

  for (const [id, rango] of Object.entries(S.arbol.nodos)) {
    if (!rango) continue;
    const nodo = nodoPorId(id);
    if (!nodo || nodo.tipo !== 'pasiva') continue;
    const v = nodo.valorPara(rango);
    out[nodo.bonus] = (out[nodo.bonus] || 0) + v;
  }
  return out;
}

/** Reglas activas de los keystones (17.07). */
export function reglasActivas() {
  const out = {};
  for (const [id, rango] of Object.entries(S.arbol.nodos)) {
    if (!rango) continue;
    const nodo = nodoPorId(id);
    if (!nodo || nodo.tipo !== 'keystone') continue;
    const k = KEYSTONES[nodo.keystone];
    if (!k) continue;
    // Si el mismo keystone se compró en varios tiers, gana el rango más alto
    const val = k.valor(rango);
    const previo = out[k.regla];
    out[k.regla] = previo ? mejorRegla(k.regla, previo, val) : val;
  }
  return out;
}

function mejorRegla(regla, a, b) {
  const clave = Object.keys(a)[0];
  return (b[clave] || 0) > (a[clave] || 0) ? b : a;
}

/* ---------- Sugerencia #1: planificador de ruta ---------- */

/**
 * Camino mínimo para poder comprar un nodo objetivo.
 * Devuelve los nodos intermedios que hay que comprar y el coste total.
 * Con solo ~200 puntos y sin respec (17.05), planificar no es un lujo.
 */
export function rutaHasta(idOrNodo) {
  const objetivo = typeof idOrNodo === 'string' ? nodoPorId(idOrNodo) : idOrNodo;
  if (!objetivo) return null;

  const pasos = [];
  let coste = 0;
  // simulación de compras en tiers anteriores
  const simuladas = {};

  const comprasSim = (rama, tier) => {
    let n = comprasEnTier(rama, tier);
    for (const k of Object.keys(simuladas)) {
      const nn = nodoPorId(k);
      if (nn && nn.rama === rama && nn.tier === tier && rangoDe(k) === 0) n++;
    }
    return n;
  };

  // Abrir cada tier anterior hasta tener 2 nodos comprados
  for (let t = 1; t < objetivo.tier; t++) {
    let faltan = 2 - comprasSim(objetivo.rama, t);
    if (faltan <= 0) continue;
    const candidatos = nodosDeTier(objetivo.rama, t)
      .filter(n => n.tipo === 'pasiva' && rangoDe(n.id) === 0 && !simuladas[n.id])
      .sort((a, b) => costeRango(a.tier, 1) - costeRango(b.tier, 1));
    for (const c of candidatos) {
      if (faltan <= 0) break;
      simuladas[c.id] = 1;
      pasos.push({ nodo: c, coste: costeRango(c.tier, 1) });
      coste += costeRango(c.tier, 1);
      faltan--;
    }
  }

  // Un keystone también exige 2 nodos de su propio tier
  if (objetivo.tipo === 'keystone') {
    let faltan = 2 - comprasSim(objetivo.rama, objetivo.tier);
    const candidatos = nodosDeTier(objetivo.rama, objetivo.tier)
      .filter(n => n.tipo === 'pasiva' && rangoDe(n.id) === 0 && !simuladas[n.id]);
    for (const c of candidatos) {
      if (faltan <= 0) break;
      simuladas[c.id] = 1;
      pasos.push({ nodo: c, coste: costeRango(c.tier, 1) });
      coste += costeRango(c.tier, 1);
      faltan--;
    }
  }

  // El propio objetivo
  const cSelf = costeSiguiente(objetivo);
  if (cSelf != null) {
    pasos.push({ nodo: objetivo, coste: cSelf });
    coste += cSelf;
  }

  const nivelNecesario = Math.max(
    objetivo.nivelReq,
    RAMAS[objetivo.rama].nivelRama,
    ...pasos.map(p => p.nodo.nivelReq)
  );

  return {
    objetivo, pasos, coste,
    nivelNecesario,
    alcanzable: puntosDisponibles() >= coste && S.perfil.nivel >= nivelNecesario,
    faltanPuntos: Math.max(0, coste - puntosDisponibles()),
    faltanNiveles: Math.max(0, nivelNecesario - S.perfil.nivel)
  };
}

/* ---------- Sugerencia #4: búsqueda por texto ---------- */

/** Busca nodos cuyo nombre, efecto o rama coincida con el texto. */
export function buscar(texto, hastaTier = TIERS_BASE) {
  const q = (texto || '').trim().toLowerCase();
  if (!q) return [];
  const norm = s => (s || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const qn = norm(q);

  return arbolCompleto(hastaTier).filter(n => {
    const desc = n.tipo === 'keystone' ? n.desc : n.texto(n.valorPara(1));
    const campos = [n.nombre, desc, RAMAS[n.rama].nombre, n.bonus || n.regla || ''];
    return campos.some(c => norm(c).includes(qn));
  });
}

/* ---------- Ayudas para la interfaz ---------- */

/** Descripción con el valor ACTUAL del jugador (18.13). */
export function descripcion(nodo) {
  const rango = rangoDe(nodo.id);
  if (nodo.tipo === 'keystone') {
    return {
      actual: rango > 0 ? nodo.porRango(rango) : 'Sin comprar',
      siguiente: rango < nodo.rangosMax ? nodo.porRango(rango + 1) : null,
      base: nodo.desc
    };
  }
  return {
    actual: rango > 0 ? nodo.texto(nodo.valorPara(rango)) : 'Sin comprar',
    siguiente: rango < nodo.rangosMax ? nodo.texto(nodo.valorPara(rango + 1)) : null,
    base: nodo.texto(nodo.valorPara(1))
  };
}

/** Ramas visibles con su estado (17.13). */
export function estadoRamas() {
  const gasto = gastoPorRama();
  return CLAVES_RAMAS.map(id => ({
    ...RAMAS[id],
    abierta: ramaAbierta(id),
    gastado: gasto[id] || 0,
    nodosComprados: Object.keys(S.arbol.nodos)
      .filter(k => k.startsWith(id + '.') && S.arbol.nodos[k] > 0).length
  }));
}

/** Tier más alto en el que el jugador ya invirtió (para el desplazamiento inicial). */
export function tierAlcanzado(ramaId) {
  let max = 1;
  for (const [id, r] of Object.entries(S.arbol.nodos)) {
    if (!r || !id.startsWith(ramaId + '.')) continue;
    const n = nodoPorId(id);
    if (n && n.tier > max) max = n.tier;
  }
  return max;
}
