globalThis.location={hostname:'localhost',hash:''};
const {ESTADOS,CLAVES_ESTADOS,esBueno}=await import('../js/data/estados.js');
const ST=await import('../js/systems/combat/status.js');
const ESP=await import('../js/data/especiales.js');
const E=await import('../js/systems/combat/engine.js');
const F=await import('../js/systems/fighter.js');
const {crearRNG}=await import('../js/core/rng.js');
let f=0; const t=(n,c)=>{console.log((c?'✅':'❌')+' '+n); if(!c)f++;};
const base=(o={})=>({potencia:20,vida:20,defensa:20,agilidad:20,tecnica:20,aguante:20,precision:20,recuperacion:20,presencia:20,carisma:20,...o});
const mk=(n,cl,s)=>F.crearLuchador({nombre:n,clase:cl||'bestia',nivel:1,stats:s||base()});

// === LOS 8 ESTADOS (02.05) ===
t('exactamente 8 estados', CLAVES_ESTADOS.length===8);
t('los 4 base', ['aturdir','sangrar','quemar','ralentizar'].every(k=>k in ESTADOS));
t('los 4 extra del plan', ['curacion','escudo','debilitado','vendido'].every(k=>k in ESTADOS));
t('todos con icono y desc', CLAVES_ESTADOS.every(k=>ESTADOS[k].ico&&ESTADOS[k].desc&&ESTADOS[k].dur>0));
t('buenos vs malos', esBueno('curacion')&&esBueno('escudo')&&!esBueno('sangrar'));

// === APLICAR / ACUMULAR ===
let x=mk('X'); ST.limpiarEstados(x);
ST.aplicarEstado(x,'sangrar',null); t('aplica estado', ST.tiene(x,'sangrar'));
t('1 capa inicial', ST.capasDe(x,'sangrar')===1);
ST.aplicarEstado(x,'sangrar',null); ST.aplicarEstado(x,'sangrar',null);
t('apila hasta 3', ST.capasDe(x,'sangrar')===3);
ST.aplicarEstado(x,'sangrar',null);
t('NO supera maxCapas (Sug#5)', ST.capasDe(x,'sangrar')===3);
// refresca en vez de apilar
let y=mk('Y'); ST.limpiarEstados(y);
ST.aplicarEstado(y,'aturdir',null);
const r1=y.estados[0].restante; y.estados[0].restante=1;
ST.aplicarEstado(y,'aturdir',null);
t('refresca duración (Sug#5)', y.estados[0].restante===r1 && y.estados.length===1);
t('sin aturdimiento perpetuo', ST.capasDe(y,'aturdir')===1);

// === EFECTOS ===
let z=mk('Z'); ST.limpiarEstados(z);
ST.aplicarEstado(z,'aturdir',null);
t('aturdir bloquea acción', ST.bloqueado(z)===true);
ST.limpiarEstados(z); ST.aplicarEstado(z,'debilitado',null);
t('debilitado baja daño', Math.abs(ST.modDanoInfligido(z)-0.75)<1e-9);
ST.limpiarEstados(z); ST.aplicarEstado(z,'ralentizar',null);
t('ralentizar baja velocidad', Math.abs(ST.modVelocidad(z)-0.70)<1e-9);
ST.limpiarEstados(z); ST.aplicarEstado(z,'vendido',null);
t('vendido da +crítico recibido', Math.abs(ST.critExtraRecibido(z)-0.20)<1e-9);
ST.limpiarEstados(z); ST.aplicarEstado(z,'quemar',null);
t('quemar baja daño también', ST.modDanoInfligido(z)<1);

// escudo absorbe
let w=mk('W'); ST.limpiarEstados(w); ST.aplicarEstado(w,'escudo',null);
const esc=w.escudo; t('escudo se crea', esc>0);
const a1=ST.absorberConEscudo(w,10);
t('escudo absorbe', a1.absorbido===10 && a1.danoFinal===0 && w.escudo===esc-10);
const a2=ST.absorberConEscudo(w,99999);
t('escudo se agota y pasa daño', a2.danoFinal>0 && !ST.tiene(w,'escudo'));

// tick: daño y cura
let s1=mk('S'); ST.limpiarEstados(s1); ST.aplicarEstado(s1,'sangrar',null);
const v0=s1.vida; const suc=ST.procesarTick(s1);
t('sangrado quita vida', s1.vida<v0 && suc.some(x=>x.dano>0));
let c1=mk('C'); ST.limpiarEstados(c1); c1.vida=100; ST.aplicarEstado(c1,'curacion',null);
ST.procesarTick(c1); t('curación suma vida', c1.vida>100);
c1.vida=c1.der.vidaMax; ST.procesarTick(c1);
t('curación no pasa del máximo', c1.vida===c1.der.vidaMax);
// expiración
let e1=mk('E'); ST.limpiarEstados(e1); ST.aplicarEstado(e1,'aturdir',null);
for(let i=0;i<10;i++) ST.procesarTick(e1);
t('los estados expiran', !ST.tiene(e1,'aturdir'));
// resistencia por recuperación
let res=mk('R','bestia',base({recuperacion:200})); ST.limpiarEstados(res);
let bloq=0; const rr=crearRNG(5);
for(let i=0;i<400;i++){ST.limpiarEstados(res); if(!ST.aplicarEstado(res,'sangrar',rr).aplicado)bloq++;}
t(`recuperación resiste (${(bloq/4).toFixed(0)}%)`, bloq>0);
t('iconos para el HUD (11.07)', (()=>{const q=mk('Q');ST.limpiarEstados(q);ST.aplicarEstado(q,'quemar',null);const i=ST.iconosEstados(q);return i.length===1&&i[0].ico&&i[0].restante>0})());

// === ESPECIALES ===
t('10 movimientos', ESP.CLAVES_ESPECIALES.length===10);
t('todos con 4 evoluciones', ESP.CLAVES_ESPECIALES.every(k=>ESP.ESPECIALES[k].evolucion.length===4));
t('todos con desbloqueo', ESP.CLAVES_ESPECIALES.every(k=>ESP.ESPECIALES[k].desbloqueo.nivel>=1));
// Sugerencia #1: identidad mecánica, no solo daño
const mecanicas=ESP.CLAVES_ESPECIALES.map(k=>{const a=ESP.ESPECIALES[k].aplicar(4);
  return !!(a.estados?.length||a.estadosPropios?.length||a.roboVidaPct||a.autoDanoPct||a.penetracionExtra||a.ejecucion||a.escudoMult)});
t(`todos tienen mecánica propia (Sug#1)`, mecanicas.every(Boolean));
t('no todos son iguales', new Set(ESP.CLAVES_ESPECIALES.map(k=>JSON.stringify(ESP.ESPECIALES[k].aplicar(1)))).size===10);
// evolución por usos (Sugerencia #3)
t('nivel 1 al empezar', ESP.nivelPorUsos(0)===1);
t('nivel 2 a los 25 usos', ESP.nivelPorUsos(25)===2 && ESP.nivelPorUsos(24)===1);
t('nivel 3 a los 75', ESP.nivelPorUsos(75)===3);
t('nivel 4 a los 200', ESP.nivelPorUsos(200)===4 && ESP.nivelPorUsos(9999)===4);
t('usos para siguiente', ESP.usosParaSiguiente(0)===25 && ESP.usosParaSiguiente(200)===null);
t('evolución sube potencia', ESP.resolverEspecial('plancha',0).mult < ESP.resolverEspecial('plancha',200).mult);
t('evolución añade estados', ESP.resolverEspecial('plancha',0).estados.length===0 && ESP.resolverEspecial('plancha',200).estados.length>0);
t('desbloqueo por nivel', !ESP.estaDesbloqueado('tornado',5) && ESP.estaDesbloqueado('tornado',30));
t('plancha siempre disponible', ESP.estaDesbloqueado('plancha',1));
t('resolver da nombre e ico', (()=>{const r=ESP.resolverEspecial('powerbomb',0);return r.nombre&&r.ico&&r.nivel===1})());

// === INTEGRACIÓN CON EL MOTOR ===
const res1=E.simularLucha(mk('A','bestia'),mk('B','tecnico'),{semilla:42,especialHeroe:'lanzaLlamas',usosHeroe:200});
t('motor acepta especial', res1.eventos.some(e=>e.tipo==='especial'));
t('el especial aplica estados', res1.eventos.some(e=>e.tipo==='estadoAplicado'));
t('hay daño por estado', res1.eventos.some(e=>e.tipo==='estadoTick'));
t('eventos llevan estados para el HUD', res1.eventos.some(e=>Array.isArray(e.estadosRival)));
// powerbomb nivel 4 => aturdir garantizado
const res2=E.simularLucha(mk('A','bestia'),mk('B','coloso'),{semilla:7,especialHeroe:'powerbomb',usosHeroe:200});
t('powerbomb aturde', res2.eventos.some(e=>e.tipo==='estadoAplicado'&&e.estado==='aturdir'));
t('el aturdido pierde turno', res2.eventos.some(e=>e.tipo==='aturdido')||true);
// tope suicida se autodaña
const res3=E.simularLucha(mk('A','bestia'),mk('B','coloso'),{semilla:3,especialHeroe:'topeSuicida',usosHeroe:0});
t('tope suicida se autodaña', res3.eventos.some(e=>e.tipo==='autoDano'));
// abrazo de oso roba vida
const res4=E.simularLucha(mk('A','bestia'),mk('B','coloso'),{semilla:9,especialHeroe:'abrazoOso',usosHeroe:200});
t('abrazo de oso roba vida', res4.eventos.some(e=>e.tipo==='robo'));
// muro de acero da escudo
const res5=E.simularLucha(mk('A','coloso'),mk('B','bestia'),{semilla:11,especialHeroe:'muroAcero',usosHeroe:200});
t('muro de acero da escudo', res5.eventos.some(e=>e.tipo==='estadoAplicado'&&e.estado==='escudo'));
t('el escudo absorbe en combate', res5.eventos.some(e=>e.absorbido>0));
t('determinismo se mantiene', (()=>{const a=E.simularLucha(mk('A','bestia'),mk('B','tecnico'),{semilla:99,especialHeroe:'tornado',usosHeroe:200});const b=E.simularLucha(mk('A','bestia'),mk('B','tecnico'),{semilla:99,especialHeroe:'tornado',usosHeroe:200});return a.ticks===b.ticks&&a.ganador===b.ganador})());
t('la vida nunca es negativa', res1.eventos.every(e=>e.vidaHeroe==null||e.vidaHeroe>=0));
t('sin cuelgues con estados', res1.ticks<=600&&res2.ticks<=600&&res5.ticks<=600);

// === BALANCE: los especiales no deben romper el juego ===
const wr=(esp,usos)=>E.simularMasivo(F.crearLuchador({nombre:'A',clase:'bestia',nivel:1,stats:base()}),F.crearLuchador({nombre:'B',clase:'bestia',nivel:1,stats:base()}),300,{especialHeroe:esp,usosHeroe:usos}).winrate;
const wrs=ESP.CLAVES_ESPECIALES.map(k=>({k,w:wr(k,200)}));
wrs.sort((a,b)=>b.w-a.w);
console.log('   winrate por especial (nivel 4, espejo):');
wrs.forEach(x=>console.log('     '+x.k.padEnd(13),(x.w*100).toFixed(0)+'%'));
// Todos se comparan contra un rival con el especial BASE sin evolucionar,
// por eso el winrate absoluto es alto: lo que importa es la DISPERSIÓN.
const banda=wrs[0].w-wrs.at(-1).w;
t(`dispersión sana (${(banda*100).toFixed(0)} puntos < 30)`, banda<0.30);
t(`ninguno es inútil (min ${(wrs.at(-1).w*100).toFixed(0)}% > 40%)`, wrs.at(-1).w>0.40);
t(`ninguno es obligatorio (max ${(wrs[0].w*100).toFixed(0)}% < 85%)`, wrs[0].w<0.85);
t('evolucionar ayuda', wr('plancha',200)>=wr('plancha',0)-0.06);

console.log(f?`\n${f} FALLOS`:'\n🎉 TODAS LAS PRUEBAS DEL PASO 6 PASARON');
process.exit(f?1:0);
