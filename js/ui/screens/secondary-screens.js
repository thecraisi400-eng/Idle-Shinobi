/** Misiones, logros y buzón: accesos secundarios paginados. */

import { el, button } from '../render.js';
import { paginator, progressBar, renderScreenFrame, segmentedControl, statusPanel } from '../components/ui-kit.js';
import { ACHIEVEMENTS_DEMO, INBOX_DEMO, MISSIONS_DEMO } from '../mock-data.js';

const MISSION_TABS = Object.freeze([
  { id: 'daily', label: 'Diarias', icon: '☀️' },
  { id: 'weekly', label: 'Semanales', icon: '📆' }
]);

export function renderMissionsScreen({ tab = 'daily', page = 0 }) {
  const selectedTab = tab === 'weekly' ? 'weekly' : 'daily';
  const missions = selectedTab === 'weekly'
    ? MISSIONS_DEMO.slice(0, 3).map((mission, index) => ({ ...mission, id: `weekly-${mission.id}`, name: `Semana: ${mission.name}`, max: mission.max * (index + 2) }))
    : MISSIONS_DEMO;
  const { visible, safePage, totalPages } = paginate(missions, page, 3);

  return renderScreenFrame({
    route: 'missions',
    title: 'Misiones',
    eyebrow: selectedTab === 'daily' ? 'Renovación diaria 06:00' : 'Renovación cada lunes',
    children: [
      segmentedControl({ label: 'Tipos de misión', group: 'missionsTab', selected: selectedTab, options: MISSION_TABS }),
      el('div', {
        className: 'mission-list',
        children: visible.map((mission) =>
          el('article', {
            className: 'mission-card',
            children: [
              el('div', {
                className: 'mission-card__copy',
                children: [el('h3', { text: mission.name }), el('p', { text: mission.detail }), progressBar({ label: mission.name, value: mission.progress, max: mission.max, display: `${mission.progress}/${mission.max}` })]
              }),
              button({
                label: mission.progress >= mission.max ? 'Reclamar' : mission.reward,
                className: 'mini-button',
                action: 'claim-demo-reward',
                disabled: mission.progress < mission.max,
                attrs: { 'data-reward-id': mission.id }
              })
            ]
          })
        )
      }),
      paginator({ group: 'missionsPage', page: safePage, totalPages, label: 'Misiones' }),
      backToPanel()
    ]
  });
}

export function renderAchievementsScreen({ page = 0 }) {
  const { visible, safePage, totalPages } = paginate(ACHIEVEMENTS_DEMO, page, 3);
  return renderScreenFrame({
    route: 'achievements',
    title: 'Logros',
    eyebrow: '1 de 100 insignias descubiertas',
    children: [
      el('div', {
        className: 'achievement-list',
        children: visible.map((achievement) =>
          el('article', {
            className: 'achievement-card',
            children: [
              el('span', { className: 'achievement-card__icon', text: achievement.icon, attrs: { 'aria-hidden': 'true' } }),
              el('div', {
                className: 'achievement-card__copy',
                children: [
                  el('h3', { text: achievement.name }),
                  el('p', { text: achievement.detail }),
                  progressBar({ label: achievement.name, value: achievement.progress, max: achievement.max, display: `${achievement.progress}/${achievement.max}` })
                ]
              }),
              button({
                label: achievement.progress >= achievement.max ? 'Reclamar' : achievement.reward,
                className: 'mini-button',
                action: 'claim-demo-reward',
                disabled: achievement.progress < achievement.max,
                attrs: { 'data-reward-id': achievement.id }
              })
            ]
          })
        )
      }),
      paginator({ group: 'achievementsPage', page: safePage, totalPages, label: 'Logros' }),
      backToPanel()
    ]
  });
}

export function renderInboxScreen({ page = 0 }) {
  const { visible, safePage, totalPages } = paginate(INBOX_DEMO, page, 3);
  return renderScreenFrame({
    route: 'inbox',
    title: 'Buzón',
    eyebrow: '3 mensajes · Inventario 47/50',
    children: [
      el('div', {
        className: 'inbox-summary',
        children: [
          el('span', { text: 'Premios pendientes' }),
          button({ label: 'Reclamar todo', className: 'btn btn--compact', action: 'claim-all-demo', attrs: { 'data-testid': 'claim-all' } })
        ]
      }),
      el('div', {
        className: 'inbox-list',
        children: visible.map((message) =>
          el('article', {
            className: `inbox-card ${message.blocked ? 'inbox-card--blocked' : ''}`,
            children: [
              el('span', { className: 'inbox-card__icon', text: message.icon, attrs: { 'aria-hidden': 'true' } }),
              el('div', {
                className: 'inbox-card__copy',
                children: [el('h3', { text: message.title }), el('p', { text: message.detail }), el('strong', { text: message.reward })]
              }),
              button({
                label: message.blocked ? 'Sin espacio' : 'Reclamar',
                className: 'mini-button',
                action: 'claim-demo-message',
                disabled: message.blocked,
                attrs: { 'data-message-id': message.id }
              })
            ]
          })
        )
      }),
      visible.some((message) => message.blocked)
        ? statusPanel({ kind: 'error', icon: '🎒', title: 'Premio conservado', text: 'El mensaje con objeto seguirá aquí hasta que liberes espacio.' })
        : null,
      paginator({ group: 'inboxPage', page: safePage, totalPages, label: 'Buzón' }),
      backToPanel()
    ]
  });
}

function paginate(items, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(totalPages - 1, Math.max(0, Number(page) || 0));
  return { visible: items.slice(safePage * pageSize, safePage * pageSize + pageSize), safePage, totalPages };
}

function backToPanel() {
  return button({ label: 'Volver al panel', className: 'btn btn--ghost', action: 'go-dashboard' });
}
