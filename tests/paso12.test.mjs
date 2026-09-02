/* PASO 12 — El Coliseo: ligas, pozo con rake, cuadro de eliminación */
globalThis.location = { hostname: 'localhost', hash: '' };

let ok = 0, mal = 0;
const t = (nombre, cond) => { if (cond) ok++; else { mal++; console.log(`❌ ${nombre}`); } };
const casi = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;

const L = await import('../js/data/ligas.js');
const PP = await import('../js/systems/pvp/prizepool.js');
const BR = await import('../js/systems/pvp/bracket.js');
const G = await import('../js/systems/pvp/ghosts.js');
const ST = await import('../js/core/state.js');
const { ECO, PROG } = await import('../js/data/constants.js');
const { crearLuchador } = await import('../js/systems/fighter.js');
const { CLAVES_STATS } = await import('../js/data/stats.js');
const { CLAVES_CLASES } = await import('../js/data/clases.js');
const { rngDe } = await import('../js/core/rng.js');

ST.iniciarEstado();

/* ============ 1. LAS 5 LIGAS (24.01) ============ */
t('24.01 hay exactamente 5 ligas', L.LIGAS.length === 5);
t('24.01 son Bronce, Plata, Oro, Diamante, Leyenda',
  L.CLAVES_LIGAS.join(',') === 'bronce,plata,oro,diamante,leyenda');
t('las ligas van numeradas 1..5', L.LIGAS.every((l, i) => l.n === i + 1));
t('22.01 el buy-in escala con la liga',
  L.LIGAS.every((l, i) => i === 0 || l.buyInOro > L.LIGAS[i - 1].buyInOro));
t('22.01 el plan fija 100 / 500 / 2500 en las tres primeras',
  L.LIGAS[0].buyInOro === 100 && L.LIGAS[1].buyInOro === 500 && L.LIGAS[2].buyInOro === 2500);
t('22.07 toda liga tiene precio en gemas', L.LIGAS.every(l => l.buyInGemas > 0));
t('22.07 las gemas son mucho más baratas que el oro',
  L.LIGAS.every(l => l.buyInGemas < l.buyInOro));
t('22.03 el tamaño de cuadro es potencia de 2',
  L.LIGAS.every(l => Number.isInteger(Math.log2(l.cuadro))));
t('22.03 el cuadro no decrece con la liga',
  L.LIGAS.every((l, i) => i === 0 || l.cuadro >= L.LIGAS[i - 1].cuadro));
t('23.05 la liga Oro usa el cuadro clásico de 32', L.getLigaPorId('oro').cuadro === 32);
t('22.09 la liga base pide nivel 10', L.LIGAS[0].nivelMin === PROG.NIVEL_MIN_PVP);
t('los requisitos de nivel son crecientes',
  L.LIGAS.every((l, i) => i === 0 || l.nivelMin > L.LIGAS[i - 1].nivelMin));
t('24.03 cada liga tiene premio de temporada',
  L.LIGAS.every(l => l.premioTemporada > 0));
t('el premio de temporada crece con la liga',
  L.LIGAS.every((l, i) => i === 0 || l.premioTemporada > L.LIGAS[i - 1].premioTemporada));
t('toda liga tiene icono, color y lema',
  L.LIGAS.every(l => l.ico && /^#[0-9a-f]{6}$/i.test(l.color) && l.lema));

/* ============ 2. SALAS (22.06, 22.07, 22.11) ============ */
const salaOro = L.construirSala(3, 'oro', false);
const salaGemas = L.construirSala(3, 'gemas', false);
t('22.06 la sala de oro y la de gemas son distintas', salaOro.id !== salaGemas.id);
t('22.07 la sala de gemas cobra en gemas', salaGemas.buyIn === L.getLiga(3).buyInGemas);
t('la sala calcula sus rondas', salaOro.rondas === Math.log2(salaOro.cuadro));
t('la sala de la liga Oro tiene 5 rondas', salaOro.rondas === 5);
t('la sala normal no multiplica el pozo', salaOro.multPozo === 1);

// 24.12 sábado XL
const sabado = new Date(2026, 8, 5);     // 5 sep 2026 = sábado
const martes = new Date(2026, 8, 8);
t('24.12 detecta el sábado', L.esSabado(sabado) === true);
t('el martes no es sábado', L.esSabado(martes) === false);
const xl = L.construirSala(3, 'oro', true);
t('24.12 el cuadro XL es de 64', xl.cuadro === 64);
t('24.12 el XL tiene 6 rondas', xl.rondas === 6);
t('24.12 el XL cobra entrada doble', xl.buyIn === salaOro.buyIn * 2);
t('24.12 el XL infla el pozo', xl.multPozo > 1);

const salasSab = L.salasDisponibles(50, sabado);
const salasMar = L.salasDisponibles(50, martes);
t('22.11 hay salas todos los días', salasMar.length >= 10);
t('22.06 hay sala de oro y de gemas por liga', salasMar.length === 10);
t('24.12 el sábado hay más salas que un martes', salasSab.length > salasMar.length);
t('24.12 el sábado añade 5 salas XL', salasSab.length === salasMar.length + 5);
t('22.09 al novato se le cierran las ligas altas',
  L.salasDisponibles(10, martes).filter(s => s.abierta).length === 2);
t('22.09 el veterano las tiene todas abiertas',
  L.salasDisponibles(50, martes).every(s => s.abierta));

/* ============ 3. RONDAS Y TEMPORADA ============ */
t('23.05 1 lucha = Final', L.nombreRonda(1) === 'Final');
t('23.05 2 luchas = Semifinal', L.nombreRonda(2) === 'Semifinal');
t('23.05 4 luchas = Cuartos', /Cuartos/.test(L.nombreRonda(4)));
t('23.05 8 luchas = Octavos', /Octavos/.test(L.nombreRonda(8)));
t('23.05 la final es al mejor de 3', L.FINAL_AL_MEJOR_DE === 3);

const lun = L.inicioTemporada(new Date(2026, 8, 9, 15, 0));   // miércoles
t('24.02 la temporada empieza en lunes', new Date(lun).getDay() === 1);
t('24.02 la temporada empieza a medianoche', new Date(lun).getHours() === 0);
t('24.02 la temporada dura 7 días', L.finTemporada(new Date(2026, 8, 9)) - lun === 7 * 864e5);
t('24.02 días de la misma semana comparten temporada',
  L.inicioTemporada(new Date(2026, 8, 7)) === L.inicioTemporada(new Date(2026, 8, 13)));
t('24.02 el domingo cierra la semana',
  L.inicioTemporada(new Date(2026, 8, 13)) !== L.inicioTemporada(new Date(2026, 8, 14)));
t('24.02 una temporada vieja caduca',
  L.temporadaCaducada(L.inicioTemporada(new Date(2026, 8, 1)), new Date(2026, 8, 20).getTime()));
t('24.02 la temporada en curso no caduca',
  !L.temporadaCaducada(L.inicioTemporada(new Date(2026, 8, 9)), new Date(2026, 8, 10).getTime()));
t('sin sello, la temporada se considera caducada', L.temporadaCaducada(null));

const pt0 = L.premioTemporada(3, 0);
const pt5 = L.premioTemporada(3, 5);
t('24.03 el premio de temporada se paga en moneda', pt0.oro > 0);
t('24.03 ganar torneos aumenta el premio', pt5.oro > pt0.oro);
t('24.03 el premio nombra la liga', pt0.liga === 'Oro');
t('la liga alta paga más que la baja', L.premioTemporada(5, 2).oro > L.premioTemporada(1, 2).oro);

/* ============ 4. POZO Y RAKE (22.02, 23.06) ============ */
t('22.02 el rake es del 5%', casi(ECO.PVP_RAKE, 0.05));
const pozo32 = PP.calcularPozo(2500, 32);
t('22.02 recaudado = entrada × plazas', pozo32.recaudado === 2500 * 32);
t('22.02 el rake es el 5% de lo recaudado', pozo32.rake === Math.round(80000 * 0.05));
t('22.02 el pozo es lo recaudado menos el rake', pozo32.pozo === 80000 - 4000);
t('22.02 el pozo es menor que lo recaudado', pozo32.pozo < pozo32.recaudado);
// el ejemplo del plan: 3200 de entradas → 3040 de pozo
t('22.02 el ejemplo del plan cuadra (3200 → 3040)', PP.calcularPozo(100, 32).pozo === 3040);
t('24.12 el multiplicador XL agranda el pozo',
  PP.calcularPozo(2500, 32, 1.5).pozo > pozo32.pozo);

t('23.06 el reparto base es de 7 puestos', PP.REPARTO.length === 7);
t('23.06 los porcentajes son 40/22/14/8/6/5/5',
  PP.REPARTO.map(r => Math.round(r.pct * 100)).join('/') === '40/22/14/8/6/5/5');
t('23.06 el reparto suma 100%', casi(PP.REPARTO.reduce((a, r) => a + r.pct, 0), 1.0, 1e-9));
t('23.06 el campeón se lleva la parte dominante', PP.REPARTO[0].pct >= 0.40);
t('23.06 el reparto es decreciente',
  PP.REPARTO.every((r, i) => i === 0 || r.pct <= PP.REPARTO[i - 1].pct));

// 23.07 los eliminados temprano no cobran: los premiados escalan con el cuadro
t('23.07 el cuadro de 8 premia solo a 2', PP.premiadosDe(8) === 2);
t('23.07 el cuadro de 16 premia a 4', PP.premiadosDe(16) === 4);
t('23.06 el cuadro de 32 premia a 7', PP.premiadosDe(32) === 7);
t('23.07 el top 7 es el techo aunque el cuadro sea de 64', PP.premiadosDe(64) === 7);
t('23.07 en todo cuadro cobra menos de la mitad',
  [8, 16, 32, 64].every(p => PP.premiadosDe(p) < p / 2));
for (const plazas of [8, 16, 32, 64]) {
  t(`el reparto de ${plazas} suma 100%`,
    casi(PP.repartoDe(plazas).reduce((a, r) => a + r.pct, 0), 1.0, 1e-9));
  t(`el reparto de ${plazas} es decreciente`,
    PP.repartoDe(plazas).every((r, i) => i === 0 || r.pct <= PP.repartoDe(plazas)[i - 1].pct));
}

const tabla = PP.tablaPremios(2500, 32);
t('22.12 la tabla lista todos los premiados', tabla.length === PP.premiadosDe(32));
t('22.12 la tabla dice si recuperas la entrada', tabla.every(f => typeof f.rentable === 'boolean'));
t('22.12 el campeón siempre recupera la entrada', tabla[0].rentable === true);
t('22.12 los premios de la tabla suman el pozo',
  Math.abs(tabla.reduce((a, f) => a + f.oro, 0) - pozo32.pozo) <= tabla.length);

t('23.07 fuera del top no hay premio', PP.premioDePuesto(20, 2500, 32) === 0);
t('23.07 el 8º de un cuadro de 32 no cobra', PP.premioDePuesto(8, 2500, 32) === 0);
t('23.07 el 3º de un cuadro de 8 no cobra', PP.premioDePuesto(3, 100, 8) === 0);
t('el campeón cobra el 40% del pozo de 32',
  PP.premioDePuesto(1, 2500, 32) === Math.round(pozo32.pozo * 0.40));

/* puestos por ronda */
t('el campeón es el puesto 1', PP.puestoPorRonda(null, 32) === 1);
t('perder la final da el puesto 2', PP.puestoPorRonda(5, 32) === 2);
t('perder la semifinal da el puesto 3', PP.puestoPorRonda(4, 32) === 3);
t('perder cuartos da el puesto 5', PP.puestoPorRonda(3, 32) === 5);
t('caer en la ronda 1 de 32 da el puesto 17', PP.puestoPorRonda(1, 32) === 17);
t('caer en ronda 1 nunca da premio', PP.premioDePuesto(PP.puestoPorRonda(1, 32), 2500, 32) === 0);
t('el puesto empeora cuanto antes caes',
  PP.puestoPorRonda(1, 32) > PP.puestoPorRonda(3, 32));
t('en un cuadro de 8, caer en ronda 1 da el puesto 5', PP.puestoPorRonda(1, 8) === 5);

/* balance */
const balC = PP.balanceTorneo({ puesto: 1, buyIn: 2500, plazas: 32 });
const balP = PP.balanceTorneo({ puesto: 20, buyIn: 2500, plazas: 32 });
t('el balance del campeón es positivo', balC.neto > 0 && balC.campeon);
t('23.07 el eliminado pierde exactamente la entrada', balP.neto === -2500 && !balP.premiado);
t('el balance marca si hubo premio', balC.premiado === true);

/* Sugerencia #3: riesgo */
t('Sug#3 gastar todo el saldo es riesgo alto', PP.riesgoBuyIn(900, 1000).nivel === 'alto');
t('Sug#3 una entrada pequeña es riesgo bajo', PP.riesgoBuyIn(50, 1000).nivel === 'bajo');
t('Sug#3 sin saldo suficiente es imposible', PP.riesgoBuyIn(2000, 1000).nivel === 'imposible');
t('Sug#3 el riesgo trae texto explicativo',
  PP.riesgoBuyIn(500, 1000).texto.length > 10);
t('Sug#3 el riesgo medio está entre medias', PP.riesgoBuyIn(300, 1000).nivel === 'medio');

/* ============ 5. RIVALES CPU (22.04, 24.04, 24.05) ============ */
const stats = {}; for (const k of CLAVES_STATS) stats[k] = 40;
const rngG = rngDe('test', 1);
const fantasmas = G.llenarCuadro(rngG, 31, { nivelHeroe: 20, statsHeroe: stats });

t('22.04 se rellenan todas las plazas pedidas', fantasmas.length === 31);
t('22.04 los CPU tienen nombres creíbles, no CPU_n',
  fantasmas.every(f => f.nombre && !/^(cpu|bot)/i.test(f.nombre) && f.nombre.length > 3));
t('22.04 los nombres del cuadro son únicos',
  new Set(fantasmas.map(f => f.nombre)).size === fantasmas.length);
t('24.04 cada CPU tiene clase', fantasmas.every(f => CLAVES_CLASES.includes(f.clase)));
t('24.04 cada CPU tiene apodo', fantasmas.every(f => f.apodo && f.apodo.length > 2));
t('24.04 cada CPU tiene procedencia', fantasmas.every(f => f.procedencia));
t('24.04 cada CPU tiene icono y color', fantasmas.every(f => f.ico && f.color));
t('24.04 hay variedad de clases en el cuadro',
  new Set(fantasmas.map(f => f.clase)).size >= 4);
t('los CPU están marcados como cpu', fantasmas.every(f => f.cpu === true));
t('los CPU tienen poder calculado', fantasmas.every(f => f.poder > 0));
t('los CPU llevan id único', new Set(fantasmas.map(f => f.id)).size === fantasmas.length);

// 24.05 el 10% son tiburones
let tiburones = 0, total = 0;
for (let s = 0; s < 60; s++) {
  const r = rngDe('tib', s);
  for (const f of G.llenarCuadro(r, 20, { nivelHeroe: 20, statsHeroe: stats })) {
    total++; if (f.tiburon) tiburones++;
  }
}
const pctTib = tiburones / total;
t('24.05 alrededor del 10% son tiburones', pctTib > 0.05 && pctTib < 0.16);
t('24.05 el tiburón es más fuerte', G.MULT_TIBURON > 1);
t('24.05 la probabilidad de tiburón es del 10%', casi(G.PROB_TIBURON, 0.10));

// 24.11 sin ELO en la ficha
const ficha = G.fichaDe(fantasmas[0]);
t('Sug#2 la ficha trae nombre, clase y poder',
  ficha.nombre && ficha.clase && ficha.poder > 0);
t('24.11 la ficha NO expone ningún rating/ELO',
  !('elo' in ficha) && !('rating' in ficha));
t('24.05 la ficha NO revela si es tiburón', !('tiburon' in ficha));
t('Sug#2 la ficha trae vida y daño para comparar', ficha.vidaMax > 0 && ficha.dano > 0);
t('fichaDe(null) no rompe', G.fichaDe(null) === null);

const heroe = crearLuchador({ nombre: 'Yo', clase: 'bestia', nivel: 20, stats });
const cmp = G.compararCon(heroe, fantasmas[0]);
t('Sug#2 la comparación da veredicto y tono', cmp.veredicto && cmp.tono);
const fuerte = { poder: heroe.poder * 2 };
const debil = { poder: heroe.poder * 0.5 };
t('Sug#2 detecta al rival muy superior', G.compararCon(heroe, fuerte).tono === 'mal');
t('Sug#2 detecta al rival muy inferior', G.compararCon(heroe, debil).tono === 'ok');
t('Sug#2 un clon es "parejo"', G.compararCon(heroe, { poder: heroe.poder }).veredicto === 'Parejo contigo');

/* ============ 6. EL CUADRO (23.01, 24.06, 23.11) ============ */
const opc = { semilla: 4242, nivelHeroe: 20, statsHeroe: stats };
const c32 = BR.sortearCuadro(heroe, salaOro, opc);

t('el cuadro tiene tantos participantes como plazas', c32.participantes.length === 32);
t('el jugador está en el cuadro', c32.participantes.filter(p => p.esJugador).length === 1);
t('hay 31 CPU y 1 jugador', c32.participantes.filter(p => p.cpu).length === 31);
t('23.05 el cuadro de 32 tiene 5 rondas', c32.totalRondas === 5);
t('23.05 las rondas van 16→8→4→2→1',
  c32.rondas.map(r => r.length).join(',') === '16,8,4,2,1');
t('la ronda 1 tiene a todos emparejados',
  c32.rondas[0].every(l => l.a && l.b));
t('las rondas futuras empiezan vacías',
  c32.rondas.slice(1).every(r => r.every(l => !l.a && !l.b)));
t('empieza en la ronda 1', c32.rondaActual === 1);
t('el torneo empieza sin terminar', !c32.terminado && !c32.eliminado);
t('exactamente una llave es del jugador',
  c32.rondas[0].filter(l => l.esDelJugador).length === 1);

// 24.06 sorteo puro: la posición del jugador varía
const posiciones = new Set();
for (let s = 0; s < 40; s++) {
  const cc = BR.sortearCuadro(heroe, salaOro, { ...opc, semilla: s * 71 + 3 });
  posiciones.add(cc.rondas[0].findIndex(l => l.esDelJugador));
}
t('24.06 sorteo puro: el jugador cae en llaves distintas', posiciones.size >= 8);
t('24.06 sin seeds: no siempre en la llave 0', !(posiciones.size === 1 && posiciones.has(0)));
t('el sorteo es determinista con la misma semilla',
  BR.sortearCuadro(heroe, salaOro, opc).participantes.map(p => p.nombre).join() ===
  c32.participantes.map(p => p.nombre).join());

t('rivalActual devuelve un oponente', BR.rivalActual(c32) !== null);
t('el rival actual no soy yo', BR.rivalActual(c32).esJugador !== true);
t('el nombre de la ronda 1 de 32 es Dieciseisavos', BR.nombreRondaActual(c32) === 'Dieciseisavos');
t('23.05 la última ronda es la final', BR.esFinal(c32, 5) === true);
t('la ronda 1 no es la final', BR.esFinal(c32, 1) === false);

/* 23.11 mi mitad */
const mitad = BR.miMitad(c32);
t('23.11 la mitad tiene una entrada por ronda', mitad.length === c32.totalRondas);
t('23.11 la mitad de la ronda 1 es la mitad de las llaves', mitad[0].length === 8);
t('23.11 la mitad se estrecha ronda a ronda',
  mitad.map(r => r.length).join(',') === '8,4,2,1,1');
t('23.11 el jugador está en su mitad', mitad[0].some(l => l.esDelJugador));
t('23.11 la mitad muestra menos que el cuadro entero',
  mitad[0].length < c32.rondas[0].length);
for (let s = 0; s < 20; s++) {
  const cc = BR.sortearCuadro(heroe, salaOro, { ...opc, semilla: s * 313 + 11 });
  const m = BR.miMitad(cc);
  if (!m[0].some(l => l.esDelJugador)) { t('23.11 el jugador siempre aparece en su mitad', false); break; }
  if (s === 19) t('23.11 el jugador siempre aparece en su mitad', true);
}

/* ============ 7. AVANCE Y RESOLUCIÓN ============ */
const cJuego = BR.sortearCuadro(heroe, salaOro, { ...opc, semilla: 777 });
BR.jugarRonda(cJuego);
t('tras jugar, todas las llaves tienen ganador',
  cJuego.rondas[0].every(l => l.jugada && l.ganador));
t('el ganador es uno de los dos contendientes',
  cJuego.rondas[0].every(l => l.ganador === l.a || l.ganador === l.b));
t('cada llave registra su perdedor',
  cJuego.rondas[0].every(l => l.perdedor && l.perdedor !== l.ganador));

const av = BR.avanzarRonda(cJuego);
t('el avance funciona', av.ok === true);
t('pasa a la ronda 2', cJuego.rondaActual === 2);
t('23.01 la ronda 2 se llena con los 16 ganadores',
  cJuego.rondas[1].every(l => l.a && l.b));
t('23.01 eliminación simple: los perdedores no reaparecen',
  cJuego.rondas[1].every(l =>
    !cJuego.rondas[0].some(p => p.perdedor === l.a || p.perdedor === l.b)));
t('no se puede avanzar con la ronda incompleta',
  BR.avanzarRonda(cJuego).ok === false);

/* torneo completo */
const cFull = BR.sortearCuadro(heroe, salaOro, { ...opc, semilla: 999 });
BR.simularTorneoCompleto(cFull);
t('el torneo completo termina', cFull.terminado === true);
t('hay un campeón', cFull.campeon !== null);
t('la final se jugó', cFull.rondas[4][0].jugada === true);
t('el campeón es el ganador de la final', cFull.campeon === cFull.rondas[4][0].ganador);
t('o eres campeón o fuiste eliminado',
  cFull.campeon.esJugador ? !cFull.eliminado : cFull.eliminado);
t('si te eliminaron, consta la ronda',
  !cFull.eliminado || (cFull.rondaEliminado >= 1 && cFull.rondaEliminado <= 5));

/* 23.05 la final al mejor de 3 */
let finalesConVarias = 0, finalesTotal = 0;
for (let s = 0; s < 25; s++) {
  const cc = BR.sortearCuadro(heroe, salaOro, { ...opc, semilla: s * 97 + 5 });
  BR.simularTorneoCompleto(cc);
  const f = cc.rondas[4][0];
  if (f.resultado) {
    finalesTotal++;
    if (f.resultado.repeticiones >= 2) finalesConVarias++;
    const vencedor = Math.max(f.resultado.vA, f.resultado.vB);
    if (vencedor < 2) { t('23.05 la final se gana a 2 caídas', false); break; }
  }
}
t('23.05 la final se gana a 2 caídas', true);
t('23.05 la final requiere al menos 2 luchas', finalesConVarias === finalesTotal && finalesTotal > 0);

/* 23.08 empate = se repite */
const llaveEmp = { a: heroe, b: fantasmas[0], ronda: 1, indice: 0, jugada: false };
BR.resolverLlave(llaveEmp, rngDe('emp', 1), { alMejorDe: 1 });
t('23.08 la llave siempre acaba con un ganador', llaveEmp.ganador !== null);
t('23.08 nunca queda un empate sin resolver',
  llaveEmp.resultado.vA !== llaveEmp.resultado.vB);
t('23.08 los empates se contabilizan como repetición',
  llaveEmp.resultado.empatesRepetidos === llaveEmp.resultado.caidas.filter(c => c.repetida).length);

/* lucha del jugador registrada aparte (23.02) */
const cMano = BR.sortearCuadro(heroe, salaOro, { ...opc, semilla: 555 });
const llaveMia = BR.llaveDelJugador(cMano);
BR.registrarLuchaDelJugador(cMano, true);
t('23.02 la lucha del jugador se registra a mano', llaveMia.jugada === true);
t('23.02 ganando, el jugador es el ganador de su llave', llaveMia.ganador.esJugador === true);
BR.jugarRonda(cMano);
t('23.03 el resto de la ronda se resuelve solo',
  cMano.rondas[0].every(l => l.jugada));
t('23.02 la llave del jugador no se re-resolvió', llaveMia.ganador.esJugador === true);
BR.avanzarRonda(cMano);
t('el jugador avanza a la ronda 2', !cMano.eliminado && cMano.rondaActual === 2);

const cPierde = BR.sortearCuadro(heroe, salaOro, { ...opc, semilla: 556 });
BR.registrarLuchaDelJugador(cPierde, false);
BR.jugarRonda(cPierde);
BR.avanzarRonda(cPierde);
t('22.08 perdiendo quedas eliminado', cPierde.eliminado === true);
t('consta que caíste en la ronda 1', cPierde.rondaEliminado === 1);
t('el eliminado ya no aparece en la ronda 2',
  !cPierde.rondas[1].some(l => l.a?.esJugador || l.b?.esJugador));
BR.simularTorneoCompleto(cPierde);
t('el torneo sigue sin ti hasta el campeón', cPierde.terminado && cPierde.campeon);
t('22.08 sin reentrada: sigues eliminado al final', cPierde.eliminado === true);

/* camino del jugador */
const camino = BR.caminoDelJugador(cFull);
t('el camino lista las luchas jugadas', camino.length >= 1);
t('cada paso del camino nombra la ronda y el rival',
  camino.every(c => c.nombreRonda && c.rival));
t('el camino solo tiene una derrota como mucho',
  camino.filter(c => !c.gano).length <= 1);
t('si perdiste, fue en la última lucha del camino',
  camino.every((c, i) => c.gano || i === camino.length - 1));

/* ============ 8. CUADROS DE OTROS TAMAÑOS ============ */
for (const [nLiga, plazas] of [[1, 8], [2, 16], [3, 32]]) {
  const sala = L.construirSala(nLiga, 'oro', false);
  const cc = BR.sortearCuadro(heroe, sala, { ...opc, semilla: nLiga * 1000 });
  t(`el cuadro de ${plazas} tiene ${Math.log2(plazas)} rondas`, cc.totalRondas === Math.log2(plazas));
  BR.simularTorneoCompleto(cc);
  t(`el cuadro de ${plazas} termina con campeón`, cc.terminado && cc.campeon);
  t(`el cuadro de ${plazas} deja una sola llave final`, cc.rondas[cc.rondas.length - 1].length === 1);
  const p = PP.puestoPorRonda(cc.rondaEliminado, plazas);
  t(`el puesto en el cuadro de ${plazas} es válido`, p >= 1 && p <= plazas);
}
const cXL = BR.sortearCuadro(heroe, xl, { ...opc, semilla: 31337 });
t('24.12 el cuadro XL tiene 64 participantes', cXL.participantes.length === 64);
t('24.12 el XL tiene 6 rondas', cXL.totalRondas === 6);
BR.simularTorneoCompleto(cXL);
t('24.12 el XL termina correctamente', cXL.terminado && cXL.campeon);

/* ============ 9. ESTADO ============ */
t('el estado tiene la rama pvp', ST.S.pvp && typeof ST.S.pvp === 'object');
t('arranca en la liga 1', ST.S.pvp.liga === 1);
t('arranca sin torneo activo', ST.S.pvp.torneoActivo === null);
t('24.02 lleva la cuenta de torneos de la semana', ST.S.pvp.torneosSemana === 0);
t('24.02 lleva la cuenta de torneos ganados', ST.S.pvp.ganadosSemana === 0);
t('23.15 solo se guarda el último torneo, no un historial',
  'ultimoTorneo' in ST.S.pvp && !('historial' in ST.S.pvp));
t('la carrera cuenta torneos jugados', typeof ST.S.carrera.torneosJugados === 'number');
t('la carrera cuenta torneos ganados', typeof ST.S.carrera.torneosGanados === 'number');
t('22.09 la constante de nivel mínimo es 10', PROG.NIVEL_MIN_PVP === 10);

/* ============ 10. EQUILIBRIO ECONÓMICO ============ */
/* Un jugador medio no debe barrer ni arruinarse: con un rake del 5%
   el ROI esperado ronda el equilibrio negativo suave. */
for (const [nLiga, etiqueta] of [[1, 'Bronce(8)'], [3, 'Oro(32)']]) {
  const sala = L.construirSala(nLiga, 'oro', false);
  let camp = 0, neto = 0, n = 120;
  for (let s = 0; s < n; s++) {
    const cc = BR.sortearCuadro(heroe, sala, { ...opc, semilla: s * 811 + 17 });
    BR.simularTorneoCompleto(cc);
    const p = PP.puestoPorRonda(cc.rondaEliminado, sala.cuadro);
    if (p === 1) camp++;
    neto += PP.balanceTorneo({ puesto: p, buyIn: sala.buyIn, plazas: sala.cuadro }).neto;
  }
  const roi = (neto / n) / sala.buyIn;
  const pctCamp = camp / n;
  t(`equilibrio ${etiqueta}: el jugador gana algún torneo`, pctCamp > 0.002);
  t(`equilibrio ${etiqueta}: no domina el cuadro`, pctCamp < 0.55);
  t(`equilibrio ${etiqueta}: el ROI no es un chollo (${(roi * 100).toFixed(0)}%)`, roi < 1.2);
  t(`equilibrio ${etiqueta}: el ROI no es una ruina`, roi > -0.75);
}
t('la banda de los CPU está calibrada cerca del jugador',
  BR.BANDA_CPU > 0.85 && BR.BANDA_CPU <= 1.0);

console.log(`\n${mal === 0 ? '✅' : '⚠️'} Paso 12: ${ok} correctas, ${mal} fallidas`);
process.exit(mal === 0 ? 0 : 1);
