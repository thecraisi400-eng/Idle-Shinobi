/* PRUEBAS DEL PASO 8 — XP, niveles, rangos, rasgos y mejoras con oro */
globalThis.location = { hostname: 'localhost', hash: '' };

let ok = 0, fail = 0;
const t = (nombre, cond, extra = '') => {
  if (cond) { ok++; }
  else { fail++; console.log(`  ❌ ${nombre} ${extra}`); }
};
const sec = n => console.log(`\n— ${n}`);

const ST = await import('../js/core/state.js');   // namespace: S es un binding vivo
const { iniciarEstado, crearPartidaNueva, topeStat, costeStat, ganarOro, xpNecesaria, ganarXP } = ST;
const { PROG, ECO } = await import('../js/data/constants.js');
const { CLAVES_STATS } = await import('../js/data/stats.js');
const { RANGOS, rangoPorPoder, progresoRango, rasgosDisponibles, aplicarRasgosHeroe, RASGOS_HEROE, NIVELES_RASGO } =
  await import('../js/data/rangos.js');
const { xpDelRival, oroDelCombate, bonusCarisma, recompensar, avanzarProgreso, actualizarRango, topeEnNivel } =
  await import('../js/systems/xp.js');
const up = await import('../js/systems/upgrades.js');
const { heroeDesdeEstado } = await import('../js/systems/fighter.js');
const { poder } = await import('../js/systems/power.js');

function reset(nivel = 1, oro = 1000) {
  iniciarEstado(crearPartidaNueva(12345));
  const S = ST.S;
  S.perfil.clase = 'rudo';
  S.perfil.subclase = null;
  S.perfil.nivel = nivel;
  S.monedas.oro = oro;
  return S;
}
/** Acceso siempre fresco al estado vivo. */
const st = () => ST.S;

/* ================= 1. CURVA DE XP ================= */
sec('Curva de XP (04.01 creciente, 01.08 sin tope)');
reset();
let prev = 0, creciente = true;
for (let n = 1; n <= 60; n++) {
  const x = xpNecesaria(n);
  if (x <= prev) creciente = false;
  prev = x;
}
t('la XP necesaria siempre crece', creciente);
t('nivel 1 barato', xpNecesaria(1) === PROG.XP_BASE, xpNecesaria(1));
t('nivel 10 mucho mayor que el 1', xpNecesaria(10) > xpNecesaria(1) * 20, xpNecesaria(10));
t('no existe nivel máximo', xpNecesaria(500) > 0 && Number.isFinite(xpNecesaria(500)));

sec('Subida de nivel entrega puntos');
reset();
const nAntes = st().perfil.nivel, pAntes = st().perfil.puntosLibres;
ganarXP(xpNecesaria(1) + 5);
t('subió un nivel', st().perfil.nivel === nAntes + 1, st().perfil.nivel);
t('dio los puntos libres', st().perfil.puntosLibres === pAntes + PROG.PUNTOS_POR_NIVEL, st().perfil.puntosLibres);
t('dio punto de árbol', st().perfil.puntosArbol === 1);
t('conservó el excedente de XP', st().perfil.xp === 5, st().perfil.xp);

reset();
ganarXP(1e6);
t('multinivel de golpe funciona', st().perfil.nivel > 5, st().perfil.nivel);
t('puntos coherentes con niveles', st().perfil.puntosLibres === (st().perfil.nivel - 1) * PROG.PUNTOS_POR_NIVEL);

/* ================= 2. TOPES POR NIVEL (13.04) ================= */
sec('Tope de estadísticas por nivel');
reset(1);
t('tope base al nivel 1', topeStat() === PROG.TOPE_STAT_BASE, topeStat());
reset(10);
t('tope sube con el nivel', topeStat() === PROG.TOPE_STAT_BASE + PROG.TOPE_STAT_POR_NIVEL * 9, topeStat());
t('topeEnNivel coincide', topeEnNivel(10) === topeStat());
t('el tope siempre supera al máximo inicial', topeEnNivel(1) > PROG.STAT_MAX_INICIAL);

/* ================= 3. COSTE CRECIENTE (13.02) ================= */
sec('Coste creciente por estadística');
reset(30, 10 ** 9);
const c0 = costeStat('potencia');
up.comprarStat('potencia', 1);
const c1 = costeStat('potencia');
t('la 2ª compra cuesta más', c1 > c0, `${c0} → ${c1}`);
t('cada compra sube +1 (13.03)',
  st().stats.potencia === crearPartidaNueva(12345).stats.potencia + PROG.SUBIDA_POR_PUNTO,
  st().stats.potencia);

reset(30, 10 ** 9);
const base = st().stats.tecnica;
up.comprarStat('tecnica', 10);
t('comprar x10 sube exactamente 10', st().stats.tecnica === base + 10, st().stats.tecnica);
t('registró las 10 compras', st().compras.tecnica === 10);

reset(30, 10 ** 9);
const dv = up.costeDeVarias('agilidad', 5);
const oroAntes = st().monedas.oro;
const r5 = up.comprarStat('agilidad', 5);
t('costeDeVarias predice el gasto real', dv.total === r5.gastado, `${dv.total} vs ${r5.gastado}`);
t('el oro bajó exactamente eso', oroAntes - st().monedas.oro === r5.gastado);

sec('Escalado exponencial suave (07.12)');
reset(60, 10 ** 12);
const cA = up.costeCompraN('potencia', 0);
const cB = up.costeCompraN('potencia', 50);
const ratio = cB / cA;
t('50 compras encarecen mucho pero no infinito', ratio > 100 && ratio < 1000, ratio.toFixed(1));

/* ================= 4. TOPE RESPETADO ================= */
sec('El tope no se puede pasar ni con oro infinito');
reset(1, 10 ** 12);
const rTope = up.comprarStat('vida', 999);
t('se detiene en el tope', st().stats.vida === topeStat(), `${st().stats.vida} / ${topeStat()}`);
t('no gastó de más', rTope.compradas === topeStat() - crearPartidaNueva(12345).stats.vida);
const rNada = up.comprarStat('vida', 5);
t('en el tope devuelve motivo tope', rNada.ok === false && rNada.motivo === 'tope', rNada.motivo);

sec('Sin oro no se compra');
reset(30, 0);
const rPobre = up.comprarStat('potencia', 1);
t('rechaza por falta de oro', rPobre.ok === false && rPobre.motivo === 'sin-oro', rPobre.motivo);
t('no cambió la stat', st().compras.potencia === 0);

sec('cuantasPuedoPagar y costeHastaTope');
reset(30, 500);
const cp = up.cuantasPuedoPagar('presencia');
t('lo que puedo pagar es asequible', cp.coste <= 500, cp.coste);
const unaMas = cp.coste + up.costeCompraN('presencia', cp.cantidad);
t('una más ya no cabría', unaMas > 500 || st().stats.presencia + cp.cantidad >= topeStat());
const real = up.comprarStat('presencia', cp.cantidad);
t('coincide con la compra real', real.compradas === cp.cantidad, `${real.compradas} vs ${cp.cantidad}`);

reset(5, 10 ** 9);
const ht = up.costeHastaTope('defensa');
t('el coste al tope cubre justo el margen', ht.cantidad === topeStat() - st().stats.defensa, ht.cantidad);
up.comprarStat('defensa', ht.cantidad);
t('tras pagarlo queda en el tope', st().stats.defensa === topeStat());

/* ================= 5. CONFIRMACIÓN (Sugerencia #1) ================= */
sec('Confirmación solo para compras grandes');
reset(30, 1000);
t('compra pequeña no confirma', up.requiereConfirmar(100) === false);
t('compra del 30% sí confirma', up.requiereConfirmar(300) === true);
t('el umbral es el 25%', up.UMBRAL_CONFIRMAR === 0.25);

/* ================= 6. MEJORAR TODO EQUILIBRADO (13.10) ================= */
sec('Mejorar todo equilibrado');
reset(40, 20000);
const antesArr = CLAVES_STATS.map(k => st().stats[k]);
const mt = up.mejorarTodoEquilibrado();
t('gastó oro', mt.gastado > 0, mt.gastado);
t('hizo varias mejoras', mt.pasos > 5, mt.pasos);
t('no se pasó del presupuesto', mt.gastado <= 20000, mt.gastado);
t('tocó varias estadísticas', Object.keys(mt.detalle).length >= 5, Object.keys(mt.detalle).length);
const desviaAntes = desviacion(antesArr);
const desviaDespues = desviacion(CLAVES_STATS.map(k => st().stats[k]));
t('el build queda MÁS parejo que antes', desviaDespues <= desviaAntes + 0.01,
  `${desviaAntes.toFixed(2)} → ${desviaDespues.toFixed(2)}`);
t('ninguna stat pasó del tope', CLAVES_STATS.every(k => st().stats[k] <= topeStat()));

reset(40, 300);
const mtPobre = up.mejorarTodoEquilibrado();
t('con poco oro hace poco', mtPobre.gastado <= 300, mtPobre.gastado);

function desviacion(arr) {
  const m = arr.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length);
}

/* ================= 7. EFECTO EN DPS (13.05) ================= */
sec('Previsualización del efecto (13.05)');
reset(30, 10 ** 6);
const efPot = up.efectoDe('potencia', 1);
t('subir potencia sube el DPS', efPot.dpsDelta > 0, efPot.dpsDelta.toFixed(3));
t('subir potencia sube el poder', efPot.poderDelta > 0, efPot.poderDelta);
const efCar = up.efectoDe('carisma', 1);
t('el carisma no aporta DPS', Math.abs(efCar.dpsDelta) < 0.001, efCar.dpsDelta);
t('pero sí algo de poder', efCar.poderDelta >= 0);
const ef10 = up.efectoDe('potencia', 10);
t('10 puntos rinden más que 1', ef10.dpsDelta > efPot.dpsDelta * 5, ef10.dpsDelta.toFixed(2));
t('efectoDe no muta el estado', st().stats.potencia === crearPartidaNueva(12345).stats.potencia);

/* ================= 8. RANGOS (14.01) ================= */
sec('Los 5 rangos D→S');
t('hay exactamente 5 rangos', RANGOS.length === 5, RANGOS.length);
t('los ids son D C B A S', RANGOS.map(r => r.id).join('') === 'DCBAS');
let umbralesCrecen = true;
for (let i = 1; i < RANGOS.length; i++) if (RANGOS[i].desde <= RANGOS[i - 1].desde) umbralesCrecen = false;
t('los umbrales crecen', umbralesCrecen);
t('poder 0 → rango D', rangoPorPoder(0).id === 'D');
t('poder enorme → rango S', rangoPorPoder(10 ** 6).id === 'S');
t('justo en el umbral entra al rango', rangoPorPoder(RANGOS[2].desde).id === 'B');
t('un punto antes NO entra', rangoPorPoder(RANGOS[2].desde - 1).id === 'C');

sec('Progreso hacia el siguiente rango');
const pr = progresoRango((RANGOS[0].desde + RANGOS[1].desde) / 2);
t('el porcentaje es intermedio', pr.pct > 40 && pr.pct < 60, pr.pct.toFixed(1));
t('indica el siguiente rango', pr.siguiente.id === 'C');
t('indica cuánto falta', pr.falta > 0);
const prMax = progresoRango(10 ** 7);
t('en rango S no hay siguiente', prMax.siguiente === null && prMax.pct === 100);

sec('El rango se guarda en el perfil');
reset(1);
st().monedas.oro = 0;
actualizarRango(50);
t('empieza en D', st().perfil.rango === 'D', st().perfil.rango);
actualizarRango(RANGOS[4].desde + 10);
t('sube a S', st().perfil.rango === 'S', st().perfil.rango);

/* ================= 9. RASGOS DEL HÉROE (14.10) ================= */
sec('Mesa de rasgos');
t('tres niveles de rasgo', NIVELES_RASGO.length === 3);
for (const n of NIVELES_RASGO) {
  t(`el nivel ${n} ofrece 3 opciones`,
    Object.values(RASGOS_HEROE).filter(r => r.nivel === n).length === 3);
}
t('nivel 4 no ofrece nada', rasgosDisponibles(4, []).length === 0);
t('nivel 5 ofrece una elección', rasgosDisponibles(5, []).length === 1);
t('nivel 30 con nada elegido ofrece tres', rasgosDisponibles(30, []).length === 3);
t('tras elegir uno de nivel 5 baja a dos', rasgosDisponibles(30, ['cabezaDura']).length === 2);
t('todo elegido → nada pendiente',
  rasgosDisponibles(30, ['cabezaDura', 'sangreFria', 'verdugo']).length === 0);

sec('Los rasgos modifican las stats');
const stBase = { potencia: 100, defensa: 100, aguante: 100, vida: 100, agilidad: 100,
                 tecnica: 100, precision: 100, recuperacion: 100, carisma: 100, presencia: 100 };
const conDuro = aplicarRasgosHeroe(stBase, ['cabezaDura']);
t('cabezaDura sube defensa', conDuro.defensa === 110, conDuro.defensa);
t('y no toca la potencia', conDuro.potencia === 100);
const conVerdugo = aplicarRasgosHeroe(stBase, ['verdugo']);
t('verdugo sube potencia', conVerdugo.potencia === 122, conVerdugo.potencia);
t('verdugo baja defensa (trade-off)', conVerdugo.defensa === 90, conVerdugo.defensa);
const dobles = aplicarRasgosHeroe(stBase, ['cabezaDura', 'verdugo']);
t('dos rasgos se combinan', dobles.defensa === Math.round(100 * 1.10 * 0.90), dobles.defensa);
t('sin rasgos no cambia nada', JSON.stringify(aplicarRasgosHeroe(stBase, [])) === JSON.stringify(stBase));
t('un rasgo inexistente se ignora', aplicarRasgosHeroe(stBase, ['noExiste']).potencia === 100);

sec('El héroe real usa sus rasgos');
reset(30, 0);
const sinRasgo = heroeDesdeEstado().poder;
st().perfil.rasgos = ['monstruoSagrado'];
const conRasgo = heroeDesdeEstado().poder;
t('el rasgo aumenta el poder del héroe', conRasgo > sinRasgo, `${sinRasgo} → ${conRasgo}`);

/* ================= 10. RECOMPENSAS (07.01, 07.04) ================= */
sec('Oro y XP del rival');
const rivalNormal = { nivel: 10, tipo: 'normal', oro: 200 };
const rivalJefe   = { nivel: 10, tipo: 'jefe',   oro: 440 };
const rivalCamp   = { nivel: 10, tipo: 'campeon', oro: 800 };
t('el jefe paga más que el normal', oroDelCombate(rivalJefe) > oroDelCombate(rivalNormal));
t('el campeón paga más que el jefe', oroDelCombate(rivalCamp) > oroDelCombate(rivalJefe));
t('perder paga el 25% (07.04)',
  oroDelCombate(rivalNormal, false) === Math.round(200 * ECO.ORO_DERROTA_PCT),
  oroDelCombate(rivalNormal, false));
t('el jefe da más XP', xpDelRival(rivalJefe) > xpDelRival(rivalNormal));
t('el campeón da la XP máxima', xpDelRival(rivalCamp) > xpDelRival(rivalJefe));
t('perder da menos XP pero nunca 0',
  xpDelRival(rivalNormal, false) > 0 && xpDelRival(rivalNormal, false) < xpDelRival(rivalNormal));
t('la XP escala con el nivel del rival',
  xpDelRival({ nivel: 40, tipo: 'normal' }) > xpDelRival({ nivel: 5, tipo: 'normal' }));

sec('Bonus de carisma');
t('sin carisma el multiplicador es 1', Math.abs(bonusCarisma({ stats: { carisma: 0, presencia: 0 } }) - 1) < 1e-9);
t('con carisma sube', bonusCarisma({ stats: { carisma: 50, presencia: 20 } }) > 1);
t('está topado al 35%', bonusCarisma({ stats: { carisma: 9999, presencia: 9999 } }) <= 1.35001);

sec('recompensar() entrega de verdad');
reset(30, 0);
st().perfil.rasgos = [];
const heroe = heroeDesdeEstado();
const res = { motivo: 'ko', rondas: 4, resumen: { duracionSeg: 40 } };
const oroAntes2 = st().monedas.oro, xpAntes2 = st().perfil.xp;
const botin = recompensar({ nivel: 10, tipo: 'normal', oro: 300 }, res, heroe, true);
t('el oro del estado subió', st().monedas.oro === oroAntes2 + botin.oro, `${st().monedas.oro} vs ${botin.oro}`);
t('el desglose informa el oro', botin.oro > 0);
t('la XP subió', st().perfil.xp !== xpAntes2 || st().perfil.nivel > 30);
t('cuenta la victoria', st().carrera.victorias === 1 && st().carrera.derrotas === 0);
t('cuenta la lucha', st().carrera.luchas === 1);
t('cuenta la racha', st().carrera.rachaActual === 1);
t('contabiliza el KO', st().carrera.kos === 1);
t('devuelve el rango', botin.rango && botin.rango.id);

sec('Perder también recompensa (poco)');
reset(30, 0);
const h2 = heroeDesdeEstado();
const bWin  = recompensar({ nivel: 10, tipo: 'normal', oro: 300 }, res, h2, true);
reset(30, 0);
const bLose = recompensar({ nivel: 10, tipo: 'normal', oro: 300 }, res, h2, false);
t('perder da menos oro que ganar', bLose.oro < bWin.oro, `${bLose.oro} < ${bWin.oro}`);
t('perder da algo de oro', bLose.oro > 0);
t('perder nunca da gemas', bLose.gemas === 0);
t('cuenta la derrota', st().carrera.derrotas === 1 && st().carrera.victorias === 0);
t('rompe la racha', st().carrera.rachaActual === 0);

sec('Las gemas son raras en rivales normales');
let conGemas = 0;
for (let i = 0; i < 300; i++) {
  reset(30, 0);
  const b = recompensar({ nivel: 10, tipo: 'normal', oro: 100 }, res, heroe, true);
  if (b.gemas > 0) conGemas++;
}
t('gotan en menos del 12% de las luchas normales', conGemas / 300 < 0.12, (conGemas / 300 * 100).toFixed(1) + '%');
reset(30, 0);
const bCamp = recompensar({ nivel: 10, tipo: 'campeon', oro: 800 }, res, heroe, true);
t('el campeón SIEMPRE da gemas', bCamp.gemas > 0, bCamp.gemas);
t('entre 1 y 5 gemas (08.05)', bCamp.gemas >= ECO.GEMA_DROP_MIN && bCamp.gemas <= ECO.GEMA_DROP_MAX);

sec('Subida de nivel dentro del botín');
reset(1, 0);
const h3 = heroeDesdeEstado();
const bUp = recompensar({ nivel: 30, tipo: 'campeon', oro: 500 }, res, h3, true);
t('detecta la subida de nivel', bUp.subioNivel === true);
t('informa los niveles ganados', bUp.nivelesGanados >= 1, bUp.nivelesGanados);
t('informa los puntos ganados',
  bUp.puntosGanados === bUp.nivelesGanados * PROG.PUNTOS_POR_NIVEL, bUp.puntosGanados);

/* ================= 11. AVANCE DE PROGRESO ================= */
sec('Avance de rival');
reset(10, 0);
st().progreso.rivalIndice = 4;
st().progreso.rivalActual = { nombre: 'X' };
const av = avanzarProgreso(true);
t('ganar avanza el índice', st().progreso.rivalIndice === 5, st().progreso.rivalIndice);
t('limpia el rival elegido', st().progreso.rivalActual === null);
t('limpia las cartas', st().progreso.cartasOfrecidas === null);
t('devuelve avanzo=true', av.avanzo === true);

reset(10, 0);
st().progreso.rivalIndice = 4;
st().progreso.rivalActual = { nombre: 'X' };
const av2 = avanzarProgreso(false);
t('perder NO avanza', st().progreso.rivalIndice === 4);
t('perder conserva el rival', st().progreso.rivalActual !== null);
t('devuelve avanzo=false', av2.avanzo === false);

/* ================= 12. AVISO DE BUILD MUERTA (Sug. #5) ================= */
sec('Aviso de build muerta');
reset(5, 10 ** 9);
t('a nivel bajo no molesta', up.avisoBuildMuerta() === null);
reset(30, 10 ** 9);
t('sin compras suficientes no avisa', up.avisoBuildMuerta() === null);
reset(30, 10 ** 9);
up.comprarStat('potencia', 20);
t('build 100% ofensiva dispara el aviso', up.avisoBuildMuerta() !== null);
reset(30, 10 ** 9);
up.comprarStat('potencia', 10);
up.comprarStat('vida', 10);
t('build equilibrada no avisa', up.avisoBuildMuerta() === null);

/* ================= 13. BUCLE COMPLETO ================= */
sec('Bucle completo: luchar → cobrar → mejorar → más poder');
reset(1, 0);
st().perfil.rasgos = [];
const poderInicial = heroeDesdeEstado().poder;
for (let i = 0; i < 25; i++) {
  const h = heroeDesdeEstado();
  recompensar({ nivel: 1 + i, tipo: i % 10 === 9 ? 'jefe' : 'normal', oro: 40 + i * 25 }, res, h, true);
  up.mejorarTodoEquilibrado(Math.floor(st().monedas.oro * 0.9));
}
const poderFinal = heroeDesdeEstado().poder;
t('25 luchas invirtiendo aumentan el poder', poderFinal > poderInicial * 1.5,
  `${poderInicial} → ${poderFinal}`);
t('el jugador subió de nivel', st().perfil.nivel > 1, st().perfil.nivel);
t('el rango mejoró', st().perfil.rango !== 'D', st().perfil.rango);
t('quedan puntos libres por gastar', st().perfil.puntosLibres > 0, st().perfil.puntosLibres);
t('el récord cuadra', st().carrera.victorias === 25 && st().carrera.luchas === 25);
t('ninguna stat superó su tope', CLAVES_STATS.every(k => st().stats[k] <= topeStat()));
t('el oro no quedó negativo', st().monedas.oro >= 0, st().monedas.oro);

sec('Sin invertir, el jugador se estanca');
reset(1, 0);
st().perfil.rasgos = [];
const pQuieto0 = heroeDesdeEstado().poder;
for (let i = 0; i < 25; i++) {
  recompensar({ nivel: 1 + i, tipo: 'normal', oro: 40 + i * 25 }, res, heroeDesdeEstado(), true);
}
const pQuieto1 = heroeDesdeEstado().poder;
t('sin gastar oro el poder NO cambia', pQuieto1 === pQuieto0, `${pQuieto0} → ${pQuieto1}`);
t('pero acumuló oro para gastar', st().monedas.oro > 1000, st().monedas.oro);

/* ================= RESUMEN ================= */
console.log(`\n${'='.repeat(46)}`);
console.log(`✅ ${ok} correctas · ❌ ${fail} fallidas`);
if (fail === 0) console.log('🎉 TODAS LAS PRUEBAS DEL PASO 8 PASARON');
process.exit(fail ? 1 : 0);
