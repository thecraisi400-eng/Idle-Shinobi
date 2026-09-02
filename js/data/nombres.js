/* ===== GENERADOR PROCEDURAL DE NOMBRES (05.08) =====
   Combinación de patrones para crear miles de luchadores creíbles.
   La semilla se deriva del índice del rival, así el rival #47
   SIEMPRE se llama igual (determinismo, Sugerencia #4 del Paso 2). */

export const ARTICULOS = ['El', 'La'];

export const SUSTANTIVOS_M = [
  'Martillo', 'Vórtice', 'Titán', 'Relámpago', 'Coloso', 'Verdugo', 'Tiburón',
  'Cóndor', 'Jaguar', 'Fantasma', 'Demonio', 'Ciclón', 'Toro', 'Halcón',
  'Lobo', 'Escorpión', 'Dragón', 'Puño', 'Trueno', 'Rayo', 'Cuervo',
  'Búfalo', 'Tigre', 'León', 'Ogro', 'Gigante', 'Búho', 'Zorro', 'Águila',
  'Puma', 'Rinoceronte', 'Cobra', 'Bisonte', 'Mastín', 'Basilisco'
];

export const SUSTANTIVOS_F = [
  'Pantera', 'Sombra', 'Furia', 'Tormenta', 'Bestia', 'Serpiente', 'Víbora',
  'Llama', 'Muerte', 'Hiena', 'Araña', 'Loba', 'Ráfaga', 'Estrella', 'Garra'
];

export const ADJETIVOS_M = [
  'Negro', 'Salvaje', 'Eterno', 'Sangriento', 'Dorado', 'Invicto', 'Maldito',
  'Silencioso', 'Furioso', 'Implacable', 'Enmascarado', 'Rebelde', 'Feroz',
  'Indomable', 'Legendario', 'Brutal', 'Errante', 'Escarlata', 'Carmesí',
  'Colosal', 'Veloz', 'Temible', 'Imparable', 'Nocturno', 'Ardiente'
];

export const ADJETIVOS_F = [
  'Negra', 'Salvaje', 'Eterna', 'Sangrienta', 'Dorada', 'Invicta', 'Maldita',
  'Silenciosa', 'Furiosa', 'Implacable', 'Rebelde', 'Feroz', 'Indomable',
  'Brutal', 'Errante', 'Escarlata', 'Temible', 'Nocturna', 'Ardiente'
];

export const LUGARES = [
  'Jalisco', 'Monterrey', 'Tijuana', 'Guadalajara', 'Veracruz', 'Puebla',
  'Oaxaca', 'Sonora', 'Chiapas', 'Yucatán', 'Durango', 'Sinaloa',
  'Caracas', 'Maracaibo', 'Valencia', 'Bogotá', 'Medellín', 'Lima',
  'Santiago', 'Rosario', 'Montevideo', 'La Habana', 'San Juan', 'Panamá'
];

export const TITULOS = [
  'Jr.', 'II', 'III', 'Sr.', 'el Grande', 'el Joven', 'el Original'
];

export const NOMBRES_PILA = [
  'Ramón', 'Aurelio', 'Bruno', 'César', 'Damián', 'Emilio', 'Fabián',
  'Gustavo', 'Hugo', 'Ignacio', 'Joaquín', 'Leonardo', 'Marcos', 'Nicolás',
  'Octavio', 'Pablo', 'Rodrigo', 'Salvador', 'Tomás', 'Vicente', 'Xavier'
];

export const APELLIDOS = [
  'Vargas', 'Mendoza', 'Cruz', 'Salazar', 'Ibarra', 'Quintero', 'Rivas',
  'Beltrán', 'Cordero', 'Fuentes', 'Guerrero', 'Herrera', 'Lozano',
  'Montero', 'Navarro', 'Ortega', 'Peña', 'Ramos', 'Solís', 'Trejo'
];

/**
 * Genera un nombre de luchador con el RNG dado.
 * Seis patrones distintos para que el plantel no suene repetitivo.
 */
export function generarNombre(rng) {
  const patron = rng.int(1, 6);

  switch (patron) {
    case 1: {   // El Martillo de Jalisco
      const fem = rng.chance(0.28);
      const art = fem ? 'La' : 'El';
      const sus = fem ? rng.elegir(SUSTANTIVOS_F) : rng.elegir(SUSTANTIVOS_M);
      return `${art} ${sus} de ${rng.elegir(LUGARES)}`;
    }
    case 2: {   // Vórtice Negro
      const fem = rng.chance(0.28);
      const sus = fem ? rng.elegir(SUSTANTIVOS_F) : rng.elegir(SUSTANTIVOS_M);
      const adj = fem ? rng.elegir(ADJETIVOS_F) : rng.elegir(ADJETIVOS_M);
      return `${sus} ${adj}`;
    }
    case 3: {   // El Cóndor Invicto
      const fem = rng.chance(0.28);
      const art = fem ? 'La' : 'El';
      const sus = fem ? rng.elegir(SUSTANTIVOS_F) : rng.elegir(SUSTANTIVOS_M);
      const adj = fem ? rng.elegir(ADJETIVOS_F) : rng.elegir(ADJETIVOS_M);
      return `${art} ${sus} ${adj}`;
    }
    case 4: {   // Rodrigo "El Tiburón" Salazar
      return `${rng.elegir(NOMBRES_PILA)} "${rng.elegir(SUSTANTIVOS_M)}" ${rng.elegir(APELLIDOS)}`;
    }
    case 5: {   // Tiburón Jr.
      return `${rng.elegir(SUSTANTIVOS_M)} ${rng.elegir(TITULOS)}`;
    }
    default: {  // Súper Jaguar
      const prefijos = ['Súper', 'Ultra', 'Mega', 'Místico', 'Máscara', 'Rey', 'Príncipe'];
      return `${rng.elegir(prefijos)} ${rng.elegir(SUSTANTIVOS_M)}`;
    }
  }
}

/** Apodo corto para tablas y brackets estrechos. */
export function nombreCorto(nombre, max = 16) {
  if (nombre.length <= max) return nombre;
  const limpio = nombre.replace(/^(El|La)\s+/, '');
  if (limpio.length <= max) return limpio;
  return limpio.slice(0, max - 1).trimEnd() + '…';
}
