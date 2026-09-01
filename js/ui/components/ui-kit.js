/** Componentes visuales reutilizables de la interfaz del Paso 4. */

import { el, button } from '../render.js';

export function renderScreenFrame({ route, title, eyebrow, children = [], className = '' }) {
  return el('main', {
    className: `screen game-screen game-screen--${route} ${className}`.trim(),
    attrs: {
      id: 'main-content',
      'data-testid': `screen-${route}`,
      'data-screen': route,
      'aria-label': title
    },
    children: [
      el('header', {
        className: 'screen-heading',
        children: [
          eyebrow ? el('span', { className: 'screen-heading__eyebrow', text: eyebrow }) : null,
          el('h1', { className: 'screen__title', text: title })
        ]
      }),
      el('div', { className: 'screen__body', children })
    ]
  });
}

export function progressBar({ label, value = 0, max = 100, display, className = '' }) {
  const safeMax = Math.max(1, Number(max) || 1);
  const safeValue = Math.min(safeMax, Math.max(0, Number(value) || 0));
  const percent = Math.round((safeValue / safeMax) * 100);

  return el('div', {
    className: `progress ${className}`.trim(),
    children: [
      el('div', {
        className: 'progress__labels',
        children: [el('span', { text: label }), el('strong', { text: display ?? `${safeValue}/${safeMax}` })]
      }),
      el('div', {
        className: 'progress__track',
        attrs: {
          role: 'progressbar',
          'aria-label': label,
          'aria-valuemin': '0',
          'aria-valuemax': String(safeMax),
          'aria-valuenow': String(safeValue),
          'aria-valuetext': display ?? `${safeValue} de ${safeMax}`
        },
        children: [el('span', { className: 'progress__fill', attrs: { style: `width:${percent}%` } })]
      })
    ]
  });
}

export function segmentedControl({ label, group, selected, options }) {
  return el('div', {
    className: `segments segments--${Math.min(options.length, 4)}`,
    attrs: { role: 'group', 'aria-label': label },
    children: options.map((option) =>
      button({
        label: `${option.icon ? `${option.icon} ` : ''}${option.label}`,
        className: 'segment',
        action: 'ui-tab',
        attrs: {
          'data-group': group,
          'data-value': option.id,
          'aria-pressed': option.id === selected ? 'true' : 'false',
          'data-testid': `${group}-${option.id}`
        }
      })
    )
  });
}

export function paginator({ group, page = 0, totalPages = 1, label = 'Página' }) {
  const count = Math.max(1, totalPages);
  const current = Math.min(count - 1, Math.max(0, page));
  return el('nav', {
    className: 'paginator',
    attrs: { 'aria-label': `Paginación de ${label.toLowerCase()}` },
    children: [
      button({
        label: '‹',
        className: 'paginator__button',
        action: 'ui-page',
        disabled: current === 0,
        attrs: { 'data-group': group, 'data-delta': '-1', 'aria-label': `${label} anterior` }
      }),
      el('span', {
        className: 'paginator__status',
        text: `${label} ${current + 1} de ${count}`,
        attrs: { 'aria-live': 'polite', 'data-testid': `page-${group}` }
      }),
      button({
        label: '›',
        className: 'paginator__button',
        action: 'ui-page',
        disabled: current >= count - 1,
        attrs: { 'data-group': group, 'data-delta': '1', 'aria-label': `${label} siguiente` }
      })
    ]
  });
}

export function statusPanel({ kind = 'empty', icon = 'ℹ️', title, text, action, actionLabel }) {
  const children = [
    el('span', { className: 'status-panel__icon', text: icon, attrs: { 'aria-hidden': 'true' } }),
    el('div', {
      className: 'status-panel__copy',
      children: [el('h3', { text: title }), el('p', { text })]
    })
  ];
  if (action && actionLabel) children.push(button({ label: actionLabel, className: 'btn btn--compact', action }));
  return el('section', {
    className: `status-panel status-panel--${kind}`,
    attrs: { role: kind === 'error' ? 'alert' : 'status' },
    children
  });
}

export function iconButton({ icon, label, action, attrs = {}, className = '' }) {
  return button({
    label,
    className: `icon-action ${className}`.trim(),
    action,
    attrs: { ...attrs, 'aria-label': label },
    children: [
      el('span', { className: 'icon-action__icon', text: icon, attrs: { 'aria-hidden': 'true' } }),
      el('span', { className: 'icon-action__label', text: label })
    ]
  });
}

export function compactCard({ title, meta, icon, children = [], className = '', attrs = {} }) {
  return el('section', {
    className: `compact-card ${className}`.trim(),
    attrs,
    children: [
      el('header', {
        className: 'compact-card__header',
        children: [
          icon ? el('span', { className: 'compact-card__icon', text: icon, attrs: { 'aria-hidden': 'true' } }) : null,
          el('div', {
            className: 'compact-card__heading',
            children: [el('h3', { text: title }), meta ? el('p', { text: meta }) : null]
          })
        ]
      }),
      ...children
    ]
  });
}

export function countdownText(seconds, { className = '', testId } = {}) {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  return el('time', {
    className,
    text: formatCountdown(safeSeconds),
    attrs: {
      'data-countdown': String(safeSeconds),
      ...(testId ? { 'data-testid': testId } : {})
    }
  });
}

export function formatCountdown(totalSeconds) {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}
