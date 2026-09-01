/**
 * Ring de Campeones — Portada (Paso 2, versión temporal)
 * Muestra logo, nivel del guardado y botones. Sin luchador (docs/reglas.md).
 */

import { el, button } from '../render.js';
import { GAME_CONFIG } from '../../config/game-config.js';

/**
 * @param {Object} context
 * @param {boolean} context.hasSave
 * @param {number} context.savedLevel
 * @param {string} context.version
 */
export function renderHomeScreen({ hasSave = false, savedLevel = 0, version = '0.2.0' } = {}) {
  const logo = el('img', {
    className: 'home__logo',
    attrs: {
      src: '/favicon.svg',
      alt: 'Logo de Ring de Campeones',
      width: '210',
      height: '210',
      decoding: 'async'
    }
  });

  const saveLine = el('p', {
    className: 'home__save',
    text: hasSave ? `Partida guardada — Nivel ${savedLevel}` : 'Aún no hay partida guardada',
    attrs: { 'data-testid': 'home-save-info' }
  });

  const actions = el('div', {
    className: 'home__actions',
    children: [
      button({
        label: 'Continuar',
        className: 'btn btn--primary',
        action: 'continue-game',
        disabled: !hasSave,
        attrs: { 'data-testid': 'btn-continue' }
      }),
      button({
        label: 'Nueva partida',
        className: 'btn',
        action: 'new-game',
        attrs: { 'data-testid': 'btn-new-game' }
      }),
      button({
        label: 'Ajustes',
        className: 'btn btn--ghost',
        action: 'open-settings',
        attrs: { 'data-testid': 'btn-home-settings' }
      })
    ]
  });

  return el('main', {
    className: 'home',
    attrs: { id: 'main-content', 'data-testid': 'screen-home', 'data-screen': 'home' },
    children: [
      logo,
      el('h1', { className: 'home__title', text: GAME_CONFIG.GAME_TITLE }),
      el('p', { className: 'home__subtitle', text: 'Sube al ring, gana títulos y hazte leyenda.' }),
      saveLine,
      actions,
      el('p', { className: 'home__version', text: `Versión ${version} — Paso 3` })
    ]
  });
}
