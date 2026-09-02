/* ===== MOTOR DE COMBATE POR TICKS =====
   02.01 ticks en tiempo real cada 0.5s
   02.06 el jugador es espectador puro: cero decisiones
   02.11 condiciones múltiples de fin · 02.08 desempate por jueces

   CLAVE DE ARQUITECTURA: el motor es PURO y no toca el DOM.
   simularLucha() devuelve la lista completa de eventos ya calculada;
   el Paso 5 solo la REPRODUCE. Eso permite resolver luchas de eventos
   y PVP al instante, sin animar nada. */

import { COMBATE } from '../../data/constants.js';
import { crearRNG } from '../../core/rng.js';
import * as CONS from '../consumables.js';
import { calcularGolpe, TIPOS_GOLPE, puntuacionJueces } from './damage.js';
import { elegirGolpe, retieneEspecial } from './ai.js';
import { fatigaPorGolpe, fatigaPorEspecial, recuperarFatiga, multiplicadorVelocidad } from './fatigue.js';
import { crearLog, abrirRonda, cerrarRonda, anotar } from './log.js';
import { prepararParaLucha, vidaPct } from '../fighter.js';
import * as ST from './status.js';
import { resolverEspecial } from '../../data/especiales.js';
import { ESTADOS } from '../../data/estados.js';

/** Motivos de fin de lucha (02.11). */
/** Amplitud del estado de forma por lucha (±9%). */
export const FORMA_AMPLITUD = 0.18;

export const FIN = {
  KO: 'ko',
  LIMITE: 'limite',
  JUECES: 'jueces',
  CAIDAS: 'caidas',
  DESCALIFICACION: 'descalificacion'
};

/** Inicializa los contadores de sesión de un luchador. */
function abrirSesion(f) {
  f._sesion = {
    golpes: 0, golpesTecnica: 0, criticos: 0, especiales: 0,
    esquivasLogradas: 0, danoInfligido: 0, danoRecibido: 0,
    carga: 0, arranqueLento: 0
  };
}

/**
 * Simula una lucha completa.
 * @returns {{eventos:Array, ganador:'heroe'|'rival'|null, motivo:string, log:Object, ticks:number, resumen:Object}}
 */
export function simularLucha(heroe, rival, opciones = {}) {
  const {
    semilla = Date.now(),
    vidaHeroePct = 1,
    vidaRivalPct = 1,
    maxTicks = COMBATE.TICKS_MAX,
    permiteDescalificacion = false,   // 02.11 solo en eventos
    modoCaidas = false,               // 02.11 mejor de 3 caídas
    tensionDramatica = true,          // Sugerencia #2 del Paso 4
    // 26.02 pociones ya activadas por consumables.activar(); el motor solo
    // las dispara. En eventos llega null (20.15 sin consumibles).
    pocionesHeroe = null,
    pocionesRival = null
  } = opciones;

  const rng = crearRNG(semilla);

  /* ESTADO DE FORMA (Sugerencia #2 del Paso 4, ampliada tras el pase de balance):
     como en el deporte real, cada luchador llega al ring con un día mejor o
     peor. Un ±9% sobre daño y vida que convierte los resultados deterministas
     en pronósticos: el favorito sigue ganando, pero el KO sorpresa existe. */
  const formaH = rng.rango(1 - FORMA_AMPLITUD, 1 + FORMA_AMPLITUD);
  const formaR = rng.rango(1 - FORMA_AMPLITUD, 1 + FORMA_AMPLITUD);

  const eventos = [];
  const log = crearLog();

  prepararParaLucha(heroe, vidaHeroePct * formaH);
  prepararParaLucha(rival, vidaRivalPct * formaR);
  ST.limpiarEstados(heroe);
  ST.limpiarEstados(rival);
  // Especial equipado y su nivel de evolución (12.14)
  heroe._esp = resolverEspecial(opciones.especialHeroe || 'plancha', opciones.usosHeroe || 0);
  rival._esp = resolverEspecial(opciones.especialRival || 'plancha', opciones.usosRival || 0);
  heroe._forma = formaH;
  rival._forma = formaR;
  abrirSesion(heroe);
  abrirSesion(rival);

  let caidas = { heroe: 0, rival: 0 };
  // Keystone Terco (17.07): salva del KO un número limitado de veces
  heroe._tercoUsos = heroe.reglas?.aguantaKO?.veces || 0;
  rival._tercoUsos = rival.reglas?.aguantaKO?.veces || 0;

  /** Devuelve true si el keystone Terco evita este KO. */
  /* 26.02 — el elixir de segunda vida te levanta al caer. Se comprueba
     ANTES que el keystone terco: la poción se gastó y debe valer. */
  const salvaPocion = (f, quien) => {
    const act = f === heroe ? pocionesHeroe : pocionesRival;
    const r = CONS.revisarCaida(f, act);
    if (!r) return false;
    eventos.push({ t: tick, tipo: 'pocion', subtipo: 'revivir', quien,
                   ico: r.ico, valor: r.valor });
    return true;
  };

  const salvaTerco = (f, quien) => {
    if (salvaPocion(f, quien)) return true;
    if ((f._tercoUsos || 0) <= 0) return false;
    f._tercoUsos--;
    f.vida = 1;
    eventos.push({ t: tick, tipo: 'terco', quien });
    return true;
  };
  let ronda = 1, tick = 0, fin = null, ganador = null;
  let vidaPrevias = { heroe: 1, rival: 1 };

  abrirRonda(log, ronda);
  eventos.push({ t: 0, tipo: 'inicio', ronda: 1 });

  while (tick < maxTicks && !fin) {
    tick++;

    // 26.02 — las pociones de curación se activan solas al bajar del 50%
    for (const f of [heroe, rival]) {
      const act = f === heroe ? pocionesHeroe : pocionesRival;
      const r = CONS.revisarTick(f, act);
      if (r) eventos.push({ t: tick, tipo: 'pocion', subtipo: 'curar',
                            quien: f === heroe ? 'heroe' : 'rival',
                            ico: r.ico, valor: r.valor });
    }

    // --- Cambio de ronda cada RONDA_TICKS ---
    if (tick > 1 && (tick - 1) % COMBATE.RONDA_TICKS === 0) {
      cerrarRonda(log, vidaPct(heroe), vidaPct(rival), vidaPrevias);
      vidaPrevias = { heroe: vidaPct(heroe), rival: vidaPct(rival) };
      recuperarFatiga(heroe);
      recuperarFatiga(rival);
      // Keystone Fortaleza (17.07): escudo al empezar cada ronda
      for (const f of [heroe, rival]) {
        const esc = f.reglas?.escudoRonda?.escudo || 0;
        if (esc > 0) {
          f.escudo = (f.escudo || 0) + esc;
          eventos.push({ t: tick, tipo: 'escudoRonda',
                         quien: f === heroe ? 'heroe' : 'rival', escudo: esc });
        }
      }
      ronda++;
      abrirRonda(log, ronda);
      eventos.push({ t: tick, tipo: 'ronda', ronda });
      anotar(log, 'ronda', { numero: ronda });
    }

    // --- Tensión dramática (Sugerencia #2): evita luchas planas y eternas ---
    let boostTension = 1;
    if (tensionDramatica && tick > maxTicks * 0.55) {
      const ambosSanos = vidaPct(heroe) > 0.15 && vidaPct(rival) > 0.15;
      if (ambosSanos) boostTension = 1 + (tick / maxTicks - 0.55) * 1.6;
    }

    // --- Estados alterados: daño/cura por tick y expiración (02.05) ---
    for (const f of [heroe, rival]) {
      const esH = f === heroe;
      for (const suceso of ST.procesarTick(f)) {
        eventos.push({
          t: tick, tipo: suceso.tipo, quien: esH ? 'heroe' : 'rival',
          estado: suceso.id, ico: suceso.ico, nombre: suceso.nombre,
          dano: suceso.dano, cura: suceso.cura,
          vidaHeroe: Math.max(0, heroe.vida), vidaRival: Math.max(0, rival.vida)
        });
        if (suceso.dano || suceso.cura) {
          anotar(log, 'estadoTick', {
            objetivo: f.nombre, ico: suceso.ico, nombre: suceso.nombre,
            dano: suceso.dano, cura: suceso.cura
          });
        }
      }
      // Muerte por daño de estado (sangrado/quemadura)
      if (f.vida <= 0 && !fin && !salvaTerco(f, esH ? 'heroe' : 'rival')) {
        f.vida = 0;
        fin = FIN.KO;
        ganador = esH ? 'rival' : 'heroe';
      }
    }
    if (fin) break;

    // --- Acumulación de carga de acción según velocidad (02.01) ---
    for (const f of [heroe, rival]) {
      f._sesion.carga += f.der.velocidad * multiplicadorVelocidad(f) * ST.modVelocidad(f);
    }

    // --- Actúa quien tenga la carga llena (mayor primero si empatan) ---
    const orden = heroe._sesion.carga >= rival._sesion.carga
      ? [[heroe, rival], [rival, heroe]]
      : [[rival, heroe], [heroe, rival]];

    for (const [atk, def] of orden) {
      if (fin) break;
      if (atk._sesion.carga < 1) continue;
      atk._sesion.carga -= 1;

      const esHeroe = atk === heroe;

      // Aturdido: pierde la acción (02.05)
      if (ST.bloqueado(atk)) {
        eventos.push({ t: tick, tipo: 'aturdido', quien: esHeroe ? 'heroe' : 'rival' });
        anotar(log, 'estado', { objetivo: atk.nombre, ico: '💫', nombre: 'Aturdido', turnos: 1 });
        continue;
      }

      // ¿Especial listo? (12.03 se activa solo al llenarse)
      if (atk.momentum >= COMBATE.MOMENTUM_MAX && !retieneEspecial(atk, def)) {
        const esp = atk._esp;
        let multEsp = esp.mult * atk.der.especialMult * boostTension * (atk._forma || 1);

        // Ejecución: más daño si el rival está herido (Juicio Final)
        if (esp.ejecucion && (def.vida / def.der.vidaMax) < esp.ejecucion.umbral) {
          multEsp *= 1 + esp.ejecucion.bonus;
        }

        const g = calcularGolpe(atk, def, 'potencia', rng, {
          mult: multEsp * ST.modDanoInfligido(atk),
          critProbExtra: ST.critExtraRecibido(def),
          mitigacionMult: esp.penetracionExtra ? Math.max(0, 1 - esp.penetracionExtra) : 1
        });

        // Keystone Huracán (17.07): conserva parte del momentum
        const pctHuracan = atk.reglas?.especialDoble?.pct || 0;
        atk.momentum = Math.round(COMBATE.MOMENTUM_MAX * pctHuracan);
        atk._sesion.arranqueLento = COMBATE.MOMENTUM_ARRANQUE_TICKS;  // 12.11
        fatigaPorEspecial(atk);
        atk._sesion.especiales++;

        let absorbido = 0;
        if (!g.esquivado) {
          const abs = ST.absorberConEscudo(def, g.dano);
          absorbido = abs.absorbido;
          def.vida -= abs.danoFinal;
          atk._sesion.danoInfligido += g.dano;
          def._sesion.danoRecibido += abs.danoFinal;

          // Robo de vida (Abrazo de Oso)
          if (esp.roboVidaPct) {
            const curado = Math.round(g.dano * esp.roboVidaPct);
            atk.vida = Math.min(atk.der.vidaMax, atk.vida + curado);
            eventos.push({ t: tick, tipo: 'robo', quien: esHeroe ? 'heroe' : 'rival', cura: curado });
          }

          // Estados aplicados al rival
          for (const e of esp.estados || []) {
            const veces = e.veces || 1;
            for (let v = 0; v < veces; v++) {
              if (e.prob != null && !rng.chance(e.prob)) continue;
              const r = ST.aplicarEstado(def, e.id, rng, { dur: e.dur });
              if (r.aplicado) {
                const d = ESTADOS[e.id];
                eventos.push({
                  t: tick, tipo: 'estadoAplicado', quien: esHeroe ? 'rival' : 'heroe',
                  estado: e.id, ico: d.ico, nombre: d.nombre, capas: r.capas
                });
                anotar(log, 'estado', { objetivo: def.nombre, ico: d.ico, nombre: d.nombre, turnos: e.dur || d.dur });
              }
            }
          }
        }

        // Coste de vida propio (Tope Suicida)
        if (esp.autoDanoPct) {
          const coste = Math.round(atk.der.vidaMax * esp.autoDanoPct);
          atk.vida -= coste;
          eventos.push({ t: tick, tipo: 'autoDano', quien: esHeroe ? 'heroe' : 'rival', dano: coste });
        }

        // Estados sobre uno mismo (Muro de Acero, Abrazo de Oso)
        for (const e of esp.estadosPropios || []) {
          const r = ST.aplicarEstado(atk, e.id, null, { dur: e.dur });
          if (r.aplicado) {
            const d = ESTADOS[e.id];
            if (e.id === 'escudo' && esp.escudoMult) atk.escudo = Math.round(atk.escudo * esp.escudoMult);
            eventos.push({
              t: tick, tipo: 'estadoAplicado', quien: esHeroe ? 'heroe' : 'rival',
              estado: e.id, ico: d.ico, nombre: d.nombre, capas: r.capas
            });
            anotar(log, 'estado', { objetivo: atk.nombre, ico: d.ico, nombre: d.nombre, turnos: e.dur || d.dur });
          }
        }

        eventos.push({
          t: tick, tipo: 'especial', atacante: esHeroe ? 'heroe' : 'rival',
          nombre: esp.nombre, ico: esp.ico, nivelEsp: esp.nivel,
          dano: g.dano, absorbido, critico: g.critico, esquivado: g.esquivado,
          estadosHeroe: ST.iconosEstados(heroe), estadosRival: ST.iconosEstados(rival),
          escudoHeroe: heroe.escudo || 0, escudoRival: rival.escudo || 0,
          vidaHeroe: Math.max(0, heroe.vida), vidaRival: Math.max(0, rival.vida)
        });
        anotar(log, 'especial', { atacante: atk.nombre, nombre: esp.nombre, dano: g.dano, atacanteEsHeroe: esHeroe });

        // Auto-KO por el coste del Tope Suicida
        if (atk.vida <= 0 && !salvaTerco(atk, esHeroe ? 'heroe' : 'rival')) {
          atk.vida = 0; fin = FIN.KO; ganador = esHeroe ? 'rival' : 'heroe';
        }
      } else {
        // --- Golpe normal ---
        const tipoId = elegirGolpe(atk, def, rng);
        const g = calcularGolpe(atk, def, tipoId, rng, {
          mult: boostTension * (atk._forma || 1) * ST.modDanoInfligido(atk),
          critProbExtra: ST.critExtraRecibido(def)      // estado Vendido (02.05)
        });

        atk._sesion.golpes++;
        if (tipoId === 'tecnica') atk._sesion.golpesTecnica++;
        fatigaPorGolpe(atk, TIPOS_GOLPE[tipoId].coste);

        if (g.esquivado) {
          def._sesion.esquivasLogradas++;
        } else {
          const abs = ST.absorberConEscudo(def, g.dano);
          g.absorbido = abs.absorbido;
          def.vida -= abs.danoFinal;
          atk._sesion.danoInfligido += g.dano;
          def._sesion.danoRecibido += abs.danoFinal;
          if (g.critico) {
            atk._sesion.criticos++;
            // Keystone Carnicería (17.07): los críticos hacen sangrar
            const carn = atk.reglas?.critSangra;
            if (carn?.capas) {
              for (let c = 0; c < carn.capas; c++) ST.aplicarEstado(def, 'sangrar', atk);
              eventos.push({ t: tick, tipo: 'estadoAplicado',
                quien: esHeroe ? 'rival' : 'heroe', estado: 'sangrar', ico: '🩸' });
            }
            // Keystone Cirujano (17.07): los críticos dejan Vendido
            const cir = atk.reglas?.critVendido;
            if (cir?.ticks) {
              ST.aplicarEstado(def, 'vendido', atk);
              eventos.push({ t: tick, tipo: 'estadoAplicado',
                quien: esHeroe ? 'rival' : 'heroe', estado: 'vendido', ico: '🎯' });
            }
          }

          // Keystone Vendaval (17.07): posibilidad de encadenar otro golpe
          const vend = atk.reglas?.dobleGolpe;
          if (vend?.prob && rng.chance(vend.prob)) {
            atk._sesion.carga += 1;
            eventos.push({ t: tick, tipo: 'dobleGolpe', quien: esHeroe ? 'heroe' : 'rival' });
          }

          // Momentum solo al golpear (12.02), con arranque lento tras el especial (12.11)
          const factor = atk._sesion.arranqueLento > 0 ? COMBATE.MOMENTUM_ARRANQUE_LENTO : 1;
          if (atk._sesion.arranqueLento > 0) atk._sesion.arranqueLento--;
          const antes = atk.momentum;
          atk.momentum = Math.min(
            COMBATE.MOMENTUM_MAX,
            atk.momentum + COMBATE.MOMENTUM_POR_GOLPE * atk.der.momentumMult * factor
          );
          if (antes < COMBATE.MOMENTUM_MAX && atk.momentum >= COMBATE.MOMENTUM_MAX) {
            eventos.push({ t: tick, tipo: 'momentumLleno', quien: esHeroe ? 'heroe' : 'rival' });
          }
        }

        eventos.push({
          t: tick, tipo: 'golpe', atacante: esHeroe ? 'heroe' : 'rival',
          tipoGolpe: tipoId, dano: g.dano, critico: g.critico, esquivado: g.esquivado,
          momentumHeroe: heroe.momentum, momentumRival: rival.momentum,
          fatigaHeroe: heroe.fatiga, fatigaRival: rival.fatiga,
          absorbido: g.absorbido || 0,
          estadosHeroe: ST.iconosEstados(heroe), estadosRival: ST.iconosEstados(rival),
          escudoHeroe: heroe.escudo || 0, escudoRival: rival.escudo || 0,
          vidaHeroe: Math.max(0, heroe.vida), vidaRival: Math.max(0, rival.vida)
        });
        anotar(log, 'golpe', {
          atacante: atk.nombre, defensor: def.nombre, tipoGolpe: tipoId,
          dano: g.dano, critico: g.critico, esquivado: g.esquivado,
          verboIdx: atk._sesion.golpes, atacanteEsHeroe: esHeroe
        });
      }

      // --- ¿KO? ---
      if (def.vida <= 0 && salvaTerco(def, def === heroe ? 'heroe' : 'rival')) {
        // el keystone Terco lo mantiene en pie con 1 de vida
      } else if (def.vida <= 0) {
        if (modoCaidas) {
          const clave = def === heroe ? 'heroe' : 'rival';
          caidas[clave]++;
          eventos.push({ t: tick, tipo: 'caida', quien: clave, total: caidas[clave] });
          if (caidas[clave] >= 2) {
            fin = FIN.CAIDAS; ganador = esHeroe ? 'heroe' : 'rival';
          } else {
            def.vida = Math.floor(def.der.vidaMax * 0.45);   // se levanta
            def.fatiga = Math.min(COMBATE.FATIGA_MAX, def.fatiga + 15);
          }
        } else {
          def.vida = 0;
          fin = FIN.KO;
          ganador = esHeroe ? 'heroe' : 'rival';
        }
      }
    }

    // --- Descalificación por objeto ilegal (02.11, solo eventos) ---
    if (permiteDescalificacion && !fin && rng.chance(0.0008)) {
      const culpable = rng.chance(0.5) ? 'heroe' : 'rival';
      fin = FIN.DESCALIFICACION;
      ganador = culpable === 'heroe' ? 'rival' : 'heroe';
      eventos.push({ t: tick, tipo: 'descalificacion', culpable });
    }
  }

  // --- Límite de tiempo: decisión de jueces (02.08) ---
  if (!fin) {
    fin = FIN.LIMITE;
    const pH = puntuacionJueces(heroe);
    const pR = puntuacionJueces(rival);
    if (Math.abs(pH - pR) < 0.5) {
      ganador = null;   // empate real (23.08 en PVP se repite)
      fin = FIN.JUECES;
    } else {
      ganador = pH > pR ? 'heroe' : 'rival';
      fin = FIN.JUECES;
    }
    eventos.push({ t: tick, tipo: 'jueces', puntosHeroe: +pH.toFixed(1), puntosRival: +pR.toFixed(1) });
  }

  cerrarRonda(log, vidaPct(heroe), vidaPct(rival), vidaPrevias);
  eventos.push({
    t: tick, tipo: 'fin', motivo: fin, ganador,
    vidaHeroe: Math.max(0, heroe.vida), vidaRival: Math.max(0, rival.vida)
  });

  return {
    eventos, ganador, motivo: fin, log, ticks: tick, rondas: ronda, semilla,
    resumen: {
      heroe: { ...heroe._sesion, vidaFinal: Math.max(0, heroe.vida), vidaMax: heroe.der.vidaMax },
      rival: { ...rival._sesion, vidaFinal: Math.max(0, rival.vida), vidaMax: rival.der.vidaMax },
      duracionSeg: (tick * COMBATE.TICK_MS) / 1000,
      especialHeroe: heroe._esp?.id, usosEspecial: heroe._sesion.especiales
    }
  };
}

/** Resolución instantánea: solo el ganador, sin guardar eventos (eventos y PVP). */
export function resolverRapido(heroe, rival, opciones = {}) {
  const r = simularLucha(heroe, rival, opciones);
  return {
    ganador: r.ganador, motivo: r.motivo, resumen: r.resumen, ticks: r.ticks,
    // el Paso 11 necesita la vida final para encadenar luchas de evento (20.03, 20.08)
    vidaHeroe: r.vidaHeroe, vidaRival: r.vidaRival
  };
}

/**
 * Sugerencia #1 del Paso 4: simulador masivo para balancear.
 * Corre N luchas y devuelve el % de victoria real.
 */
export function simularMasivo(heroe, rival, n = 1000, opciones = {}) {
  let victorias = 0, empates = 0, ticksTotal = 0;
  const motivos = {};
  for (let i = 0; i < n; i++) {
    const r = resolverRapido(heroe, rival, { ...opciones, semilla: i * 7919 + 13 });
    if (r.ganador === 'heroe') victorias++;
    else if (r.ganador === null) empates++;
    ticksTotal += r.ticks;
    motivos[r.motivo] = (motivos[r.motivo] || 0) + 1;
  }
  return {
    n, victorias, empates,
    winrate: victorias / n,
    ticksMedios: ticksTotal / n,
    duracionMediaSeg: (ticksTotal / n) * COMBATE.TICK_MS / 1000,
    motivos
  };
}
