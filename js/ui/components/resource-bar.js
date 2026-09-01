/**
 * Ring de Campeones — Cabecera con recursos (Paso 2)
 * Nivel, oro, Gemas y materiales (no hay energía, según docs/reglas.md).
 */

import { el, button } from '../render.js';
import { formatNumber } from '../../core/formatters.js';

/**
 * @param {Object} data
 * @param {number} data.level
 * @param {number} data.gold
 * @param {number} data.gems
 * @param {number} data.materials
 * @param {string} [data.nextEventLabel]
 * @param {string} [data.nextEventTime]
 */
export function renderResourceBar({
  level = 1,
  gold = 0,
  gems = 0,
  materials = 0,
  nextEventLabel = 'Próximo evento',
  nextEventTime = '--:--'
} = {}) {
  const levelBox = el('div', {
    className: 'resource-bar__level',
    attrs: { 'aria-label': `Nivel ${level}` },
    children: [
      el('span', { className: 'resource-bar__level-label', text: 'NIVEL', attrs: { 'aria-hidden': 'true' } }),
      el('span', {
        className: 'resource-bar__level-value',
        text: formatNumber(level),
        attrs: { 'aria-hidden': 'true' },
        dataset: { testid: 'hud-level' }
      })
    ]
  });

  const resources = el('div', {
    className: 'resource-bar__resources',
    children: [
      resource('gold', '🪙', 'Oro', gold),
      resource('gems', '💎', 'Gemas', gems),
      resource('materials', '🧱', 'Materiales', materials)
    ]
  });

  const settingsButton = button({
    label: '⚙️',
    className: 'icon-button',
    action: 'open-settings',
    attrs: { 'aria-label': 'Abrir ajustes', 'data-testid': 'btn-settings' }
  });

  const nextEvent = el('p', {
    className: 'next-event',
    children: [
      el('span', { text: nextEventLabel }),
      el('span', { className: 'next-event__value', text: nextEventTime })
    ]
  });

  return el('header', {
    className: 'resource-bar',
    attrs: { role: 'banner', 'data-testid': 'resource-bar' },
    children: [levelBox, resources, settingsButton, nextEvent]
  });
}

function resource(kind, icon, label, value) {
  return el('div', {
    className: `resource resource--${kind}`,
    attrs: { 'aria-label': `${label}: ${value}` },
    dataset: { testid: `hud-${kind}` },
    children: [
      el('span', { className: 'resource__icon', text: icon, attrs: { 'aria-hidden': 'true' } }),
      el('span', { className: 'resource__value', text: formatNumber(value), attrs: { 'aria-hidden': 'true' } })
    ]
  });
}
