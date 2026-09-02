globalThis.location={hostname:'localhost',hash:''};
const N=await import('../js/data/nombres.js');
const DIV=await import('../js/data/divisiones.js');
const DF=await import('../js/systems/difficulty.js');
const RG=await import('../js/systems/rival-gen.js');
const {crearRNG,rngDe}=await import('../js/core/rng.js');
const {RIVALES}=await import('../js/data/constants.js');
const E=await import('../js/systems/combat/engine.js');
const F=await import('../js/systems/fighter.js');
let f=0; const t=(n,c)=>{console.log((c?'✅':'❌')+' '+n); if(!c)f++;};
const base=()=>({potencia:20,vida:20,defensa:20,agilidad:20,tecnica:20,aguante:20,precision:20,recuperacion:20,presencia:20,carisma:20});

// === NOMBRES (05.08) ===
const rng=crearRNG(1); const nombres=new Set();
for(let i=0;i<3000;i++) nombres.add(N.generarNombre(crearRNG(i)));
t(`variedad de nombres (${nombres.size} únicos de 3000)`, nombres.size>800);
t('nombres no vacíos', [...nombres].every(x=>x&&x.length>3));
t('sin "undefined"', ![...nombres].some(x=>x.includes('undefined')));
t('nombreCorto trunca', N.nombreCorto('El Martillo Sangriento de Guadalajara',16).length<=16);
t('nombreCorto respeta cortos', N.nombreCorto('Toro Jr.',16)==='Toro Jr.');
// determinismo
t('mismo índice = mismo nombre', N.generarNombre(rngDe('rival',1,47))===N.generarNombre(rngDe('rival',1,47)));

// === DIVISIONES (05.12) ===
t('6 divisiones', DIV.DIVISIONES.length===6);
t('dificultad creciente', DIV.DIVISIONES.every((d,i)=>i===0||d.multStats>DIV.DIVISIONES[i-1].multStats));
t('oro creciente', DIV.DIVISIONES.every((d,i)=>i===0||d.multOro>DIV.DIVISIONES[i-1].multOro));
t('200 luchas de campaña', DIV.TOTAL_LUCHAS_CAMPANA===200);
t('división por índice', DIV.divisionPorIndice(0).n===1 && DIV.divisionPorIndice(19).n===1 && DIV.divisionPorIndice(20).n===2);
t('torre tras la 6ª', DIV.divisionPorIndice(500).id==='torre');
t('índice local reinicia', DIV.indiceLocal(0)===0 && DIV.indiceLocal(20)===0);

// === DIFICULTAD ===
t('jefe cada 10 (05.13)', DF.esJefe(9)&&!DF.esJefe(5)&&!DF.esJefe(0));
t('el campeón NO cuenta como jefe', !DF.esJefe(19)&&DF.esCampeon(19));
t('jefes y campeones no se apilan', (()=>{const j=RG.generarRival(9,{semillaPartida:99,statsHeroe:base(),nivelHeroe:10});const c=RG.generarRival(19,{semillaPartida:99,statsHeroe:base(),nivelHeroe:10});return c.poder<j.poder*3})());
t('campeón al final de división', DF.esCampeon(19)&&!DF.esCampeon(9));
const esc=[0,5,10,15,19].map(i=>DF.escaladoRival(i));
t('escalado creciente', esc.every((v,i)=>i===0||v>=esc[i-1]*0.85));
t('dientes de sierra tras jefe (06.02)', DF.escaladoRival(10)<DF.escaladoRival(9));
t('muros suben dificultad (06.03)', DF.escaladoRival(25)>DF.escaladoRival(24));
t('oro escala con nivel', DF.oroDelRival(0,10)<DF.oroDelRival(0,50));
t('etiquetas de dificultad', DF.etiquetaDificultad(50,100).txt==='Presa fácil'&&DF.etiquetaDificultad(200,100).txt==='Brutal');

// === RASGOS (06.13) ===
t('12 rasgos', Object.keys(RG.RASGOS).length===12);
t('4 rarezas', Object.keys(RG.RAREZA_RASGO).length===4);
t('todos con mods y desc', Object.values(RG.RASGOS).every(r=>r.mods&&r.desc&&r.ico));
t('rareza épica es la más rara', RG.RAREZA_RASGO[4].peso<RG.RAREZA_RASGO[1].peso);

// === GENERADOR DE RIVALES ===
const op={semillaPartida:99,statsHeroe:base(),nivelHeroe:10};
const r0=RG.generarRival(0,op);
t('rival tiene nombre y clase', r0.nombre&&r0.clase&&r0.poder>0);
t('rival tiene 10 stats', Object.keys(r0.stats).length===10);
t('rival tiene personalidad', ['agresivo','oportunista','defensivo'].includes(r0.personalidad));
t('rival tiene retrato procedural (Sug#4)', r0.retrato&&r0.retrato.piel);
t('rival tiene especial', r0.especial);
t('rival tiene oro', r0.oro>0);
// determinismo
t('generador determinista', RG.generarRival(47,op).nombre===RG.generarRival(47,op).nombre);
t('índices distintos = rivales distintos', RG.generarRival(1,op).nombre!==RG.generarRival(2,op).nombre||RG.generarRival(1,op).poder!==RG.generarRival(2,op).poder);
// jefes y élites
const jefe=RG.generarRival(9,op);
t('el índice 9 es jefe', jefe.esJefe&&jefe.tipo==='jefe');
t('jefe más fuerte que normal', jefe.poder>RG.generarRival(8,op).poder);
t('jefe paga más oro', jefe.oro>RG.generarRival(8,op).oro);
t('jefe tiene rasgos', jefe.rasgos.length>=2);
const camp=RG.generarRival(19,op);
t('campeón detectado', camp.esCampeon&&camp.tipo==='campeon');
t('campeón paga mucho (05.14)', camp.oro>jefe.oro);
// élite ~5%
let elites=0; for(let i=0;i<600;i++){const r=RG.generarRival(i,{...op,semillaPartida:i*3+1}); if(r.esElite)elites++;}
const pctE=elites/600;
t(`élites ~5% (real ${(pctE*100).toFixed(1)}%)`, pctE>0.02&&pctE<0.10);
// escalado real
t('rivales escalan por división', RG.generarRival(150,op).poder>RG.generarRival(5,op).poder*2);
t('torre escala con piso', RG.generarRival(210,{...op,piso:50}).poder>RG.generarRival(210,{...op,piso:0}).poder);

// === LAS 3 CARTAS (06.04) ===
const cartas=RG.generarCartas(5,op);
t('exactamente 3 cartas', cartas.length===3);
t('3 perfiles distintos', new Set(cartas.map(c=>c.perfil.id)).size===3);
// Sugerencia #1: decisiones reales
t('el seguro es más débil', cartas[0].poder<cartas[1].poder);
t('el arriesgado es más fuerte', cartas[2].poder>cartas[1].poder);
t('el seguro paga menos', cartas[0].oro<cartas[1].oro);
t('el arriesgado paga más (Sug#1)', cartas[2].oro>cartas[1].oro);
t('riesgo compensa', (cartas[2].oro/cartas[1].oro)>(cartas[2].poder/cartas[1].poder));
t('cartas deterministas', RG.generarCartas(5,op)[0].nombre===cartas[0].nombre);
t('cartas con nombres distintos', new Set(cartas.map(c=>c.nombre)).size>=2);

// === NÉMESIS (05.11) ===
const nem=RG.generarNemesis({encuentros:0,nombre:'El Eterno',clase:'rudo'},{...op,statsHeroe:base()});
t('némesis se crea', nem.esNemesis&&nem.nombre==='El Eterno');
t('némesis es más fuerte', nem.poder>RG.generarRival(0,op).poder);
t('némesis tiene frase', typeof nem.frase==='string'&&nem.frase.length>5);
const nem2=RG.generarNemesis({encuentros:3,nombre:'El Eterno',clase:'rudo'},{...op,statsHeroe:base()});
t('némesis crece con los encuentros', nem2.poder>nem.poder);

// === INTEGRACIÓN: se puede luchar contra ellos ===
const heroe=F.crearLuchador({nombre:'H',clase:'bestia',nivel:10,stats:base()});
const res=E.simularLucha(heroe,RG.generarRival(3,op),{semilla:7});
t('lucha contra rival generado', ['heroe','rival',null].includes(res.ganador)&&res.ticks>0);
t('sin cuelgues', res.ticks<=600);

// === CURVA: ¿es jugable? ===
console.log('   curva de winrate del héroe (stats fijas, sin mejorar):');
for(const i of [0,5,9,15,19,25]){
  const r=RG.generarRival(i,op);
  const w=E.simularMasivo(heroe,r,150).winrate;
  const tag=DF.esCampeon(i)?'👑':DF.esJefe(i)?'💀':'  ';
  console.log(`     rival ${String(i).padStart(3)} ${tag} poder ${String(r.poder).padStart(5)} → ${(w*100).toFixed(0)}%`);
}
const w0=E.simularMasivo(heroe,RG.generarRival(0,op),200).winrate;
const w9=E.simularMasivo(heroe,RG.generarRival(9,op),200).winrate;
t(`el rival 0 es asequible (${(w0*100).toFixed(0)}%)`, w0>0.35);
t(`el jefe cuesta más que el normal`, w9<w0+0.05);

console.log(f?`\n${f} FALLOS`:'\n🎉 TODAS LAS PRUEBAS DEL PASO 7 PASARON');
process.exit(f?1:0);
