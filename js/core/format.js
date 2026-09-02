/* ===== FORMATO DE NÚMEROS =====
   03.15 "Sin tope + notación": los números crecen para siempre
   y se leen como 12.4K / 3.2M / 1.8B, luego sufijos aa, ab, ac...
   Sugerencia #3 del Paso 2: por encima de 1e15 se conserva precisión
   trabajando con exponentes en vez de decimales frágiles. */

const CORTOS = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
const LETRAS = 'abcdefghijklmnopqrstuvwxyz';

/** Sufijo alfabético infinito: aa, ab, ac ... az, ba, bb ... */
function sufijoAlfabetico(indice) {
  let i = indice - CORTOS.length;
  let out = '';
  do {
    out = LETRAS[i % 26] + out;
    i = Math.floor(i / 26) - 1;
  } while (i >= 0);
  return out.length === 1 ? 'a' + out : out;
}

/** Formato principal: fmt(12400) → "12.4K" */
export function fmt(n, decimales = 1) {
  if (n == null || Number.isNaN(n)) return '0';
  const neg = n < 0;
  n = Math.abs(n);

  if (n < 1000) {
    const r = n % 1 === 0 ? String(n) : n.toFixed(n < 10 ? 1 : 0);
    return (neg ? '-' : '') + r;
  }

  const tier = Math.floor(Math.log10(n) / 3);
  const escala = Math.pow(10, tier * 3);
  const valor = n / escala;
  const suf = tier < CORTOS.length ? CORTOS[tier] : sufijoAlfabetico(tier);
  const txt = valor >= 100 ? valor.toFixed(0)
            : valor >= 10  ? valor.toFixed(Math.min(1, decimales))
            : valor.toFixed(decimales);

  return (neg ? '-' : '') + txt.replace(/\.0+$/, '') + suf;
}

/** Número completo con separadores: 1.234.567 */
const NF = new Intl.NumberFormat('es-VE');
export function fmtLargo(n) {
  return NF.format(Math.floor(n));
}

/** Porcentaje: pct(0.1234) → "12.3%" */
export function pct(v, dec = 1) {
  return (v * 100).toFixed(dec).replace(/\.0$/, '') + '%';
}

/** Delta con signo y color semántico: delta(+12) → {txt:"+12", clase:"ok"} */
export function delta(v) {
  if (v === 0) return { txt: '±0', clase: '' };
  return { txt: (v > 0 ? '+' : '') + fmt(v), clase: v > 0 ? 'ok' : 'bad' };
}

/** Tiempo: mmss(95) → "1:35" */
export function mmss(segundos) {
  const s = Math.max(0, Math.floor(segundos));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

/** Cuenta atrás larga: hms(7325) → "2h 02m" */
export function hms(segundos) {
  const s = Math.max(0, Math.floor(segundos));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  return `${m}m ${String(s % 60).padStart(2, '0')}s`;
}

/** Fecha legible para el guardado (27.10). */
export function fechaHora(ts = Date.now()) {
  return new Date(ts).toLocaleString('es-VE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}
