/**
 * Ring de Campeones — Pantallas temporales (Paso 2)
 *
 * Cada pantalla se implementa por completo en el Paso 4. Aquí sólo se
 * comprueba que la estructura, la navegación y el "cero scroll" funcionan.
 */

import { el, card, placeholder } from '../render.js';
import { ROUTES } from '../router.js';

const SCREEN_DEFINITIONS = Object.freeze({
  [ROUTES.DASHBOARD]: {
    title: 'Panel',
    icon: '🏟️',
    intro: 'Retrato del héroe, estadísticas principales, evento activo y tarjeta de rival.',
    pending: 'El panel con el rival y el botón ¡LUCHAR! llega en el Paso 4.'
  },
  [ROUTES.HERO]: {
    title: 'Héroe',
    icon: '🥊',
    intro: 'Poder de combate, estadísticas mejorables, puntos disponibles e insignias.',
    pending: 'Las mejoras de estadísticas se conectan en el Paso 5.'
  },
  [ROUTES.EQUIPMENT]: {
    title: 'Equipo',
    icon: '🛡️',
    intro: 'Siete huecos, inventario paginado, comparación, mejora y venta con deshacer.',
    pending: 'El inventario real se conecta en el Paso 5.'
  },
  [ROUTES.SKILLS]: {
    title: 'Habilidad',
    icon: '✨',
    intro: 'Cuatro ramas: Ataque, Defensa, Fortuna y Gloria.',
    pending: 'El árbol de habilidades llega en el Paso 5.'
  },
  [ROUTES.EVENTS]: {
    title: 'Eventos',
    icon: '📅',
    intro: 'Siete eventos diarios, tiempo restante, historial y buzón.',
    pending: 'Los eventos diarios llegan en el Paso 7.'
  },
  [ROUTES.PVP]: {
    title: 'PVP',
    icon: '🏆',
    intro: 'Salas Bronce, Plata y Oro, bracket de 32 y campeones recientes.',
    pending: 'Los torneos contra rivales fantasma llegan en el Paso 8.'
  },
  [ROUTES.SHOP]: {
    title: 'Tienda',
    icon: '🛒',
    intro: 'Equipo, materiales, consumibles y premium, con tres ofertas diarias.',
    pending: 'La tienda se conecta en el Paso 8.'
  },
  [ROUTES.COMBAT]: {
    title: 'Combate',
    icon: '🥋',
    intro: 'Pantalla inmersiva sin cabecera ni navegación inferior.',
    pending: 'El motor de combate por turnos de carga llega en el Paso 6.'
  }
});

/**
 * Devuelve la pantalla temporal de una ruta.
 * @param {string} route
 * @returns {HTMLElement}
 */
export function renderPlaceholderScreen(route) {
  const definition = SCREEN_DEFINITIONS[route] || {
    title: 'Pantalla',
    icon: '❔',
    intro: 'Contenido pendiente.',
    pending: 'Esta pantalla se construye en un paso posterior.'
  };

  return el('main', {
    className: 'screen',
    attrs: {
      id: 'main-content',
      'data-testid': `screen-${route}`,
      'data-screen': route,
      'aria-label': definition.title
    },
    children: [
      el('h2', { className: 'screen__title', text: definition.title }),
      el('div', {
        className: 'screen__body',
        children: [card(`${definition.icon} ${definition.title}`, definition.intro), placeholder(definition.icon, definition.pending)]
      })
    ]
  });
}

export { SCREEN_DEFINITIONS };
