/* PRUEBAS DEL PASO 10 — Árbol de habilidades */
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

const { PROG } = await import('../js/data/constants.js');
const PAS = await import('../js/data/pasivas.js');
const { RAMAS, CLAVES_RAMAS, PLANTILLAS, KEYSTONES, CLAVES_BONUS, plantillasDeRama } = PAS;
const ARB = await import('../js/data/arbol.js');
const { arbolCompleto, nodosDeTier, nodosDeRama, nodoPorId, construirNodo, keystoneDeTier,
        costeRango, costeKeystone, costeAcumulado, valorEnTier, nivelRequerido,
        TIERS_BASE, NODOS_POR_TIER } = ARB;
const AR = await import('../js/systems/skilltree.js');
const { heroeDesdeEstado, crearLuchador, pasivasVacias } = await import('../js/systems/fighter.js');
const { simularLucha, simularMasivo } = await import('../js/systems/combat/engine.js');
const { recompensar } = await import('../js/systems/xp.js');

function reset(nivel = 60, puntos = 200) {
  iniciarEstado(crearPartidaNueva(4242));
  const S = ST.S;
  S.perfil.clase = 'rudo';
  S.perfil.nivel = nivel;
  S.perfil.puntosArbol = puntos;
  S.monedas.oro = 0;
  return S;
}

/* ================= 1. ESTRUCTURA (17.01, 17.02) ================= */
sec('Las 6 ramas');
t('hay exactamente 6 ramas', CLAVES_RAMAS.length === 6, CLAVES_RAMAS.length);
t('son las del plan',
  CLAVES_RAMAS.join(',') === 'potencia,resistencia,velocidad,momentum,economia,tecnica',
  CLAVES_RAMAS.join(','));
t('cada rama tiene color e icono', CLAVES_RAMAS.every(r => RAMAS[r].color && RAMAS[r].ico));
t('cada rama tiene 5 plantillas', CLAVES_RAMAS.every(r => plantillasDeRama(r).length === NODOS_POR_TIER),
  CLAVES_RAMAS.map(r => plantillasDeRama(r).length).join(','));

sec('Apertura progresiva de ramas (17.13)');
let nivelesRama = CLAVES_RAMAS.map(r => RAMAS[r].nivelRama);
t('la primera rama está abierta desde el nivel 1', nivelesRama[0] === 1);
let crecen = true;
for (let i = 1; i < nivelesRama.length; i++) if (nivelesRama[i] <= nivelesRama[i-1]) crecen = false;
t('cada rama se abre más tarde que la anterior', crecen, nivelesRama.join(','));
reset(1);
t('a nivel 1 solo hay 1 rama abierta',
  AR.estadoRamas().filter(r => r.abierta).length === 1);
reset(60);
t('a nivel 60 están todas abiertas',
  AR.estadoRamas().every(r => r.abierta));

/* ================= 2. 150+ PASIVAS ================= */
sec('El catálogo llega a 150+ nodos');
const todos = arbolCompleto(TIERS_BASE);
t('hay más de 150 nodos', todos.length > 150, todos.length);
const pasivas = todos.filter(n => n.tipo === 'pasiva');
const keys = todos.filter(n => n.tipo === 'keystone');
t('la mayoría son pasivas', pasivas.length >= 150, pasivas.length);
t('hay keystones', keys.length > 0, keys.length);
t('todos los ids son únicos', new Set(todos.map(n => n.id)).size === todos.length);
t('30 plantillas base', Object.keys(PLANTILLAS).length === 30, Object.keys(PLANTILLAS).length);
t('8 keystones definidos', Object.keys(KEYSTONES).length === 8, Object.keys(KEYSTONES).length);

sec('Cada nodo está bien formado');
t('todos tienen rama válida', todos.every(n => CLAVES_RAMAS.includes(n.rama)));
t('todos tienen tier >= 1', todos.every(n => n.tier >= 1));
t('todos tienen nombre', todos.every(n => typeof n.nombre === 'string' && n.nombre.length > 0));
t('todos tienen rangos máximos', todos.every(n => n.rangosMax >= 1));
t('las pasivas apuntan a un bonus válido',
  pasivas.every(n => CLAVES_BONUS.includes(n.bonus)),
  pasivas.filter(n => !CLAVES_BONUS.includes(n.bonus)).map(n => n.bonus).join(','));
t('los keystones tienen regla', keys.every(n => typeof n.regla === 'string'));

sec('Nada de eventos, PVP ni utilidad (18.07–18.09)');
const prohibidas = ['evento', 'pvp', 'coliseo', 'liga', 'torneo', 'inventario', 'tienda'];
t('ninguna clave de bonus es de esas categorías',
  CLAVES_BONUS.every(b => !prohibidas.some(p => b.toLowerCase().includes(p))),
  CLAVES_BONUS.join(','));

sec('Categorías del plan presentes (18.04, 18.05, 18.06)');
t('hay penetración (ofensiva, 18.04)', CLAVES_BONUS.includes('penetracion'));
t('hay escudo inicial (defensiva, 18.05)', CLAVES_BONUS.includes('escudoInicial'));
t('hay oro y XP (económica, 18.06)',
  CLAVES_BONUS.includes('oroMult') && CLAVES_BONUS.includes('xpMult'));

/* ================= 3. TIERS INFINITOS (17.06) ================= */
sec('Tiers infinitos');
const t50 = construirNodo('potencia', 50, 0);
t('el tier 50 existe', t50 !== null && t50.tier === 50);
t('tiene nombre propio', t50.nombre !== construirNodo('potencia', 1, 0).nombre, t50.nombre);
const t200 = construirNodo('economia', 200, 2);
t('el tier 200 también', t200 !== null && t200.tier === 200);
t('se puede recuperar por id', nodoPorId(t50.id)?.id === t50.id);
t('un id inventado devuelve null', nodoPorId('inexistente.t1.0') === null);
t('un id mal formado devuelve null', nodoPorId('basura') === null);

sec('El valor escala con el tier (17.09)');
const v1 = valorEnTier(PLANTILLAS.golpeSeco, 1, 1);
const v5 = valorEnTier(PLANTILLAS.golpeSeco, 5, 1);
t('el tier 5 vale más que el 1', v5 > v1 * 2, `${v1.toFixed(3)} → ${v5.toFixed(3)}`);
t('los rangos suman dentro del tier',
  valorEnTier(PLANTILLAS.golpeSeco, 1, 3) > valorEnTier(PLANTILLAS.golpeSeco, 1, 1));

sec('El coste escala con el tier (17.09) y el rango (17.11 overcharge)');
t('el tier encarece', costeRango(5, 1) > costeRango(1, 1), `${costeRango(1,1)} → ${costeRango(5,1)}`);
t('cada rango extra cuesta más', costeRango(3, 4) > costeRango(3, 1), `${costeRango(3,1)} → ${costeRango(3,4)}`);
t('el acumulado suma los rangos',
  costeAcumulado(2, 3) === costeRango(2,1) + costeRango(2,2) + costeRango(2,3));
t('los keystones son caros', costeKeystone(2, 1) > costeRango(2, 1),
  `${costeRango(2,1)} vs ${costeKeystone(2,1)}`);

sec('Nivel requerido crece con el tier (17.04)');
t('el tier 1 pide poco', nivelRequerido('potencia', 1) === RAMAS.potencia.nivelRama);
t('el tier 5 pide más', nivelRequerido('potencia', 5) > nivelRequerido('potencia', 1));
t('la rama tardía pide más de entrada',
  nivelRequerido('tecnica', 1) > nivelRequerido('potencia', 1));

/* ================= 4. COMPRA Y REQUISITOS ================= */
sec('Compra básica (17.03)');
reset(60, 100);
const n1 = construirNodo('potencia', 1, 0);
const puntos0 = AR.puntosDisponibles();
const c1 = AR.comprar(n1);
t('se compra', c1.ok === true, c1.motivo);
t('sube a rango 1', AR.rangoDe(n1.id) === 1);
t('descuenta puntos', AR.puntosDisponibles() === puntos0 - c1.coste, AR.puntosDisponibles());
t('queda registrado en el estado', st().arbol.nodos[n1.id] === 1);

sec('Rangos múltiples con overcharge (17.11)');
reset(60, 200);
const nMulti = construirNodo('potencia', 1, 0);
let costes = [];
for (let i = 0; i < nMulti.rangosMax; i++) {
  const r = AR.comprar(nMulti);
  if (r.ok) costes.push(r.coste);
}
t('se llega al rango máximo', AR.rangoDe(nMulti.id) === nMulti.rangosMax, AR.rangoDe(nMulti.id));
let costesCrecen = true;
for (let i = 1; i < costes.length; i++) if (costes[i] <= costes[i-1]) costesCrecen = false;
t('cada rango cuesta más que el anterior', costesCrecen, costes.join(','));
const extra = AR.comprar(nMulti);
t('no se puede pasar del máximo', extra.ok === false && extra.motivo === 'maximo', extra.motivo);

sec('Rendimientos decrecientes por punto (17.11)');
const nOv = construirNodo('potencia', 1, 0);
const valor1 = nOv.valorPara(1), valor5 = nOv.valorPara(5);
const coste1 = costeAcumulado(1, 1), coste5 = costeAcumulado(1, 5);
const eff1 = valor1 / coste1, eff5 = valor5 / coste5;
t('el primer punto rinde más que el quinto', eff1 > eff5,
  `${eff1.toFixed(4)} vs ${eff5.toFixed(4)}`);

sec('Sin puntos no se compra');
reset(60, 0);
const sinPuntos = AR.comprar(construirNodo('potencia', 1, 0));
t('rechaza por puntos', sinPuntos.ok === false && sinPuntos.motivo === 'puntos', sinPuntos.motivo);
t('no cambió nada', Object.keys(st().arbol.nodos).length === 0);

sec('Requisito de nivel (17.04)');
reset(1, 500);
const alto = construirNodo('potencia', 5, 0);
const rAlto = AR.puedeComprar(alto);
t('a nivel 1 no se puede tocar el tier 5', rAlto.ok === false);
t('el motivo son los requisitos', rAlto.motivo === 'requisitos', rAlto.motivo);
t('17.15 dice exactamente qué falta', rAlto.faltan.length > 0, JSON.stringify(rAlto.faltan));
t('menciona el nivel', rAlto.faltan.some(f => f.includes('Nivel')), JSON.stringify(rAlto.faltan));

sec('Rama cerrada (17.13)');
reset(2, 500);
const ramaCerrada = construirNodo('tecnica', 1, 0);
const rc = AR.puedeComprar(ramaCerrada);
t('no se compra en rama cerrada', rc.ok === false);
t('el aviso menciona la rama', rc.faltan.some(f => f.includes('Técnica')), JSON.stringify(rc.faltan));
t('ramaAbierta lo confirma', AR.ramaAbierta('tecnica') === false);
t('la rama inicial sí está abierta', AR.ramaAbierta('potencia') === true);

sec('Puerta de tier: hay que invertir en el anterior');
reset(60, 500);
const tier2 = construirNodo('potencia', 2, 0);
const antesPuerta = AR.puedeComprar(tier2);
t('sin nada del tier 1, el tier 2 está cerrado', antesPuerta.ok === false, antesPuerta.motivo);
t('dice cuántos nodos faltan',
  antesPuerta.faltan.some(f => f.includes('tier 1')), JSON.stringify(antesPuerta.faltan));
AR.comprar(construirNodo('potencia', 1, 0));
t('con 1 nodo aún no basta', AR.puedeComprar(tier2).ok === false);
AR.comprar(construirNodo('potencia', 1, 1));
t('con 2 nodos se abre', AR.puedeComprar(tier2).ok === true);
t('comprasEnTier cuenta bien', AR.comprasEnTier('potencia', 1) === 2);

sec('Sin sinergias entre ramas (17.12)');
reset(60, 500);
for (let i = 0; i < 5; i++) AR.comprar(construirNodo('potencia', 1, i));
const otraRama = construirNodo('resistencia', 2, 0);
t('invertir en Potencia NO abre el tier 2 de Resistencia',
  AR.puedeComprar(otraRama).ok === false);
t('cada rama lleva su propia cuenta',
  AR.comprasEnTier('potencia', 1) === 5 && AR.comprasEnTier('resistencia', 1) === 0);

/* ================= 5. KEYSTONES (17.07) ================= */
sec('Keystones');
const kTier2 = keystoneDeTier('potencia', 2);
t('el tier 2 tiene keystone', kTier2 !== null);
t('el tier 1 no', keystoneDeTier('potencia', 1) === null);
t('el tier 3 tampoco', keystoneDeTier('potencia', 3) === null);
t('el tier 5 sí (cada 3 tiers)', keystoneDeTier('potencia', 5) !== null);
t('el keystone tiene regla', typeof kTier2.regla === 'string' && kTier2.regla.length > 0);
t('evoluciona en varios rangos', kTier2.rangosMax >= 2, kTier2.rangosMax);

sec('El keystone exige inversión en su propio tier');
reset(60, 500);
AR.comprar(construirNodo('potencia', 1, 0));
AR.comprar(construirNodo('potencia', 1, 1));
const kk = keystoneDeTier('potencia', 2);
t('sin nodos del tier 2 el keystone está bloqueado', AR.puedeComprar(kk).ok === false);
AR.comprar(construirNodo('potencia', 2, 0));
AR.comprar(construirNodo('potencia', 2, 1));
t('con 2 nodos del tier 2 ya se puede', AR.puedeComprar(kk).ok === true);
const compraK = AR.comprar(kk);
t('se compra el keystone', compraK.ok === true);
t('aparece en reglasActivas', AR.reglasActivas()[kk.regla] !== undefined,
  JSON.stringify(AR.reglasActivas()));

sec('Los keystones evolucionan');
reset(60, 900);
AR.comprar(construirNodo('potencia', 1, 0));
AR.comprar(construirNodo('potencia', 1, 1));
AR.comprar(construirNodo('potencia', 2, 0));
AR.comprar(construirNodo('potencia', 2, 1));
const kEvo = keystoneDeTier('potencia', 2);
AR.comprar(kEvo);
const regla1 = JSON.stringify(AR.reglasActivas()[kEvo.regla]);
AR.comprar(kEvo);
const regla2 = JSON.stringify(AR.reglasActivas()[kEvo.regla]);
t('el rango 2 refuerza la regla', regla1 !== regla2, `${regla1} → ${regla2}`);

/* ================= 6. BONOS TOTALES (18.14) ================= */
sec('bonosTotales suma las pasivas');
reset(60, 500);
t('sin comprar nada todo está a cero',
  Object.values(AR.bonosTotales()).every(v => v === 0));
const nDano = construirNodo('potencia', 1, 0);
AR.comprar(nDano);
const b1 = AR.bonosTotales();
t('la pasiva comprada aparece', b1[nDano.bonus] > 0, `${nDano.bonus}=${b1[nDano.bonus]}`);
AR.comprar(nDano);
const b2 = AR.bonosTotales();
t('el rango 2 aporta más', b2[nDano.bonus] > b1[nDano.bonus],
  `${b1[nDano.bonus].toFixed(4)} → ${b2[nDano.bonus].toFixed(4)}`);

sec('Bonos del mismo tipo se suman');
reset(60, 900);
AR.comprar(construirNodo('potencia', 1, 0));   // golpeSeco → danoMult
AR.comprar(construirNodo('potencia', 1, 1));
AR.comprar(construirNodo('momentum', 1, 3));   // adrenalina → danoMult (rama distinta)
const bs = AR.bonosTotales();
t('danoMult acumula de varias ramas', bs.danoMult > 0, bs.danoMult.toFixed(4));
t('todos los valores son finitos',
  Object.values(bs).every(v => Number.isFinite(v)));
t('ninguno es negativo', Object.values(bs).every(v => v >= 0));

sec('bonosTotales no se contamina con los keystones');
reset(60, 900);
for (let tt = 1; tt <= 2; tt++) for (let s2 = 0; s2 < 2; s2++) AR.comprar(construirNodo('potencia', tt, s2));
AR.comprar(keystoneDeTier('potencia', 2));
const bk = AR.bonosTotales();
t('todas las claves son claves de bonus declaradas',
  Object.keys(bk).every(k => CLAVES_BONUS.includes(k)),
  Object.keys(bk).filter(k => !CLAVES_BONUS.includes(k)).join(','));
t('no aparece una clave undefined', !('undefined' in bk), Object.keys(bk).join(','));
t('todos los valores siguen siendo números',
  Object.values(bk).every(v => typeof v === 'number' && Number.isFinite(v)));
t('el keystone sí está en reglasActivas, no en bonos',
  Object.keys(AR.reglasActivas()).length > 0);

sec('Los keystones son escasos: uno cada 3 tiers');
{
  const porRama = {};
  for (const r of CLAVES_RAMAS) {
    porRama[r] = [];
    for (let tier = 1; tier <= 12; tier++) if (keystoneDeTier(r, tier)) porRama[r].push(tier);
  }
  t('en 12 tiers hay como mucho 4 keystones por rama',
    CLAVES_RAMAS.every(r => porRama[r].length <= 4),
    JSON.stringify(porRama.potencia));
  t('empiezan en el tier 2', CLAVES_RAMAS.every(r => porRama[r][0] === 2));
  t('van de 3 en 3',
    CLAVES_RAMAS.every(r => porRama[r].every((tv, i) => tv === 2 + i * 3)),
    JSON.stringify(porRama.potencia));
  t('la mayoría de los tiers NO tienen keystone',
    porRama.potencia.length < 12 / 2, porRama.potencia.length);
  const totalKeys = arbolCompleto(TIERS_BASE).filter(n => n.tipo === 'keystone').length;
  const totalPas  = arbolCompleto(TIERS_BASE).filter(n => n.tipo === 'pasiva').length;
  t('los keystones son minoría frente a las pasivas', totalKeys < totalPas * 0.15,
    `${totalKeys} keystones vs ${totalPas} pasivas`);
}

sec('Gasto por rama (Sugerencia #5)');
reset(60, 900);
AR.comprar(construirNodo('potencia', 1, 0));
AR.comprar(construirNodo('resistencia', 1, 0));
AR.comprar(construirNodo('resistencia', 1, 1));
const gpr = AR.gastoPorRama();
t('cuenta Potencia', gpr.potencia > 0, gpr.potencia);
t('cuenta Resistencia', gpr.resistencia > gpr.potencia, gpr.resistencia);
t('las no tocadas están a cero', gpr.tecnica === 0 && gpr.economia === 0);
t('el total cuadra',
  AR.gastoTotal() === Object.values(gpr).reduce((a,b) => a+b, 0),
  `${AR.gastoTotal()} vs ${Object.values(gpr).reduce((a,b)=>a+b,0)}`);

/* ================= 7. EFECTO EN COMBATE (18.14) ================= */
sec('Las pasivas llegan a las stats derivadas');
reset(60, 900);
const heroeSin = heroeDesdeEstado();
// cuero curtido = vidaMult (resistencia slot 0)
const nVida = construirNodo('resistencia', 1, 0);
t('el nodo elegido es de vida', nVida.bonus === 'vidaMult', nVida.bonus);
for (let i = 0; i < nVida.rangosMax; i++) AR.comprar(nVida);
const heroeCon = heroeDesdeEstado();
t('la vida máxima sube', heroeCon.der.vidaMax > heroeSin.der.vidaMax,
  `${heroeSin.der.vidaMax} → ${heroeCon.der.vidaMax}`);
t('el rival CPU no tiene pasivas',
  Object.values(crearLuchador({ nombre:'x', clase:'rudo', nivel:10, stats: st().stats }).pasivas)
    .every(v => v === 0));

sec('Escudo inicial (18.05)');
reset(60, 900);
AR.comprar(construirNodo('resistencia', 1, 0));
AR.comprar(construirNodo('resistencia', 1, 1));
const nEsc = construirNodo('resistencia', 1, 2);   // vendaje → escudoInicial
t('el nodo es de escudo', nEsc.bonus === 'escudoInicial', nEsc.bonus);
AR.comprar(nEsc);
const hEsc = heroeDesdeEstado();
t('el bono existe', hEsc.pasivas.escudoInicial > 0, hEsc.pasivas.escudoInicial);
const rivalEsc = crearLuchador({ nombre:'R', clase:'tecnico', nivel:60, stats: st().stats });
const resEsc = simularLucha(hEsc, rivalEsc, { semilla: 1 });
t('la lucha se resuelve con escudo', resEsc.ganador !== undefined);
// el escudo se coloca al preparar la lucha, no al construir el luchador
const { prepararParaLucha } = await import('../js/systems/fighter.js');
const { limpiarEstados } = await import('../js/systems/combat/status.js');
prepararParaLucha(hEsc, 1);
t('prepararParaLucha pone el escudo', hEsc.escudo > 0, hEsc.escudo);
limpiarEstados(hEsc);
t('limpiarEstados NO se lo lleva por delante', hEsc.escudo > 0, hEsc.escudo);
const rivalPelado = crearLuchador({ nombre:'P', clase:'rudo', nivel:60, stats: st().stats });
prepararParaLucha(rivalPelado, 1);
t('un rival sin árbol no tiene escudo', (rivalPelado.escudo || 0) === 0, rivalPelado.escudo);

sec('El daño extra se nota en el winrate');
reset(60, 200);   // 17.08: el presupuesto REAL de toda la partida
const statsBase = { ...st().stats };
const rivalRef = crearLuchador({ nombre:'Ref', clase:'rudo', nivel:60, stats: statsBase });
const hSin = heroeDesdeEstado();
const wrSin = simularMasivo(hSin, rivalRef, 400).winrate;
// invertir a saco en Potencia
for (let s = 0; s < 5; s++) {
  const n = construirNodo('potencia', 1, s);
  for (let r = 0; r < n.rangosMax; r++) AR.comprar(n);
}
for (let s = 0; s < 5; s++) {
  const n = construirNodo('potencia', 2, s);
  for (let r = 0; r < n.rangosMax; r++) AR.comprar(n);
}
const hCon = heroeDesdeEstado();
const wrCon = simularMasivo(hCon, rivalRef, 400).winrate;
t('invertir en el árbol sube el winrate', wrCon > wrSin + 0.05,
  `${(wrSin*100).toFixed(1)}% → ${(wrCon*100).toFixed(1)}%`);
t('pero NO te vuelve invencible (17.08)', wrCon < 0.90,
  `${(wrCon*100).toFixed(1)}% con todo el presupuesto en una rama`);

sec('Keystone Terco: sobrevive al KO');
reset(60, 3000);
for (let tt = 1; tt <= 2; tt++)
  for (let s = 0; s < 2; s++) AR.comprar(construirNodo('resistencia', tt, s));
const kTerco = Object.values(KEYSTONES).find(k => k.regla === 'aguantaKO');
const nodoTerco = [2,5,8].map(x => keystoneDeTier('resistencia', x)).find(n => n && n.regla === 'aguantaKO');
if (nodoTerco) {
  // abrir su tier
  for (let tt = 1; tt <= nodoTerco.tier; tt++)
    for (let s = 0; s < 2; s++) AR.comprar(construirNodo('resistencia', tt, s));
  const cT = AR.comprar(nodoTerco);
  t('se compra Terco', cT.ok === true, cT.motivo);
  t('la regla aguantaKO está activa', AR.reglasActivas().aguantaKO?.veces >= 1,
    JSON.stringify(AR.reglasActivas().aguantaKO));
  const hT = heroeDesdeEstado();
  t('el luchador recibe la regla', hT.reglas.aguantaKO?.veces >= 1);
} else {
  t('existe un keystone aguantaKO alcanzable', false, 'no encontrado');
}

sec('Keystone Empresario: oro por ronda (18.06)');
reset(60, 3000);
for (let tt = 1; tt <= 2; tt++)
  for (let s = 0; s < 2; s++) AR.comprar(construirNodo('economia', tt, s));
const nodoEmp = [2,5,8].map(x => keystoneDeTier('economia', x)).find(n => n && n.regla === 'oroPorRonda');
const heroeEco = heroeDesdeEstado();
const resFalso = { motivo: 'ko', rondas: 6, resumen: { duracionSeg: 60 } };
reset(60, 3000);
const sinArbol = recompensar({ nivel: 20, tipo: 'normal', oro: 1000 }, resFalso, heroeEco, true);
reset(60, 3000);
for (let s = 0; s < 5; s++) {
  const n = construirNodo('economia', 1, s);
  for (let r = 0; r < n.rangosMax; r++) AR.comprar(n);
}
const conArbol = recompensar({ nivel: 20, tipo: 'normal', oro: 1000 }, resFalso, heroeEco, true);
t('las pasivas económicas dan más oro', conArbol.oro > sinArbol.oro,
  `${sinArbol.oro} → ${conArbol.oro}`);
t('y más XP', conArbol.xp > sinArbol.xp, `${sinArbol.xp} → ${conArbol.xp}`);
t('el desglose informa del multiplicador', conArbol.multOroArbol > 1, conArbol.multOroArbol.toFixed(3));

sec('Ninguna rama es dominante ni inútil (balance calibrado)');
{
  const gastarTodo = (rama, pres = 200) => {
    let g = 0;
    for (let tier = 1; tier <= 6 && g < pres; tier++) {
      for (let s = 0; s < NODOS_POR_TIER && g < pres; s++) {
        const n = construirNodo(rama, tier, s);
        for (let r = 0; r < n.rangosMax; r++) {
          const p = AR.puedeComprar(n);
          if (!p.ok || g + p.coste > pres) break;
          AR.comprar(n); g += p.coste;
        }
      }
    }
    return g;
  };
  reset(60, 200);
  const rivalBal = crearLuchador({ nombre:'Bal', clase:'rudo', nivel:60, stats: st().stats });
  const wrs = {};
  for (const rama of ['potencia','resistencia','velocidad','momentum','tecnica']) {
    reset(60, 200);
    gastarTodo(rama);
    wrs[rama] = simularMasivo(heroeDesdeEstado(), rivalBal, 400).winrate;
  }
  const vals = Object.values(wrs);
  const resumen = Object.entries(wrs).map(([k,v]) => `${k} ${(v*100).toFixed(0)}%`).join(' · ');
  t('ninguna rama de combate pasa del 90%', Math.max(...vals) < 0.90, resumen);
  t('ninguna rama de combate baja del 50%', Math.min(...vals) > 0.50, resumen);
  t('la dispersión entre ramas es razonable', Math.max(...vals) - Math.min(...vals) < 0.30, resumen);
}

/* ================= 8. PLANIFICADOR DE RUTA (Sugerencia #1) ================= */
sec('Planificador de ruta');
reset(60, 500);
const lejano = construirNodo('potencia', 4, 0);
const ruta = AR.rutaHasta(lejano);
t('devuelve una ruta', ruta !== null && ruta.pasos.length > 0, ruta?.pasos?.length);
t('incluye el objetivo', ruta.pasos[ruta.pasos.length - 1].nodo.id === lejano.id);
t('incluye nodos intermedios', ruta.pasos.length > 1, ruta.pasos.length);
t('suma un coste', ruta.coste > 0, ruta.coste);
t('el coste es la suma de los pasos',
  ruta.coste === ruta.pasos.reduce((a, p) => a + p.coste, 0));
t('todos los pasos son de la misma rama (17.12)',
  ruta.pasos.every(p => p.nodo.rama === 'potencia'));
t('indica el nivel necesario', ruta.nivelNecesario >= lejano.nivelReq, ruta.nivelNecesario);

sec('La ruta es realmente ejecutable');
reset(60, 500);
const objetivo = construirNodo('velocidad', 3, 1);
const r2 = AR.rutaHasta(objetivo);
let comprasOk = true, motivo = '';
for (const paso of r2.pasos) {
  const res = AR.comprar(paso.nodo);
  if (!res.ok) { comprasOk = false; motivo = `${paso.nodo.id}: ${res.motivo}`; break; }
}
t('siguiendo la ruta se compra todo', comprasOk, motivo);
t('el objetivo queda comprado', AR.rangoDe(objetivo.id) >= 1);

sec('Ruta hacia un keystone');
reset(60, 900);
const kObj = keystoneDeTier('resistencia', 2);
const r3 = AR.rutaHasta(kObj);
let okKey = true, m3 = '';
for (const paso of r3.pasos) {
  const res = AR.comprar(paso.nodo);
  if (!res.ok) { okKey = false; m3 = `${paso.nodo.id}: ${res.motivo}`; break; }
}
t('la ruta al keystone funciona', okKey, m3);
t('el keystone queda comprado', AR.rangoDe(kObj.id) >= 1);

sec('Si ya tienes lo previo, la ruta se acorta');
reset(60, 900);
const objL = construirNodo('potencia', 3, 0);
const rutaLarga = AR.rutaHasta(objL).coste;
AR.comprar(construirNodo('potencia', 1, 0));
AR.comprar(construirNodo('potencia', 1, 1));
const rutaCorta = AR.rutaHasta(objL).coste;
t('la ruta cuesta menos tras invertir', rutaCorta < rutaLarga, `${rutaLarga} → ${rutaCorta}`);

/* ================= 9. BÚSQUEDA (Sugerencia #4) ================= */
sec('Búsqueda por texto');
reset(60, 100);
t('busca por efecto', AR.buscar('crítico').length > 0, AR.buscar('crítico').length);
t('busca sin tildes', AR.buscar('critico').length > 0, AR.buscar('critico').length);
t('busca por rama', AR.buscar('economía').length > 0);
t('busca por clave de bonus', AR.buscar('oroMult').length > 0);
t('vacío no devuelve nada', AR.buscar('').length === 0);
t('lo inexistente no devuelve nada', AR.buscar('zzzzqqq').length === 0);
t('mayúsculas dan igual',
  AR.buscar('ORO').length === AR.buscar('oro').length);
t('los resultados son nodos reales',
  AR.buscar('escudo').every(n => nodoPorId(n.id) !== null));

/* ================= 10. DESCRIPCIONES (18.13) ================= */
sec('Cada nodo muestra tu valor actual');
reset(60, 500);
const nDesc = construirNodo('potencia', 1, 0);
const d0 = AR.descripcion(nDesc);
t('sin comprar dice "Sin comprar"', d0.actual === 'Sin comprar', d0.actual);
t('muestra qué daría el siguiente rango', typeof d0.siguiente === 'string' && d0.siguiente.length > 0);
AR.comprar(nDesc);
const d1 = AR.descripcion(nDesc);
t('tras comprar muestra el valor real', d1.actual !== 'Sin comprar', d1.actual);
t('el texto lleva un número', /\d/.test(d1.actual), d1.actual);
t('sigue mostrando el siguiente', d1.siguiente !== null);
for (let i = 1; i < nDesc.rangosMax; i++) AR.comprar(nDesc);
t('al máximo ya no hay siguiente', AR.descripcion(nDesc).siguiente === null);

sec('Los keystones describen su regla');
const kD = keystoneDeTier('tecnica', 2);
t('tiene descripción base', typeof kD.desc === 'string' && kD.desc.length > 10);
t('describe cada rango', typeof kD.porRango(1) === 'string' && kD.porRango(1).length > 0);
t('el rango 2 dice algo distinto', kD.porRango(1) !== kD.porRango(2),
  `${kD.porRango(1)} / ${kD.porRango(2)}`);

/* ================= 11. PRESUPUESTO (17.08 ~200 puntos) ================= */
sec('El presupuesto de ~200 puntos es coherente');
t('la constante existe', PROG.PUNTOS_ARBOL_TOTALES === 200, PROG.PUNTOS_ARBOL_TOTALES);
reset(201, 200);
t('a nivel 201 tendrías 200 puntos', ARB.puntosAlNivel(201) === 200);

// ¿200 puntos alcanzan para una rama completa pero no para todo?
reset(200, 200);
let gastado = 0, comprados = 0;
for (let tier = 1; tier <= 5 && gastado < 200; tier++) {
  for (let s = 0; s < NODOS_POR_TIER && gastado < 200; s++) {
    const n = construirNodo('potencia', tier, s);
    for (let r = 0; r < n.rangosMax; r++) {
      const res = AR.comprar(n);
      if (!res.ok) break;
      gastado += res.coste; comprados++;
    }
  }
}
t('200 puntos NO llegan para 5 tiers completos de una rama', gastado >= 190,
  `gastó ${gastado} en ${comprados} rangos`);
t('con 200 puntos hay que especializarse', AR.gastoTotal() <= 200, AR.gastoTotal());
const ramas200 = AR.gastoPorRama();
t('todo el gasto fue en una rama',
  Object.entries(ramas200).filter(([, v]) => v > 0).length === 1,
  JSON.stringify(ramas200));

/* ================= 12. SIN RESPEC (17.05) ================= */
sec('No hay reasignación');
const exportadas = Object.keys(AR);
const sospechosas = exportadas.filter(k => /respec|reset|refund|devolver|deshacer|vender/i.test(k));
t('el módulo no exporta ninguna función de respec', sospechosas.length === 0, sospechosas.join(','));
reset(60, 100);
AR.comprar(construirNodo('potencia', 1, 0));
const puntosTrasCompra = AR.puntosDisponibles();
AR.comprar(construirNodo('potencia', 1, 0));
t('comprar nunca devuelve puntos', AR.puntosDisponibles() < puntosTrasCompra);

/* ================= 13. INTEGRIDAD GENERAL ================= */
sec('Integridad del árbol completo');
const grande = arbolCompleto(8);
t('genera 8 tiers sin romperse', grande.length > 240, grande.length);
t('todos los costes son positivos',
  grande.every(n => {
    const c = n.tipo === 'keystone' ? costeKeystone(n.tier, 1) : costeRango(n.tier, 1);
    return c > 0 && Number.isFinite(c);
  }));
t('todos los valores de pasiva son finitos y positivos',
  grande.filter(n => n.tipo === 'pasiva').every(n => {
    const v = n.valorPara(1);
    return Number.isFinite(v) && v > 0;
  }));
t('ningún nombre queda vacío', grande.every(n => n.nombre.trim().length > 0));
t('los niveles requeridos son crecientes por tier',
  CLAVES_RAMAS.every(r => nivelRequerido(r, 2) > nivelRequerido(r, 1)));

sec('Simulación: 60 niveles invirtiendo en el árbol');
reset(1, 0);
let errores = 0;
for (let nivel = 2; nivel <= 60; nivel++) {
  st().perfil.nivel = nivel;
  st().perfil.puntosArbol += 1;
  // intenta comprar lo más barato disponible en las ramas abiertas
  const abiertas = AR.estadoRamas().filter(r => r.abierta).map(r => r.id);
  let mejor = null, mejorCoste = Infinity;
  for (const ramaId of abiertas) {
    for (let tier = 1; tier <= 4; tier++) {
      for (const n of nodosDeTier(ramaId, tier)) {
        const p = AR.puedeComprar(n);
        if (p.ok && p.coste < mejorCoste) { mejor = n; mejorCoste = p.coste; }
      }
    }
  }
  if (mejor) {
    const r = AR.comprar(mejor);
    if (!r.ok) errores++;
  }
}
t('no hubo errores de compra en 60 niveles', errores === 0, errores);
t('gastó puntos', AR.gastoTotal() > 0, AR.gastoTotal());
t('nunca gastó más de lo que tenía', AR.puntosDisponibles() >= 0, AR.puntosDisponibles());
const hFinal = heroeDesdeEstado();
t('el héroe final es válido', Number.isFinite(hFinal.poder) && hFinal.poder > 0, hFinal.poder);
t('la vida sigue siendo finita', Number.isFinite(hFinal.der.vidaMax) && hFinal.der.vidaMax > 0);
t('la fatiga no se volvió negativa', hFinal.der.fatigaMult > 0, hFinal.der.fatigaMult);
t('la esquiva está topada', hFinal.der.esquiva <= 0.35, hFinal.der.esquiva);
t('la penetración está topada', hFinal.der.penetracion <= 0.85, hFinal.der.penetracion);

sec('El combate sigue funcionando con el árbol invertido');
const rivalFinal = crearLuchador({ nombre:'Final', clase:'coloso', nivel:60, stats: st().stats });
const masivo = simularMasivo(hFinal, rivalFinal, 300);
t('300 luchas se resuelven', masivo.winrate >= 0 && masivo.winrate <= 1, masivo.winrate);
t('la duración es razonable', masivo.duracionMediaSeg > 2 && masivo.duracionMediaSeg < 200,
  masivo.duracionMediaSeg.toFixed(1));

/* ================= RESUMEN ================= */
console.log(`\n${'='.repeat(46)}`);
console.log(`✅ ${ok} correctas · ❌ ${fail} fallidas`);
if (fail === 0) console.log('🎉 TODAS LAS PRUEBAS DEL PASO 10 PASARON');
process.exit(fail ? 1 : 0);
