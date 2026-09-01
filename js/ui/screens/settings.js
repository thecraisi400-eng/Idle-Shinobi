/** Ajustes visuales, de accesibilidad y datos del Paso 4. */

import { el, button } from '../render.js';
import { FONT_SCALES, QUALITY_LEVELS } from '../../platform/preferences.js';
import { renderScreenFrame, segmentedControl, statusPanel } from '../components/ui-kit.js';

const SETTINGS_TABS = Object.freeze([
  { id: 'visual', label: 'Visual', icon: '👁️' },
  { id: 'audio', label: 'Audio', icon: '🔊' },
  { id: 'data', label: 'Datos', icon: '💾' }
]);

export function renderSettingsScreen({ preferences, settings, tab = 'visual', hasGame = false } = {}) {
  const selectedTab = SETTINGS_TABS.some((entry) => entry.id === tab) ? tab : 'visual';
  let content;
  if (selectedTab === 'audio') content = renderAudioSettings(settings);
  else if (selectedTab === 'data') content = renderDataSettings(hasGame);
  else content = renderVisualSettings(preferences, settings);

  return renderScreenFrame({
    route: 'settings',
    title: 'Ajustes',
    eyebrow: 'Preferencias guardadas en este dispositivo',
    className: 'settings-screen',
    children: [
      segmentedControl({ label: 'Secciones de ajustes', group: 'settingsTab', selected: selectedTab, options: SETTINGS_TABS }),
      el('div', { className: 'settings-panel', attrs: { 'data-testid': `settings-panel-${selectedTab}` }, children: [content] }),
      button({ label: 'Volver', className: 'btn btn--ghost settings-back', action: 'back', attrs: { 'data-testid': 'btn-back' } })
    ]
  });
}

function renderVisualSettings(preferences, settings) {
  return el('div', {
    className: 'settings-groups',
    children: [
      optionGroup({
        legend: 'Tamaño de texto',
        name: 'font-scale',
        action: 'set-font-scale',
        options: FONT_SCALES.map(({ id, label, value }) => ({ id, label: `${label} ×${value}` })),
        selected: preferences?.fontScale
      }),
      optionGroup({
        legend: 'Calidad visual',
        name: 'quality',
        action: 'set-quality',
        options: QUALITY_LEVELS,
        selected: preferences?.quality
      }),
      toggleRow({
        label: 'Reducir movimiento',
        detail: 'Desactiva transiciones y efectos intensos.',
        setting: 'reducedMotion',
        enabled: Boolean(settings?.reducedMotion)
      })
    ]
  });
}

function renderAudioSettings(settings = {}) {
  return el('div', {
    className: 'settings-groups',
    children: [
      volumeGroup('Música', 'musicVolume', settings.musicVolume ?? 0.5),
      volumeGroup('Efectos', 'effectsVolume', settings.effectsVolume ?? 0.7),
      toggleRow({
        label: 'Vibración',
        detail: 'Respuesta háptica en botones, golpes y victorias.',
        setting: 'vibration',
        enabled: Boolean(settings.vibration)
      }),
      statusPanel({ kind: 'info', icon: '🔇', title: 'Volumen cero respetado', text: 'En 0% no se reproducirá ningún sonido.' })
    ]
  });
}

function renderDataSettings(hasGame) {
  return el('div', {
    className: 'settings-groups settings-data',
    children: [
      statusPanel({
        kind: hasGame ? 'info' : 'empty',
        icon: '💾',
        title: hasGame ? 'Partida protegida' : 'No hay partida guardada',
        text: hasGame ? 'El guardado actual mantiene una copia de respaldo local.' : 'Crea una partida para habilitar las herramientas de respaldo.'
      }),
      button({ label: 'Exportar respaldo', className: 'btn', action: 'demo-backup', disabled: !hasGame, attrs: { 'data-backup-action': 'export' } }),
      button({ label: 'Importar respaldo', className: 'btn btn--ghost', action: 'demo-backup', attrs: { 'data-backup-action': 'import' } }),
      el('p', { className: 'help-line', text: 'La interfaz está preparada; la importación y exportación funcional se conectará más adelante.' })
    ]
  });
}

function optionGroup({ legend, name, action, options, selected }) {
  return el('fieldset', {
    className: 'settings-group',
    attrs: { 'data-testid': `group-${name}` },
    children: [
      el('legend', { text: legend }),
      el('div', {
        className: `choice-row choice-row--${options.length}`,
        children: options.map((option) =>
          button({
            label: option.label,
            className: 'choice-button',
            action,
            attrs: {
              'data-value': option.id,
              'aria-pressed': option.id === selected ? 'true' : 'false',
              'data-testid': `${name}-${option.id}`
            }
          })
        )
      })
    ]
  });
}

function volumeGroup(label, setting, value) {
  const percent = Math.round(value * 100);
  return el('fieldset', {
    className: 'settings-group',
    children: [
      el('legend', { text: `${label}: ${percent}%` }),
      el('div', {
        className: 'choice-row choice-row--3',
        children: [0, 0.5, 1].map((amount) =>
          button({
            label: `${Math.round(amount * 100)}%`,
            className: 'choice-button',
            action: 'set-volume',
            attrs: {
              'data-setting': setting,
              'data-value': String(amount),
              'aria-pressed': value === amount ? 'true' : 'false'
            }
          })
        )
      })
    ]
  });
}

function toggleRow({ label, detail, setting, enabled }) {
  return el('div', {
    className: 'toggle-row',
    children: [
      el('div', { children: [el('strong', { text: label }), el('small', { text: detail })] }),
      button({
        label: enabled ? 'Activado' : 'Desactivado',
        className: 'toggle-button',
        action: 'toggle-setting',
        attrs: {
          'data-setting': setting,
          'data-value': enabled ? 'false' : 'true',
          'aria-pressed': enabled ? 'true' : 'false'
        }
      })
    ]
  });
}
