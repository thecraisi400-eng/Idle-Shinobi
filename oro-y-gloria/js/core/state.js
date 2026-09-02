/* ===== GAME STATE — única fuente de verdad =====
   Nadie modifica el estado directamente: se usan las funciones oficiales
   (ganarOro, gastarOro, ganarGemas...) que emiten eventos en el bus.
   Sugerencia #1 del Paso 2: en desarrollo el estado se congela para
   detectar al instante cualquier mutación pirata. */

import { ECO, PROG, EQUIPO, META } from '../data/constants.js';
import { emit } from './events-bus.js';
import { crearRNG, sembrarGlobal } from './rng.js';

/* ---------- Modo desarrollo ---------- */
export const DEV = location.hostname === 'localhost'
               || location.hostname.startsWith('127.')
               || location.hostname.endsWith('.e2b.app');

/* ---------- Estado vivo ---------- */
export let S = null;

/* ---------- Partida nueva ---------- */
export function crearPartidaNueva(semilla = Date.now()) {
  const rng = crearRNG(semilla);
  const statInicial = () => rng.int(PROG.STAT_MIN_INICIAL, PROG.STAT_MAX_INICIAL);

  return {
    meta: {
      version: META.VERSION_SAVE,       // 27.09
      semilla,                          // Sugerencia #4
      creado: Date.now(),
      guardado: 0,                      // 27.10
      tiempoJugadoMs: 0,
      sesionInicio: Date.now(),
      tutorialHecho: false              // 01.14
    },

    perfil: {
      nombre: 'Novato sin Máscara',     // 05.10 aspecto fijo
      clase: null,                      // 05.01 se elige en el Paso 3
      subclase: null,
      nivel: 1,                         // 01.08 sin nivel máximo
      xp: 0,
      puntosLibres: 0,                  // 03.09
      puntosArbol: 0,                   // 17.03
      rango: 'D',                       // 14.01 cinco rangos D→S
      rasgos: []                        // 14.10 mesa de rasgos
    },

    monedas: {
      oro: ECO.ORO_INICIAL,             // 07.15 = 100
      gemas: ECO.GEMAS_INICIALES
    },

    // 03.01 / 03.02 — las 10 estadísticas con identidad de lucha
    stats: {
      potencia:    statInicial(),
      aguante:     statInicial(),
      tecnica:     statInicial(),
      agilidad:    statInicial(),
      carisma:     statInicial(),
      vida:        statInicial(),
      defensa:     statInicial(),
      precision:   statInicial(),
      recuperacion:statInicial(),
      presencia:   statInicial()
    },

    // 13.02 cuántas veces se compró cada stat (para el coste creciente)
    compras: {
      potencia:0, aguante:0, tecnica:0, agilidad:0, carisma:0,
      vida:0, defensa:0, precision:0, recuperacion:0, presencia:0
    },

    equipo: {
      slots: { mascara:null, capa:null, botas:null, muniequeras:null,
               cinturon:null, protector:null, guantes:null, amuleto:null },
      inventario: [],                   // 16.09 máx 100
      maxInventario: EQUIPO.INVENTARIO_MAX,
      autoVenta: { r1:false, r2:false, r3:false, r4:false, r5:false, r6:false },
      material: 0,                      // 16.01 vendas de campeón
      bloqueados: []                    // Sugerencia #2 del Paso 9
    },

    arbol: { nodos: {}, ramasAbiertas: ['potencia'] },

    especial: { actual: 'plancha', desbloqueados: ['plancha'], usos: {} },

    progreso: {
      division: 1,                      // 05.12 seis divisiones
      rivalIndice: 0,
      luchasDesdeJefe: 0,               // 05.13
      cartasOfrecidas: null,            // 06.04
      rivalActual: null,
      torrePiso: 0,                     // 06.11 torre infinita
      nemesis: null                     // 05.11 rival con historia
    },

    eventos: { inscrito: null, intentos: 0, puntaje: 0, ultimo: null, ordenDia: null, diaSemilla: null },

    pvp: {
      liga: 1, torneoActivo: null, temporadaInicio: null,
      torneosSemana: 0, ganadosSemana: 0,   // 24.02 se reinician cada lunes
      ultimoTorneo: null                    // 23.15 sin historial: solo el último, para el resumen
    },

    tienda: {
      rotacionHora: null, stock: {}, ofertaDiaria: null, mercadoNegro: false,
      diaStock: null,          // 25.12 sello del día para el stock
      comprados: {},           // {idConsumible: unidades compradas hoy}
      compradosEquipo: [],     // piezas de la vitrina de esta hora ya vendidas
      pociones: {},            // 26.02 mochila: se activan solas en la lucha
      tickets: 0,              // 26.09 tickets del Coliseo
      deseos: []               // Sugerencia #4: lista de deseos
    },

    misiones: { diarias: [], semanales: [], diaReset: null, semanaReset: null, refrescos: 1 },

    logros: { completados: [], progreso: {} },

    // hitos puntuales que el estado no puede deducir solo (logros secretos)
    hitos: {},

    // Sugerencia #5 del Paso 2: contadores desde el minuto uno
    carrera: {
      victorias: 0, derrotas: 0,
      luchas: 0, kos: 0, kosRecibidos: 0,
      golpes: 0, criticos: 0, especiales: 0,
      danoInfligido: 0, danoRecibido: 0,
      oroGanado: 0, oroGastado: 0,
      gemasGanadas: 0, gemasGastadas: 0,
      nivelesSubidos: 0, objetosObtenidos: 0, objetosVendidos: 0,
      eventosJugados: 0, eventosTop10: 0,
      torneosJugados: 0, torneosGanados: 0,
      mejorRacha: 0, rachaActual: 0
    },

    ajustes: {
      velocidad: 1,                     // 02.02 1x / 2x
      numerosDano: true,                // 02.14 configurables
      tamanoNumeros: 'medio',
      modoResumen: false,
      logDetallado: true,               // 02.13
      modoSimple: false,                // 29.14
      autoLuchar: false                 // 10.11
    }
  };
}

/* ---------- Carga / arranque ---------- */
export function iniciarEstado(datos = null) {
  S = datos || crearPartidaNueva();
  S.meta.sesionInicio = Date.now();
  sembrarGlobal(S.meta.semilla);
  emit('estado:listo', S);
  return S;
}

export function reemplazarEstado(datos) {
  S = datos;
  sembrarGlobal(S.meta.semilla);
  emit('estado:listo', S);
  emit('hud:refresh');
  return S;
}

/* ================= MUTACIONES OFICIALES ================= */

/** Suma oro. motivo sirve para las estadísticas y el log. */
export function ganarOro(cantidad, motivo = 'lucha') {
  cantidad = Math.floor(cantidad);
  if (cantidad <= 0) return 0;
  S.monedas.oro += cantidad;
  S.carrera.oroGanado += cantidad;
  emit('oro:change', { delta: cantidad, motivo, total: S.monedas.oro });
  return cantidad;
}

/** Gasta oro. Devuelve true si alcanzó. */
export function gastarOro(cantidad, motivo = 'compra') {
  cantidad = Math.floor(cantidad);
  if (cantidad <= 0) return true;
  if (S.monedas.oro < cantidad) {
    emit('oro:insuficiente', { falta: cantidad - S.monedas.oro, motivo });
    return false;
  }
  S.monedas.oro -= cantidad;
  S.carrera.oroGastado += cantidad;
  emit('oro:change', { delta: -cantidad, motivo, total: S.monedas.oro });
  return true;
}

export function ganarGemas(cantidad, motivo = 'premio') {
  cantidad = Math.floor(cantidad);
  if (cantidad <= 0) return 0;
  S.monedas.gemas += cantidad;
  S.carrera.gemasGanadas += cantidad;
  emit('gemas:change', { delta: cantidad, motivo, total: S.monedas.gemas });
  return cantidad;
}

export function gastarGemas(cantidad, motivo = 'compra') {
  cantidad = Math.floor(cantidad);
  if (S.monedas.gemas < cantidad) {
    emit('gemas:insuficiente', { falta: cantidad - S.monedas.gemas, motivo });
    return false;
  }
  S.monedas.gemas -= cantidad;
  S.carrera.gemasGastadas += cantidad;
  emit('gemas:change', { delta: -cantidad, motivo, total: S.monedas.gemas });
  return true;
}

/* ---------- Estadísticas ---------- */

/** Tope actual de una stat según el nivel (03.11 / 13.04). */
export function topeStat() {
  return PROG.TOPE_STAT_BASE + PROG.TOPE_STAT_POR_NIVEL * (S.perfil.nivel - 1);
}

/** Coste creciente por stat (13.02). */
export function costeStat(clave) {
  const compradas = S.compras[clave] || 0;
  return Math.floor(PROG.COSTE_STAT_BASE * Math.pow(PROG.COSTE_STAT_ESCALA, compradas));
}

/** Sube una stat pagando oro. Respeta el tope. */
export function mejorarStat(clave) {
  if (!(clave in S.stats)) return false;
  if (S.stats[clave] >= topeStat()) {
    emit('stat:tope', { clave });
    return false;
  }
  const coste = costeStat(clave);
  if (!gastarOro(coste, `stat:${clave}`)) return false;
  S.stats[clave] += PROG.SUBIDA_POR_PUNTO;
  S.compras[clave]++;
  emit('stat:change', { clave, valor: S.stats[clave], coste });
  return true;
}

/** Asigna un punto libre de nivel (03.09). */
export function asignarPunto(clave) {
  if (S.perfil.puntosLibres <= 0) return false;
  if (S.stats[clave] >= topeStat()) return false;
  S.perfil.puntosLibres--;
  S.stats[clave] += PROG.SUBIDA_POR_PUNTO;
  emit('stat:change', { clave, valor: S.stats[clave], coste: 0 });
  emit('perfil:change');
  return true;
}

/* ---------- Experiencia (04.01) ---------- */

export function xpNecesaria(nivel = S.perfil.nivel) {
  return Math.floor(PROG.XP_BASE * Math.pow(nivel, PROG.XP_EXP));
}

export function ganarXP(cantidad) {
  cantidad = Math.floor(cantidad);
  if (cantidad <= 0) return;
  S.perfil.xp += cantidad;
  let subidas = 0;
  while (S.perfil.xp >= xpNecesaria()) {
    S.perfil.xp -= xpNecesaria();
    S.perfil.nivel++;
    S.perfil.puntosLibres += PROG.PUNTOS_POR_NIVEL;
    S.perfil.puntosArbol += 1;
    S.carrera.nivelesSubidos++;
    subidas++;
  }
  emit('xp:change', { delta: cantidad, xp: S.perfil.xp, necesaria: xpNecesaria() });
  if (subidas) emit('nivel:up', { nivel: S.perfil.nivel, subidas });
}

/** Porcentaje de XP para la barra del HUD. */
export function xpPct() {
  return Math.min(100, (S.perfil.xp / xpNecesaria()) * 100);
}

/* ---------- Récord ---------- */
export function registrarResultado(gano) {
  S.carrera.luchas++;
  if (gano) {
    S.carrera.victorias++;
    S.carrera.rachaActual++;
    S.carrera.mejorRacha = Math.max(S.carrera.mejorRacha, S.carrera.rachaActual);
  } else {
    S.carrera.derrotas++;
    S.carrera.rachaActual = 0;
  }
  emit('carrera:change', { gano });
}

/* ---------- Tiempo jugado ---------- */
export function tiempoJugado() {
  return S.meta.tiempoJugadoMs + (Date.now() - S.meta.sesionInicio);
}
export function sellarTiempo() {
  S.meta.tiempoJugadoMs = tiempoJugado();
  S.meta.sesionInicio = Date.now();
}
