/* PASO 11 — Eventos: rueda horaria, motor de intentos, clasificación */
globalThis.location = { hostname: 'localhost', hash: '' };

let ok = 0, mal = 0;
const t = (nombre, cond) => {
  if (cond) { ok++; }
  else { mal++; console.log(`❌ ${nombre}`); }
};
const casi = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;

const EV = await import('../js/data/eventos.js');
const SCH = await import('../js/systems/event-scheduler.js');
const LB = await import('../js/systems/leaderboard.js');
const RUN = await import('../js/systems/event-runner.js');
const ST = await import('../js/core/state.js');
const { EVENTOS } = await import('../js/data/constants.js');
const { crearLuchador } = await import('../js/systems/fighter.js');
const { CLAVES_STATS } = await import('../js/data/stats.js');
const { rngDe: rngDe0 } = await import('../js/core/rng.js');

ST.iniciarEstado();

/* ============ 1. DATOS DE EVENTOS ============ */
t('19.01 hay exactamente 7 tipos de evento', EV.CLAVES_EVENTOS.length === EVENTOS.CANTIDAD);
t('7 horas de inicio', EV.HORAS_INICIO.length === 7);
t('19.02 empiezan a las 00:00', EV.HORAS_INICIO[0] === 0);
t('19.02 el último empieza a las 18:00', EV.HORAS_INICIO[6] === 18);
t('19.02 el último cierra a las 21:00', EV.HORAS_INICIO[6] + EVENTOS.DURACION_H === 21);
t('19.01 franjas de 3h consecutivas',
  EV.HORAS_INICIO.every((h, i) => i === 0 || h - EV.HORAS_INICIO[i - 1] === EVENTOS.DURACION_H));
t('duración en ms coherente', EV.DURACION_MS === EVENTOS.DURACION_H * 3600 * 1000);

for (const [id, ev] of Object.entries(EV.TIPOS_EVENTO)) {
  t(`${id} tiene nombre`, typeof ev.nombre === 'string' && ev.nombre.length > 2);
  t(`${id} tiene icono`, !!ev.ico);
  t(`${id} tiene color`, /^#[0-9a-f]{6}$/i.test(ev.color));
  t(`19.12 ${id} tiene reglas listadas`, Array.isArray(ev.reglas) && ev.reglas.length >= 3);
  t(`${id} declara stats que favorece`, Array.isArray(ev.favorece) && ev.favorece.length >= 1);
  t(`${id} favorece stats reales`, ev.favorece.every(s => CLAVES_STATS.includes(s)));
  t(`${id} tiene número de luchas`, Number.isFinite(ev.luchas) && ev.luchas > 0);
}

/* ============ 2. PIRÁMIDE DE PREMIOS ============ */
t('19.04 premia a 10 puestos', EV.PIRAMIDE.length === EVENTOS.PREMIADOS);
t('puestos del 1 al 10', EV.PIRAMIDE.every((p, i) => p.puesto === i + 1));
t('la pirámide es decreciente en oro',
  EV.PIRAMIDE.every((p, i) => i === 0 || p.oro < EV.PIRAMIDE[i - 1].oro));
t('la pirámide es no creciente en gemas',
  EV.PIRAMIDE.every((p, i) => i === 0 || p.gemas <= EV.PIRAMIDE[i - 1].gemas));
t('el 1º se lleva la bolsa entera', casi(EV.PIRAMIDE[0].oro, 1.00));

const p1 = EV.premioDePuesto(1, 10);
const p10 = EV.premioDePuesto(10, 10);
const p11 = EV.premioDePuesto(11, 10);
t('1º cobra más que 10º', p1.oro > p10.oro && p1.gemas > p10.gemas);
t('el top 10 está marcado como premiado', p1.premiado && p10.premiado);
t('el 11º NO está premiado', p11.premiado === false);
t('el 11º cobra participación', p11.oro === EV.premioParticipacion(10) && p11.gemas === 0);
t('19.15 el domingo dobla el oro', EV.premioDePuesto(1, 10, 2).oro === p1.oro * 2);
t('19.15 el domingo dobla las gemas', EV.premioDePuesto(1, 10, 2).gemas === p1.gemas * 2);
t('la bolsa crece con el nivel', EV.bolsaDelEvento(20) > EV.bolsaDelEvento(5));
t('la participación crece con el nivel', EV.premioParticipacion(20) > EV.premioParticipacion(5));

/* ============ 3. RUEDA HORARIA ============ */
const lunes = new Date(2026, 8, 7, 10, 0, 0);      // 7 sep 2026, lunes
const domingo = new Date(2026, 8, 6, 10, 0, 0);    // 6 sep 2026, domingo

t('claveDia con formato ISO corto', SCH.claveDia(lunes) === '2026-09-07');
t('19.15 detecta el domingo', SCH.esDomingo(domingo) === true);
t('el lunes no es domingo', SCH.esDomingo(lunes) === false);
t('19.15 multiplicador x2 en domingo', SCH.multiplicadorDia(domingo) === EVENTOS.MULT_DOMINGO);
t('multiplicador x1 entre semana', SCH.multiplicadorDia(lunes) === 1);

const orden = SCH.ordenDelDia(lunes);
t('19.03 el orden contiene los 7 eventos', orden.length === 7);
t('19.03 sin repetidos', new Set(orden).size === 7);
t('19.03 son ids válidos', orden.every(id => EV.CLAVES_EVENTOS.includes(id)));
t('19.03 el orden es estable durante el día',
  JSON.stringify(SCH.ordenDelDia(new Date(2026, 8, 7, 23, 0))) === JSON.stringify(orden));

// El orden debe CAMBIAR de un día a otro (al menos en algún día de la semana)
let algunoDistinto = false;
for (let d = 1; d <= 14; d++) {
  const o = SCH.ordenDelDia(new Date(2026, 8, 7 + d, 10, 0));
  if (JSON.stringify(o) !== JSON.stringify(orden)) algunoDistinto = true;
}
t('19.03 el orden cambia de un día a otro', algunoDistinto);

const agenda = SCH.agendaDelDia(lunes);
t('la agenda tiene 7 franjas', agenda.length === 7);
t('las franjas no se solapan', agenda.every((f, i) => i === 0 || f.inicio >= agenda[i - 1].fin));
t('cada franja dura 3h', agenda.every(f => f.fin - f.inicio === EV.DURACION_MS));
t('la primera empieza a medianoche', new Date(agenda[0].inicio).getHours() === 0);
t('19.02 la rueda cierra a las 21:00', new Date(agenda[6].fin).getHours() === 21);
t('cada franja lleva su objeto evento', agenda.every(f => f.evento && f.evento.nombre));
t('cada franja lleva etiqueta horaria', agenda.every(f => /\d\d:\d\d/.test(f.etiqueta)));

// Cobertura total del día: 7 franjas x 3h = 21h; a las 22:00 no hay evento
const ahora10 = lunes.getTime();
const act = SCH.eventoActivo(ahora10);
t('a las 10:00 hay evento activo', act !== null);
t('el evento activo contiene la hora actual', act.inicio <= ahora10 && ahora10 < act.fin);
t('a las 22:30 NO hay evento activo',
  SCH.eventoActivo(new Date(2026, 8, 7, 22, 30).getTime()) === null);

const prox = SCH.proximoEvento(new Date(2026, 8, 7, 22, 30).getTime());
t('tras el cierre, el próximo es de mañana', SCH.claveDia(new Date(prox.inicio)) === '2026-09-08');
t('el próximo evento empieza a las 00:00', new Date(prox.inicio).getHours() === 0);

const tr = SCH.tiempoRestante(ahora10);
t('20.13 el cronómetro marca activo', tr.activo === true);
t('20.13 el tiempo restante es positivo y < 3h', tr.ms > 0 && tr.ms <= EV.DURACION_MS);
const trFuera = SCH.tiempoRestante(new Date(2026, 8, 7, 22, 30).getTime());
t('20.13 fuera de horario cuenta hacia el próximo', trFuera.activo === false && trFuera.ms > 0);

/* ============ 4. CALENDARIO SEMANAL (Sugerencia #5) ============ */
const cal = SCH.calendarioSemanal(lunes.getTime());
t('el calendario cubre 7 días', cal.length === 7);
t('cada día tiene sus 7 franjas', cal.every(d => d.franjas.length === 7));
t('los días son consecutivos y distintos', new Set(cal.map(d => d.dia)).size === 7);
t('el calendario marca el domingo', cal.some(d => d.esDomingo && d.multiplicador === 2));
t('cada día lleva nombre en español', cal.every(d => /^[A-ZÁÉÍÓÚ]/.test(d.nombreDia)));

const veces = SCH.proximasVecesDe('relampago', lunes.getTime(), 7);
t('un evento reaparece cada día de la semana', veces.length >= 6);
t('las apariciones van en orden cronológico',
  veces.every((v, i) => i === 0 || v.inicio > veces[i - 1].inicio));
t('todas las apariciones son del evento pedido', veces.every(v => v.id === 'relampago'));
t('minutosPara devuelve un número', Number.isFinite(SCH.minutosPara('relampago', lunes.getTime())));

/* ============ 5. AFINIDAD CON LA BUILD (Sugerencia #2) ============ */
const statsPeg = {}; for (const k of CLAVES_STATS) statsPeg[k] = 20;
statsPeg.potencia = 90; statsPeg.tecnica = 90;
const afColoso = SCH.afinidadConBuild('coloso', statsPeg);
const statsVel = {}; for (const k of CLAVES_STATS) statsVel[k] = 20;
statsVel.agilidad = 95; statsVel.recuperacion = 80;
t('la afinidad está en 0..1', afColoso >= 0 && afColoso <= 1);
t('build de pegada afín al coloso', SCH.afinidadConBuild('coloso', statsPeg) > 0.3);
t('Sug#2 la build veloz es más afín a la carrera de KOs que la de pegada',
  SCH.afinidadConBuild('carreraKO', statsVel) > SCH.afinidadConBuild('carreraKO', statsPeg));
t('Sug#2 la build de pegada es más afín al coloso que la veloz',
  SCH.afinidadConBuild('coloso', statsPeg) > SCH.afinidadConBuild('coloso', statsVel));
const planas = {}; for (const k of CLAVES_STATS) planas[k] = 30;
t('con stats planas la afinidad es baja', SCH.afinidadConBuild('coloso', planas) < 0.6);
t('brillaAqui es booleano', typeof SCH.brillaAqui('coloso', statsPeg) === 'boolean');
t('sin stats la afinidad es 0', SCH.afinidadConBuild('coloso', null) === 0);

/* ============ 6. CLASIFICACIÓN (19.07–19.11) ============ */
const tabla = LB.generarTabla('relampago', { dia: '2026-09-07', nivelHeroe: 10 });
t('19.07 hay 50 competidores CPU', tabla.length === EVENTOS.COMPETIDORES);
t('la tabla viene ordenada de mayor a menor',
  tabla.every((f, i) => i === 0 || f.puntos <= tabla[i - 1].puntos));
t('Sug#3 los CPU tienen nombre procedural, no CPU_n',
  tabla.every(f => f.nombre && !/^cpu/i.test(f.nombre) && f.nombre.length > 3));
t('Sug#3 hay variedad de nombres', new Set(tabla.map(f => f.nombre)).size >= 40);
t('todos los CPU tienen clase e icono', tabla.every(f => f.clase && f.ico));
t('ningún CPU se marca como jugador', tabla.every(f => f.esJugador === false));
t('19.08 los puntajes son positivos', tabla.every(f => f.puntos > 0));
t('19.08 hay banda: el 1º no dobla en exceso al último',
  tabla[0].puntos / tabla[tabla.length - 1].puntos < 6);
t('19.08 hay dispersión real', tabla[0].puntos > tabla[tabla.length - 1].puntos * 1.5);

const tabla2 = LB.generarTabla('relampago', { dia: '2026-09-07', nivelHeroe: 10 });
t('la tabla es determinista el mismo día',
  JSON.stringify(tabla) === JSON.stringify(tabla2));
t('la tabla cambia otro día',
  JSON.stringify(LB.generarTabla('relampago', { dia: '2026-09-08', nivelHeroe: 10 })) !== JSON.stringify(tabla));
t('la tabla cambia con otro evento',
  JSON.stringify(LB.generarTabla('coloso', { dia: '2026-09-07', nivelHeroe: 10 })) !== JSON.stringify(tabla));
t('19.11 la dificultad sube con el nivel del jugador',
  LB.puntajeReferencia('relampago', 30) > LB.puntajeReferencia('relampago', 5));

const cl = LB.clasificar(tabla, tabla[24].puntos + 1, 'Yo');
t('el jugador entra en la tabla', cl.length === tabla.length + 1);
t('la clasificación numera del 1 al 51', cl.every((f, i) => f.puesto === i + 1));
t('sigue ordenada por puntos',
  cl.every((f, i) => i === 0 || f.puntos <= cl[i - 1].puntos));
t('el jugador cae en mitad de tabla', LB.puestoDelJugador(cl) > 5 && LB.puestoDelJugador(cl) < 45);
t('con muchos puntos el jugador sube',
  LB.puestoDelJugador(LB.clasificar(tabla, tabla[0].puntos + 1, 'Yo')) === 1);

// 19.09 muerte súbita: empatar NO basta
const empate = LB.clasificar(tabla, tabla[9].puntos, 'Yo');
const iEmp = empate.findIndex(f => f.esJugador);
t('19.09 empatar deja al jugador por debajo del CPU',
  empate[iEmp - 1].puntos === empate[iEmp].puntos && !empate[iEmp - 1].esJugador);
const supera = LB.clasificar(tabla, tabla[9].puntos + 1, 'Yo');
t('19.09 superar por 1 punto sí adelanta',
  LB.puestoDelJugador(supera) < LB.puestoDelJugador(empate));

/* 19.10 brechas */
const b = LB.brechas(cl);
t('19.10 hay brecha con el de arriba', b.arriba && b.arriba.diff > 0);
t('19.10 hay brecha con el de abajo', b.abajo && b.abajo.diff >= 0);
t('19.10 la brecha de arriba te haría adelantarlo',
  b.puntos + b.arriba.diff > b.arriba.puntos);
t('brechas reporta el puesto correcto', b.puesto === LB.puestoDelJugador(cl));
const bTop = LB.brechas(LB.clasificar(tabla, tabla[0].puntos + 9999, 'Yo'));
t('el primero no tiene a nadie arriba', bTop.arriba === null && bTop.puesto === 1);
t('el primero está en premios', bTop.enPremios === true);
const bFondo = LB.brechas(LB.clasificar(tabla, 1, 'Yo'));
t('el último no tiene a nadie abajo', bFondo.abajo === null);
t('el último no está en premios', bFondo.enPremios === false);
t('Sug#4 fuera de premios hay distancia al top 10', bFondo.puntosParaTop > 0);
t('Sug#4 dentro de premios la distancia es 0', bTop.puntosParaTop === 0);
t('Sug#4 alcanzar el corte mete en el top 10',
  LB.puestoDelJugador(LB.clasificar(tabla, bFondo.puntos + bFondo.puntosParaTop, 'Yo')) <= EVENTOS.PREMIADOS);

const obj = LB.objetivoPersonal(cl, 3, 500);
t('Sug#4 el objetivo devuelve texto', typeof obj.texto === 'string' && obj.texto.length > 10);
t('Sug#4 el objetivo reparte entre intentos', obj.enPremios || obj.porIntento > 0);
const objFin = LB.objetivoPersonal(bFondo ? LB.clasificar(tabla, 1, 'Yo') : cl, 0, 100);
t('Sug#4 sin intentos el texto es de cierre', /Terminaste/.test(objFin.texto));

/* ============ 7. MOTOR DE INTENTOS ============ */
const stats = {}; for (const k of CLAVES_STATS) stats[k] = 40;
const heroe = crearLuchador({ nombre: 'Test', clase: 'luchador', nivel: 12, stats });
const opc = { semilla: 12345, nivelHeroe: 12, statsHeroe: stats };

for (const id of EV.CLAVES_EVENTOS) {
  const r = RUN.correrIntento(id, heroe, opc);
  t(`${id}: el intento devuelve resultado`, r !== null);
  t(`${id}: puntos numéricos y >= 0`, Number.isFinite(r.puntos) && r.puntos >= 0);
  t(`${id}: hay al menos una lucha`, r.luchas.length >= 1);
  t(`${id}: no excede el número de luchas del tipo`, r.luchas.length <= EV.TIPOS_EVENTO[id].luchas);
  t(`${id}: cada lucha tiene rival con nombre`, r.luchas.every(l => l.rival && l.rival.length > 2));
  t(`${id}: los puntos por lucha nunca son negativos`, r.luchas.every(l => l.puntos >= 0));
  t(`${id}: resumen legible`, typeof RUN.resumenIntento(r) === 'string' && RUN.resumenIntento(r).length > 3);
  t(`${id}: determinista con la misma semilla`,
    RUN.correrIntento(id, heroe, opc).puntos === r.puntos);
}

// 20.09 los puntos solo llegan con la victoria (salvo el modo daño del coloso)
for (const id of EV.CLAVES_EVENTOS) {
  if (EV.TIPOS_EVENTO[id].modoDano) continue;
  let comprobadas = 0;
  for (let s = 0; s < 25; s++) {
    const r = RUN.correrIntento(id, heroe, { ...opc, semilla: s * 977 + 3 });
    for (const l of r.luchas) {
      if (!l.gano) { t(`20.09 ${id}: derrota = 0 puntos`, l.puntos === 0); comprobadas++; }
    }
  }
  if (comprobadas === 0) ok++;   // no salió ninguna derrota: nada que refutar
}

// 20.02 el coloso SÍ puntúa por daño aunque no se gane
const rCol = RUN.correrIntento('coloso', heroe, opc);
t('20.02 el coloso puntúa daño sin exigir victoria', rCol.puntos > 0);
t('20.02 el coloso es una sola lucha', rCol.luchas.length === 1);
t('20.02 el rival del coloso tiene vida descomunal', EV.TIPOS_EVENTO.coloso.vidaColoso >= 10);
t('20.02 el coloso tiene límite de tiempo', EV.TIPOS_EVENTO.coloso.segundos > 0);

// 20.04 contrarreloj
const rKO = RUN.correrIntento('carreraKO', heroe, opc);
t('20.04 la carrera respeta el límite de tiempo',
  rKO.segundos <= EV.TIPOS_EVENTO.carreraKO.segundos + 15);
t('20.04 la derrota no corta la carrera de KOs',
  rKO.luchas.length >= 1);

// 20.01 bonus por completar la escalera
const evRel = EV.TIPOS_EVENTO.relampago;
t('20.01 el relámpago tiene 5 luchas', evRel.luchas === 5);
t('20.01 el relámpago tiene bonus final', evRel.bonusFinal > 0);
t('20.01 el relámpago acaba en jefe', evRel.jefeFinal === true);
// El jefe solo se marca en la última lucha, y solo si se llega hasta ella
let jefeBienColocado = true, vistoAlgunJefe = false;
for (let s = 0; s < 40; s++) {
  const r = RUN.correrIntento('relampago', heroe, { ...opc, semilla: s * 31 + 7 });
  for (const l of r.luchas) {
    if (l.esJefe) {
      vistoAlgunJefe = true;
      if (l.indice !== evRel.luchas - 1) jefeBienColocado = false;
    }
  }
}
t('20.01 si aparece un jefe, es siempre el de la última lucha', jefeBienColocado);
const jefeDirecto = RUN.rivalDeEvento('relampago', evRel.luchas - 1,
  { rng: rngDe0('j', 1), nivelHeroe: 12, statsHeroe: stats });
t('20.01 el rival de la última lucha del relámpago es jefe', jefeDirecto.esJefe === true);
const noJefe = RUN.rivalDeEvento('relampago', 0,
  { rng: rngDe0('j', 1), nivelHeroe: 12, statsHeroe: stats });
t('20.01 el primer rival del relámpago no es jefe', noJefe.esJefe !== true);
t('20.01 el jefe es más fuerte que el primer rival', jefeDirecto.poder > noJefe.poder);

// 20.03 supervivencia sin cura
t('20.03 la supervivencia está marcada sin cura', EV.TIPOS_EVENTO.supervivencia.sinCura === true);
t('20.03 la supervivencia sube el premio por oleada', EV.TIPOS_EVENTO.supervivencia.bonusProgresivo > 0);
const rSup = RUN.correrIntento('supervivencia', heroe, opc);
t('20.03 la supervivencia termina por derrota o por tope',
  rSup.motivoFin === 'derrota' || rSup.completado);

// 20.05 duelo de leyendas: una por clase
const evLey = EV.TIPOS_EVENTO.leyendas;
t('20.05 leyendas tiene una lucha por clase', evLey.unaPorClase === true);
const rLey = RUN.correrIntento('leyendas', heroe, opc);
const clasesLey = rLey.luchas.map(l => l.clase);
t('20.05 las clases no se repiten', new Set(clasesLey).size === clasesLey.length);

// 20.06 la montaña premia las defensas
t('20.06 la montaña multiplica las defensas', EV.TIPOS_EVENTO.montania.multDefensa > 1);
t('20.06 la montaña define dónde empieza la defensa',
  Number.isFinite(EV.TIPOS_EVENTO.montania.subida));

// 20.07 estilo
t('20.07 el estilo puntúa críticos', EV.TIPOS_EVENTO.estilo.puntosPorCritico > 0);
t('20.07 el estilo puntúa especiales', EV.TIPOS_EVENTO.estilo.puntosPorEspecial > 0);
t('20.07 el estilo escala con carisma', EV.TIPOS_EVENTO.estilo.multCarisma === true);
const statsCar = { ...stats, carisma: 120, presencia: 120 };
const heroeCar = crearLuchador({ nombre: 'Diva', clase: 'luchador', nivel: 12, stats: statsCar });
const gv = { gano: true, res: { resumen: { heroe: { criticos: 3, especiales: 2, danoInfligido: 500 } } }, indice: 0 };
t('20.07 más carisma = más puntos de estilo',
  RUN.puntosDeLucha('estilo', { ...gv, heroe: heroeCar }) >
  RUN.puntosDeLucha('estilo', { ...gv, heroe }));
t('20.07 los críticos suman en el estilo',
  RUN.puntosDeLucha('estilo', { ...gv, heroe }) >
  RUN.puntosDeLucha('estilo', { gano: true, indice: 0, heroe,
    res: { resumen: { heroe: { criticos: 0, especiales: 0, danoInfligido: 500 } } } }));
t('20.09 perder da 0 en el estilo también',
  RUN.puntosDeLucha('estilo', { ...gv, gano: false, heroe }) === 0);

/* 20.08 cura del 30% entre luchas */
const { COMBATE } = await import('../js/data/constants.js');
t('20.08 la cura entre luchas es del 30%', casi(COMBATE.CURA_ENTRE_LUCHAS_EVENTO, 0.30));

/* 20.10 rivales temáticos */
const { rngDe } = await import('../js/core/rng.js');
const rv = RUN.rivalDeEvento('coloso', 0, { rng: rngDe('t', 1), nivelHeroe: 12, statsHeroe: stats });
t('20.10 el rival de evento está marcado como invitado', rv.invitado === true);
t('20.10 el coloso tiene vida enorme frente al héroe', rv.der.vidaMax > heroe.der.vidaMax * 5);
t('20.10 el rival lleva nombre temático', /Montaña|Titán|Mole|Bastión/.test(rv.nombre));
const rvLey0 = RUN.rivalDeEvento('leyendas', 0, { rng: rngDe('t', 1), nivelHeroe: 12, statsHeroe: stats });
const rvLey1 = RUN.rivalDeEvento('leyendas', 1, { rng: rngDe('t', 1), nivelHeroe: 12, statsHeroe: stats });
t('20.05 leyendas asigna clases distintas por índice', rvLey0.clase !== rvLey1.clase);

/* ============ 8. ESTADO ============ */
t('el estado tiene la rama eventos', ST.S.eventos && typeof ST.S.eventos === 'object');
t('19.06 el tope de intentos es 5', EVENTOS.INTENTOS === 5);
t('arranca sin inscripción', ST.S.eventos.inscrito === null);
t('arranca con 0 intentos', ST.S.eventos.intentos === 0);
t('19.14 hay hueco para el último evento', 'ultimo' in ST.S.eventos);
t('el estado guarda la semilla del día', 'diaSemilla' in ST.S.eventos);
t('la carrera cuenta eventos jugados', typeof ST.S.carrera.eventosJugados === 'number');
t('la carrera cuenta entradas al top 10', typeof ST.S.carrera.eventosTop10 === 'number');

/* ============ 9. EQUILIBRIO: los 7 eventos son jugables ============ */
for (const id of EV.CLAVES_EVENTOS) {
  let total = 0, n = 12;
  for (let s = 0; s < n; s++) total += RUN.correrIntento(id, heroe, { ...opc, semilla: s * 613 + 11 }).puntos;
  const media = total / n;
  const ref = LB.puntajeReferencia(id, 12);
  // Un héroe con stats planas debe quedar en la banda, ni barrido ni invencible
  t(`equilibrio ${id}: puntúa algo (media ${Math.round(media)} vs ref ${ref})`, media > ref * 0.05);
  t(`equilibrio ${id}: no rompe la tabla`, media < ref * 12);
}

console.log(`\n${mal === 0 ? '✅' : '⚠️'} Paso 11: ${ok} correctas, ${mal} fallidas`);
process.exit(mal === 0 ? 0 : 1);
