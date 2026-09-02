/* PRUEBAS DEL PASO 9 — Equipo, botín, inventario, forja */
globalThis.location = { hostname: 'localhost', hash: '' };

let ok = 0, fail = 0;
const t = (nombre, cond, extra = '') => {
  if (cond) ok++;
  else { fail++; console.log(`  ❌ ${nombre} ${extra}`); }
};
const sec = n => console.log(`\n— ${n}`);

const ST = await import('../js/core/state.js');
const { iniciarEstado, crearPartidaNueva } = ST;
const st = () => ST.S;

const { EQUIPO, ECO } = await import('../js/data/constants.js');
const { CLAVES_STATS } = await import('../js/data/stats.js');
const EQ = await import('../js/data/equipo.js');
const { SLOTS, CLAVES_SLOTS, RAREZAS, getRareza, EXOTICOS, PROB_EXOTICO,
        valorDePieza, costeMejora, puntosDePieza, requisitosCumplidos } = EQ;
const LOOT = await import('../js/systems/loot.js');
const INV = await import('../js/systems/inventory.js');
const FORJA = await import('../js/systems/forge.js');
const { crearRNG, rngDe } = await import('../js/core/rng.js');
const { heroeDesdeEstado } = await import('../js/systems/fighter.js');

function reset(nivel = 20, oro = 100000) {
  iniciarEstado(crearPartidaNueva(777));
  const S = ST.S;
  S.perfil.clase = 'rudo';
  S.perfil.nivel = nivel;
  S.monedas.oro = oro;
  S.equipo.material = 500;
  return S;
}
const rngT = (s = 1) => crearRNG(s);

/* ================= 1. ESTRUCTURA (15.01, 15.02) ================= */
sec('Slots y rarezas');
t('hay exactamente 8 slots (15.01)', CLAVES_SLOTS.length === EQUIPO.SLOTS, CLAVES_SLOTS.length);
t('los slots son los del plan',
  CLAVES_SLOTS.join(',') === 'mascara,capa,botas,muniequeras,cinturon,protector,guantes,amuleto',
  CLAVES_SLOTS.join(','));
t('hay 6 rarezas (15.02)', Object.keys(RAREZAS).length === EQUIPO.RAREZAS);
t('cada slot tiene stats afines', CLAVES_SLOTS.every(k => SLOTS[k].afines.length >= 2));
t('las afines son stats válidas',
  CLAVES_SLOTS.every(k => SLOTS[k].afines.every(a => CLAVES_STATS.includes(a))));

sec('Las rarezas escalan de verdad');
let multCrece = true, valorCrece = true, pesoBaja = true;
for (let n = 2; n <= 6; n++) {
  if (RAREZAS[n].mult <= RAREZAS[n - 1].mult) multCrece = false;
  if (RAREZAS[n].valor <= RAREZAS[n - 1].valor) valorCrece = false;
  if (RAREZAS[n].peso >= RAREZAS[n - 1].peso) pesoBaja = false;
}
t('el multiplicador sube con la rareza', multCrece);
t('el valor sube con la rareza', valorCrece);
t('la probabilidad baja con la rareza', pesoBaja);
t('los colores son los clásicos (15.03)',
  RAREZAS[1].color === '#8b8b93' && RAREZAS[6].color === '#e8b64c');

/* ================= 2. GENERACIÓN DE PIEZAS ================= */
sec('Generación básica');
reset();
const p1 = LOOT.generarPieza({ nivel: 10, rareza: 3, rng: rngT(5) });
t('tiene id único', typeof p1.id === 'string' && p1.id.length > 3);
t('tiene slot válido', CLAVES_SLOTS.includes(p1.slot));
t('la rareza es la pedida', p1.rareza === 3);
t('tiene nivel propio (15.05)', p1.nivel === 10);
t('empieza con pocas estrellas', p1.estrellas <= 1, p1.estrellas);
t('tiene al menos una stat', Object.keys(p1.stats).length >= 1);
t('tiene valor en oro', p1.valor > 0);
t('no nace bloqueada', p1.bloqueado === false);

sec('Sin substats: pocas stats y grandes (15.06)');
for (const rar of [1, 2, 3, 4, 5, 6]) {
  const p = LOOT.generarPieza({ nivel: 20, rareza: rar, exotico: false, rng: rngT(rar * 11) });
  const n = Object.keys(p.stats).length;
  t(`rareza ${rar}: como máximo ${getRareza(rar).statsN} stats`, n <= getRareza(rar).statsN, n);
}
const pGrande = LOOT.generarPieza({ nivel: 40, rareza: 6, exotico: false, rng: rngT(3) });
t('los valores son grandes, no migajas',
  Math.max(...Object.values(pGrande.stats)) >= 20, Math.max(...Object.values(pGrande.stats)));

sec('La primera stat es afín al slot');
let afines = 0;
for (let i = 0; i < 60; i++) {
  const p = LOOT.generarPieza({ nivel: 15, rareza: 1, exotico: false, rng: rngT(i + 100) });
  const primera = Object.keys(p.stats)[0];
  if (SLOTS[p.slot].afines.includes(primera)) afines++;
}
t('una máscara no da +Potencia por accidente', afines === 60, `${afines}/60`);

sec('Escalado por nivel y rareza');
const bajo = LOOT.generarPieza({ nivel: 1, rareza: 1, exotico: false, rng: rngT(9) });
const alto = LOOT.generarPieza({ nivel: 50, rareza: 1, exotico: false, rng: rngT(9) });
t('más nivel = más puntos', LOOT.puntuacion(alto) > LOOT.puntuacion(bajo),
  `${LOOT.puntuacion(bajo)} → ${LOOT.puntuacion(alto)}`);
const comun = LOOT.generarPieza({ nivel: 20, rareza: 1, exotico: false, rng: rngT(4) });
const divino = LOOT.generarPieza({ nivel: 20, rareza: 6, exotico: false, rng: rngT(4) });
t('más rareza = más puntos', LOOT.puntuacion(divino) > LOOT.puntuacion(comun) * 2,
  `${LOOT.puntuacion(comun)} vs ${LOOT.puntuacion(divino)}`);

sec('Nombres genéricos y legibles (15.09)');
const nombres = new Set();
for (let i = 0; i < 40; i++) {
  const p = LOOT.generarPieza({ nivel: 10, rng: rngT(i + 500) });
  nombres.add(p.nombre);
  if (!p.nombre.includes(SLOTS[p.slot].nombre)) {
    t('el nombre incluye el tipo de pieza', false, p.nombre);
  }
}
t('todos los nombres dicen qué pieza son', true);
t('hay variedad de nombres', nombres.size > 8, nombres.size);

/* ================= 3. EXÓTICOS Y TRADE-OFFS (15.11) ================= */
sec('Exóticos: el trade-off es real');
const exo = LOOT.generarPieza({ nivel: 30, rareza: 5, exotico: true, rng: rngT(21) });
t('la pieza es exótica', exo.exotico !== null, exo.exotico);
const def = EXOTICOS[exo.exotico];
t('sube su stat buena', (exo.stats[def.sube] || 0) > 0, `${def.sube}=${exo.stats[def.sube]}`);
t('la stat castigada está presente y penalizada',
  exo.stats[def.baja] !== undefined, `${def.baja}=${exo.stats[def.baja]}`);

sec('El castigo baja el valor de esa stat');
let conCastigoNegativo = 0, total = 0;
for (let i = 0; i < 40; i++) {
  const e = LOOT.generarPieza({ nivel: 30, rareza: 5, exotico: true, rng: rngT(i + 900) });
  const d = EXOTICOS[e.exotico];
  const normal = LOOT.generarPieza({ nivel: 30, rareza: 5, exotico: false, rng: rngT(i + 900) });
  total++;
  if ((e.stats[d.baja] || 0) < 0) conCastigoNegativo++;
}
t('los exóticos generan penalizaciones reales', conCastigoNegativo > 0, `${conCastigoNegativo}/${total}`);

t('las rarezas 1 y 2 nunca son exóticas (15.11)',
  PROB_EXOTICO[1] === 0 && PROB_EXOTICO[2] === 0);
let exoBajo = 0;
for (let i = 0; i < 100; i++) {
  const p = LOOT.generarPieza({ nivel: 20, rareza: 2, rng: rngT(i + 60) });
  if (p.exotico) exoBajo++;
}
t('confirmado en la práctica', exoBajo === 0, exoBajo);
t('cada exótico respeta su rareza mínima',
  Object.values(EXOTICOS).every(e => e.rarezaMin >= 3));

sec('Sin sets ni pasivas (15.04, 15.07)');
const muestra = LOOT.generarLote(50, { nivel: 25, semilla: 3 });
t('ninguna pieza tiene set', muestra.every(p => p.set === undefined));
t('ninguna pieza tiene pasiva', muestra.every(p => p.pasiva === undefined));

/* ================= 4. RAREZA PONDERADA Y SUERTE ================= */
sec('Distribución de rarezas');
const cuenta = {1:0,2:0,3:0,4:0,5:0,6:0};
const rngD = rngT(12345);
for (let i = 0; i < 20000; i++) cuenta[LOOT.sortearRareza(rngD, 1)]++;
t('las comunes dominan', cuenta[1] / 20000 > 0.40, (cuenta[1]/200).toFixed(1) + '%');
t('las divinas son muy raras', cuenta[6] / 20000 < 0.02, (cuenta[6]/200).toFixed(2) + '%');
t('todas las rarezas aparecen', Object.values(cuenta).every(v => v > 0), JSON.stringify(cuenta));
let ordenOk = true;
for (let n = 2; n <= 6; n++) if (cuenta[n] > cuenta[n-1]) ordenOk = false;
t('cuanto más rara, menos frecuente', ordenOk, JSON.stringify(cuenta));

sec('La suerte mejora las rarezas (15.08 sin tabla propia de jefe)');
const cuentaSuerte = {1:0,2:0,3:0,4:0,5:0,6:0};
const rngS = rngT(12345);
for (let i = 0; i < 20000; i++) cuentaSuerte[LOOT.sortearRareza(rngS, 1.9)]++;
t('con suerte caen más épicas o mejores',
  (cuentaSuerte[4]+cuentaSuerte[5]+cuentaSuerte[6]) > (cuenta[4]+cuenta[5]+cuenta[6]) * 2,
  `${cuenta[4]+cuenta[5]+cuenta[6]} → ${cuentaSuerte[4]+cuentaSuerte[5]+cuentaSuerte[6]}`);
t('pero las comunes siguen existiendo', cuentaSuerte[1] > 0);

/* ================= 5. BOTÍN DE COMBATE ================= */
sec('Botín según el tipo de rival');
const rngB = rngT(55);
const contar = (tipo, n = 400) => {
  let piezas = 0, mat = 0;
  const r = rngT(99);
  for (let i = 0; i < n; i++) {
    const b = LOOT.botinDeCombate({ tipo, nivel: 20 }, { gano: true, rng: r });
    piezas += b.piezas.length; mat += b.material;
  }
  return { piezas: piezas / n, mat: mat / n };
};
const cNorm = contar('normal'), cJefe = contar('jefe'), cCamp = contar('campeon');
t('el jefe suelta más que el normal', cJefe.piezas > cNorm.piezas, `${cNorm.piezas.toFixed(2)} vs ${cJefe.piezas.toFixed(2)}`);
t('el campeón suelta más que el jefe', cCamp.piezas > cJefe.piezas, cCamp.piezas.toFixed(2));
t('el campeón da más material', cCamp.mat > cJefe.mat && cJefe.mat > cNorm.mat);
t('el rival normal a veces no suelta nada', cNorm.piezas < 0.9, cNorm.piezas.toFixed(2));

const perdido = LOOT.botinDeCombate({ tipo: 'campeon', nivel: 20 }, { gano: false, rng: rngB });
t('perder no da botín', perdido.piezas.length === 0 && perdido.material === 0);

/* ================= 6. INVENTARIO (16.09) ================= */
sec('Recoger y capacidad');
reset();
t('empieza vacío', INV.inventario().length === 0);
t('100 espacios libres (16.09)', INV.libres() === EQUIPO.INVENTARIO_MAX, INV.libres());
const pr = LOOT.generarPieza({ nivel: 10, rareza: 3, rng: rngT(1) });
const rec = INV.recoger(pr);
t('la pieza entra', rec.entro === true && INV.inventario().length === 1);
t('cuenta en las estadísticas', st().carrera.objetosObtenidos === 1);
t('se puede buscar por id', INV.buscar(pr.id)?.id === pr.id);

reset();
for (let i = 0; i < EQUIPO.INVENTARIO_MAX; i++) {
  INV.recoger(LOOT.generarPieza({ nivel: 5, rareza: 1, rng: rngT(i) }));
}
t('se llena exactamente a 100', INV.inventario().length === 100 && INV.lleno());
const rechazada = INV.recoger(LOOT.generarPieza({ nivel: 5, rareza: 1, rng: rngT(999) }));
t('la 101 se rechaza', rechazada.entro === false && rechazada.motivo === 'lleno');
t('no se pasó de 100', INV.inventario().length === 100);

/* ================= 7. VENTA (16.03, 16.04) ================= */
sec('Venta al 25% (16.04)');
reset();
const pv = LOOT.generarPieza({ nivel: 20, rareza: 4, rng: rngT(7) });
INV.recoger(pv);
const oroAntes = st().monedas.oro;
const matAntes = INV.material();
const obtenido = INV.vender(pv);
t('paga el 25% del valor', obtenido === Math.max(1, Math.round(pv.valor * ECO.VENTA_PCT)),
  `${obtenido} vs ${Math.round(pv.valor * 0.25)}`);
t('el oro llegó al estado', st().monedas.oro === oroAntes + obtenido);
t('la pieza salió del inventario', INV.buscar(pv.id) === null);
t('vender da material (16.01)', INV.material() > matAntes, INV.material() - matAntes);
t('cuenta como objeto vendido', st().carrera.objetosVendidos === 1);

sec('Venta masiva de basura (Sugerencia #5)');
reset();
for (let i = 0; i < 10; i++) INV.recoger(LOOT.generarPieza({ nivel: 10, rareza: 1, rng: rngT(i) }));
for (let i = 0; i < 5; i++)  INV.recoger(LOOT.generarPieza({ nivel: 10, rareza: 5, rng: rngT(i + 50) }));
const vb = INV.venderBasura(2);
t('vendió las 10 comunes', vb.cantidad === 10, vb.cantidad);
t('conservó las 5 míticas', INV.inventario().length === 5);
t('cobró por ellas', vb.oro > 0);

/* ================= 8. CANDADO (Sugerencia #2) ================= */
sec('El candado protege de la auto-venta');
reset();
st().equipo.autoVenta.r1 = true;
const pAuto = LOOT.generarPieza({ nivel: 10, rareza: 1, rng: rngT(2) });
const rAuto = INV.recoger(pAuto);
t('la común se auto-vende (16.05)', rAuto.vendida === true && rAuto.entro === false);
t('el inventario sigue vacío', INV.inventario().length === 0);
t('pero cobras el oro', rAuto.oro > 0);

const pBloq = LOOT.generarPieza({ nivel: 10, rareza: 1, rng: rngT(3) });
pBloq.bloqueado = true;
const rBloq = INV.recoger(pBloq);
t('la bloqueada NO se auto-vende', rBloq.entro === true && rBloq.vendida === false);
t('y entra al inventario', INV.inventario().length === 1);

reset();
const pTog = LOOT.generarPieza({ nivel: 10, rareza: 2, rng: rngT(4) });
INV.recoger(pTog);
t('alternar activa el candado', INV.alternarBloqueo(pTog.id) === true);
t('alternar otra vez lo quita', INV.alternarBloqueo(pTog.id) === false);
INV.alternarBloqueo(pTog.id);
const vbBloq = INV.venderBasura(2);
t('venderBasura respeta el candado', vbBloq.cantidad === 0 && INV.inventario().length === 1);

sec('La auto-venta solo afecta a las rarezas marcadas');
reset();
st().equipo.autoVenta.r1 = true;
INV.recoger(LOOT.generarPieza({ nivel: 10, rareza: 1, rng: rngT(11) }));
INV.recoger(LOOT.generarPieza({ nivel: 10, rareza: 3, rng: rngT(12) }));
t('la común se fue, la épica se queda', INV.inventario().length === 1 && INV.inventario()[0].rareza === 3);

/* ================= 9. EQUIPAR (15.10, 16.15) ================= */
sec('Equipar y requisitos mixtos');
reset(30);
const pe = LOOT.generarPieza({ nivel: 5, rareza: 2, rng: rngT(31) });
pe.requisitos = { nivel: 1 };
INV.recoger(pe);
const eq = INV.equipar(pe.id);
t('se equipa', eq.ok === true);
t('ocupa su slot', st().equipo.slots[pe.slot]?.id === pe.id);
t('sale del inventario', INV.buscar(pe.id) === null);

const imposible = LOOT.generarPieza({ nivel: 50, rareza: 4, rng: rngT(32) });
imposible.requisitos = { nivel: 999 };
INV.recoger(imposible);
const eqNo = INV.equipar(imposible.id);
t('no se equipa sin requisitos', eqNo.ok === false && eqNo.motivo === 'requisitos');
t('dice qué falta', Array.isArray(eqNo.faltan) && eqNo.faltan.length > 0, JSON.stringify(eqNo.faltan));
t('sigue en el inventario', INV.buscar(imposible.id) !== null);

sec('Requisitos de clase (15.10)');
const pClase = { requisitos: { clase: 'volador' }, stats: {} };
t('otra clase no puede', requisitosCumplidos(pClase, { nivel: 99, stats: {}, clase: 'rudo' }).ok === false);
t('la clase correcta sí', requisitosCumplidos(pClase, { nivel: 99, stats: {}, clase: 'volador' }).ok === true);
const pStat = { requisitos: { stat: { clave: 'potencia', valor: 50 } }, stats: {} };
t('sin la stat no puede', requisitosCumplidos(pStat, { nivel:99, stats:{potencia:20}, clase:'rudo' }).ok === false);
t('con la stat sí', requisitosCumplidos(pStat, { nivel:99, stats:{potencia:60}, clase:'rudo' }).ok === true);

sec('Intercambio de piezas en el mismo slot');
reset(30);
const a = LOOT.generarPieza({ nivel: 10, rareza: 2, slot: 'guantes', rng: rngT(41) });
const b = LOOT.generarPieza({ nivel: 10, rareza: 4, slot: 'guantes', rng: rngT(42) });
a.requisitos = { nivel: 1 }; b.requisitos = { nivel: 1 };
INV.recoger(a); INV.recoger(b);
INV.equipar(a.id);
const swap = INV.equipar(b.id);
t('la nueva se pone', st().equipo.slots.guantes.id === b.id);
t('la vieja vuelve al inventario', INV.buscar(a.id) !== null);
t('informa de la anterior', swap.anterior?.id === a.id);
t('no se duplica nada', INV.inventario().length === 1);

sec('Quitar es gratis (16.15)');
reset(30);
const pq = LOOT.generarPieza({ nivel: 10, rareza: 2, slot: 'botas', rng: rngT(51) });
pq.requisitos = { nivel: 1 };
INV.recoger(pq); INV.equipar(pq.id);
const oroAntesQ = st().monedas.oro;
const q = INV.quitar('botas');
t('se quita bien', q.ok === true && st().equipo.slots.botas === null);
t('vuelve al inventario', INV.buscar(pq.id) !== null);
t('no cuesta nada', st().monedas.oro === oroAntesQ);

/* ================= 10. PODER Y DELTA (16.12) ================= */
sec('El equipo aumenta el Poder de verdad');
reset(30);
const pPot = LOOT.generarPieza({ nivel: 40, rareza: 6, slot: 'guantes', exotico: false, rng: rngT(61) });
pPot.requisitos = { nivel: 1 };
INV.recoger(pPot);
const poderSin = INV.poderActual();
const poderCon = INV.poderConPieza(pPot);
t('previsualiza más poder', poderCon > poderSin, `${poderSin} → ${poderCon}`);
INV.equipar(pPot.id);
t('al equiparla el poder real sube', INV.poderActual() === poderCon, `${INV.poderActual()} vs ${poderCon}`);
t('el héroe de combate lo refleja', heroeDesdeEstado().poder === poderCon);

sec('Delta simple (16.12)');
reset(30);
const v1 = LOOT.generarPieza({ nivel: 10, rareza: 2, slot: 'capa', exotico: false, rng: rngT(71) });
const v2 = LOOT.generarPieza({ nivel: 40, rareza: 5, slot: 'capa', exotico: false, rng: rngT(72) });
v1.requisitos = { nivel: 1 }; v2.requisitos = { nivel: 1 };
INV.recoger(v1); INV.equipar(v1.id);
INV.recoger(v2);
const d = INV.delta(v2);
t('detecta la pieza equipada', d.actual?.id === v1.id);
t('la mejor da delta positivo', d.poderDelta > 0, d.poderDelta);
t('informa el cambio de puntos', d.puntosDelta > 0, d.puntosDelta);
t('lista los cambios por stat', Object.keys(d.cambios).length > 0);

/* ================= 11. EQUIPAR LO MEJOR (16.11) ================= */
sec('Equipar lo mejor automáticamente');
reset(40);
for (let i = 0; i < 30; i++) {
  const p = LOOT.generarPieza({ nivel: 20, rng: rngT(i + 200) });
  p.requisitos = { nivel: 1 };
  INV.recoger(p);
}
const poder0 = INV.poderActual();
const auto = INV.equiparMejor();
t('equipó varias piezas', auto.cambios >= 4, auto.cambios);
t('el poder subió mucho', INV.poderActual() > poder0, `${poder0} → ${INV.poderActual()}`);
const auto2 = INV.equiparMejor();
t('repetir no cambia nada (ya es óptimo)', auto2.cambios === 0, auto2.cambios);
t('ningún slot quedó duplicado',
  CLAVES_SLOTS.every(s => !st().equipo.slots[s] || st().equipo.slots[s].slot === s));

sec('Equipar lo mejor por stat objetivo');
reset(40);
for (let i = 0; i < 40; i++) {
  const p = LOOT.generarPieza({ nivel: 20, rng: rngT(i + 400) });
  p.requisitos = { nivel: 1 };
  INV.recoger(p);
}
INV.equiparMejor('potencia');
const potEquipada = Object.values(st().equipo.slots)
  .reduce((a, p) => a + (p?.stats?.potencia || 0), 0);
reset(40);
for (let i = 0; i < 40; i++) {
  const p = LOOT.generarPieza({ nivel: 20, rng: rngT(i + 400) });
  p.requisitos = { nivel: 1 };
  INV.recoger(p);
}
INV.equiparMejor('defensa');
const potConDefensa = Object.values(st().equipo.slots)
  .reduce((a, p) => a + (p?.stats?.potencia || 0), 0);
t('optimizar Potencia da más Potencia que optimizar Defensa',
  potEquipada >= potConDefensa, `${potEquipada} vs ${potConDefensa}`);

sec('No equipa lo que no puede (16.11 + 15.10)');
reset(5);
const alta = LOOT.generarPieza({ nivel: 90, rareza: 6, slot: 'amuleto', rng: rngT(81) });
alta.requisitos = { nivel: 900 };
INV.recoger(alta);
INV.equiparMejor();
t('la pieza inaccesible no se equipa', st().equipo.slots.amuleto === null);

sec('Indicador de mejora disponible (Sugerencia #1)');
reset(30);
t('sin nada no hay mejoras', INV.mejorasDisponibles().length === 0);
const buena = LOOT.generarPieza({ nivel: 40, rareza: 5, slot: 'cinturon', exotico: false, rng: rngT(91) });
buena.requisitos = { nivel: 1 };
INV.recoger(buena);
t('detecta el slot con mejora', INV.mejorasDisponibles().includes('cinturon'));
INV.equipar(buena.id);
t('tras equiparla ya no avisa', !INV.mejorasDisponibles().includes('cinturon'));

/* ================= 12. ORDENACIÓN (16.10) ================= */
sec('Ordenación del inventario');
reset();
for (let i = 0; i < 25; i++) INV.recoger(LOOT.generarPieza({ nivel: 5 + i, rng: rngT(i + 300) }));
INV.ordenar('rareza');
let ordRareza = true;
const inv = INV.inventario();
for (let i = 1; i < inv.length; i++) if (inv[i].rareza > inv[i-1].rareza) ordRareza = false;
t('ordena por rareza descendente', ordRareza);
INV.ordenar('nivel');
let ordNivel = true;
for (let i = 1; i < inv.length; i++) if (inv[i].nivel > inv[i-1].nivel) ordNivel = false;
t('ordena por nivel descendente', ordNivel);
INV.ordenar('valor');
let ordValor = true;
for (let i = 1; i < inv.length; i++) if ((inv[i].valor||0) > (inv[i-1].valor||0)) ordValor = false;
t('ordena por valor descendente', ordValor);
t('ordenar no pierde piezas', INV.inventario().length === 25);
t('hay 5 criterios de orden', Object.keys(INV.ORDENES).length === 5);

/* ================= 13. FORJA (16.01, 16.02) ================= */
sec('Mejora con oro + material (16.01)');
reset(30, 1000000);
st().equipo.material = 1000;
const pf = LOOT.generarPieza({ nivel: 20, rareza: 3, exotico: false, rng: rngT(101) });
pf.estrellas = 0;
INV.recoger(pf);
const statsAntes = { ...pf.stats };
const oroA = st().monedas.oro, matA = INV.material();
const mej = FORJA.mejorar(pf.id);
t('la mejora funciona', mej.ok === true, mej.motivo);
t('sube una estrella', pf.estrellas === 1);
t('cuesta oro', st().monedas.oro < oroA, `${oroA} → ${st().monedas.oro}`);
t('cuesta material', INV.material() < matA, `${matA} → ${INV.material()}`);
t('las stats suben', Object.keys(statsAntes).every(k => pf.stats[k] > statsAntes[k]),
  JSON.stringify(pf.stats));
t('el valor sube', pf.valor > valorDePieza({ ...pf, estrellas: 0 }));

sec('Sin tope de mejora (16.02)');
reset(30, 10 ** 12);
st().equipo.material = 100000;
const pInf = LOOT.generarPieza({ nivel: 20, rareza: 1, exotico: false, rng: rngT(111) });
pInf.estrellas = 0;
INV.recoger(pInf);
const mv = FORJA.mejorarVarias(pInf.id, 15, 15);
t('se puede mejorar muchas veces', mv.hechas === 15, mv.hechas);
t('la pieza acumula estrellas', pInf.estrellas === 15, pInf.estrellas);
t('ni una rareza común tiene tope duro', pInf.estrellas > getRareza(1).estrellasMax);

sec('El coste crece con cada estrella');
const c0 = costeMejora({ nivel: 20, rareza: 3, estrellas: 0 });
const c5 = costeMejora({ nivel: 20, rareza: 3, estrellas: 5 });
t('el oro crece', c5.oro > c0.oro * 5, `${c0.oro} → ${c5.oro}`);
t('el material crece', c5.material > c0.material, `${c0.material} → ${c5.material}`);
const cRaro = costeMejora({ nivel: 20, rareza: 6, estrellas: 0 });
t('mejorar una divina cuesta más que una común',
  cRaro.oro > costeMejora({ nivel: 20, rareza: 1, estrellas: 0 }).oro);

sec('No se mejora sin recursos');
reset(30, 0);
st().equipo.material = 0;
const pPobre = LOOT.generarPieza({ nivel: 20, rareza: 3, rng: rngT(121) });
INV.recoger(pPobre);
const mFail = FORJA.mejorar(pPobre.id);
t('falla sin oro ni material', mFail.ok === false);
t('indica el motivo', ['oro','material','oro-y-material'].includes(mFail.motivo), mFail.motivo);
t('no subió la estrella', pPobre.estrellas === 0);
reset(30, 10 ** 9);
st().equipo.material = 0;
const pSoloOro = LOOT.generarPieza({ nivel: 20, rareza: 3, rng: rngT(122) });
INV.recoger(pSoloOro);
const mSolo = FORJA.mejorar(pSoloOro.id);
t('con oro pero sin material tampoco', mSolo.ok === false && mSolo.motivo === 'material', mSolo.motivo);
t('y NO gastó el oro', st().monedas.oro === 10 ** 9, st().monedas.oro);

sec('Se puede mejorar lo que llevas puesto');
reset(30, 10 ** 9);
st().equipo.material = 500;
const pEq = LOOT.generarPieza({ nivel: 20, rareza: 3, slot: 'protector', exotico: false, rng: rngT(131) });
pEq.requisitos = { nivel: 1 };
INV.recoger(pEq); INV.equipar(pEq.id);
const poderPre = INV.poderActual();
const mEq = FORJA.mejorar(pEq.id);
t('mejora la pieza equipada', mEq.ok === true);
t('localiza que está equipada', FORJA.localizar(pEq.id).donde === 'equipado');
t('el poder del héroe sube al instante', INV.poderActual() > poderPre,
  `${poderPre} → ${INV.poderActual()}`);

sec('La mejora conserva el trade-off de los exóticos');
reset(30, 10 ** 9);
st().equipo.material = 500;
let pExo = null;
for (let i = 0; i < 60 && !pExo; i++) {
  const c = LOOT.generarPieza({ nivel: 30, rareza: 5, exotico: true, rng: rngT(i + 700) });
  const dd = EXOTICOS[c.exotico];
  if ((c.stats[dd.baja] || 0) < 0) pExo = c;
}
if (pExo) {
  const dd = EXOTICOS[pExo.exotico];
  const negAntes = pExo.stats[dd.baja];
  INV.recoger(pExo);
  FORJA.mejorar(pExo.id);
  t('la penalización sigue siendo negativa', pExo.stats[dd.baja] < 0, pExo.stats[dd.baja]);
  t('y crece en magnitud con la mejora', pExo.stats[dd.baja] <= negAntes,
    `${negAntes} → ${pExo.stats[dd.baja]}`);
} else {
  t('se encontró un exótico con penalización negativa', false, 'ninguno en 60 intentos');
}

sec('Previsualización de la forja');
reset(30, 10 ** 9);
st().equipo.material = 500;
const pPrev = LOOT.generarPieza({ nivel: 20, rareza: 4, exotico: false, rng: rngT(141) });
INV.recoger(pPrev);
const prev = FORJA.previsualizar(pPrev);
t('la previsualización promete más', Object.keys(pPrev.stats).every(k => prev.stats[k] >= pPrev.stats[k]));
FORJA.mejorar(pPrev.id);
t('y acierta exactamente', JSON.stringify(pPrev.stats) === JSON.stringify(prev.stats),
  `${JSON.stringify(prev.stats)} vs ${JSON.stringify(pPrev.stats)}`);

/* ================= 14. AVISO DE INVENTARIO (Sugerencia #5) ================= */
sec('Aviso de inventario lleno');
reset();
t('vacío no avisa', INV.avisoInventario() === null);
for (let i = 0; i < 96; i++) INV.recoger(LOOT.generarPieza({ nivel: 10, rareza: 1, rng: rngT(i + 800) }));
const av = INV.avisoInventario();
t('a 96/100 avisa', av !== null, INV.inventario().length);
t('cuenta la basura vendible', av.basura > 0, av.basura);
t('el texto es informativo', av.texto.includes('96'), av.texto);

/* ================= 15. INTEGRACIÓN CON EL COMBATE ================= */
sec('bonosDeEquipo alimenta al luchador');
reset(30);
const sinEquipo = heroeDesdeEstado();
const pBig = LOOT.generarPieza({ nivel: 60, rareza: 6, slot: 'guantes', exotico: false, rng: rngT(151) });
pBig.requisitos = { nivel: 1 };
INV.recoger(pBig); INV.equipar(pBig.id);
const conEquipo = heroeDesdeEstado();
t('el poder del luchador sube', conEquipo.poder > sinEquipo.poder,
  `${sinEquipo.poder} → ${conEquipo.poder}`);
t('las derivadas cambian', JSON.stringify(conEquipo.der) !== JSON.stringify(sinEquipo.der));

sec('Ciclo completo: 60 luchas con botín');
reset(20, 0);
st().equipo.material = 0;
const rngCiclo = rngT(2024);
for (let i = 0; i < 60; i++) {
  const tipo = i % 10 === 9 ? 'jefe' : 'normal';
  const b = LOOT.botinDeCombate({ tipo, nivel: 20 }, { gano: true, clase: 'rudo', rng: rngCiclo });
  for (const p of b.piezas) INV.recoger(p);
  INV.darMaterial(b.material);
}
t('consiguió piezas', INV.inventario().length > 10, INV.inventario().length);
t('nunca superó los 100', INV.inventario().length <= 100);
t('acumuló material', INV.material() > 0, INV.material());
const poderAntesEq = INV.poderActual();
INV.equiparMejor();
t('equiparse sube el poder', INV.poderActual() > poderAntesEq,
  `${poderAntesEq} → ${INV.poderActual()}`);
t('todas las piezas equipadas cumplen requisitos',
  Object.values(st().equipo.slots).every(p => !p || INV.puedeEquipar(p).ok));
t('las stats del inventario son coherentes',
  INV.inventario().every(p => Object.keys(p.stats).every(k => CLAVES_STATS.includes(k))));

/* ================= RESUMEN ================= */
console.log(`\n${'='.repeat(46)}`);
console.log(`✅ ${ok} correctas · ❌ ${fail} fallidas`);
if (fail === 0) console.log('🎉 TODAS LAS PRUEBAS DEL PASO 9 PASARON');
process.exit(fail ? 1 : 0);
