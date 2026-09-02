globalThis.location={hostname:'localhost',hash:''};
const {crearRNG}=await import('../js/core/rng.js');
const D=await import('../js/systems/combat/damage.js');
const FT=await import('../js/systems/combat/fatigue.js');
const AI=await import('../js/systems/combat/ai.js');
const E=await import('../js/systems/combat/engine.js');
const L=await import('../js/systems/combat/log.js');
const F=await import('../js/systems/fighter.js');
const {COMBATE}=await import('../js/data/constants.js');

let f=0; const t=(n,c)=>{console.log((c?'✅':'❌')+' '+n); if(!c)f++;};
const base=(o={})=>({potencia:20,vida:20,defensa:20,agilidad:20,tecnica:20,aguante:20,precision:20,recuperacion:20,presencia:20,carisma:20,...o});
const mk=(n,cl,s)=>F.crearLuchador({nombre:n,clase:cl,nivel:1,stats:s||base()});

// TIPOS DE GOLPE
t('3 tipos de golpe', D.CLAVES_TIPOS.length===3);
t('potencia pega más', D.TIPOS_GOLPE.potencia.mult>D.TIPOS_GOLPE.agilidad.mult);
t('técnica penetra', D.TIPOS_GOLPE.tecnica.penetraExtra>0);
t('agilidad cuesta menos fatiga', D.TIPOS_GOLPE.agilidad.coste<D.TIPOS_GOLPE.potencia.coste);

// DAÑO
const a=mk('A','bestia'), b=mk('B','coloso'); a._sesion={};b._sesion={};
const rng=crearRNG(1);
let g=D.calcularGolpe(a,b,'potencia',rng);
t('golpe da daño >=1', g.dano>=1);
t('golpe devuelve estructura', 'critico' in g && 'esquivado' in g);
// crítico ~10%
let crits=0,total=4000,rg=crearRNG(99);
for(let i=0;i<total;i++){const x=D.calcularGolpe(a,b,'potencia',rg);if(!x.esquivado&&x.critico)crits++;}
const cr=crits/total;
t(`crítico ~10% (real ${(cr*100).toFixed(1)}%)`, cr>0.08&&cr<0.12);
// crítico pega más
let sumC=0,nC=0,sumN=0,nN=0,rg2=crearRNG(5);
for(let i=0;i<8000;i++){const x=D.calcularGolpe(a,b,'potencia',rg2);if(x.esquivado)continue;if(x.critico){sumC+=x.dano;nC++}else{sumN+=x.dano;nN++}}
t('crítico hace más daño', (sumC/nC)>(sumN/nN)*1.3);
// defensa mitiga
const tank=mk('T','coloso',base({defensa:200}));tank._sesion={};
const d1=D.calcularGolpe(a,b,'potencia',crearRNG(3)).dano;
const d2=D.calcularGolpe(a,tank,'potencia',crearRNG(3)).dano;
t('defensa reduce daño', d2<d1);
t('nunca bloquea >90%', d2>=1);
// ventaja de clase
const vs_debil=mk('X','tecnico');vs_debil._sesion={};
const vs_fuerte=mk('Y','coloso');vs_fuerte._sesion={};
let s1=0,s2=0;for(let i=0;i<3000;i++){s1+=D.calcularGolpe(a,vs_debil,'potencia',crearRNG(i)).dano;s2+=D.calcularGolpe(a,vs_fuerte,'potencia',crearRNG(i)).dano;}
t('ventaja de clase se aplica', s1>s2);
// esquiva
const rapido=mk('R','volador',base({agilidad:180}));rapido._sesion={};
let esq=0;for(let i=0;i<3000;i++){if(D.calcularGolpe(a,rapido,'potencia',crearRNG(i+500)).esquivado)esq++;}
t(`ágil esquiva (${(esq/3000*100).toFixed(1)}%)`, esq/3000>0.15);

// FATIGA
const ff=mk('F','bestia');ff.fatiga=0;
FT.fatigaPorGolpe(ff,1);t('fatiga sube al golpear', ff.fatiga>0);
t('velocidad baja con fatiga', FT.multiplicadorVelocidad({fatiga:100,der:{}})<FT.multiplicadorVelocidad({fatiga:0,der:{}}));
ff.fatiga=50;FT.recuperarFatiga(ff);t('recupera entre rondas', ff.fatiga<50);
const duro=mk('D','coloso',base({aguante:100}));duro.fatiga=0;const flojo=mk('E','volador',base({aguante:5}));flojo.fatiga=0;
FT.fatigaPorGolpe(duro,1);FT.fatigaPorGolpe(flojo,1);
t('aguante reduce fatiga', duro.fatiga<flojo.fatiga);
t('fatiga tope 100', (()=>{const z=mk('Z','bestia');z.fatiga=0;for(let i=0;i<999;i++)FT.fatigaPorEspecial(z);return z.fatiga<=COMBATE.FATIGA_MAX})());

// IA
t('3 personalidades', Object.keys(AI.PERSONALIDADES).length===3);
const agr=mk('AG','bestia'); agr._sesion={}; agr.personalidad='agresivo';
const def=mk('DF','tecnico'); def._sesion={}; def.personalidad='defensivo';
const cuenta=(atk,dfn)=>{const c={potencia:0,tecnica:0,agilidad:0};const r=crearRNG(7);for(let i=0;i<3000;i++)c[AI.elegirGolpe(atk,dfn,r)]++;return c};
const cA=cuenta(agr,def), cD=cuenta(def,agr);
t('agresivo prefiere potencia', cA.potencia>cA.tecnica&&cA.potencia>cA.agilidad);
t('defensivo prefiere técnica', cD.tecnica>cD.potencia);
t('oportunista guarda especial', AI.retieneEspecial({personalidad:'oportunista',vida:100,der:{vidaMax:100}},{vida:90,der:{vidaMax:100}})===true);
t('agresivo no guarda', AI.retieneEspecial({personalidad:'agresivo'},{vida:90,der:{vidaMax:100}})===false);

// MOTOR
const h=mk('Heroe','bestia'), r=mk('Rival','tecnico');
const res=E.simularLucha(h,r,{semilla:42});
t('devuelve eventos', Array.isArray(res.eventos)&&res.eventos.length>5);
t('hay ganador o empate', ['heroe','rival',null].includes(res.ganador));
t('motivo válido', Object.values(E.FIN).includes(res.motivo));
t('primer evento inicio', res.eventos[0].tipo==='inicio');
t('último evento fin', res.eventos.at(-1).tipo==='fin');
t('no supera maxTicks', res.ticks<=COMBATE.TICKS_MAX);
t('log con rondas', res.log.rondas.length>=1 && res.log.rondas[0].titulo);
t('resumen completo', res.resumen.heroe.golpes>0 && res.resumen.duracionSeg>0);
t('vida nunca negativa', res.eventos.every(e=>e.vidaHeroe==null||e.vidaHeroe>=0));

// DETERMINISMO (Sugerencia #3)
const r1=E.simularLucha(mk('A','bestia'),mk('B','tecnico'),{semilla:777});
const r2=E.simularLucha(mk('A','bestia'),mk('B','tecnico'),{semilla:777});
t('misma semilla = misma lucha', r1.ganador===r2.ganador&&r1.ticks===r2.ticks&&r1.eventos.length===r2.eventos.length);
const r3=E.simularLucha(mk('A','bestia'),mk('B','tecnico'),{semilla:888});
t('otra semilla = otra lucha', r1.eventos.length!==r3.eventos.length||r1.ticks!==r3.ticks);

// MOMENTUM Y ESPECIALES
const conEsp=res.eventos.filter(e=>e.tipo==='especial');
t('se ejecutan especiales', conEsp.length>0);
t('momentum se llena', res.eventos.some(e=>e.tipo==='momentumLleno'));

// CAÍDAS Y DESCALIFICACIÓN
const rc=E.simularLucha(mk('A','bestia'),mk('B','volador'),{semilla:11,modoCaidas:true});
t('modo caídas funciona', rc.motivo!==undefined);
t('vidaPct parcial', (()=>{const x=mk('P','bestia');F.prepararParaLucha(x,0.3);return Math.abs(F.vidaPct(x)-0.3)<0.02})());

// BALANCE MASIVO (Sugerencia #1) — espejo debe dar ~50%
const m=E.simularMasivo(mk('A','bestia'),mk('B','bestia'),600);
t(`espejo ~50% (real ${(m.winrate*100).toFixed(1)}%)`, m.winrate>0.40&&m.winrate<0.60);
t(`duración razonable (${m.duracionMediaSeg.toFixed(1)}s)`, m.duracionMediaSeg>5&&m.duracionMediaSeg<200);
const mv=E.simularMasivo(mk('Fuerte','bestia',base({potencia:60,vida:50})),mk('Debil','bestia',base({potencia:10,vida:10})),400);
t(`el más fuerte gana (${(mv.winrate*100).toFixed(0)}%)`, mv.winrate>0.85);
// ventaja de clase se nota en winrate
const mc=E.simularMasivo(mk('A','bestia'),mk('B','tecnico'),600);
const mc2=E.simularMasivo(mk('A','bestia'),mk('B','coloso'),600);
t(`clase importa (${(mc.winrate*100).toFixed(0)}% vs ${(mc2.winrate*100).toFixed(0)}%)`, mc.winrate>mc2.winrate);
console.log('   motivos de fin:',JSON.stringify(m.motivos));

// LOG
t('textoLinea funciona', typeof L.textoLinea({tipo:'golpe',atacante:'A',defensor:'B',tipoGolpe:'potencia',dano:10,verboIdx:0})==='string');
t('logATexto', L.logATexto(res.log).includes('Ronda 1'));

console.log(f?`\n${f} FALLOS`:'\n🎉 TODAS LAS PRUEBAS DEL PASO 4 PASARON');
process.exit(f?1:0);
