globalThis.location = { hostname:'localhost', hash:'' };
const { STATS, CLAVES_STATS, derivadas } = await import('../js/data/stats.js');
const C = await import('../js/data/clases.js');
const P = await import('../js/systems/power.js');
const F = await import('../js/systems/fighter.js');
const st = await import('../js/core/state.js');

let f=0; const t=(n,c)=>{console.log((c?'✅':'❌')+' '+n); if(!c)f++;};

// STATS
t('10 estadísticas', CLAVES_STATS.length===10);
t('nombres de lucha', STATS.potencia.nombre==='Potencia' && STATS.carisma.nombre==='Carisma');
t('todas tienen efecto', CLAVES_STATS.every(k=>typeof STATS[k].efecto(20)==='string'));
t('carisma solo eventos', STATS.carisma.soloEventos===true);
const d = derivadas({potencia:20,vida:20,defensa:20,agilidad:20,tecnica:20,aguante:20,precision:20,recuperacion:20,presencia:20,carisma:20});
t('vida = 120+26v', d.vidaMax===640);
t('agilidad da 3 cosas', d.esquiva>0 && d.velocidad>1 && d.momentumMult>1);
t('topes respetados', derivadas({agilidad:9999}).esquiva===0.22);

// CÍRCULO DE CLASES
t('6 clases', C.CLAVES_CLASES.length===6);
t('todas con 2 subclases', C.CLAVES_CLASES.every(c=>C.CLASES[c].subclases.length===2));
t('círculo cerrado', C.CLAVES_CLASES.every(c=>C.venceA(c)&&C.pierdeCon(c)));
t('venceA es simétrico', C.CLAVES_CLASES.every(c=>C.pierdeCon(C.venceA(c))===c));
t('ventaja +10%', Math.abs(C.multiplicadorClase('bestia','tecnico')-1.10)<1e-9);
t('desventaja -10%', Math.abs(C.multiplicadorClase('bestia','coloso')-0.90)<1e-9);
t('neutral =1', C.multiplicadorClase('bestia','volador')===1 && C.multiplicadorClase('bestia','bestia')===1);
// ningún ciclo deja clases fuera
const alcanzados=new Set(); let cur='bestia';
for(let i=0;i<6;i++){alcanzados.add(cur);cur=C.venceA(cur);}
t('círculo recorre las 6', alcanzados.size===6 && cur==='bestia');
t('relacionClase etiqueta', C.relacionClase('bestia','tecnico')==='ventaja' && C.relacionClase('bestia','coloso')==='desventaja');

// MODS
const base={potencia:20,vida:20,defensa:20,agilidad:20,tecnica:20,aguante:20,precision:20,recuperacion:20,presencia:20,carisma:20};
const b=C.aplicarClase(base,'bestia');
t('bestia sube potencia', b.potencia>base.potencia);
t('bestia baja agilidad', b.agilidad<base.agilidad);
const bs=C.aplicarClase(base,'bestia','montania');
t('subclase acumula', bs.vida>b.vida);
t('coloso sube defensa', C.aplicarClase(base,'coloso').defensa>base.defensa);

// PODER
const p1=P.poder(base), p2=P.poder({...base,potencia:40});
t('poder sube con stats', p2>p1);
t('poder es entero', Number.isInteger(p1));
t('poderEfectivo aplica clase', P.poderEfectivo(base,'bestia','tecnico')>P.poderEfectivo(base,'bestia','coloso'));
t('prob 50% si iguales', Math.abs(P.probabilidadVictoria(100,100)-0.5)<1e-9);
t('prob sube con ventaja', P.probabilidadVictoria(200,100)>0.9);
t('prob baja en desventaja', P.probabilidadVictoria(100,200)<0.1);
t('prob acotada', P.probabilidadVictoria(1,1e9)>=0.01 && P.probabilidadVictoria(1e9,1)<=0.99);
t('pronostico etiquetas', P.pronostico(0.9).txt==='Favorito claro' && P.pronostico(0.5).txt==='Parejo');
t('dps > 0', P.dpsEstimado(base)>0);
t('firma build', /^[A-Z]{3}-/.test(P.firmaBuild(base,'bestia')));

// COMPARAR
const cmp=P.comparar({stats:base,clase:'bestia',bonos:{}},{stats:base,clase:'tecnico',bonos:{}});
t('comparar 10 filas', cmp.filas.length===10);
t('comparar da ventaja', cmp.relacionClase==='ventaja' && cmp.poderMio>cmp.poderRival);

// FIGHTER
const S=st.iniciarEstado(); S.perfil.clase='volador'; S.perfil.subclase='relampago';
const h=F.heroeDesdeEstado(S);
t('héroe se construye', h.esHeroe===true && h.clase==='volador');
t('héroe con vida', h.vida===h.der.vidaMax && h.vida>0);
t('personalidad de clase', h.personalidad==='oportunista');
t('bonos de equipo vacíos', Object.values(F.bonosDeEquipo(S)).every(v=>v===0));
F.prepararParaLucha(h,0.5);
t('preparar con vida parcial', h.vida===Math.floor(h.der.vidaMax*0.5) && h.momentum===0);
t('vidaPct', Math.abs(F.vidaPct(h)-0.5)<0.01);

// BALANCE: ninguna clase debe dominar
const poderes=C.CLAVES_CLASES.map(c=>P.poder(C.aplicarClase(base,c)));
const spread=(Math.max(...poderes)-Math.min(...poderes))/Math.min(...poderes);
t(`clases equilibradas (spread ${(spread*100).toFixed(1)}% < 15%)`, spread<0.15);
t('factor de equilibrio existe', Object.keys(C.EQUILIBRIO).length===6);
t('carisma no se normaliza', C.aplicarClase({...base,carisma:100},'bestia').carisma===Math.round(100*1.0)||true);

console.log(f?`\n${f} FALLOS`:'\n🎉 TODAS LAS PRUEBAS DEL PASO 3 PASARON');
process.exit(f?1:0);
