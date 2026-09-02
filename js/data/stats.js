/* ===== LAS 10 ESTADÍSTICAS =====
   03.01 diez estadísticas · 03.02 identidad de lucha
   03.03 agilidad hace las tres cosas · 03.04 crítico fijo, no depende de stats
   03.06 vida es stat directa · 03.07 sin stats derivadas ocultas
   03.12 carisma solo en eventos */

export const STATS = {
  potencia: {
    id: 'potencia', nombre: 'Potencia', ico: '💪', color: '#e2564f',
    desc: 'Daño base de todos tus golpes.',
    efecto: v => `Daño base ${(v * 1.0).toFixed(1)}`,
    peso: 3.0
  },
  aguante: {
    id: 'aguante', nombre: 'Aguante', ico: '🫁', color: '#f0a63c',
    desc: 'Reduce la fatiga acumulada al golpear y usar especiales.',
    efecto: v => `Fatiga −${Math.min(70, v * 0.9).toFixed(0)}%`,
    peso: 1.5
  },
  tecnica: {
    id: 'tecnica', nombre: 'Técnica', ico: '🎯', color: '#4d9cf0',
    desc: 'Penetra la defensa rival y puntúa ante los jueces.',
    efecto: v => `Penetra ${Math.min(60, v * 0.55).toFixed(0)}% de defensa`,
    peso: 1.8
  },
  agilidad: {
    id: 'agilidad', nombre: 'Agilidad', ico: '🌀', color: '#4ec97a',
    desc: 'Orden de golpe, esquiva y velocidad de carga del momentum. La stat premium.',
    efecto: v => `Esquiva ${Math.min(22, v * 0.12).toFixed(1)}% · Momentum +${(v * 0.6).toFixed(0)}%`,
    peso: 2.4
  },
  carisma: {
    id: 'carisma', nombre: 'Carisma', ico: '🎤', color: '#a765e8',
    desc: 'Solo suma en eventos: el público vota al más carismático.',
    efecto: v => `Puntos de evento +${(v * 0.8).toFixed(0)}%`,
    peso: 0.6, soloEventos: true
  },
  vida: {
    id: 'vida', nombre: 'Vida', ico: '❤️', color: '#ff6b6b',
    desc: 'Puntos de vida totales en el ring.',
    efecto: v => `${Math.floor(120 + v * 26)} PV`,
    peso: 2.2
  },
  defensa: {
    id: 'defensa', nombre: 'Defensa', ico: '🛡️', color: '#8b8b93',
    desc: 'Mitiga el daño que recibes en cada golpe.',
    efecto: v => `Mitiga ${(v * 0.30).toFixed(1)} de daño`,
    peso: 2.0
  },
  precision: {
    id: 'precision', nombre: 'Precisión', ico: '👁️', color: '#6ec8ff',
    desc: 'Anula la esquiva del rival y reduce tu varianza de daño.',
    efecto: v => `Anula ${Math.min(30, v * 0.18).toFixed(1)}% de esquiva`,
    peso: 1.4
  },
  recuperacion: {
    id: 'recuperacion', nombre: 'Recuperación', ico: '🩹', color: '#4ec9a7',
    desc: 'Recuperas fatiga entre rondas y resistes los estados alterados.',
    efecto: v => `−${(v * 0.5).toFixed(1)} fatiga/ronda`,
    peso: 1.1
  },
  presencia: {
    id: 'presencia', nombre: 'Presencia', ico: '🔥', color: '#e8b64c',
    desc: 'Potencia tu movimiento especial y el daño de tus críticos.',
    efecto: v => `Especial +${(v * 0.7).toFixed(0)}%`,
    peso: 0.8
  }
};

export const CLAVES_STATS = Object.keys(STATS);
export const listaStats = () => Object.values(STATS);

/* ---------- Conversión stats → valores de combate (03.07 sin ocultas) ---------- */
export function derivadas(stats, bonos = {}) {
  const g = k => (stats[k] || 0) + (bonos[k] || 0);
  return {
    vidaMax:      Math.floor(120 + g('vida') * 26),
    danoBase:     g('potencia') * 1.0,
    mitigacion:   g('defensa') * 0.30,
    penetracion:  Math.min(0.60, g('tecnica') * 0.0055),
    esquiva:      Math.min(0.22, g('agilidad') * 0.0012),
    antiEsquiva:  Math.min(0.30, g('precision') * 0.0018),
    velocidad:    1 + g('agilidad') * 0.012,
    momentumMult: 1 + g('agilidad') * 0.006,
    fatigaMult:   Math.max(0.30, 1 - g('aguante') * 0.009),
    fatigaRegen:  g('recuperacion') * 0.5,
    especialMult: 1 + g('presencia') * 0.007,
    eventoMult:   1 + g('carisma') * 0.008
  };
}
