/* ===== CONSTANTES BALANCEABLES =====
   TODOS los números del juego viven aquí.
   Balancear "Oro y Gloria" = editar este archivo y nada más.
   Cada valor lleva la referencia a la pregunta del plan que lo decidió. */

export const META = {
  NOMBRE_JUEGO: 'Oro y Gloria',   // 01.15
  VERSION_SAVE: 1,                // 27.09 guardado versionado
  IDIOMA: 'es'                    // 01.11 / 30.10
};

/* ---------- ECONOMÍA ---------- */
export const ECO = {
  ORO_INICIAL: 100,               // 07.15
  ORO_PRIMERA_HORA_OBJETIVO: 500, // 07.02 (guía de balance)
  ORO_POR_NIVEL_RIVAL: 12,        // 07.01 pago según nivel del rival
  ORO_DERROTA_PCT: 0.25,          // 07.04 25% del pago al perder
  ORO_JEFE_MULT: 3.5,             // 05.14 oro grande del campeón
  ORO_ELITE_MULT: 1.8,            // 06.06 rivales élite pagan más
  VENTA_PCT: 0.25,                // 16.04 venta al 25%
  PRECIO_ESCALA: 1.085,           // 07.12 exponencial suave
  GEMAS_INICIALES: 0,
  GEMA_DROP_MIN: 1,               // 08.05 1–5 por vez
  GEMA_DROP_MAX: 5,
  PVP_RAKE: 0.05                  // 22.02 rake del 5%
};

/* ---------- COMBATE ---------- */
export const COMBATE = {
  TICK_MS: 500,                   // 02.01 ticks de 0.5s
  CRIT_PROB: 0.10,                // 03.04 fijo 10% para todos
  CRIT_MULT: 1.5,                 // 02.04 daño x1.5
  VARIANZA_MIN: 0.85,             // 02.03 varianza de daño
  VARIANZA_MAX: 1.15,
  ESPECIAL_MULT: 1.5,             // 12.05 golpe x1.5
  MOMENTUM_MAX: 100,              // 12.08 un solo nivel
  MOMENTUM_POR_GOLPE: 9,          // 12.02 se llena al golpear
  MOMENTUM_ARRANQUE_LENTO: 0.5,   // 12.11 tras usarlo carga a mitad de ritmo
  MOMENTUM_ARRANQUE_TICKS: 8,
  FATIGA_POR_GOLPE: 1.4,          // 02.10 fatiga por actividad
  FATIGA_POR_ESPECIAL: 6,
  FATIGA_MAX: 100,
  FATIGA_PENAL_VELOCIDAD: 0.45,   // a fatiga máxima pierdes 45% de velocidad
  TICKS_MAX: 600,                 // tope de seguridad (Sugerencia 5 del Paso 4)
  RONDA_TICKS: 24,                // 10s por ronda
  VENTAJA_CLASE: 0.10,            // 05.02 ±10% círculo de clases
  CURA_ENTRE_LUCHAS_EVENTO: 0.30  // 20.08 cura 30%
};

/* ---------- PROGRESIÓN ---------- */
export const PROG = {
  STAT_MIN_INICIAL: 10,           // 03.05 rango 10–25
  STAT_MAX_INICIAL: 25,
  PUNTOS_POR_NIVEL: 3,            // 03.09 puntos libres
  TOPE_STAT_BASE: 30,             // 03.11 / 13.04 tope por nivel
  TOPE_STAT_POR_NIVEL: 8,
  XP_BASE: 100,                   // 04.01 curva creciente
  XP_EXP: 1.55,
  COSTE_STAT_BASE: 15,            // 13.02 coste creciente por stat
  COSTE_STAT_ESCALA: 1.12,
  SUBIDA_POR_PUNTO: 1,            // 13.03 +1 fijo
  NIVEL_MIN_PVP: 10,              // 22.09
  PUNTOS_ARBOL_TOTALES: 200       // 17.08 ~200 puntos en toda la partida
};

/* ---------- RIVALES ---------- */
export const RIVALES = {
  ARRANQUE: 0.78,                 // el 1er rival de cada división es asequible
  ESCALA: 1.10,                   // 06.01 exponencial 1.10^n
  DIENTES_SIERRA: 0.12,           // 06.02 respiro tras cada jefe
  JEFE_CADA: 10,                  // 05.13 jefe cada 10 luchas
  JEFE_MULT: 1.26,                // 06.09 solo stats altas
  ELITE_PROB: 0.05,               // 06.06 5% de aparición
  CAMPEON_MULT: 1.45,             // 05.14 el campeón de división
  ELITE_MULT: 1.22,
  MUROS: [25, 60, 120, 200],      // 06.03 muros medibles
  MURO_MULT: 1.18,
  CARTAS_OFRECIDAS: 3             // 06.04 elige 1 de 3
};

/* ---------- EVENTOS ---------- */
export const EVENTOS = {
  CANTIDAD: 7,                    // 19.01 siete eventos
  DURACION_H: 3,                  // 19.01 de 3 horas
  HORA_INICIO: 0,                 // 19.02 00:00 a 21:00
  INTENTOS: 5,                    // 19.06
  COMPETIDORES: 50,               // 19.07
  PREMIADOS: 10,                  // 21.01 top 10
  MULT_DOMINGO: 2                 // 19.15 x2 los domingos
};

/* ---------- EQUIPO ---------- */
export const EQUIPO = {
  SLOTS: 8,                       // 15.01
  RAREZAS: 6,                     // 15.02
  INVENTARIO_MAX: 100             // 16.09
};

/* ---------- INTERFAZ ---------- */
export const UI = {
  AUTOSAVE_MS: 20000,             // 27.01 guardado paranoico
  BACKUPS: 5,                     // 27.07 historial de 5
  TOAST_MS: 2200,
  MISIONES_DIARIAS: 5,            // 30.02
  MISIONES_SEMANALES: 3,          // 30.03
  LOGROS_TOTALES: 150             // 30.01
};
