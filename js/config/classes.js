/**
 * Ring de Campeones - Catálogo y Reglas de Clases
 * Versión: 1.0.0 (Paso 1)
 */

export const CLASSES = Object.freeze({
  HEAVY: {
    id: 'heavy',
    name: 'Pesado',
    isPlayable: true,
    description: 'Titán imponente con enorme resistencia y golpes demoledores.',
    advantagesAgainst: ['agile'],     // Vence a Ágil (+12% daño)
    disadvantagesAgainst: ['technical'], // Sufre ante Técnico (-10% daño)
    statModifiers: Object.freeze({
      health: 1.18,
      defense: 1.08,
      speed: 0.90,
      attack: 1.00
    }),
    moves: Object.freeze([
      { id: 'h_powerbomb', name: 'Bombazo Destructor', power: 1.25 },
      { id: 'h_lariat', name: 'Lariat Fulminante', power: 1.10 },
      { id: 'h_chokeslam', name: 'Garra Infernal', power: 1.20 },
      { id: 'h_bearhug', name: 'Abrazo de Oso', power: 1.05 },
      { id: 'h_bigboot', name: 'Bota a la Quijada', power: 1.00 },
      { id: 'h_bodyslam', name: 'Azotón contra la Lona', power: 1.05 },
      { id: 'h_splash', name: 'Plancha Titánica', power: 1.15 },
      { id: 'h_finisher', name: '¡MARTILLO DEL DESTINO!', power: 1.50, isFinisher: true }
    ])
  },
  TECHNICAL: {
    id: 'technical',
    name: 'Técnico',
    isPlayable: true,
    description: 'Maestro de las llaves y la sumisión con precisión quirúrgica.',
    advantagesAgainst: ['heavy'],     // Vence a Pesado (+12% daño)
    disadvantagesAgainst: ['agile'],  // Sufre ante Ágil (-10% daño)
    statModifiers: Object.freeze({
      accuracy: 1.10,
      criticalChance: 1.05,
      health: 0.95,
      attack: 1.00
    }),
    moves: Object.freeze([
      { id: 't_sharpshooter', name: 'Francotirador de Piernas', power: 1.25 },
      { id: 't_suplex', name: 'Suplex Alemán Perfecto', power: 1.15 },
      { id: 't_armbar', name: 'Palanca al Brazo', power: 1.10 },
      { id: 't_figurefour', name: 'Cruceta a las Cuatro', power: 1.20 },
      { id: 't_dropkick', name: 'Patada Voladora Precisa', power: 1.00 },
      { id: 't_crossface', name: 'Candado Cruzado', power: 1.15 },
      { id: 't_ddt', name: 'DDT Implacable', power: 1.10 },
      { id: 't_finisher', name: '¡SUMISIÓN DE LA ETERNIDAD!', power: 1.50, isFinisher: true }
    ])
  },
  AGILE: {
    id: 'agile',
    name: 'Ágil',
    isPlayable: true,
    description: 'Luchador aéreo ultrarrápido con reflejos y esquiva superior.',
    advantagesAgainst: ['technical'], // Vence a Técnico (+12% daño)
    disadvantagesAgainst: ['heavy'],  // Sufre ante Pesado (-10% daño)
    statModifiers: Object.freeze({
      speed: 1.18,
      dodge: 1.03,
      defense: 0.92,
      attack: 1.00
    }),
    moves: Object.freeze([
      { id: 'a_frog_splash', name: 'Plancha Sapito Aérea', power: 1.20 },
      { id: 'a_hurricanrana', name: 'Huracarrana Veloz', power: 1.10 },
      { id: 'a_springboard', name: 'Impulso de Cuerdas', power: 1.05 },
      { id: 'a_moonsault', name: 'Salto Lunar Imposible', power: 1.25 },
      { id: 'a_tornado_ddt', name: 'DDT Tornado', power: 1.15 },
      { id: 'a_enzuigiri', name: 'Patada Enzuigiri', power: 1.05 },
      { id: 'a_corkscrew', name: 'Tornillo Celestial', power: 1.15 },
      { id: 'a_finisher', name: '¡METEORO DE LAS CUERDAS!', power: 1.50, isFinisher: true }
    ])
  },
  BALANCED: {
    id: 'balanced',
    name: 'Equilibrado',
    isPlayable: true,
    description: 'Luchador versátil y completo, adaptable a cualquier estilo.',
    advantagesAgainst: [],
    disadvantagesAgainst: [],
    statModifiers: Object.freeze({
      health: 1.04,
      attack: 1.04,
      defense: 1.04,
      speed: 1.04
    }),
    moves: Object.freeze([
      { id: 'b_clothesline', name: 'Lazo Clásico', power: 1.10 },
      { id: 'b_cutter', name: 'Cortador Rápido', power: 1.20 },
      { id: 'b_superkick', name: 'Súper Patada Sonora', power: 1.15 },
      { id: 'b_spinebuster', name: 'Rompe-espinas Clásico', power: 1.15 },
      { id: 'b_elbow_drop', name: 'Codazo del Campeón', power: 1.10 },
      { id: 'b_neckbreaker', name: 'Quebradora de Cuello', power: 1.05 },
      { id: 'b_piledriver', name: 'Martinete Controlado', power: 1.25 },
      { id: 'b_finisher', name: '¡EL REMATE DEL PUEBLO!', power: 1.50, isFinisher: true }
    ])
  },
  LEGEND: {
    id: 'legend',
    name: 'Leyenda',
    isPlayable: false, // Solo Jefes y CPU
    description: 'Mito viviente del cuadrilátero con poder supremo.',
    advantagesAgainst: ['heavy', 'technical', 'agile', 'balanced'],
    disadvantagesAgainst: [],
    statModifiers: Object.freeze({
      health: 1.25,
      attack: 1.20,
      defense: 1.15,
      speed: 1.10
    }),
    moves: Object.freeze([
      { id: 'l_thunder_slam', name: 'Azote Trueno Ancestral', power: 1.30 },
      { id: 'l_legend_cutter', name: 'Corte Legendario', power: 1.35 },
      { id: 'l_immortal_lock', name: 'Candado Inmortal', power: 1.25 },
      { id: 'l_finisher', name: '¡APOCALIPSIS EN EL RING!', power: 1.60, isFinisher: true }
    ])
  }
});

/**
 * Calcula el multiplicador de daño entre dos clases
 * @param {string} attackerClassId 
 * @param {string} defenderClassId 
 * @returns {number} Multiplicador (1.12 para ventaja, 0.90 para desventaja, 1.00 neutro)
 */
export function getClassMultiplier(attackerClassId, defenderClassId) {
  const attacker = CLASSES[attackerClassId?.toUpperCase()];
  if (!attacker) return 1.0;

  if (attacker.advantagesAgainst.includes(defenderClassId)) {
    return 1.12;
  }
  if (attacker.disadvantagesAgainst.includes(defenderClassId)) {
    return 0.90;
  }
  return 1.0;
}
