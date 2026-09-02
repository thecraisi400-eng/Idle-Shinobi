/* ===== MISIONES (30.02, 30.03) =====
   5 diarias con 1 refresco gratis · 3 semanales más grandes
   10.13 contador simple en el panel
   Sugerencia #3: misiones que empujan a EXPLORAR todo el juego,
   no solo "gana 10 luchas". Cada una lleva la pantalla a la que manda. */

/**
 * Cada plantilla dice qué contador de `S.carrera` mide, cuánto pide
 * y a qué zona del juego empuja. `objetivo` puede ser un rango.
 */
export const DIARIAS = [
  { id:'d_luchas',    ico:'🥊', texto:n => `Disputa ${n} luchas`,            contador:'luchas',        min:3,  max:8,   oro:250,  zona:'arena' },
  { id:'d_victorias', ico:'🏆', texto:n => `Gana ${n} luchas`,               contador:'victorias',     min:2,  max:5,   oro:350,  zona:'arena' },
  { id:'d_kos',       ico:'💥', texto:n => `Gana ${n} luchas por KO`,        contador:'kos',           min:1,  max:3,   oro:400,  zona:'arena' },
  { id:'d_criticos',  ico:'⚡', texto:n => `Asesta ${n} golpes críticos`,    contador:'criticos',      min:5,  max:15,  oro:300,  zona:'arena' },
  { id:'d_especiales',ico:'🌟', texto:n => `Ejecuta ${n} especiales`,        contador:'especiales',    min:3,  max:8,   oro:300,  zona:'especiales' },
  { id:'d_oro',       ico:'🪙', texto:n => `Gana ${n} de oro`,               contador:'oroGanado',     min:500,max:2000,oro:200,  zona:'arena', paso:100 },
  // Sugerencia #3: estas empujan fuera de la Arena
  { id:'d_evento',    ico:'🏟️', texto:n => `Juega ${n} evento(s) del día`,  contador:'eventosJugados',min:1,  max:2,   oro:500,  zona:'eventos' },
  { id:'d_torneo',    ico:'🎪', texto:n => `Participa en ${n} torneo(s)`,    contador:'torneosJugados',min:1,  max:2,   oro:600,  zona:'coliseo' },
  { id:'d_objetos',   ico:'🎁', texto:n => `Consigue ${n} piezas de equipo`, contador:'objetosObtenidos', min:2, max:5, oro:350,  zona:'equipo' },
  { id:'d_ventas',    ico:'💱', texto:n => `Vende ${n} piezas`,              contador:'objetosVendidos', min:3, max:8,  oro:250,  zona:'equipo' },
  { id:'d_gasto',     ico:'🛒', texto:n => `Gasta ${n} de oro`,              contador:'oroGastado',    min:300,max:1500,oro:250,  zona:'tienda', paso:100 },
  { id:'d_dano',      ico:'⚔️', texto:n => `Inflige ${n} de daño`,           contador:'danoInfligido', min:2000,max:8000,oro:300, zona:'arena', paso:500 }
];

export const SEMANALES = [
  { id:'s_victorias', ico:'🏆', texto:n => `Gana ${n} luchas esta semana`,       contador:'victorias',     min:25, max:60,  oro:3000, gemas:2, zona:'arena' },
  { id:'s_eventos',   ico:'🏟️', texto:n => `Juega ${n} eventos esta semana`,    contador:'eventosJugados',min:5,  max:12,  oro:3500, gemas:3, zona:'eventos' },
  { id:'s_top10',     ico:'🥇', texto:n => `Entra ${n} veces en el top 10`,      contador:'eventosTop10',  min:2,  max:5,   oro:4000, gemas:4, zona:'eventos' },
  { id:'s_torneos',   ico:'🎪', texto:n => `Juega ${n} torneos del Coliseo`,     contador:'torneosJugados',min:4,  max:10,  oro:3500, gemas:3, zona:'coliseo' },
  { id:'s_campeon',   ico:'👑', texto:n => `Gana ${n} torneo(s) del Coliseo`,    contador:'torneosGanados',min:1,  max:2,   oro:6000, gemas:6, zona:'coliseo' },
  { id:'s_niveles',   ico:'📈', texto:n => `Sube ${n} niveles`,                  contador:'nivelesSubidos',min:2,  max:5,   oro:3000, gemas:2, zona:'heroe' },
  { id:'s_kos',       ico:'💥', texto:n => `Gana ${n} luchas por KO`,            contador:'kos',           min:10, max:25,  oro:3200, gemas:2, zona:'arena' },
  { id:'s_oro',       ico:'🪙', texto:n => `Gana ${n} de oro`,                   contador:'oroGanado',     min:8000,max:25000,oro:2500,gemas:2, zona:'arena', paso:1000 }
];

export const N_DIARIAS = 5;      // 30.02
export const N_SEMANALES = 3;    // 30.03
export const REFRESCOS_DIARIOS = 1;   // 30.02 un refresco gratis

export const getPlantilla = id =>
  DIARIAS.find(m => m.id === id) || SEMANALES.find(m => m.id === id) || null;
