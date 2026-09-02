/* PASO 14 — Guardado paranoico, export .md, 150 logros y misiones */
globalThis.location = { hostname: 'localhost', hash: '' };

/* --- localStorage simulado (Node no lo trae) --- */
class MemStorage {
  constructor() { this.m = new Map(); this.falla = false; }
  getItem(k) { return this.m.has(k) ? this.m.get(k) : null; }
  setItem(k, v) { if (this.falla) throw new Error('cuota'); this.m.set(k, String(v)); }
  removeItem(k) { this.m.delete(k); }
  clear() { this.m.clear(); }
}
globalThis.localStorage = new MemStorage();
globalThis.btoa = s => Buffer.from(s, 'binary').toString('base64');
globalThis.atob = s => Buffer.from(s, 'base64').toString('binary');

let ok = 0, mal = 0;
const t = (nombre, cond) => { if (cond) ok++; else { mal++; console.log(`❌ ${nombre}`); } };

const SAVE = await import('../js/systems/save.js');
const MD = await import('../js/systems/export-md.js');
const LG = await import('../js/data/logros.js');
const MIS = await import('../js/data/misiones.js');
const Q = await import('../js/systems/quests.js');
const ACH = await import('../js/systems/achievements.js');
const ST = await import('../js/core/state.js');
const { UI, META } = await import('../js/data/constants.js');
const { esGuardadoValido } = await import('../js/core/migrations.js');

const S = () => ST.S;
const limpio = () => { localStorage.clear(); ST.iniciarEstado(); };

/* ============ 1. LOS 150 LOGROS (30.01) ============ */
t('30.01 hay exactamente 150 logros', LG.TOTAL_LOGROS === 150);
t('30.01 hay cadenas progresivas', LG.LOGROS.filter(l => l.cadena).length === 100);
t('30.01 los escalones son 1, 10, 50, 250 y 1000',
  LG.ESCALONES.join() === '1,10,50,250,1000');
t('30.01 las cadenas sin escalones propios usan 1..1000 por su escala',
  LG.CADENAS.filter(c => !c.escalones).every(c => {
    const l = LG.LOGROS_POR_CADENA(c.id), e = c.escala || 1;
    return l.map(x => x.meta).join() === LG.ESCALONES.map(n => n * e).join();
  }));
t('30.01 las cadenas con escalones propios los respetan',
  LG.CADENAS.filter(c => c.escalones).every(c =>
    LG.LOGROS_POR_CADENA(c.id).map(x => x.meta).join() === c.escalones.join()));
t('hay 50 hitos sueltos', LG.HITOS.length === 50);
t('todos los ids son únicos', new Set(LG.LOGROS.map(l => l.id)).size === 150);
t('todos tienen nombre, descripción e icono',
  LG.LOGROS.every(l => l.nombre && l.desc && l.ico));
t('07.14 todos pagan oro', LG.LOGROS.every(l => l.oro > 0));
t('07.14 el oro es pequeño (ningún logro paga más de 6000)',
  LG.LOGROS.every(l => l.oro <= 6000));
t('08.14 hay logros que pagan gemas', LG.LOGROS.some(l => l.gemas > 0));
t('08.14 las gemas son pocas por logro', LG.LOGROS.every(l => l.gemas <= 10));
t('30.01 las cadenas son progresivas: cada peldaño pide más',
  LG.CADENAS.every(c => {
    const lista = LG.LOGROS_POR_CADENA(c.id);
    return lista.every((l, i) => i === 0 || l.meta > lista[i - 1].meta);
  }));
t('30.01 cada cadena tiene 5 peldaños',
  LG.CADENAS.every(c => LG.LOGROS_POR_CADENA(c.id).length === 5));
t('el oro crece con el peldaño',
  LG.CADENAS.every(c => {
    const l = LG.LOGROS_POR_CADENA(c.id);
    return l.every((x, i) => i === 0 || x.oro > l[i - 1].oro);
  }));
t('hay logros secretos', LG.SECRETOS.length === 10);
t('Sug#4 todos los secretos tienen pista', LG.SECRETOS.every(l => l.pista && l.pista.length > 10));
t('los logros de cadena apuntan a un contador real',
  LG.LOGROS.filter(l => l.contador).every(l => l.contador in ST.crearPartidaNueva(1).carrera));
t('los hitos tienen función de condición',
  LG.HITOS.every(h => typeof h.cond === 'function'));
t('getLogro encuentra por id', LG.getLogro('luchas1')?.id === 'luchas1');
t('getLogro devuelve null si no existe', LG.getLogro('inventado') === null);

/* --- evaluación --- */
limpio();
t('se empieza sin logros', ACH.completados().length === 0);
t('el resumen inicial está a cero', ACH.resumen().hechos === 0);
t('el resumen conoce el total', ACH.resumen().total === 150);

S().carrera.luchas = 1;
let nuevos = ACH.revisar();
t('30.01 el primer peldaño salta con 1 lucha', nuevos.some(l => l.id === 'luchas1'));
t('el logro queda registrado', ACH.estaCompleto('luchas1'));
t('07.14 el logro paga oro', S().monedas.oro > 100);
t('no se vuelve a pagar el mismo logro', ACH.revisar().every(l => l.id !== 'luchas1'));

S().carrera.luchas = 1000;
nuevos = ACH.revisar();
t('30.01 subir mucho desbloquea toda la cadena de golpe', nuevos.length >= 4);
t('la cadena completa queda marcada',
  LG.LOGROS_POR_CADENA('luchas').every(l => ACH.estaCompleto(l.id)));

/* gemas de colección (08.14) */
limpio();
const gAntes = S().monedas.gemas;
S().carrera.objetosObtenidos = 1000;
ACH.revisar();
t('08.14 la cadena de colección paga gemas', S().monedas.gemas > gAntes);

/* progreso y valores */
limpio();
S().carrera.victorias = 5;
const lg = LG.getLogro('victorias2');    // pide 10
t('el progreso es proporcional', Math.abs(ACH.progreso(lg) - 0.5) < 0.01);
t('los valores muestran actual y meta',
  ACH.valores(lg).actual === 5 && ACH.valores(lg).meta === 10);
t('el progreso nunca pasa de 1',
  (S().carrera.victorias = 999, ACH.progreso(lg) === 1));

/* Sugerencia #4: pistas escalonadas */
limpio();
const secreto = LG.SECRETOS[0];
let v = ACH.vista(secreto);
t('Sug#4 el secreto arranca oculto', v.oculto === true && v.nombre === '???');
t('Sug#4 al 0% no se ve la pista', v.revelado !== true);
t('Sug#4 el secreto oculta su descripción real', v.desc !== secreto.desc);

t('Sug#4 con poco progreso sigue oculto',
  ACH.vista({ ...secreto, cond: () => false }, S()).oculto === true);

// un secreto ya conseguido se muestra entero
limpio();
S().hitos.perfecto = true;
ACH.revisar();
const vHecho = ACH.vista(LG.getLogro('perfecto'));
t('Sug#4 el secreto conseguido se revela', vHecho.oculto === false);
t('Sug#4 el secreto conseguido muestra su nombre real', vHecho.nombre === 'Ni un rasguño');

/* hitos de lucha */
limpio();
const res = { ganador: 'heroe', motivo: 'ko', ticks: 8, vidaHeroe: 5,
              resumen: { heroe: { danoRecibido: 0 } } };
const heroe = { der: { vidaMax: 1000 } };
const marcados = ACH.hitosDeLucha(res, { heroe }, S());
t('marca la remontada con vida mínima', marcados.includes('remontada'));
t('marca la lucha perfecta sin daño', marcados.includes('perfecto'));
t('marca el KO relámpago', marcados.includes('relampagoKO'));
t('los hitos quedan en el estado', S().hitos.remontada === true);
t('un hito no se marca dos veces',
  ACH.hitosDeLucha(res, { heroe }, S()).length === 0);
ACH.revisar();
t('los hitos desbloquean sus logros secretos', ACH.estaCompleto('remontada'));

limpio();
t('el empate marca su hito',
  ACH.hitosDeLucha({ ganador: null, motivo: 'empate' }, {}, S()).includes('empate'));
limpio();
t('la descalificación marca su hito',
  ACH.hitosDeLucha({ ganador: 'rival', motivo: 'descalificacion' }, {}, S()).includes('descalificado'));
limpio();
t('perder no marca hitos de victoria',
  !ACH.hitosDeLucha({ ganador: 'rival', motivo: 'ko', ticks: 3 }, { heroe }, S()).includes('relampagoKO'));

/* agrupación */
limpio();
const grupos = ACH.porCadenas();
t('los logros se agrupan por cadena', grupos.length === LG.CADENAS.length + 1);
t('cada grupo cuenta sus logros',
  grupos.reduce((a, g) => a + g.total, 0) === 150);
S().carrera.luchas = 60;
ACH.revisar();
t('los próximos muestran lo que está a tiro', ACH.proximos(S(), 5).length > 0);
t('los próximos no incluyen secretos', ACH.proximos(S(), 20).every(x => !x.logro.secreto));
t('los próximos no incluyen los ya hechos',
  ACH.proximos(S(), 20).every(x => !ACH.estaCompleto(x.logro.id)));
t('los próximos van ordenados por cercanía',
  ACH.proximos(S(), 5).every((x, i, a) => i === 0 || x.pct <= a[i - 1].pct));

/* ============ 2. MISIONES (30.02, 30.03) ============ */
limpio();
const T1 = new Date(2026, 8, 2, 10, 0).getTime();     // miércoles
const T2 = new Date(2026, 8, 3, 10, 0).getTime();     // jueves
const T3 = new Date(2026, 8, 9, 10, 0).getTime();     // miércoles siguiente

t('30.02 hay plantillas de diarias', MIS.DIARIAS.length >= MIS.N_DIARIAS);
t('30.03 hay plantillas de semanales', MIS.SEMANALES.length >= MIS.N_SEMANALES);
t('30.02 se piden 5 diarias', MIS.N_DIARIAS === 5);
t('30.03 se piden 3 semanales', MIS.N_SEMANALES === 3);
t('30.02 hay 1 refresco gratis', MIS.REFRESCOS_DIARIOS === 1);
t('toda plantilla tiene contador, premio y zona',
  [...MIS.DIARIAS, ...MIS.SEMANALES].every(m => m.contador && m.oro > 0 && m.zona));
t('los objetivos tienen rango válido',
  [...MIS.DIARIAS, ...MIS.SEMANALES].every(m => m.max >= m.min && m.min > 0));
t('30.03 las semanales pagan más que las diarias',
  Math.min(...MIS.SEMANALES.map(m => m.oro)) > Math.max(...MIS.DIARIAS.map(m => m.oro)));
t('30.03 las semanales pagan gemas', MIS.SEMANALES.every(m => m.gemas > 0));
t('Sug#3 las misiones cubren varias zonas del juego',
  new Set(MIS.DIARIAS.map(m => m.zona)).size >= 4);
t('Sug#3 hay misiones de eventos y de coliseo',
  MIS.DIARIAS.some(m => m.zona === 'eventos') && MIS.DIARIAS.some(m => m.zona === 'coliseo'));

Q.sincronizar(S(), T1);
t('30.02 se generan 5 diarias', S().misiones.diarias.length === 5);
t('30.03 se generan 3 semanales', S().misiones.semanales.length === 3);
t('las diarias no se repiten entre sí',
  new Set(S().misiones.diarias.map(m => m.id)).size === 5);
t('las semanales no se repiten entre sí',
  new Set(S().misiones.semanales.map(m => m.id)).size === 3);
t('cada misión guarda su línea base',
  Q.todas(S()).every(m => typeof m.base === 'number'));
t('cada misión tiene objetivo positivo', Q.todas(S()).every(m => m.objetivo > 0));
t('ninguna empieza cobrada', Q.todas(S()).every(m => !m.cobrada));

const idsDia1 = S().misiones.diarias.map(m => m.id).join();
Q.sincronizar(S(), T1 + 3600e3);
t('las misiones no cambian durante el día',
  S().misiones.diarias.map(m => m.id).join() === idsDia1);

/* la línea base impide que el progreso viejo complete la misión */
limpio();
for (const k of Object.keys(S().carrera)) {
  if (typeof S().carrera[k] === 'number') S().carrera[k] = 5000;
}
Q.sincronizar(S(), T1);
const mv = S().misiones.diarias[0];
t('la línea base impide completar con progreso antiguo', !Q.progreso(mv, S()).completa);
t('la base guarda el valor actual del contador', mv.base === 5000);
t('todas las misiones toman su base del contador real',
  S().misiones.diarias.every(m => m.base === 5000));

/* progreso y cobro */
limpio();
Q.sincronizar(S(), T1);
const m0 = S().misiones.diarias[0];
t('la misión empieza sin progreso', Q.progreso(m0, S()).hecho === 0);
t('no se puede cobrar sin completar', Q.cobrar(m0.id, S()).ok === false);

S().carrera[m0.contador] = m0.base + m0.objetivo;
const p0 = Q.progreso(m0, S());
t('al alcanzar el objetivo se completa', p0.completa === true);
t('el porcentaje llega al 100%', p0.pct === 1);
t('el progreso no se pasa del objetivo',
  (S().carrera[m0.contador] = m0.base + m0.objetivo * 5,
   Q.progreso(m0, S()).hecho === m0.objetivo));

const oroPrev = S().monedas.oro;
const cob = Q.cobrar(m0.id, S());
t('cobrar funciona al completar', cob.ok === true);
t('cobrar paga el oro', S().monedas.oro === oroPrev + m0.oro);
t('la misión queda marcada como cobrada', m0.cobrada === true);
t('no se puede cobrar dos veces', Q.cobrar(m0.id, S()).ok === false);
t('cobrar dos veces no da más oro', S().monedas.oro === oroPrev + m0.oro);

/* contador del panel (10.13) */
const c = Q.contadorPanel(S());
t('10.13 el contador cuenta las diarias', c.total === 5);
t('10.13 el contador registra la cobrada', c.hechas === 1);
t('10.13 el contador da texto simple', c.texto === '1/5');

/* cobrar todas */
limpio();
Q.sincronizar(S(), T1);
for (const m of S().misiones.diarias) S().carrera[m.contador] = m.base + m.objetivo;
t('hayRecompensas detecta las listas', Q.hayRecompensas(S()) === true);
const todas = Q.cobrarTodas(S());
t('cobrarTodas cobra las completas', todas.n >= 1);
t('cobrarTodas suma el oro', todas.oro > 0);
t('tras cobrar todo no queda nada pendiente', Q.hayRecompensas(S()) === false);

/* 30.02 refresco */
limpio();
Q.sincronizar(S(), T1);
t('30.02 se empieza con 1 refresco', Q.refrescosRestantes(S()) === 1);
const viejaId = S().misiones.diarias[1].id;
const rf = Q.refrescar(viejaId, S(), T1);
t('30.02 el refresco funciona', rf.ok === true);
t('30.02 la misión cambia', S().misiones.diarias[1].id !== viejaId);
t('30.02 la nueva no duplica otra existente',
  new Set(S().misiones.diarias.map(m => m.id)).size === 5);
t('30.02 el refresco se gasta', Q.refrescosRestantes(S()) === 0);
t('30.02 no hay un segundo refresco',
  Q.refrescar(S().misiones.diarias[2].id, S(), T1).ok === false);

limpio();
Q.sincronizar(S(), T1);
const mc = S().misiones.diarias[0];
S().carrera[mc.contador] = mc.base + mc.objetivo;
Q.cobrar(mc.id, S());
t('no se puede refrescar una misión ya cobrada', Q.refrescar(mc.id, S(), T1).ok === false);
t('refrescar una semanal no cuela', Q.refrescar(S().misiones.semanales[0].id, S(), T1).ok === false);

/* rotación de periodos */
limpio();
Q.sincronizar(S(), T1);
const dia1 = S().misiones.diarias.map(m => m.id).join();
const sem1 = S().misiones.semanales.map(m => m.id).join();
Q.sincronizar(S(), T2);
t('30.02 el día nuevo reinicia el ciclo de diarias',
  S().misiones.diaReset === Q.claveDia(T2) && S().misiones.diaReset !== Q.claveDia(T1));
t('30.02 las diarias nuevas están sin cobrar',
  S().misiones.diarias.every(m => !m.cobrada));
t('30.02 el día nuevo repone el refresco', Q.refrescosRestantes(S()) === 1);
t('30.03 las semanales NO cambian el día siguiente',
  S().misiones.semanales.map(m => m.id).join() === sem1);
Q.sincronizar(S(), T3);
t('30.03 las semanales cambian a la semana siguiente',
  S().misiones.semanaReset === Q.claveSemana(T3));
t('la clave de semana es el lunes',
  new Date(Q.claveSemana(T1) + 'T00:00:00').getDay() === 1);
t('días de la misma semana comparten clave',
  Q.claveSemana(new Date(2026, 8, 7).getTime()) === Q.claveSemana(new Date(2026, 8, 13).getTime()));

/* ============ 3. GUARDADO (Grupo 27) ============ */
limpio();
t('el almacén está disponible', SAVE.almacenDisponible() === true);
t('27.05 al principio no hay partida', SAVE.hayPartida() === false);
t('sin partida no se puede cargar', SAVE.cargar().ok === false);

S().perfil.nivel = 12;
S().monedas.oro = 4321;
const g = SAVE.guardar('test');
t('27.01 guardar funciona', g.ok === true);
t('27.05 ahora hay partida', SAVE.hayPartida() === true);
t('27.10 se registra la fecha del guardado', S().meta.guardado > 0);
t('27.09 se registra la versión', S().meta.version === META.VERSION_SAVE);
t('el guardado ocupa bytes', g.bytes > 100);

const info = SAVE.infoGuardado();
t('27.10 la info dice cuándo se guardó', info.existe && info.cuando > 0);
t('27.10 la info trae la fecha como objeto Date', info.fecha instanceof Date);
t('la info trae nivel y oro', info.nivel === 12 && info.oro === 4321);
t('la info trae la versión', info.version === META.VERSION_SAVE);
t('27.10 el texto de "hace cuánto" funciona', /momento|min|h|días/.test(SAVE.haceCuanto(Date.now())));
t('sin fecha dice nunca', SAVE.haceCuanto(0) === 'nunca');

/* cargar */
S().perfil.nivel = 99;
S().monedas.oro = 1;
const car = SAVE.cargar();
t('27.04 cargar funciona', car.ok === true);
t('cargar restaura el nivel guardado', S().perfil.nivel === 12);
t('cargar restaura el oro guardado', S().monedas.oro === 4321);
t('27.05 hay un solo perfil', SAVE.CLAVE === 'oro-y-gloria:save');

/* 27.07 respaldos */
localStorage.removeItem(SAVE.CLAVE_BACKUPS);
t('se empieza sin respaldos', SAVE.listarRespaldos().length === 0);
SAVE.crearRespaldo('prueba');
t('27.07 se crea el respaldo', SAVE.listarRespaldos().length === 1);
t('27.07 el respaldo guarda el motivo', SAVE.listarRespaldos()[0].motivo === 'prueba');
t('27.07 el respaldo guarda nivel y oro',
  SAVE.listarRespaldos()[0].nivel === 12 && SAVE.listarRespaldos()[0].oro === 4321);

for (let i = 0; i < 10; i++) { S().perfil.nivel = 20 + i; SAVE.crearRespaldo(`r${i}`); }
t('27.07 solo se conservan 5 respaldos', SAVE.listarRespaldos().length === 5);
t('27.07 la constante de respaldos es 5', UI.BACKUPS === 5);
t('27.07 el más reciente va primero', SAVE.listarRespaldos()[0].motivo === 'r9');

/* restaurar */
S().perfil.nivel = 77;
const rr = SAVE.restaurarRespaldo(0);
t('27.07 restaurar funciona', rr.ok === true);
t('27.07 restaurar recupera el estado', S().perfil.nivel === 29);
t('27.07 restaurar también respalda antes',
  SAVE.listarRespaldos()[0].motivo === 'antes-de-restaurar');
t('restaurar un índice inexistente falla', SAVE.restaurarRespaldo(99).ok === false);

/* cargar respalda antes (27.07) */
localStorage.removeItem(SAVE.CLAVE_BACKUPS);
SAVE.cargar();
t('27.07 cargar crea respaldo previo',
  SAVE.listarRespaldos().some(b => b.motivo === 'antes-de-cargar'));

/* 27.08 doble confirmación */
limpio();
SAVE.guardar('test');
t('27.08 el testigo de reinicio es explícito', SAVE.TESTIGO_REINICIO === 'BORRAR-TODO');
t('27.08 reiniciar sin testigo falla', SAVE.reiniciar().ok === false);
t('27.08 reiniciar con cadena vacía falla', SAVE.reiniciar('').ok === false);
t('27.08 reiniciar con testigo erróneo falla', SAVE.reiniciar('si').ok === false);
t('27.08 la partida sigue ahí tras el intento fallido', SAVE.hayPartida() === true);
const rst = SAVE.reiniciar(SAVE.TESTIGO_REINICIO);
t('27.08 reiniciar con el testigo correcto funciona', rst.ok === true);
t('27.08 la partida se borra', SAVE.hayPartida() === false);
t('27.08 se respalda antes de borrar',
  SAVE.listarRespaldos().some(b => b.motivo === 'antes-de-reiniciar'));

/* guardado corrupto */
limpio();
localStorage.setItem(SAVE.CLAVE, '{no es json');
t('un guardado ilegible no revienta', SAVE.leerGuardado() === null);
t('un guardado ilegible no se carga', SAVE.cargar().ok === false);
localStorage.setItem(SAVE.CLAVE, '{"cosa":1}');
t('un guardado incompleto se rechaza', SAVE.cargar().ok === false);

/* almacén que falla (modo incógnito) */
limpio();
localStorage.falla = true;
const gf = SAVE.guardar('fallo');
t('si el almacén falla, guardar avisa sin romper', gf.ok === false);
localStorage.falla = false;

/* Sugerencia #2: recordatorio */
limpio();
t('Sug#2 al principio no molesta con el aviso', SAVE.tocaRecordarExport(S()) === false);
S().meta.tiempoJugadoMs = 5 * 3600e3;
t('Sug#2 tras horas de juego sin exportar, avisa', SAVE.tocaRecordarExport(S()) === true);
SAVE.marcarExportado(Date.now());
t('Sug#2 tras exportar deja de avisar', SAVE.tocaRecordarExport(S()) === false);
SAVE.marcarExportado(Date.now() - 8 * 24 * 3600e3);
t('27.01 vuelve a avisar a la semana', SAVE.tocaRecordarExport(S()) === true);

/* Sugerencia #5: resumen de sesión */
limpio();
const foto = SAVE.tomarFoto(S());
t('Sug#5 la foto captura el estado', foto.oro === S().monedas.oro);
S().monedas.oro += 5000;
S().perfil.nivel += 2;
S().carrera.luchas += 7;
const rs = SAVE.resumenSesion(foto, S());
t('Sug#5 el resumen calcula el oro ganado', rs.oro === 5000);
t('Sug#5 el resumen cuenta los niveles', rs.niveles === 2);
t('Sug#5 el resumen cuenta las luchas', rs.luchas === 7);
t('Sug#5 detecta que hubo progreso', rs.huboProgreso === true);
const foto2 = SAVE.tomarFoto(S());
t('Sug#5 sin progreso lo dice', SAVE.resumenSesion(foto2, S()).huboProgreso === false);

/* ============ 4. EXPORT / IMPORT .MD (27.03, 27.13) ============ */
limpio();
S().perfil.nivel = 33;
S().monedas.oro = 54321;
S().monedas.gemas = 42;
S().carrera.luchas = 500;
S().carrera.victorias = 320;

const md = MD.generarMD(S());
t('27.03 el .md se genera', typeof md === 'string' && md.length > 500);
t('27.03 el .md es legible: tiene títulos markdown', md.includes('# 🥊 Oro y Gloria'));
t('27.03 el .md muestra el nivel en texto legible', md.includes('| Nivel | 33 |'));
t('27.03 el .md muestra las estadísticas', md.includes('## 📊 Estadísticas'));
t('27.03 el .md muestra la carrera', md.includes('## 🏆 Carrera'));
t('27.13 el .md lleva el bloque de datos', md.includes(MD.MARCA_INICIO));
t('27.13 el bloque de datos se cierra', md.includes(MD.MARCA_FIN));
t('27.09 el bloque declara la versión', /version:\s*\d+/.test(md));
t('Sug#1 el bloque lleva checksum', /checksum:\s*[0-9a-f]{8}/.test(md));
t('el .md lleva fecha de exportación', /fecha:\s*\d{4}-/.test(md));

/* checksum */
t('Sug#1 el checksum es estable', MD.checksum('hola') === MD.checksum('hola'));
t('Sug#1 el checksum cambia con el contenido', MD.checksum('hola') !== MD.checksum('holA'));
t('Sug#1 el checksum tiene 8 caracteres hex', /^[0-9a-f]{8}$/.test(MD.checksum('x')));
t('Sug#1 el checksum es FNV-1a de 32 bits (vector fijo)',
  MD.checksum('oro-y-gloria') === '972479e2');
t('Sug#1 segundo vector de prueba', MD.checksum('') === '811c9dc5');

/* codificación con acentos */
const conAcentos = 'Máscara Sagrada ñ é í ó ú ¡ñ!';
t('la codificación soporta acentos',
  MD.decodificar(MD.codificar(conAcentos)) === conAcentos);
t('la codificación soporta JSON largo',
  MD.decodificar(MD.codificar(JSON.stringify(S()))) === JSON.stringify(S()));

/* importar */
const imp = MD.parsearMD(md);
t('27.03 el .md se puede reimportar', imp.ok === true);
t('la importación recupera el nivel', imp.estado.perfil.nivel === 33);
t('la importación recupera el oro', imp.estado.monedas.oro === 54321);
t('la importación recupera las gemas', imp.estado.monedas.gemas === 42);
t('la importación recupera la carrera', imp.estado.carrera.victorias === 320);
t('la importación trae resumen para confirmar',
  imp.resumen.nivel === 33 && imp.resumen.oro === 54321);
t('el estado importado es válido', esGuardadoValido(imp.estado));
t('sin avisos si el archivo está intacto', !imp.aviso);

/* Sug#1: detección de corrupción */
const corrupto = md.replace(/datos: (.)/, (m0, c) => `datos: ${c === 'A' ? 'B' : 'A'}`);
const impC = MD.parsearMD(corrupto);
t('Sug#1 se detecta el archivo manipulado', impC.ok === false);
t('Sug#1 el error explica el problema', /modificado|corrupto|dañad/i.test(impC.motivo));

t('un texto cualquiera no se importa', MD.parsearMD('# hola mundo').ok === false);
t('un archivo vacío no se importa', MD.parsearMD('').ok === false);
t('null no rompe el importador', MD.parsearMD(null).ok === false);
t('el error de archivo ajeno es claro',
  /no es un archivo/i.test(MD.parsearMD('# otra cosa').motivo));

/* bloque presente pero datos rotos */
const sinDatos = md.replace(/datos: .+/, 'datos: ');
t('un bloque sin datos se rechaza', MD.parsearMD(sinDatos).ok === false);

/* 27.09 versión futura */
const futuro = md.replace(/version: \d+/, 'version: 999');
const impF = MD.parsearMD(futuro);
t('27.09 se rechaza una partida de versión más nueva', impF.ok === false);
t('27.09 el mensaje menciona la versión', /versión/i.test(impF.motivo));

/* nombre de archivo */
const nom = MD.nombreArchivo(S());
t('el nombre del archivo es descriptivo', /^oro-y-gloria-nv33-\d{8}\.md$/.test(nom));
t('el nombre termina en .md', nom.endsWith('.md'));

/* ida y vuelta completa */
limpio();
S().perfil.nombre = 'El Ñandú Épico';
S().perfil.nivel = 7;
S().equipo.material = 55;
S().logros.completados = ['luchas1', 'victorias1'];
const md2 = MD.generarMD(S());
const imp2 = MD.parsearMD(md2);
t('ida y vuelta conserva el nombre con acentos',
  imp2.estado.perfil.nombre === 'El Ñandú Épico');
t('ida y vuelta conserva el material', imp2.estado.equipo.material === 55);
t('ida y vuelta conserva los logros',
  imp2.estado.logros.completados.length === 2);

/* ============ 5. ESTADO ============ */
limpio();
t('el estado tiene la rama misiones', typeof S().misiones === 'object');
t('el estado tiene refrescos', typeof S().misiones.refrescos === 'number');
t('el estado tiene la rama logros', Array.isArray(S().logros.completados));
t('el estado tiene la rama hitos', typeof S().hitos === 'object');
t('27.09 el estado nace con versión', S().meta.version === META.VERSION_SAVE);
t('27.12 el perfil no tiene nombre de slot', !('nombreSlot' in S().meta));

console.log(`\n${mal === 0 ? '✅' : '⚠️'} Paso 14: ${ok} correctas, ${mal} fallidas`);
process.exit(mal === 0 ? 0 : 1);
