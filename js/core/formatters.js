/**
 * Ring de Campeones — Formateadores de texto (números, tiempos, porcentajes)
 * Todos devuelven cadenas listas para `textContent`, en español.
 */

const UNITS = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi'];

/**
 * Formatea un número grande de forma compacta: 1200 → "1.2K", 120000 → "120K".
 * @param {number} value
 * @param {number} [decimals=1]
 * @returns {string}
 */
export function formatNumber(value, decimals = 1) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '0';

  const sign = numeric < 0 ? '-' : '';
  const abs = Math.abs(numeric);

  if (abs < 1000) return `${sign}${Math.floor(abs)}`;

  let tier = Math.floor(Math.log10(abs) / 3);
  if (tier >= UNITS.length) tier = UNITS.length - 1;

  const scaled = abs / 1000 ** tier;
  const rounded = scaled >= 100 ? Math.floor(scaled) : Number(scaled.toFixed(decimals));

  return `${sign}${String(rounded).replace(/\.0$/, '')}${UNITS[tier]}`;
}

/**
 * Número completo con separadores de miles (es-ES): 120000 → "120.000".
 * @param {number} value
 * @returns {string}
 */
export function formatFullNumber(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return '0';
  return Math.trunc(numeric).toLocaleString('es-ES');
}

/**
 * Porcentaje legible: 0.125 → "12,5 %".
 * @param {number} ratio Valor entre 0 y 1.
 * @param {number} [decimals=1]
 * @returns {string}
 */
export function formatPercent(ratio, decimals = 1) {
  const numeric = Number(ratio);
  if (!Number.isFinite(numeric)) return '0 %';
  const percent = numeric * 100;
  const text = percent.toFixed(decimals).replace(/\.0+$/, '').replace('.', ',');
  return `${text} %`;
}

/**
 * Duración en formato mm:ss o h:mm:ss.
 * @param {number} seconds
 * @returns {string}
 */
export function formatDuration(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/**
 * Fecha corta local: "01/09/2026 06:00".
 * @param {number|Date} timestamp
 * @returns {string}
 */
export function formatDateTime(timestamp) {
  const date = timestamp instanceof Date ? timestamp : new Date(Number(timestamp));
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
