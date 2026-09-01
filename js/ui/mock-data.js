/**
 * Datos de demostración visual del Paso 4.
 *
 * Estos catálogos permiten validar la interfaz antes de conectar las reglas de
 * economía, combate, eventos y PVP de los pasos posteriores. Nunca se guardan
 * dentro de la partida del usuario.
 */

export const HERO_DEMO = Object.freeze({
  power: 286,
  expRequired: 100,
  stats: Object.freeze([
    { id: 'health', label: 'Vida', short: 'VID', value: 120, icon: '❤️' },
    { id: 'attack', label: 'Ataque', short: 'ATQ', value: 18, icon: '👊' },
    { id: 'defense', label: 'Defensa', short: 'DEF', value: 10, icon: '🛡️' },
    { id: 'speed', label: 'Velocidad', short: 'VEL', value: 10, icon: '⚡' },
    { id: 'criticalChance', label: 'Crítico', short: 'CRIT', value: '5%', icon: '💥' },
    { id: 'luck', label: 'Suerte', short: 'SUE', value: '0%', icon: '🍀' },
    { id: 'dodge', label: 'Esquiva', short: 'ESQ', value: '1%', icon: '💨' },
    { id: 'accuracy', label: 'Precisión', short: 'PRE', value: '95%', icon: '🎯' },
    { id: 'criticalResistance', label: 'Resist. crítica', short: 'RCR', value: '0%', icon: '🔰' },
    { id: 'criticalNullify', label: 'Anulación crítica', short: 'ACR', value: '0%', icon: '🚫' }
  ]),
  badges: Object.freeze([
    { id: 'rookie', icon: '🥉', name: 'Primer paso', detail: 'Comienza tu carrera.' },
    { id: 'challenger', icon: '🔒', name: 'Retador', detail: 'Gana 10 combates.' },
    { id: 'champion', icon: '🔒', name: 'Campeón', detail: 'Conquista un título.' }
  ])
});

export const RIVAL_DEMO = Object.freeze({
  name: 'Toro Mendoza',
  classId: 'heavy',
  className: 'Pesado',
  level: 1,
  power: 251,
  comparison: '+14%',
  difficulty: 'Favorable',
  rewards: Object.freeze({ gold: 120, exp: 35, materials: 2 })
});

export const EQUIPMENT_DEMO = Object.freeze([
  { id: 'mask-bronze', slot: 'head', icon: '🎭', name: 'Máscara del Novato', rarity: 'Común', level: 0, power: 18, stat: '+8 Vida', price: 80 },
  { id: 'vest-blue', slot: 'torso', icon: '🥋', name: 'Chaleco del Ring', rarity: 'Raro', level: 2, power: 42, stat: '+5 Defensa', price: 220 },
  { id: 'guards-green', slot: 'arms', icon: '🧤', name: 'Muñequeras Firmes', rarity: 'Poco común', level: 1, power: 27, stat: '+3 Ataque', price: 130 },
  { id: 'boots-purple', slot: 'boots', icon: '👢', name: 'Botas Relámpago', rarity: 'Épico', level: 3, power: 61, stat: '+6 Velocidad', price: 380 },
  { id: 'belt-gold', slot: 'belt', icon: '🏅', name: 'Cinturón Aspirante', rarity: 'Legendario', level: 0, power: 74, stat: '+4 Ataque · +3% Crítico', price: 650 },
  { id: 'amulet', slot: 'amulet', icon: '📿', name: 'Amuleto de Fortuna', rarity: 'Raro', level: 1, power: 35, stat: '+4% Suerte', price: 260 }
]);

export const EQUIPMENT_SLOTS_DEMO = Object.freeze([
  { id: 'head', label: 'Cabeza', icon: '🎭', itemId: 'mask-bronze' },
  { id: 'torso', label: 'Torso', icon: '🥋', itemId: 'vest-blue' },
  { id: 'arms', label: 'Brazos', icon: '🧤', itemId: 'guards-green' },
  { id: 'legs', label: 'Piernas', icon: '🩳', itemId: null },
  { id: 'boots', label: 'Botas', icon: '👢', itemId: 'boots-purple' },
  { id: 'belt', label: 'Cinturón', icon: '🏅', itemId: 'belt-gold' },
  { id: 'amulet', label: 'Amuleto', icon: '📿', itemId: 'amulet' }
]);

export const MATERIALS_DEMO = Object.freeze([
  { id: 'iron', icon: '🔩', name: 'Hierro', amount: 14 },
  { id: 'leather', icon: '🟫', name: 'Cuero', amount: 9 },
  { id: 'titanium', icon: '🔷', name: 'Titanio', amount: 3 },
  { id: 'essence', icon: '🔮', name: 'Esencia mística', amount: 1 }
]);

export const SKILL_BRANCHES_DEMO = Object.freeze([
  {
    id: 'attack', name: 'Ataque', icon: '👊', color: 'danger',
    nodes: Object.freeze([
      { id: 'force-1', name: 'Puño firme I', effect: '+2% Ataque', level: 1, cost: 1, prerequisite: 'Ninguno', state: 'available' },
      { id: 'force-2', name: 'Puño firme II', effect: '+2% Ataque', level: 3, cost: 1, prerequisite: 'Puño firme I', state: 'locked' },
      { id: 'critical-1', name: 'Impacto preciso', effect: '+1% Crítico', level: 5, cost: 2, prerequisite: 'Puño firme II', state: 'locked' },
      { id: 'pierce-1', name: 'Rompeguardia', effect: '+3% Penetración', level: 8, cost: 2, prerequisite: 'Impacto preciso', state: 'locked' }
    ])
  },
  {
    id: 'defense', name: 'Defensa', icon: '🛡️', color: 'success',
    nodes: Object.freeze([
      { id: 'wall-1', name: 'Muro de acero I', effect: '+3% Vida', level: 1, cost: 1, prerequisite: 'Ninguno', state: 'available' },
      { id: 'wall-2', name: 'Muro de acero II', effect: '+2% Defensa', level: 3, cost: 1, prerequisite: 'Muro de acero I', state: 'locked' },
      { id: 'resist-1', name: 'Corazón blindado', effect: '+2% Resist. crítica', level: 6, cost: 2, prerequisite: 'Muro de acero II', state: 'locked' }
    ])
  },
  {
    id: 'fortune', name: 'Fortuna', icon: '🍀', color: 'gold',
    nodes: Object.freeze([
      { id: 'gold-1', name: 'Bolsillos llenos', effect: '+3% Oro', level: 1, cost: 1, prerequisite: 'Ninguno', state: 'available' },
      { id: 'material-1', name: 'Buen hallazgo', effect: '+3% Materiales', level: 4, cost: 1, prerequisite: 'Bolsillos llenos', state: 'locked' },
      { id: 'luck-1', name: 'Estrella del ring', effect: '+2% Suerte', level: 7, cost: 2, prerequisite: 'Buen hallazgo', state: 'locked' }
    ])
  },
  {
    id: 'glory', name: 'Gloria', icon: '✨', color: 'blue',
    nodes: Object.freeze([
      { id: 'speed-1', name: 'Ritmo del público', effect: '+2% Velocidad', level: 1, cost: 1, prerequisite: 'Ninguno', state: 'available' },
      { id: 'accuracy-1', name: 'Técnica impecable', effect: '+2% Precisión', level: 4, cost: 1, prerequisite: 'Ritmo del público', state: 'locked' },
      { id: 'finisher-1', name: 'Gran final', effect: '+4% Remate', level: 9, cost: 2, prerequisite: 'Técnica impecable', state: 'locked' }
    ])
  }
]);

export const EVENTS_DEMO = Object.freeze([
  { id: 'lightning', icon: '⚡', name: 'Torneo Relámpago', status: 'Activo', time: '01:42:16', description: 'Encadena victorias antes de que termine el tiempo.' },
  { id: 'giant', icon: '🗿', name: 'Derriba al Gigante', status: 'Próximo', time: '03:00:00', description: 'Causa tanto daño como puedas al gigante.' },
  { id: 'marathon', icon: '🏃', name: 'Maratón de Victorias', status: 'Hoy', time: '06:00', description: 'Suma victorias consecutivas.' },
  { id: 'survival', icon: '❤️‍🔥', name: 'Supervivencia Extrema', status: 'Hoy', time: '09:00', description: 'Resiste oleadas con una sola barra de vida.' },
  { id: 'master', icon: '🎯', name: 'Golpe Maestro', status: 'Hoy', time: '12:00', description: 'Busca el golpe de mayor daño.' },
  { id: 'ladder', icon: '🪜', name: 'Escalera al Cielo', status: 'Hoy', time: '15:00', description: 'Supera rivales cada vez más fuertes.' },
  { id: 'king', icon: '👑', name: 'Rey del Ring', status: 'Hoy', time: '18:00', description: 'Defiende el cuadrilátero hasta el final.' }
]);

export const PVP_ROOMS_DEMO = Object.freeze([
  { id: 'bronze', icon: '🥉', name: 'Sala Bronce', price: '500 Oro', netPool: '12.800 Oro', range: '80–120%', available: true },
  { id: 'silver', icon: '🥈', name: 'Sala Plata', price: '2.500 Oro', netPool: '64.000 Oro', range: '95–135%', available: false },
  { id: 'gold', icon: '🥇', name: 'Sala Oro', price: '25 Gemas', netPool: '640 Gemas', range: '110–150%', available: false }
]);

export const SHOP_ITEMS_DEMO = Object.freeze([
  { id: 'shop-mask', category: 'equipment', icon: '🎭', name: 'Máscara Carmesí', rarity: 'Raro', stats: '+12 Vida · +2 Ataque', price: 450, currency: 'gold' },
  { id: 'shop-boots', category: 'equipment', icon: '👢', name: 'Botas del Viento', rarity: 'Épico', stats: '+7 Velocidad · +2% Esquiva', price: 920, currency: 'gold' },
  { id: 'shop-belt', category: 'equipment', icon: '🏅', name: 'Cinturón Dorado', rarity: 'Legendario', stats: '+9 Ataque · +4% Crítico', price: 35, currency: 'gems' },
  { id: 'shop-vest', category: 'equipment', icon: '🥋', name: 'Chaleco Guardián', rarity: 'Poco común', stats: '+8 Defensa', price: 300, currency: 'gold' },
  { id: 'mat-iron', category: 'materials', icon: '🔩', name: 'Lote de Hierro', rarity: 'Material', stats: '10 unidades', price: 100, currency: 'gold' },
  { id: 'mat-leather', category: 'materials', icon: '🟫', name: 'Lote de Cuero', rarity: 'Material', stats: '8 unidades', price: 120, currency: 'gold' },
  { id: 'mat-essence', category: 'materials', icon: '🔮', name: 'Esencia Mística', rarity: 'Material raro', stats: '2 unidades', price: 8, currency: 'gems' },
  { id: 'potion-power', category: 'consumables', icon: '🧪', name: 'Tónico de Poder', rarity: 'Consumible', stats: '+10% Poder durante una lucha', price: 180, currency: 'gold' },
  { id: 'stone-safe', category: 'consumables', icon: '💠', name: 'Piedra de Protección', rarity: 'Consumible', stats: 'Garantiza una mejora', price: 12, currency: 'gems' },
  { id: 'premium-crown', category: 'premium', icon: '👑', name: 'Corona del Campeón', rarity: 'Divino', stats: '+15 Ataque · +8% Crítico · Set doble', price: 80, currency: 'gems' },
  { id: 'premium-amulet', category: 'premium', icon: '📿', name: 'Reliquia Inmortal', rarity: 'Legendario', stats: '+12 Vida · +5% Suerte', price: 55, currency: 'gems' }
]);

export const MISSIONS_DEMO = Object.freeze([
  { id: 'fight-3', name: 'Sube al ring', detail: 'Completa 3 combates', progress: 1, max: 3, reward: '150 Oro' },
  { id: 'upgrade-1', name: 'Más fuerte', detail: 'Mejora una estadística', progress: 0, max: 1, reward: '3 Materiales' },
  { id: 'event-1', name: 'Cita diaria', detail: 'Participa en un evento', progress: 0, max: 1, reward: '1 Gema' },
  { id: 'win-2', name: 'Noche de victoria', detail: 'Gana 2 combates', progress: 0, max: 2, reward: '100 Oro' },
  { id: 'shop-1', name: 'Buen cliente', detail: 'Visita la tienda', progress: 1, max: 1, reward: 'Reclamar' }
]);

export const ACHIEVEMENTS_DEMO = Object.freeze([
  { id: 'first-step', icon: '🥉', name: 'Primer paso', detail: 'Crea tu luchador', progress: 1, max: 1, reward: '5 Gemas', claimed: false },
  { id: 'ten-wins', icon: '🏆', name: 'Diez sobre la lona', detail: 'Gana 10 combates', progress: 0, max: 10, reward: '10 Gemas', claimed: false },
  { id: 'collector', icon: '🛡️', name: 'Coleccionista', detail: 'Obtén 7 piezas', progress: 3, max: 7, reward: '500 Oro', claimed: false },
  { id: 'legend', icon: '👑', name: 'Leyenda local', detail: 'Alcanza nivel 50', progress: 1, max: 50, reward: '25 Gemas', claimed: false }
]);

export const INBOX_DEMO = Object.freeze([
  { id: 'welcome', icon: '🎁', title: 'Bienvenida al ring', detail: 'Regalo por comenzar tu carrera.', reward: '200 Oro', blocked: false },
  { id: 'event-prize', icon: '📦', title: 'Premio de evento', detail: 'Incluye una pieza; necesitas espacio.', reward: 'Botas Raras', blocked: true },
  { id: 'daily', icon: '🪙', title: 'Bono diario', detail: 'Recompensa del calendario.', reward: '75 Oro', blocked: false }
]);

export const UI_BADGES_DEMO = Object.freeze({ equipment: 2, events: 1, shop: 3 });

export function findDemoItem(id) {
  return EQUIPMENT_DEMO.find((item) => item.id === id) || SHOP_ITEMS_DEMO.find((item) => item.id === id) || null;
}
