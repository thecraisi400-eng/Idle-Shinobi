/**
 * Ring de Campeones — Navegación inferior de seis pestañas (Paso 2)
 */

import { el, button } from '../render.js';
import { NAV_TABS } from '../router.js';

/**
 * @param {Object} options
 * @param {string} options.activeRoute
 * @param {Object<string, number>} [options.badges] Avisos numerados por ruta.
 */
export function renderBottomNav({ activeRoute, badges = {} } = {}) {
  const tabs = NAV_TABS.map((tab) => {
    const isActive = tab.route === activeRoute;
    const badgeCount = Number(badges[tab.route] || 0);

    const children = [
      el('span', { className: 'nav-tab__icon', text: tab.icon, attrs: { 'aria-hidden': 'true' } }),
      el('span', { className: 'nav-tab__label', text: tab.label })
    ];

    if (badgeCount > 0) {
      children.push(
        el('span', {
          className: 'nav-tab__badge',
          text: badgeCount > 99 ? '99+' : String(badgeCount),
          attrs: { 'aria-label': `${badgeCount} avisos` }
        })
      );
    }

    return button({
      className: 'nav-tab',
      action: 'navigate',
      attrs: {
        'aria-current': isActive ? 'page' : 'false',
        'aria-label': tab.label,
        'data-route': tab.route,
        'data-testid': `nav-${tab.route}`
      },
      children
    });
  });

  return el('nav', {
    className: 'bottom-nav',
    attrs: { 'aria-label': 'Navegación principal', 'data-testid': 'bottom-nav' },
    children: tabs
  });
}
