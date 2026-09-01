/**
 * Ring de Campeones — Ajustes (Paso 2, versión temporal)
 * Ya son funcionales la escala de texto y la calidad visual.
 */

import { el, button, card } from '../render.js';
import { FONT_SCALES, QUALITY_LEVELS } from '../../platform/preferences.js';

/**
 * @param {Object} context
 * @param {{fontScale:string, quality:string}} context.preferences
 */
export function renderSettingsScreen({ preferences } = {}) {
  const fontGroup = optionGroup({
    legend: 'Tamaño de texto',
    name: 'font-scale',
    action: 'set-font-scale',
    options: FONT_SCALES.map(({ id, label, value }) => ({ id, label: `${label} (×${value})` })),
    selected: preferences?.fontScale
  });

  const qualityGroup = optionGroup({
    legend: 'Calidad visual',
    name: 'quality',
    action: 'set-quality',
    options: QUALITY_LEVELS,
    selected: preferences?.quality
  });

  return el('main', {
    className: 'screen',
    attrs: { id: 'main-content', 'data-testid': 'screen-settings', 'data-screen': 'settings', 'aria-label': 'Ajustes' },
    children: [
      el('h2', { className: 'screen__title', text: 'Ajustes' }),
      el('div', {
        className: 'screen__body',
        children: [
          fontGroup,
          qualityGroup,
          card('Audio, vibración y respaldo', 'El estado ya guarda ajustes y progreso con respaldo. La interfaz de exportar/importar llega en el Paso 9.'),
          button({
            label: 'Volver',
            className: 'btn btn--ghost',
            action: 'back',
            attrs: { 'data-testid': 'btn-back' }
          })
        ]
      })
    ]
  });
}

function optionGroup({ legend, name, action, options, selected }) {
  const buttons = options.map((option) =>
    button({
      label: option.label,
      className: `btn ${option.id === selected ? 'btn--primary' : 'btn--ghost'}`,
      action,
      attrs: {
        'data-value': option.id,
        'aria-pressed': option.id === selected ? 'true' : 'false',
        'data-testid': `${name}-${option.id}`
      }
    })
  );

  return el('fieldset', {
    className: 'card',
    attrs: { 'data-testid': `group-${name}` },
    children: [
      el('legend', { className: 'card__title', text: legend }),
      el('div', { className: 'modal__actions', children: buttons })
    ]
  });
}
