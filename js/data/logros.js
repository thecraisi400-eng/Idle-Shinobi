/* ===== LOS 150 LOGROS (30.01) =====
   Cadenas progresivas: gana 1 / 10 / 100 / 1000 luchas.
   07.14 pagan oro pequeño · 08.14 los de colección pagan gemas
   Sugerencia #4: los secretos enseñan la pista al 50% de progreso.

   En vez de escribir 150 objetos a mano, se declaran las CADENAS y
   los peldaños se generan: menos código, cero erratas y balance central. */

/** Escalones estándar de una cadena progresiva. */
export const ESCALONES = [1, 10, 50, 250, 1000];

/** Sufijos de la cadena, para que cada peldaño tenga nombre propio. */
const RANGOS = ['Novato', 'Veterano', 'Experto', 'Maestro', 'Leyenda'];

/**
 * Cada cadena declara: el contador de `S.carrera` que la alimenta,
 * el texto, y si paga gemas (colección) o solo oro.
 */
export const CADENAS = [
  { id:'luchas',      contador:'luchas',        ico:'🥊', nombre:'Peleador',       desc:n => `Disputa ${n} luchas.` },
  { id:'victorias',   contador:'victorias',     ico:'🏆', nombre:'Ganador',        desc:n => `Gana ${n} luchas.` },
  { id:'kos',         contador:'kos',           ico:'💥', nombre:'Demoledor',      desc:n => `Gana ${n} luchas por KO.` },
  { id:'criticos',    contador:'criticos',      ico:'⚡', nombre:'Certero',        desc:n => `Asesta ${n} golpes críticos.` },
  { id:'especiales',  contador:'especiales',    ico:'🌟', nombre:'Espectacular',   desc:n => `Ejecuta ${n} movimientos especiales.` },
  { id:'golpes',      contador:'golpes',        ico:'👊', nombre:'Incansable',     desc:n => `Conecta ${n} golpes.` },
  { id:'oro',         contador:'oroGanado',     ico:'🪙', nombre:'Adinerado',      desc:n => `Acumula ${n} de oro en total.`, escala:250 },
  { id:'niveles',     contador:'nivelesSubidos',ico:'📈', nombre:'Ascendente',     desc:n => `Sube ${n} niveles.`, escalones:[1,5,15,40,90] },
  { id:'objetos',     contador:'objetosObtenidos', ico:'🎁', nombre:'Coleccionista', desc:n => `Consigue ${n} piezas de equipo.`, gemas:true },
  { id:'ventas',      contador:'objetosVendidos', ico:'💱', nombre:'Chatarrero',   desc:n => `Vende ${n} piezas.` },
  { id:'eventos',     contador:'eventosJugados', ico:'🏟️', nombre:'Competidor',   desc:n => `Participa en ${n} eventos.`, escalones:[1,10,50,150,500] },
  { id:'eventosTop',  contador:'eventosTop10',  ico:'🥇', nombre:'Podio',          desc:n => `Termina ${n} veces en el top 10 de un evento.`, escalones:[1,5,25,100,300], gemas:true },
  { id:'torneos',     contador:'torneosJugados',ico:'🎪', nombre:'Gladiador',      desc:n => `Juega ${n} torneos del Coliseo.`, escalones:[1,10,50,150,500] },
  { id:'campeon',     contador:'torneosGanados',ico:'👑', nombre:'Campeón',        desc:n => `Gana ${n} torneos del Coliseo.`, escalones:[1,3,15,50,150], gemas:true },
  { id:'racha',       contador:'mejorRacha',    ico:'🔥', nombre:'Imparable',      desc:n => `Encadena ${n} victorias seguidas.`, escalones:[3,10,25,50,100] },
  { id:'dano',        contador:'danoInfligido', ico:'⚔️', nombre:'Devastador',     desc:n => `Inflige ${n} de daño total.`, escala:1000 },
  { id:'aguante',     contador:'danoRecibido',  ico:'🛡️', nombre:'Correoso',      desc:n => `Encaja ${n} de daño.`, escala:1000 },
  { id:'gemas',       contador:'gemasGanadas',  ico:'💎', nombre:'Joyero',         desc:n => `Consigue ${n} gemas.`, escalones:[1,25,100,400,1200], gemas:true },
  { id:'gasto',       contador:'oroGastado',    ico:'🛒', nombre:'Comprador',      desc:n => `Gasta ${n} de oro.`, escala:250 },
  { id:'derrotas',    contador:'derrotas',      ico:'💀', nombre:'Resistente',     desc:n => `Sobrevive a ${n} derrotas.` }
];

/* ---------- 07.14 recompensas: oro pequeño ---------- */

/** El oro crece con el peldaño, pero se mantiene modesto. */
export function oroDeLogro(peldano) {
  return [50, 150, 500, 1800, 6000][peldano] || 50;
}

/** 08.14 los de colección pagan gemas además del oro. */
export function gemasDeLogro(peldano) {
  return [1, 2, 3, 5, 10][peldano] || 1;
}

/* ---------- Generación de los 100 logros de cadena ---------- */

function generarCadenas() {
  const out = [];
  for (const c of CADENAS) {
    const escalones = c.escalones || ESCALONES.map(n => n * (c.escala || 1));
    escalones.forEach((meta, i) => {
      out.push({
        id: `${c.id}${i + 1}`,
        cadena: c.id,
        peldano: i,
        nombre: `${c.nombre} ${RANGOS[i]}`,
        desc: c.desc(meta.toLocaleString('es')),
        ico: c.ico,
        contador: c.contador,
        meta,
        oro: oroDeLogro(i),
        gemas: c.gemas ? gemasDeLogro(i) : 0,
        secreto: false
      });
    });
  }
  return out;
}

/* ---------- Logros sueltos y secretos ---------- */

/**
 * 50 logros de hito que no son cadenas: piden condiciones concretas.
 * `condicion(estado)` se evalúa contra el estado completo.
 * Sugerencia #4: los secretos llevan `pista`, que se revela al 50%.
 */
export const HITOS = [
  { id:'primeraSangre', ico:'🩸', nombre:'Primera sangre', desc:'Gana tu primera lucha.',
    cond:e => e.carrera.victorias >= 1 },
  { id:'clase', ico:'🎭', nombre:'Vocación', desc:'Elige tu clase de luchador.',
    cond:e => !!e.perfil.clase },
  { id:'subclase', ico:'🎓', nombre:'Especialista', desc:'Desbloquea tu subclase.',
    cond:e => !!e.perfil.subclase },
  { id:'nivel10', ico:'🔟', nombre:'Diez de diez', desc:'Alcanza el nivel 10.',
    cond:e => e.perfil.nivel >= 10 },
  { id:'nivel25', ico:'📊', nombre:'Cuarto de siglo', desc:'Alcanza el nivel 25.',
    cond:e => e.perfil.nivel >= 25 },
  { id:'nivel50', ico:'🏔️', nombre:'Medio centenar', desc:'Alcanza el nivel 50.',
    cond:e => e.perfil.nivel >= 50 },
  { id:'nivel100', ico:'💯', nombre:'Centenario', desc:'Alcanza el nivel 100.',
    cond:e => e.perfil.nivel >= 100 },
  { id:'equipoCompleto', ico:'🛡️', nombre:'De punta en blanco', desc:'Lleva las 8 piezas equipadas.',
    cond:e => Object.values(e.equipo.slots).filter(Boolean).length >= 8 },
  { id:'legendario', ico:'🟠', nombre:'Toque legendario', desc:'Consigue una pieza Legendaria.',
    cond:e => tieneRareza(e, 4), gemas:3 },
  { id:'mitico', ico:'🟣', nombre:'Mito viviente', desc:'Consigue una pieza Mítica.',
    cond:e => tieneRareza(e, 5), gemas:5 },
  { id:'divino', ico:'⭐', nombre:'Tocado por los dioses', desc:'Consigue una pieza Divina.',
    cond:e => tieneRareza(e, 6), gemas:10 },
  { id:'exotico', ico:'🌀', nombre:'Rareza exótica', desc:'Consigue una pieza exótica.',
    cond:e => todasLasPiezas(e).some(p => p.exotico), gemas:3 },
  { id:'coleccionista', ico:'🗃️', nombre:'Coleccionista', desc:'Ten 30 piezas en el inventario a la vez.',
    cond:e => e.equipo.inventario.length >= 30, gemas:5 },
  { id:'estrella5', ico:'✨', nombre:'Cinco estrellas', desc:'Mejora una pieza hasta 5 estrellas.',
    cond:e => todasLasPiezas(e).some(p => (p.estrellas || 0) >= 5) },
  { id:'ricachon', ico:'🤑', nombre:'Ricachón', desc:'Ten 100.000 de oro a la vez.',
    cond:e => e.monedas.oro >= 100000 },
  { id:'gemas50', ico:'💠', nombre:'Cofre de gemas', desc:'Ten 50 gemas a la vez.',
    cond:e => e.monedas.gemas >= 50, gemas:2 },
  { id:'arbol10', ico:'🌳', nombre:'Raíces', desc:'Desbloquea 10 nodos del árbol.',
    cond:e => Object.keys(e.arbol?.nodos || {}).length >= 10 },
  { id:'arbol40', ico:'🌲', nombre:'Copa frondosa', desc:'Desbloquea 40 nodos del árbol.',
    cond:e => Object.keys(e.arbol?.nodos || {}).length >= 40 },
  { id:'ramas3', ico:'🌿', nombre:'Polivalente', desc:'Abre 3 ramas del árbol.',
    cond:e => (e.arbol?.ramasAbiertas || []).length >= 3 },
  { id:'ramas6', ico:'🍀', nombre:'Sin especialidad', desc:'Abre las 6 ramas del árbol.',
    cond:e => (e.arbol?.ramasAbiertas || []).length >= 6 },
  { id:'ligaPlata', ico:'🥈', nombre:'Ascenso a Plata', desc:'Alcanza la liga Plata.',
    cond:e => e.pvp.liga >= 2 },
  { id:'ligaOro', ico:'🥇', nombre:'Ascenso a Oro', desc:'Alcanza la liga Oro.',
    cond:e => e.pvp.liga >= 3 },
  { id:'ligaDiamante', ico:'💠', nombre:'Ascenso a Diamante', desc:'Alcanza la liga Diamante.',
    cond:e => e.pvp.liga >= 4, gemas:5 },
  { id:'ligaLeyenda', ico:'👑', nombre:'Ascenso a Leyenda', desc:'Alcanza la liga Leyenda.',
    cond:e => e.pvp.liga >= 5, gemas:10 },
  { id:'invicto', ico:'🛡️', nombre:'Sin una mancha', desc:'Gana 10 luchas sin perder ninguna.',
    cond:e => e.carrera.victorias >= 10 && e.carrera.derrotas === 0 },
  { id:'mochila', ico:'🧪', nombre:'Boticario', desc:'Ten 5 pociones a la vez.',
    cond:e => Object.values(e.tienda?.pociones || {}).reduce((a, b) => a + b, 0) >= 5 },
  { id:'ticket', ico:'🎟️', nombre:'Con entrada', desc:'Compra un ticket del Coliseo.',
    cond:e => (e.tienda?.tickets || 0) >= 1 },
  { id:'material100', ico:'🩹', nombre:'Almacén de vendas', desc:'Acumula 100 de material.',
    cond:e => (e.equipo.material || 0) >= 100 },
  { id:'stat50', ico:'💪', nombre:'Cincuentón', desc:'Sube una estadística hasta 50.',
    cond:e => Object.values(e.stats).some(v => v >= 50) },
  { id:'stat100', ico:'🦍', nombre:'Sobrehumano', desc:'Sube una estadística hasta 100.',
    cond:e => Object.values(e.stats).some(v => v >= 100) },
  { id:'equilibrado', ico:'⚖️', nombre:'Equilibrado', desc:'Ten todas las estadísticas en 25 o más.',
    cond:e => Object.values(e.stats).every(v => v >= 25) },
  { id:'horas1', ico:'⏱️', nombre:'Una hora', desc:'Juega una hora en total.',
    cond:e => (e.meta.tiempoJugadoMs || 0) >= 3600e3 },
  { id:'horas10', ico:'⏳', nombre:'Diez horas', desc:'Juega diez horas en total.',
    cond:e => (e.meta.tiempoJugadoMs || 0) >= 10 * 3600e3 },
  { id:'horas50', ico:'🕰️', nombre:'Cincuenta horas', desc:'Juega cincuenta horas en total.',
    cond:e => (e.meta.tiempoJugadoMs || 0) >= 50 * 3600e3, gemas:10 },
  { id:'exportador', ico:'💾', nombre:'Precavido', desc:'Exporta tu partida por primera vez.',
    cond:e => !!e.meta.exportado },
  { id:'especialEvo', ico:'🔮', nombre:'Evolución', desc:'Evoluciona un movimiento especial.',
    cond:e => Object.values(e.especiales?.usos || {}).some(u => u >= 25) },
  { id:'especialMax', ico:'☄️', nombre:'Movimiento perfecto', desc:'Lleva un especial a su última evolución.',
    cond:e => Object.values(e.especiales?.usos || {}).some(u => u >= 200), gemas:5 },
  { id:'division3', ico:'🎖️', nombre:'Media tabla', desc:'Alcanza la división 3.',
    cond:e => (e.arena?.division || 1) >= 3 },
  { id:'division6', ico:'🏅', nombre:'Entre leyendas', desc:'Alcanza la división 6.',
    cond:e => (e.arena?.division || 1) >= 6, gemas:5 },
  { id:'torre', ico:'🗼', nombre:'A la torre', desc:'Entra en la Torre infinita.',
    cond:e => (e.arena?.torre || 0) >= 1, gemas:3 },

  /* --- Secretos (Sugerencia #4: pista al 50%) --- */
  { id:'sinEquipo', ico:'🩲', nombre:'A pelo', desc:'Gana una lucha sin nada equipado.',
    secreto:true, pista:'Hay quien pelea mejor sin nada que le estorbe...',
    cond:e => !!e.hitos?.sinEquipo },
  { id:'remontada', ico:'🔄', nombre:'Remontada', desc:'Gana una lucha con menos del 5% de vida.',
    secreto:true, pista:'Sobrevivir con un hilo de vida y aun así ganar.',
    cond:e => !!e.hitos?.remontada },
  { id:'perfecto', ico:'😇', nombre:'Ni un rasguño', desc:'Gana una lucha sin recibir daño.',
    secreto:true, pista:'Ganar es fácil. Ganar intacto, no.',
    cond:e => !!e.hitos?.perfecto },
  { id:'relampagoKO', ico:'⚡', nombre:'Fulminante', desc:'Gana una lucha en menos de 5 segundos.',
    secreto:true, pista:'Algunas luchas acaban antes de empezar.',
    cond:e => !!e.hitos?.relampagoKO },
  { id:'jueces', ico:'⚖️', nombre:'A los puntos', desc:'Gana una lucha por decisión de los jueces.',
    secreto:true, pista:'No todas las victorias llegan por KO.',
    cond:e => !!e.hitos?.jueces },
  { id:'descalificado', ico:'🚫', nombre:'Fuera del ring', desc:'Sufre una descalificación en un evento.',
    secreto:true, pista:'Las reglas de los eventos son estrictas.',
    cond:e => !!e.hitos?.descalificado },
  { id:'empate', ico:'🤝', nombre:'Tablas', desc:'Termina una lucha en empate.',
    secreto:true, pista:'A veces nadie gana.',
    cond:e => !!e.hitos?.empate },
  { id:'mercadoNegro', ico:'🕯️', nombre:'Puerta trasera', desc:'Descubre el mercado negro.',
    secreto:true, pista:'Coleccionar abre puertas inesperadas.',
    cond:e => !!e.tienda?.mercadoNegro || (e.logros?.completados || []).includes('coleccionista') },
  { id:'domingo', ico:'🎉', nombre:'Domingo de gloria', desc:'Gana un evento en domingo.',
    secreto:true, pista:'Un día de la semana paga el doble...',
    cond:e => !!e.hitos?.domingo, gemas:3 },
  { id:'sabadoXL', ico:'🎪', nombre:'Talla XL', desc:'Juega un torneo del Sábado XL.',
    secreto:true, pista:'El fin de semana el Coliseo se agranda.',
    cond:e => !!e.hitos?.sabadoXL, gemas:3 }
];

function todasLasPiezas(e) {
  return [...(e.equipo.inventario || []), ...Object.values(e.equipo.slots || {}).filter(Boolean)];
}
function tieneRareza(e, min) {
  return todasLasPiezas(e).some(p => (p.rareza || 0) >= min);
}

/* ---------- El catálogo completo ---------- */

const CADENA_LOGROS = generarCadenas();

/** 30.01 — los 150 logros del juego. */
export const LOGROS = [...CADENA_LOGROS, ...HITOS.map(h => ({
  ...h,
  oro: h.oro ?? 300,
  gemas: h.gemas ?? 0,
  secreto: !!h.secreto,
  peldano: 0
}))];

export const TOTAL_LOGROS = LOGROS.length;
export const getLogro = id => LOGROS.find(l => l.id === id) || null;
export const LOGROS_POR_CADENA = (cadena) => LOGROS.filter(l => l.cadena === cadena);
export const SECRETOS = LOGROS.filter(l => l.secreto);
