/* ===== CATÁLOGO DE PASIVAS =====
   18.04 ofensivas con penetración · 18.05 defensivas con escudo inicial
   18.06 económicas base · 18.07–18.09 NADA de eventos, PVP ni utilidad
   18.13 cada descripción muestra tu valor actual
   17.11 nodos de varios niveles con overcharge (rendimientos decrecientes)

   Cada pasiva es una PLANTILLA: el árbol la instancia en distintos tiers
   con valores escalados. Así 30 plantillas producen 150+ nodos reales. */

/* Claves de bonificación que entiende el motor de combate.
   Si añades una aquí, hay que leerla en systems/skilltree.js → bonosTotales(). */
export const CLAVES_BONUS = [
  // --- Ofensivas (18.04) ---
  'danoMult',        // multiplicador de daño infligido
  'critProb',        // probabilidad de crítico adicional
  'critMult',        // daño extra de los críticos
  'penetracion',     // ignora mitigación del rival
  'danoPotencia',    // multiplicador solo para golpes de poder
  'danoTecnica',     // multiplicador solo para llaves técnicas
  // --- Defensivas (18.05) ---
  'vidaMult',        // multiplicador de vida máxima
  'mitigacionMult',  // multiplicador de la mitigación propia
  'escudoInicial',   // escudo al empezar la lucha
  'esquivaExtra',    // esquiva adicional
  'reduccionCrit',   // reduce el daño crítico recibido
  // --- Ritmo ---
  'velocidadMult',   // ataca más a menudo
  'momentumMult',    // carga el especial más rápido
  'fatigaMult',      // acumula menos fatiga
  'especialMult',    // daño del especial
  // --- Económicas (18.06) ---
  'oroMult',         // oro por combate
  'xpMult',          // experiencia por combate
  'materialMult'     // vendas de campeón
];

/* ---------- Las 6 ramas (17.01, 17.02) ---------- */
export const RAMAS = {
  potencia: {
    id:'potencia', nombre:'Potencia', ico:'💪', color:'#e2564f',
    desc:'Pegar más fuerte. Críticos, penetración y golpes de poder.',
    nivelRama: 1
  },
  resistencia: {
    id:'resistencia', nombre:'Resistencia', ico:'🛡️', color:'#4d9cf0',
    desc:'Aguantar más. Vida, mitigación y escudo inicial.',
    nivelRama: 3
  },
  velocidad: {
    id:'velocidad', nombre:'Velocidad', ico:'🌀', color:'#4ec97a',
    desc:'Actuar más veces. Ritmo de golpeo, esquiva y fatiga.',
    nivelRama: 6
  },
  momentum: {
    id:'momentum', nombre:'Momentum', ico:'⚡', color:'#a765e8',
    desc:'Vivir del especial. Carga más rápido y pega más duro.',
    nivelRama: 10
  },
  economia: {
    id:'economia', nombre:'Economía', ico:'🪙', color:'#e8b64c',
    desc:'Ganar más de cada lucha. Oro, experiencia y materiales.',
    nivelRama: 15
  },
  tecnica: {
    id:'tecnica', nombre:'Técnica', ico:'🎯', color:'#f0872f',
    desc:'Precisión quirúrgica. Llaves, penetración y control.',
    nivelRama: 22
  }
};

export const CLAVES_RAMAS = Object.keys(RAMAS);

/* ---------- PLANTILLAS DE PASIVA ----------
   `base` es el valor en el tier 1; el árbol lo escala por tier.
   `porRango` es cuánto añade cada nivel extra del nodo (17.11 overcharge). */
export const PLANTILLAS = {
  /* ===== RAMA POTENCIA ===== */
  golpeSeco:    { id:'golpeSeco',    rama:'potencia', nombre:'Golpe seco',       ico:'👊',
                  bonus:'danoMult',      base:0.03,   porRango:0.025, rangos:5,
                  texto:v => `+${(v*100).toFixed(1)}% de daño infligido.` },
  ojoAsesino:   { id:'ojoAsesino',   rama:'potencia', nombre:'Ojo asesino',      ico:'🎯',
                  bonus:'critProb',      base:0.012,  porRango:0.010, rangos:5,
                  texto:v => `+${(v*100).toFixed(1)}% de probabilidad de crítico.` },
  saña:         { id:'saña',         rama:'potencia', nombre:'Saña',             ico:'💢',
                  bonus:'critMult',      base:0.06,   porRango:0.05,  rangos:5,
                  texto:v => `Tus críticos hacen un ${(v*100).toFixed(0)}% más de daño.` },
  rompeGuardias:{ id:'rompeGuardias',rama:'potencia', nombre:'Rompeguardias',    ico:'🔨',
                  bonus:'penetracion',   base:0.025,  porRango:0.020, rangos:5,
                  texto:v => `Ignoras un ${(v*100).toFixed(1)}% más de la defensa rival.` },
  fuerzaBruta:  { id:'fuerzaBruta',  rama:'potencia', nombre:'Fuerza bruta',     ico:'🦍',
                  bonus:'danoPotencia',  base:0.06,   porRango:0.05,  rangos:4,
                  texto:v => `+${(v*100).toFixed(0)}% de daño con golpes de poder.` },

  /* ===== RAMA RESISTENCIA ===== */
  cuero:        { id:'cuero',        rama:'resistencia', nombre:'Cuero curtido', ico:'🪨',
                  bonus:'vidaMult',      base:0.035,  porRango:0.030, rangos:5,
                  texto:v => `+${(v*100).toFixed(1)}% de vida máxima.` },
  murallaViva:  { id:'murallaViva',  rama:'resistencia', nombre:'Muralla viva',  ico:'🧱',
                  bonus:'mitigacionMult',base:0.05,   porRango:0.04,  rangos:5,
                  texto:v => `+${(v*100).toFixed(0)}% de mitigación de daño.` },
  vendaje:      { id:'vendaje',      rama:'resistencia', nombre:'Vendaje previo',ico:'🩹',
                  bonus:'escudoInicial', base:14,     porRango:12,    rangos:5,
                  texto:v => `Empiezas la lucha con ${Math.round(v)} de escudo.` },
  cuelloDeToro: { id:'cuelloDeToro', rama:'resistencia', nombre:'Cuello de toro',ico:'🐂',
                  bonus:'reduccionCrit', base:0.05,   porRango:0.04,  rangos:4,
                  texto:v => `Los críticos que recibes hacen un ${(v*100).toFixed(0)}% menos.` },
  fondoDeArmario:{id:'fondoDeArmario',rama:'resistencia',nombre:'Fondo de armario',ico:'🫁',
                  bonus:'fatigaMult',    base:0.04,   porRango:0.03,  rangos:4,
                  texto:v => `Acumulas un ${(v*100).toFixed(0)}% menos de fatiga.` },

  /* ===== RAMA VELOCIDAD ===== */
  piesLigeros:  { id:'piesLigeros',  rama:'velocidad', nombre:'Pies ligeros',    ico:'💨',
                  bonus:'velocidadMult', base:0.025,  porRango:0.020, rangos:5,
                  texto:v => `+${(v*100).toFixed(1)}% de velocidad de acción.` },
  reflejos:     { id:'reflejos',     rama:'velocidad', nombre:'Reflejos',        ico:'👀',
                  bonus:'esquivaExtra',  base:0.012,  porRango:0.008, rangos:5,
                  texto:v => `+${(v*100).toFixed(1)}% de esquiva.` },
  segundoAire:  { id:'segundoAire',  rama:'velocidad', nombre:'Segundo aire',    ico:'🌬️',
                  bonus:'fatigaMult',    base:0.05,   porRango:0.04,  rangos:5,
                  texto:v => `Acumulas un ${(v*100).toFixed(0)}% menos de fatiga.` },
  bailarin:     { id:'bailarin',     rama:'velocidad', nombre:'Bailarín',        ico:'🩰',
                  bonus:'danoTecnica',   base:0.05,   porRango:0.04,  rangos:4,
                  texto:v => `+${(v*100).toFixed(0)}% de daño con llaves técnicas.` },
  chispa:       { id:'chispa',       rama:'velocidad', nombre:'Chispa',          ico:'✨',
                  bonus:'momentumMult',  base:0.04,   porRango:0.035, rangos:4,
                  texto:v => `+${(v*100).toFixed(0)}% de carga de momentum.` },

  /* ===== RAMA MOMENTUM ===== */
  tamborero:    { id:'tamborero',    rama:'momentum', nombre:'Tamborero',        ico:'🥁',
                  bonus:'momentumMult',  base:0.05,   porRango:0.045, rangos:5,
                  texto:v => `+${(v*100).toFixed(0)}% de carga de momentum.` },
  granFinal:    { id:'granFinal',    rama:'momentum', nombre:'Gran final',       ico:'🎆',
                  bonus:'especialMult',  base:0.06,   porRango:0.05,  rangos:5,
                  texto:v => `+${(v*100).toFixed(0)}% de daño con tu especial.` },
  publicoEnPie: { id:'publicoEnPie', rama:'momentum', nombre:'Público en pie',   ico:'📣',
                  bonus:'especialMult',  base:0.04,   porRango:0.035, rangos:4,
                  texto:v => `+${(v*100).toFixed(0)}% de daño con tu especial.` },
  adrenalina:   { id:'adrenalina',   rama:'momentum', nombre:'Adrenalina',       ico:'🔥',
                  bonus:'danoMult',      base:0.025,  porRango:0.020, rangos:4,
                  texto:v => `+${(v*100).toFixed(1)}% de daño infligido.` },
  showtime:     { id:'showtime',     rama:'momentum', nombre:'Showtime',         ico:'🌟',
                  bonus:'critMult',      base:0.05,   porRango:0.04,  rangos:4,
                  texto:v => `Tus críticos hacen un ${(v*100).toFixed(0)}% más de daño.` },

  /* ===== RAMA ECONOMÍA (18.06) ===== */
  bolsaGorda:   { id:'bolsaGorda',   rama:'economia', nombre:'Bolsa gorda',      ico:'💰',
                  bonus:'oroMult',       base:0.05,   porRango:0.04,  rangos:5,
                  texto:v => `+${(v*100).toFixed(0)}% de oro por combate.` },
  aprendizRapido:{id:'aprendizRapido',rama:'economia',nombre:'Aprendiz rápido',  ico:'📚',
                  bonus:'xpMult',        base:0.05,   porRango:0.04,  rangos:5,
                  texto:v => `+${(v*100).toFixed(0)}% de experiencia por combate.` },
  chatarrero:   { id:'chatarrero',   rama:'economia', nombre:'Chatarrero',       ico:'🩹',
                  bonus:'materialMult',  base:0.10,   porRango:0.08,  rangos:4,
                  texto:v => `+${(v*100).toFixed(0)}% de vendas de campeón.` },
  contrato:     { id:'contrato',     rama:'economia', nombre:'Buen contrato',    ico:'📜',
                  bonus:'oroMult',       base:0.04,   porRango:0.035, rangos:5,
                  texto:v => `+${(v*100).toFixed(0)}% de oro por combate.` },
  veterania:    { id:'veterania',    rama:'economia', nombre:'Veteranía',        ico:'🎖️',
                  bonus:'xpMult',        base:0.04,   porRango:0.035, rangos:4,
                  texto:v => `+${(v*100).toFixed(0)}% de experiencia por combate.` },

  /* ===== RAMA TÉCNICA ===== */
  bisturi:      { id:'bisturi',      rama:'tecnica', nombre:'Bisturí',           ico:'🔪',
                  bonus:'penetracion',   base:0.03,   porRango:0.025, rangos:5,
                  texto:v => `Ignoras un ${(v*100).toFixed(1)}% más de la defensa rival.` },
  llaveMaestra: { id:'llaveMaestra', rama:'tecnica', nombre:'Llave maestra',     ico:'🔐',
                  bonus:'danoTecnica',   base:0.07,   porRango:0.06,  rangos:5,
                  texto:v => `+${(v*100).toFixed(0)}% de daño con llaves técnicas.` },
  lecturaRival: { id:'lecturaRival', rama:'tecnica', nombre:'Lectura del rival', ico:'🧠',
                  bonus:'critProb',      base:0.010,  porRango:0.008, rangos:5,
                  texto:v => `+${(v*100).toFixed(1)}% de probabilidad de crítico.` },
  economiaMov:  { id:'economiaMov',  rama:'tecnica', nombre:'Economía de movimiento', ico:'♟️',
                  bonus:'fatigaMult',    base:0.045,  porRango:0.035, rangos:4,
                  texto:v => `Acumulas un ${(v*100).toFixed(0)}% menos de fatiga.` },
  anticipacion: { id:'anticipacion', rama:'tecnica', nombre:'Anticipación',      ico:'🕶️',
                  bonus:'esquivaExtra',  base:0.010,  porRango:0.008, rangos:4,
                  texto:v => `+${(v*100).toFixed(1)}% de esquiva.` }
};

export const CLAVES_PLANTILLAS = Object.keys(PLANTILLAS);
export const plantillasDeRama = rama => Object.values(PLANTILLAS).filter(p => p.rama === rama);

/* ---------- KEYSTONES (17.07): cambian REGLAS, no números ----------
   Evolucionan: cada rango extra refuerza la regla. */
export const KEYSTONES = {
  carniceria: {
    id:'carniceria', rama:'potencia', nombre:'Carnicería', ico:'🩸',
    regla:'critSangra', rangos:3,
    desc:'Tus críticos hacen sangrar al rival.',
    porRango:r => `Sangrado de ${1 + r} capa(s) al criticar.`,
    valor:r => ({ capas: r })
  },
  ejecutor: {
    id:'ejecutor', rama:'potencia', nombre:'Ejecutor', ico:'⚰️',
    regla:'remate', rangos:3,
    desc:'Haces más daño a rivales por debajo del 30% de vida.',
    porRango:r => `+${(r * 12)}% de daño a rivales heridos.`,
    valor:r => ({ mult: 1 + r * 0.12 })
  },
  fortaleza: {
    id:'fortaleza', rama:'resistencia', nombre:'Fortaleza', ico:'🏰',
    regla:'escudoRonda', rangos:3,
    desc:'Recuperas escudo al empezar cada ronda.',
    porRango:r => `+${r * 10} de escudo por ronda.`,
    valor:r => ({ escudo: r * 10 })
  },
  terco: {
    id:'terco', rama:'resistencia', nombre:'Terco', ico:'🐗',
    regla:'aguantaKO', rangos:2,
    desc:'La primera vez que caerías por KO, sobrevives con 1 de vida.',
    porRango:r => r >= 2 ? 'Sobrevives dos veces por lucha.' : 'Sobrevives una vez por lucha.',
    valor:r => ({ veces: r })
  },
  vendaval: {
    id:'vendaval', rama:'velocidad', nombre:'Vendaval', ico:'🌪️',
    regla:'dobleGolpe', rangos:3,
    desc:'Probabilidad de encadenar un segundo golpe inmediato.',
    porRango:r => `${(r * 7)}% de probabilidad de golpe doble.`,
    valor:r => ({ prob: r * 0.07 })
  },
  huracan: {
    id:'huracan', rama:'momentum', nombre:'Huracán', ico:'🌀',
    regla:'especialDoble', rangos:2,
    desc:'Tu especial conserva parte del momentum al usarse.',
    porRango:r => `Conservas el ${r * 22}% del momentum tras el especial.`,
    valor:r => ({ pct: r * 0.22 })
  },
  empresario: {
    id:'empresario', rama:'economia', nombre:'Empresario', ico:'🎩',
    regla:'oroPorRonda', rangos:3,
    desc:'Ganas oro extra por cada ronda que dure la lucha.',
    porRango:r => `+${r * 4}% de oro por ronda disputada.`,
    valor:r => ({ pct: r * 0.04 })
  },
  cirujano: {
    id:'cirujano', rama:'tecnica', nombre:'Cirujano', ico:'🥼',
    regla:'critVendido', rangos:3,
    desc:'Tus críticos dejan al rival Vendido: recibe más críticos.',
    porRango:r => `Vendido durante ${2 + r} ticks.`,
    valor:r => ({ ticks: 2 + r })
  }
};

export const CLAVES_KEYSTONES = Object.keys(KEYSTONES);
export const keystonesDeRama = rama => Object.values(KEYSTONES).filter(k => k.rama === rama);
