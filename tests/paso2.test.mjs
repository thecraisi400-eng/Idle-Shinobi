globalThis.location = { hostname:'localhost', hash:'' };
const { fmt, pct, hms, mmss } = await import('../js/core/format.js');
const { crearRNG, rngDe } = await import('../js/core/rng.js');
const { on, emit } = await import('../js/core/events-bus.js');
const st = await import('../js/core/state.js');
const { migrar, esGuardadoValido } = await import('../js/core/migrations.js');

let f=0; const t=(n,c)=>{ console.log((c?'✅':'❌')+' '+n); if(!c)f++; };

// FORMATO
t('fmt 999',        fmt(999)==='999');
t('fmt 12.4K',      fmt(12400)==='12.4K');
t('fmt 3.2M',       fmt(3.2e6)==='3.2M');
t('fmt 1.8B',       fmt(1.8e9)==='1.8B');
t('fmt 4.5T',       fmt(4.5e12)==='4.5T');
console.log('   escala extrema:', [1e18,1e24,1e33,1e45].map(fmt).join(' '));
t('sufijo infinito', typeof fmt(1e45)==='string' && fmt(1e45).length>1);
t('pct', pct(0.1234)==='12.3%');
t('hms', hms(7325)==='2h 02m');
t('mmss', mmss(95)==='1:35');

// RNG determinista
const a=crearRNG(42), b=crearRNG(42);
t('RNG reproducible', a.float()===b.float() && a.int(1,100)===b.int(1,100));
t('rngDe determinista', rngDe('rival',47).int(1,999)===rngDe('rival',47).int(1,999));
t('RNG distinto con otra semilla', crearRNG(1).float()!==crearRNG(2).float());
const dado=crearRNG(7); let s=0; for(let i=0;i<20000;i++) s+=dado.float();
t('RNG media ~0.5', Math.abs(s/20000-0.5)<0.01);

// BUS
let rec=null, wild=0;
on('oro:change', d=>rec=d); on('oro:*',()=>wild++);
emit('oro:change',{delta:5});
t('bus recibe', rec.delta===5);
t('bus comodín', wild===1);

// ESTADO
const S = st.iniciarEstado();
t('oro inicial 100', S.monedas.oro===100);
t('10 stats', Object.keys(S.stats).length===10);
t('stats en 10-25', Object.values(S.stats).every(v=>v>=10&&v<=25));
st.ganarOro(500); t('ganarOro', S.monedas.oro===600);
t('carrera registra oro', S.carrera.oroGanado===500);
t('gastarOro ok', st.gastarOro(100)===true && S.monedas.oro===500);
t('gastarOro rechaza', st.gastarOro(999999)===false && S.monedas.oro===500);
const c1=st.costeStat('potencia'); st.mejorarStat('potencia'); const c2=st.costeStat('potencia');
t('coste creciente', c2>c1);
t('tope por nivel', st.topeStat()===30);
const nv=S.perfil.nivel; st.ganarXP(100000);
t('sube de nivel', S.perfil.nivel>nv);
t('da puntos libres', S.perfil.puntosLibres>0);
t('tope sube con nivel', st.topeStat()>30);
st.asignarPunto('vida'); t('asignar punto', S.compras.vida===0 && S.stats.vida>0);
st.registrarResultado(true); st.registrarResultado(true); st.registrarResultado(false);
t('racha', S.carrera.mejorRacha===2 && S.carrera.rachaActual===0);
t('W/L', S.carrera.victorias===2 && S.carrera.derrotas===1);

// MIGRACIONES
const viejo={meta:{version:0,semilla:1},perfil:{nivel:5},monedas:{oro:50},stats:{potencia:11}};
const m=migrar(structuredClone(viejo));
t('migra versión', m.meta.version===1);
t('conserva datos', m.monedas.oro===50 && m.perfil.nivel===5);
t('rellena faltantes', m.carrera && typeof m.carrera.victorias==='number' && m.equipo.slots);
t('valida guardado', esGuardadoValido(m)===true && esGuardadoValido({})===false);

console.log(f? `\n${f} FALLOS`:'\n🎉 TODAS LAS PRUEBAS PASARON');
process.exit(f?1:0);
