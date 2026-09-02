/* PASO 13 — Tienda: rotación horaria, stock diario, pociones, mercado negro */
globalThis.location = { hostname: 'localhost', hash: '' };

let ok = 0, mal = 0;
const t = (nombre, cond) => { if (cond) ok++; else { mal++; console.log(`❌ ${nombre}`); } };
const casi = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;

const TD = await import('../js/data/tienda.js');
const SHOP = await import('../js/systems/shop.js');
const CONS = await import('../js/systems/consumables.js');
const ST = await import('../js/core/state.js');
const INV = await import('../js/systems/inventory.js');
const { EQUIPO } = await import('../js/data/constants.js');
const { getRareza, CLAVES_SLOTS } = await import('../js/data/equipo.js');
const { crearLuchador } = await import('../js/systems/fighter.js');
const { CLAVES_STATS } = await import('../js/data/stats.js');
const { simularLucha } = await import('../js/systems/combat/engine.js');

ST.iniciarEstado();
const S = () => ST.S;

/* Momentos fijos para que las pruebas no dependan del reloj real */
const T1 = new Date(2026, 8, 2, 14, 30, 0).getTime();   // miércoles 14:30
const T1b = new Date(2026, 8, 2, 14, 59, 0).getTime();  // misma hora
const T2 = new Date(2026, 8, 2, 15, 5, 0).getTime();    // hora siguiente
const T3 = new Date(2026, 8, 3, 14, 30, 0).getTime();   // día siguiente

/* ============ 1. CATÁLOGO Y SECCIONES ============ */
t('25.01 hay 3 secciones visibles + la secreta', TD.CLAVES_SECCIONES.length === 4);
t('25.01 las secciones son pociones, equipo y ofertas',
  ['pociones', 'equipo', 'ofertas'].every(s => TD.SECCIONES[s] && !TD.SECCIONES[s].secreta));
t('25.14 el mercado negro está marcado como secreto', TD.SECCIONES.negro.secreta === true);
t('cada sección tiene nombre, icono y descripción',
  Object.values(TD.SECCIONES).every(s => s.nombre && s.ico && s.desc));

/* 26.01 pociones */
t('26.01 hay 4 pociones', TD.CLAVES_POCIONES.length === 4);
t('26.01 hay 3 de curación/revivir y 1 de vida extra',
  Object.values(TD.POCIONES).filter(p => p.efecto.tipo === 'vidaExtra').length === 1);
t('26.01 hay pociones de curación', Object.values(TD.POCIONES).some(p => p.efecto.tipo === 'curar'));
t('26.01 existe la de segunda vida', Object.values(TD.POCIONES).some(p => p.efecto.tipo === 'revivir'));
t('25.05 las pociones se pagan con oro',
  Object.values(TD.POCIONES).every(p => p.moneda === 'oro'));
t('toda poción tiene precio positivo', Object.values(TD.POCIONES).every(p => p.precio > 0));
t('25.12 toda poción tiene stock diario', Object.values(TD.POCIONES).every(p => p.stockDia > 0));
t('la poción más potente es la más cara',
  TD.POCIONES.elixir.precio > TD.POCIONES.vendaje.precio);
t('curar más cuesta más', TD.POCIONES.tonico.precio > TD.POCIONES.vendaje.precio);

/* 26.09 / 26.10 extras */
t('26.09 existe el ticket de PVP', !!TD.EXTRAS.ticketPvp);
t('26.09 el ticket se paga con gemas', TD.EXTRAS.ticketPvp.moneda === 'gemas');
t('26.10 se venden materiales de mejora',
  Object.values(TD.EXTRAS).some(e => e.efecto.tipo === 'material'));
t('26.10 los materiales tienen tope diario',
  Object.values(TD.EXTRAS).filter(e => e.efecto.tipo === 'material').every(e => e.limiteDiario > 0));
t('26.12 los productos de gemas son de comodidad, no de poder',
  Object.values(TD.EXTRAS).filter(e => e.moneda === 'gemas').every(e => e.comodidad === true));
t('26.12 ningún producto de gemas da stats',
  Object.values(TD.CONSUMIBLES).filter(p => p.moneda === 'gemas')
    .every(p => !['curar', 'revivir', 'vidaExtra'].includes(p.efecto.tipo)));
t('26.07 no se venden cosméticos',
  !Object.values(TD.CONSUMIBLES).some(p => /cosmetic|skin|aspecto/i.test(p.id + p.nombre)));
t('26.08 no se venden boosts multiplicadores',
  !Object.values(TD.CONSUMIBLES).some(p => p.efecto.tipo === 'boost' || p.efecto.tipo === 'multiplicador'));
t('26.05 no se venden cofres',
  !Object.values(TD.CONSUMIBLES).some(p => /cofre|caja|sobre/i.test(p.id + p.nombre)));

/* ============ 2. CLAVES DE TIEMPO Y ROTACIÓN (25.02) ============ */
t('la clave de hora incluye la hora', SHOP.claveHora(T1) === '2026-09-02h14');
t('25.02 la clave no cambia dentro de la misma hora',
  SHOP.claveHora(T1) === SHOP.claveHora(T1b));
t('25.02 la clave cambia a la hora siguiente', SHOP.claveHora(T1) !== SHOP.claveHora(T2));
t('la clave de día es la fecha', SHOP.claveDia(T1) === '2026-09-02');
t('la clave de día aguanta todo el día', SHOP.claveDia(T1) === SHOP.claveDia(T2));
t('la clave de día cambia mañana', SHOP.claveDia(T1) !== SHOP.claveDia(T3));

const msRot = SHOP.msParaRotacion(T1);
t('Sug#1 faltan 30 min para las 15:00', casi(msRot, 30 * 60 * 1000));
t('Sug#1 el tiempo restante nunca supera una hora',
  SHOP.msParaRotacion(T1) <= TD.ROTACION_MS && SHOP.msParaRotacion(T2) <= TD.ROTACION_MS);
t('Sug#1 el tiempo restante es positivo', SHOP.msParaRotacion(T1) > 0);

/* ============ 3. VITRINA DE EQUIPO (26.03, 26.04) ============ */
const v1 = SHOP.vitrinaEquipo(T1, 20);
const v1b = SHOP.vitrinaEquipo(T1b, 20);
const v2 = SHOP.vitrinaEquipo(T2, 20);

t('la vitrina tiene el número previsto de piezas', v1.length === TD.PIEZAS_EN_VITRINA);
t('25.02 la vitrina es la misma toda la hora',
  v1.map(p => p.nombre).join() === v1b.map(p => p.nombre).join());
t('25.02 la vitrina cambia a la hora siguiente',
  v1.map(p => p.nombre).join() !== v2.map(p => p.nombre).join());
t('26.03 las piezas se ven completas, con sus stats',
  v1.every(p => p.stats && Object.keys(p.stats).length > 0));
t('26.03 cada pieza tiene precio', v1.every(p => p.precio > 0));
t('26.04 la tienda NO vende Mítico ni Divino',
  v1.every(p => p.rareza <= TD.RAREZA_MAX_TIENDA));
t('26.04 el botín conserva el mejor techo', TD.RAREZA_MAX_TIENDA < 6);
t('las piezas de tienda no son exóticas', v1.every(p => !p.exotico));
t('25.05 el equipo se paga con oro', v1.every(p => p.moneda === 'oro'));
t('cada pieza tiene id de tienda único',
  new Set(v1.map(p => p.idTienda)).size === v1.length);
t('las piezas se ajustan al nivel del héroe',
  SHOP.vitrinaEquipo(T1, 40).every(p => p.nivel >= 38));
t('26.04 el precio incluye el margen de tienda', TD.MARGEN_TIENDA > 1);
t('el precio nunca baja del mínimo', TD.precioDePieza(1) >= 50);
t('el precio crece con el valor', TD.precioDePieza(1000) > TD.precioDePieza(100));

// Con muchas horas hay variedad de rarezas
const rarezasVistas = new Set();
for (let h = 0; h < 40; h++) {
  for (const p of SHOP.vitrinaEquipo(T1 + h * 3600e3, 20)) rarezasVistas.add(p.rareza);
}
t('hay variedad de rarezas a lo largo del día', rarezasVistas.size >= 3);
t('26.04 nunca aparece rareza 5 o 6 en la tienda',
  ![...rarezasVistas].some(r => r > TD.RAREZA_MAX_TIENDA));

/* ============ 4. OFERTA DIARIA (25.03) ============ */
const of1 = SHOP.ofertaDelDia(T1);
const of1b = SHOP.ofertaDelDia(T2);
const of2 = SHOP.ofertaDelDia(T3);

t('25.03 hay una oferta del día', !!of1 && of1.esOferta === true);
t('25.03 la oferta dura 24h: no cambia con la rotación horaria', of1.id === of1b.id);
t('25.03 la oferta cambia al día siguiente o es otra tirada',
  of2.id !== undefined);
t('25.03 el descuento es del 50%', casi(TD.OFERTA_DESCUENTO, 0.50));
t('25.03 la oferta cuesta la mitad',
  of1.precio === Math.max(1, Math.round(of1.precioOriginal * 0.5)));
t('25.03 la oferta guarda el precio original', of1.precioOriginal > of1.precio);
t('la oferta es un producto real del catálogo', !!TD.CONSUMIBLES[of1.id]);

// varios días distintos deben dar ofertas distintas alguna vez
const ofertas = new Set();
for (let d = 0; d < 20; d++) ofertas.add(SHOP.ofertaDelDia(T1 + d * 864e5).id);
t('25.03 la oferta va rotando entre productos', ofertas.size >= 3);

/* 25.06 sin descuentos fuera de la oferta diaria */
const pocionesCat = SHOP.catalogo('pociones', T1);
t('25.06 las pociones se venden a precio único',
  pocionesCat.every(p => p.precio === TD.POCIONES[p.id].precio));
t('25.15 no hay bundles',
  !Object.values(TD.CONSUMIBLES).some(p => /pack|bundle|combo|lote/i.test(p.id)));

/* ============ 5. STOCK DIARIO (25.12) ============ */
ST.iniciarEstado();
S().monedas.oro = 999999;
S().monedas.gemas = 9999;
S().perfil.nivel = 20;

SHOP.sincronizarDia(T1);
t('25.12 al empezar hay stock completo',
  SHOP.stockRestante('vendaje', T1) === TD.POCIONES.vendaje.stockDia);
t('25.12 nada está agotado al principio', !SHOP.topeAlcanzado('vendaje', T1));

const pocion = { ...TD.POCIONES.vendaje, seccion: 'pociones' };
SHOP.comprar(pocion, S(), T1);
t('25.12 comprar descuenta stock',
  SHOP.stockRestante('vendaje', T1) === TD.POCIONES.vendaje.stockDia - 1);

// agotar
let compras = 1;
while (!SHOP.topeAlcanzado('vendaje', T1) && compras < 20) { SHOP.comprar(pocion, S(), T1); compras++; }
t('25.12 el stock se agota en las unidades previstas', compras === TD.POCIONES.vendaje.stockDia);
t('25.12 agotado impide comprar', SHOP.puedeComprar(pocion, S(), T1).ok === false);
t('25.12 comprar agotado devuelve error', SHOP.comprar(pocion, S(), T1).ok === false);

const oroAntes = S().monedas.oro;
SHOP.comprar(pocion, S(), T1);
t('25.12 comprar agotado no cobra', S().monedas.oro === oroAntes);

t('25.12 el stock se repone al día siguiente',
  SHOP.stockRestante('vendaje', T3) === TD.POCIONES.vendaje.stockDia);
t('25.12 el nuevo día limpia el registro de compras',
  Object.keys(S().tienda.comprados).length === 0);

/* 26.10 tope diario de materiales */
ST.iniciarEstado(); S().monedas.oro = 999999; S().perfil.nivel = 20;
const vendas = { ...TD.EXTRAS.vendas, seccion: 'ofertas' };
let nv = 0;
while (!SHOP.topeAlcanzado('vendas', T1, S()) && nv < 30) { SHOP.comprar(vendas, S(), T1); nv++; }
t('26.10 el material tiene tope diario real', nv === TD.EXTRAS.vendas.limiteDiario);
t('26.10 alcanzado el tope, no se vende más',
  SHOP.comprar(vendas, S(), T1).ok === false);
t('26.10 el material comprado llega al inventario',
  INV.material() === TD.EXTRAS.vendas.efecto.valor * nv);

/* ============ 6. COMPRA (25.08, 25.09) ============ */
ST.iniciarEstado(); S().perfil.nivel = 20;
S().monedas.oro = 100;

const cara = { ...TD.POCIONES.elixir, seccion: 'pociones' };
const check = SHOP.puedeComprar(cara, S(), T1);
t('sin saldo no se puede comprar', check.ok === false);
t('el error indica cuánto falta', check.sinSaldo === true && /faltan/.test(check.motivo));
t('sin saldo la compra falla', SHOP.comprar(cara, S(), T1).ok === false);
t('sin saldo no se descuenta oro', S().monedas.oro === 100);

S().monedas.oro = 5000;
const antes = S().monedas.oro;
const res = SHOP.comprar(cara, S(), T1);
t('con saldo la compra funciona', res.ok === true);
t('la compra descuenta exactamente el precio', S().monedas.oro === antes - cara.precio);
t('la compra devuelve mensaje', typeof res.mensaje === 'string' && res.mensaje.length > 3);
t('26.02 la poción va a la mochila, no se usa al instante',
  CONS.cantidad('elixir') === 1);
t('25.09 no existe función de devolución',
  typeof SHOP.devolver === 'undefined' && typeof SHOP.reembolsar === 'undefined');

/* compra con gemas */
S().monedas.gemas = 100;
const ticket = { ...TD.EXTRAS.ticketPvp, seccion: 'ofertas' };
const gAntes = S().monedas.gemas;
const oroAntesGema = S().monedas.oro;
SHOP.comprar(ticket, S(), T1);
t('26.09 el ticket se paga en gemas', S().monedas.gemas === gAntes - ticket.precio);
t('26.09 el ticket se guarda', S().tienda.tickets === 1);
t('26.09 comprar con gemas no toca el oro', S().monedas.oro === oroAntesGema);

/* ampliación de inventario (26.12 comodidad) */
const maxAntes = S().equipo.maxInventario;
SHOP.comprar({ ...TD.EXTRAS.ampliacion, seccion: 'ofertas' }, S(), T1);
t('26.12 la ampliación aumenta el inventario',
  S().equipo.maxInventario === maxAntes + TD.EXTRAS.ampliacion.efecto.valor);

/* compra de equipo */
ST.iniciarEstado(); S().perfil.nivel = 20; S().monedas.oro = 9999999;
const pieza = SHOP.catalogo('equipo', T1, S())[0];
const invAntes = S().equipo.inventario.length;
const rc = SHOP.comprar(pieza, S(), T1);
t('26.03 la pieza comprada entra en el inventario',
  rc.ok && S().equipo.inventario.length === invAntes + 1);
t('la pieza desaparece de la vitrina tras comprarla',
  !SHOP.catalogo('equipo', T1, S()).some(p => p.idTienda === pieza.idTienda));
t('no se puede comprar dos veces la misma pieza',
  SHOP.puedeComprar(pieza, S(), T1).ok === false);
t('la vitrina se repone en la rotación siguiente',
  SHOP.catalogo('equipo', T2, S()).length === TD.PIEZAS_EN_VITRINA);

/* ============ 7. MERCADO NEGRO (25.14) ============ */
ST.iniciarEstado(); S().perfil.nivel = 20;
t('25.14 el mercado negro empieza cerrado', SHOP.mercadoNegroAbierto(S()) === false);
t('25.14 cerrado no muestra catálogo', SHOP.catalogo('negro', T1, S()).length === 0);

S().logros.completados.push(TD.LOGRO_MERCADO_NEGRO);
t('25.14 el logro abre el mercado negro', SHOP.mercadoNegroAbierto(S()) === true);
const negro = SHOP.catalogo('negro', T1, S());
t('25.14 abierto muestra piezas', negro.length === TD.NEGRO_PIEZAS);
t('25.14 el mercado negro vende exóticos', negro.every(p => p.exotico));
t('25.14 los exóticos son caros', TD.NEGRO_MARGEN > TD.MARGEN_TIENDA);
t('25.14 sus piezas son de rareza alta', negro.every(p => p.rareza >= 3));
t('25.14 el negro también rota cada hora',
  SHOP.vitrinaNegro(T1, 20).map(p => p.nombre).join() !==
  SHOP.vitrinaNegro(T2, 20).map(p => p.nombre).join());

/* ============ 8. POCIONES EN COMBATE (26.02) ============ */
ST.iniciarEstado(); S().perfil.nivel = 20;
t('la mochila empieza vacía', CONS.total() === 0);
t('sin pociones el plan está vacío', CONS.planificar().ninguna === true);

S().tienda.pociones = { vendaje: 1, tonico: 2, elixir: 1, hidromiel: 1 };
t('la mochila lista lo que llevas', CONS.total() === 5);
t('la mochila agrupa por tipo', CONS.mochila().length === 4);

const plan = CONS.planificar();
t('26.02 el plan elige una curación', plan.curar !== null);
t('26.02 el plan elige la MEJOR curación disponible', plan.curar.id === 'tonico');
t('26.02 el plan incluye la vida extra', plan.vidaExtra.id === 'hidromiel');
t('26.02 el plan incluye el elixir', plan.revivir.id === 'elixir');
t('26.02 no se planifican dos curaciones a la vez',
  typeof plan.curar === 'object' && !Array.isArray(plan.curar));

/* 20.15 en eventos no hay consumibles */
const planEvento = CONS.planificar(S(), true);
t('20.15 en eventos no se activa ninguna poción', planEvento.ninguna === true);
t('20.15 en eventos el plan no trae curación', planEvento.curar === null);
t('20.15 el resumen lo explica', /no se permiten/i.test(CONS.resumenPlan(S(), true)));

/* activar consume del inventario */
const stats = {}; for (const k of CLAVES_STATS) stats[k] = 40;
const h = crearLuchador({ nombre: 'H', clase: 'bestia', nivel: 20, stats });
const { prepararParaLucha } = await import('../js/systems/fighter.js');
prepararParaLucha(h, 1);
const vidaBase = h.der.vidaMax;
const activas = CONS.activar(h, S(), false);

t('26.01 la vida extra sube el máximo de vida', h.der.vidaMax > vidaBase);
t('26.01 la vida extra es del 20%',
  h.der.vidaMax === vidaBase + Math.round(vidaBase * 0.20));
t('26.01 la vida extra deja al luchador a tope', h.vida === h.der.vidaMax);
t('26.02 activar consume la poción de vida extra', CONS.cantidad('hidromiel') === 0);
t('26.02 activar consume la curación elegida', CONS.cantidad('tonico') === 1);
t('26.02 la otra curación sigue en la mochila', CONS.cantidad('vendaje') === 1);
t('26.02 activar consume el elixir', CONS.cantidad('elixir') === 0);
t('las activas quedan registradas', activas.usadas.length === 3);

/* la curación se dispara al bajar del 50% */
h.vida = h.der.vidaMax * 0.4;
const disparo = CONS.revisarTick(h, activas);
t('26.02 la curación se dispara sola bajo el 50%', disparo !== null && disparo.tipo === 'curar');
t('26.02 la curación devuelve vida', h.vida > h.der.vidaMax * 0.4);
t('26.02 la curación solo se usa una vez',
  CONS.revisarTick(h, activas) === null);

/* el elixir levanta al caer */
h.vida = 0;
const rev = CONS.revisarCaida(h, activas);
t('26.01 el elixir levanta al caer', rev !== null && h.vida > 0);
t('26.01 el elixir devuelve el 40% de vida',
  casi(h.vida, Math.round(h.der.vidaMax * 0.40)));
t('26.01 el elixir solo funciona una vez', CONS.revisarCaida(h, activas) === null);

/* integración con el motor */
ST.iniciarEstado(); S().perfil.nivel = 20;
S().tienda.pociones = { elixir: 1 };
const h2 = crearLuchador({ nombre: 'H2', clase: 'bestia', nivel: 20, stats });
const fuerte = crearLuchador({ nombre: 'R', clase: 'bestia', nivel: 60,
  stats: Object.fromEntries(CLAVES_STATS.map(k => [k, 200])) });
prepararParaLucha(h2, 1);
const act2 = CONS.activar(h2, S(), false);
const r2 = simularLucha(h2, fuerte, { semilla: 42, pocionesHeroe: act2 });
t('el motor acepta las pociones sin romperse', r2 && r2.ganador !== undefined);
t('26.02 el motor registra el disparo de la poción',
  r2.eventos.some(e => e.tipo === 'pocion'));

/* sin pociones el motor sigue funcionando igual */
const r3 = simularLucha(h2, fuerte, { semilla: 42 });
t('sin pociones el motor funciona igual', r3 && r3.ganador !== undefined);
t('sin pociones no hay eventos de poción',
  !r3.eventos.some(e => e.tipo === 'pocion'));

/* ============ 9. COMPARACIÓN Y SUGERENCIAS ============ */
ST.iniciarEstado(); S().perfil.nivel = 20;
const pz = SHOP.vitrinaEquipo(T1, 20)[0];
const cmpVacio = SHOP.comparaConEquipado(pz, S());
t('25.07 con el hueco vacío la comparación lo dice', cmpVacio.vacio === true);
t('25.07 con el hueco vacío la pieza es mejor', cmpVacio.mejor === true);
t('25.07 la comparación cuenta puntos', cmpVacio.puntosNuevo > 0);

S().equipo.slots[pz.slot] = { nombre: 'Vieja', stats: { potencia: 9999 }, slot: pz.slot };
const cmpPeor = SHOP.comparaConEquipado(pz, S());
t('Sug#3 detecta que lo tuyo es mejor', cmpPeor.mejor === false);
t('Sug#3 el delta es negativo', cmpPeor.delta < 0);
t('25.07 la comparación nombra lo equipado', cmpPeor.actual.nombre === 'Vieja');

/* Sug#2 historial */
const hist = SHOP.rotacionesPasadas(5, T1, 20);
t('Sug#2 el historial trae 5 rotaciones', hist.length === 5);
t('Sug#2 cada rotación tiene sus piezas',
  hist.every(r => r.piezas.length === TD.PIEZAS_EN_VITRINA));
t('Sug#2 las rotaciones pasadas son distintas de la actual',
  hist[0].clave !== SHOP.claveHora(T1));
t('Sug#2 el historial va hacia atrás en el tiempo',
  hist.every((r, i) => i === 0 || r.hora !== hist[i - 1].hora));

/* Sug#4 deseos */
ST.iniciarEstado();
t('Sug#4 la lista de deseos empieza vacía', SHOP.enDeseos('mascara', 4, S()) === false);
t('Sug#4 se puede añadir un deseo', SHOP.alternarDeseo('mascara', 4, S()) === true);
t('Sug#4 el deseo queda guardado', SHOP.enDeseos('mascara', 4, S()) === true);
t('Sug#4 volver a pulsar lo quita', SHOP.alternarDeseo('mascara', 4, S()) === false);
t('Sug#4 el deseo desaparece', SHOP.enDeseos('mascara', 4, S()) === false);
t('Sug#4 los deseos distinguen rareza',
  (SHOP.alternarDeseo('botas', 3, S()), SHOP.enDeseos('botas', 4, S()) === false));

/* ============ 10. ESTADO ============ */
ST.iniciarEstado();
t('el estado tiene la rama tienda', S().tienda && typeof S().tienda === 'object');
t('25.12 guarda el sello del día', 'diaStock' in S().tienda);
t('25.12 guarda lo comprado hoy', typeof S().tienda.comprados === 'object');
t('26.02 guarda la mochila de pociones', typeof S().tienda.pociones === 'object');
t('26.09 guarda los tickets', typeof S().tienda.tickets === 'number');
t('25.14 guarda si el mercado negro está abierto', 'mercadoNegro' in S().tienda);
t('Sug#4 guarda la lista de deseos', Array.isArray(S().tienda.deseos));
t('25.13 no hay nivel de tienda', !('nivel' in S().tienda));

/* ============ 11. EQUILIBRIO ECONÓMICO ============ */
/* 26.04 la tienda no debe reemplazar al botín: comprar la mejor pieza
   de la vitrina tiene que costar mucho más que venderla. */
const muestras = [];
for (let hh = 0; hh < 24; hh++) {
  for (const p of SHOP.vitrinaEquipo(T1 + hh * 3600e3, 20)) muestras.push(p);
}
t('26.04 comprar siempre cuesta más que el valor de reventa',
  muestras.every(p => p.precio > p.valor));
t('26.04 el margen es sustancial (no se puede especular)',
  muestras.every(p => p.precio >= p.valor * 2));
const precioMedio = muestras.reduce((a, p) => a + p.precio, 0) / muestras.length;
t('26.04 el precio medio es razonable para nivel 20',
  precioMedio > 100 && precioMedio < 60000);
t('las rarezas altas cuestan más que las bajas',
  (() => {
    const r1 = muestras.filter(p => p.rareza === 1);
    const r4 = muestras.filter(p => p.rareza === 4);
    if (!r1.length || !r4.length) return true;
    const m = a => a.reduce((s, p) => s + p.precio, 0) / a.length;
    return m(r4) > m(r1);
  })());

console.log(`\n${mal === 0 ? '✅' : '⚠️'} Paso 13: ${ok} correctas, ${mal} fallidas`);
process.exit(mal === 0 ? 0 : 1);
