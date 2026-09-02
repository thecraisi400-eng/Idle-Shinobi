/* ===== LOG DE COMBATE (02.13) =====
   "Lista por rondas con daño, críticos y estados aplicados, plegable."
   Sugerencia #4 del Paso 4: cada ronda recibe un título con peso
   narrativo ("Ronda 3 — remontada") sin necesidad de narrador (02.15). */

import { TIPOS_GOLPE } from './damage.js';

export function crearLog() {
  return { rondas: [], actual: null };
}

export function abrirRonda(log, numero) {
  log.actual = { numero, lineas: [], titulo: null, resumen: { dano: [0, 0], criticos: [0, 0] } };
  log.rondas.push(log.actual);
  return log.actual;
}

export function anotar(log, tipo, datos) {
  if (!log.actual) abrirRonda(log, 1);
  log.actual.lineas.push({ tipo, ...datos });

  if (tipo === 'golpe') {
    const i = datos.atacanteEsHeroe ? 0 : 1;
    log.actual.resumen.dano[i] += datos.dano;
    if (datos.critico) log.actual.resumen.criticos[i]++;
  }
}

/** Cierra la ronda y le pone un título según lo que pasó. */
export function cerrarRonda(log, vidaHeroePct, vidaRivalPct, vidaPrevias) {
  const r = log.actual;
  if (!r) return;
  const [dH, dR] = r.resumen.dano;
  const [cH, cR] = r.resumen.criticos;

  let titulo = 'intercambio parejo';
  if (dH > dR * 2.2)       titulo = 'dominio total';
  else if (dR > dH * 2.2)  titulo = 'te pasaron por encima';
  else if (dH > dR * 1.4)  titulo = 'llevas la iniciativa';
  else if (dR > dH * 1.4)  titulo = 'te están castigando';
  if (cH + cR >= 3)        titulo = 'lluvia de críticos';
  if (vidaHeroePct < 0.2 && dH > dR) titulo = 'remontada al límite';
  else if (vidaHeroePct < 0.15)      titulo = 'contra las cuerdas';
  if (vidaRivalPct < 0.15 && dH > dR) titulo = 'al borde del KO';
  if (vidaPrevias && vidaPrevias.heroe < vidaPrevias.rival && vidaHeroePct > vidaRivalPct) titulo = 'remontada';

  r.titulo = titulo;
  r.vidaFinal = { heroe: vidaHeroePct, rival: vidaRivalPct };
}

/** Texto legible de una línea del log. */
export function textoLinea(l) {
  switch (l.tipo) {
    case 'golpe': {
      const t = TIPOS_GOLPE[l.tipoGolpe];
      if (l.esquivado) return `${l.atacante} ${t.verbos[0]} — ${l.defensor} lo ESQUIVA`;
      const verbo = t.verbos[l.verboIdx % t.verbos.length];
      const crit = l.critico ? ' ¡CRÍTICO!' : '';
      return `${l.atacante} ${verbo}: ${l.dano} de daño${crit}`;
    }
    case 'especial':  return `⭐ ${l.atacante} ejecuta ${l.nombre}: ${l.dano} de daño`;
    case 'estado':    return `${l.ico} ${l.objetivo} sufre ${l.nombre} (${l.turnos} turnos)`;
    case 'estadoTick':return `${l.ico} ${l.objetivo} pierde ${l.dano} por ${l.nombre}`;
    case 'momentum':  return `🔥 ${l.quien} llena su barra de momentum`;
    case 'fin':       return `🔔 ${l.texto}`;
    case 'ronda':     return `— Ronda ${l.numero} —`;
    default:          return l.texto || '';
  }
}

/** Aplana el log a texto plano (para depuración o export). */
export function logATexto(log) {
  return log.rondas.map(r =>
    `Ronda ${r.numero} — ${r.titulo}\n` + r.lineas.map(l => '  ' + textoLinea(l)).join('\n')
  ).join('\n\n');
}
