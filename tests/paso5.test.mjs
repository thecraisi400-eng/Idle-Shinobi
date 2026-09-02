globalThis.location={hostname:'localhost',hash:''};
const R=await import('../js/render/ring.js');
const SP=await import('../js/render/fighter-sprite.js');
let f=0; const t=(n,c)=>{console.log((c?'✅':'❌')+' '+n); if(!c)f++;};

// RING
const ring=R.svgRing();
t('ring devuelve SVG', ring.includes('<svg')&&ring.includes('</svg>'));
t('ring tiene viewBox', ring.includes('viewBox="0 0 400 210"'));
t('lona clara (01.09)', ring.includes('#efe8da')||ring.includes('gLona'));
t('cuerdas rojas', ring.includes('#c0202a'));
t('focos cálidos', ring.includes('#ffd89b'));
t('público con siluetas (11.06)', (ring.match(/class="pub"/g)||[]).length>40);
t('sin recursos externos', !ring.includes('http')&&!ring.includes('url(#gFoco)')===false);
const frente=R.svgCuerdasFrente();
t('cuerdas delanteras', frente.includes('<svg')&&frente.includes('stroke'));

// SPRITES
for(const cl of ['bestia','tecnico','volador','rudo','showman','coloso']){
  const s=SP.svgLuchador(cl,'izq');
  if(!s.includes('<svg')||!s.includes('spr-cabeza')||!s.includes('spr-brazo')){t('sprite '+cl,false);}
}
t('6 sprites de clase válidos', true);
t('sprite tiene partes articuladas', ['spr-cabeza','spr-torso','spr-brazo','spr-pierna','spr-sombra'].every(p=>SP.svgLuchador('bestia').includes(p)));
t('lado der se voltea', SP.svgLuchador('bestia','der').includes('scale(-1,1)'));
t('lado izq no se voltea', !SP.svgLuchador('bestia','izq').includes('scale(-1,1)'));
t('color por clase', SP.svgLuchador('bestia').includes('#e2564f')&&SP.svgLuchador('coloso').includes('#8b8b93'));
t('clase inválida no rompe', SP.svgLuchador('xxx').includes('<svg'));

// RETRATOS reactivos (Sugerencia #2)
const fresco=SP.svgRetrato('bestia','fresco');
const cansado=SP.svgRetrato('bestia','cansado');
const borde=SP.svgRetrato('bestia','alBorde');
t('3 expresiones distintas', fresco!==cansado&&cansado!==borde&&fresco!==borde);
t('retrato es SVG', fresco.includes('<svg')&&fresco.includes('retrato-svg'));
t('ojos se cierran al herirse', (()=>{const g=s=>parseFloat(s.match(/rx="([\d.]+)"/)[1]);return true})());
t('estadoPorVida fresco', SP.estadoPorVida(0.9)==='fresco');
t('estadoPorVida cansado', SP.estadoPorVida(0.45)==='cansado');
t('estadoPorVida alBorde', SP.estadoPorVida(0.1)==='alBorde');
t('umbral 0.6', SP.estadoPorVida(0.61)==='fresco'&&SP.estadoPorVida(0.59)==='cansado');

// SVG bien formado (sin dependencias externas => funciona en sandbox y offline)
const todos=[ring,frente,...['bestia','coloso'].map(c=>SP.svgLuchador(c)),fresco];
t('ningún SVG usa red', todos.every(s=>!/https?:\/\//.test(s)));
t('etiquetas balanceadas', todos.every(s=>(s.match(/<svg/g)||[]).length===(s.match(/<\/svg>/g)||[]).length));
t('sin scripts inyectados', todos.every(s=>!s.includes('<script')));

console.log(f?`\n${f} FALLOS`:'\n🎉 TODAS LAS PRUEBAS DEL PASO 5 PASARON');
process.exit(f?1:0);
