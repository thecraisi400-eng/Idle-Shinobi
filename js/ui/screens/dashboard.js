/** Panel principal compacto del Paso 4. */

import { getRequiredExp, calculateCombatPower } from '../../core/formulas.js';
import { formatNumber } from '../../core/formatters.js';
import { el, button } from '../render.js';
import { compactCard, countdownText, iconButton, progressBar, renderScreenFrame } from '../components/ui-kit.js';
import { HERO_DEMO, RIVAL_DEMO } from '../mock-data.js';
import { className } from './onboarding.js';

const DASHBOARD_STATS = ['health', 'attack', 'defense', 'speed', 'criticalChance'];

export function renderDashboardScreen({ state }) {
  const requiredExp = getRequiredExp(state.progression.level);
  const expMax = Number.isFinite(requiredExp) ? requiredExp : Math.max(1, state.progression.exp);
  const power = calculateCombatPower(state.baseStats);
  const stats = HERO_DEMO.stats.filter((stat) => DASHBOARD_STATS.includes(stat.id));

  const heroCard = compactCard({
    title: state.profile.heroName,
    meta: `${className(state.profile.classId)} · Poder ${formatNumber(power)}`,
    icon: '🥊',
    className: 'dashboard-hero',
    children: [
      progressBar({
        label: `Nivel ${state.progression.level} · EXP`,
        value: state.progression.exp,
        max: expMax,
        display: Number.isFinite(requiredExp) ? `${formatNumber(state.progression.exp)}/${formatNumber(requiredExp)}` : 'MÁX.'
      }),
      el('dl', {
        className: 'stat-strip',
        children: stats.flatMap((stat) => [
          el('div', {
            className: 'stat-strip__item',
            children: [
              el('dt', { text: `${stat.icon} ${stat.short}` }),
              el('dd', { text: displayStat(state.baseStats[stat.id], stat.id) })
            ]
          })
        ])
      })
    ]
  });

  const eventCard = el('button', {
    className: 'active-event-card',
    attrs: { type: 'button', 'data-testid': 'dashboard-event', 'aria-label': 'Abrir evento activo' },
    dataset: { action: 'navigate', route: 'events' },
    children: [
      el('span', { className: 'active-event-card__icon', text: '⚡', attrs: { 'aria-hidden': 'true' } }),
      el('span', { className: 'active-event-card__copy', children: [el('strong', { text: 'Torneo Relámpago' }), el('small', { text: 'Evento activo' })] }),
      countdownText(6136, { className: 'active-event-card__time', testId: 'dashboard-event-time' }),
      el('span', { text: '›', attrs: { 'aria-hidden': 'true' } })
    ]
  });

  const rivalCard = compactCard({
    title: RIVAL_DEMO.name,
    meta: `${RIVAL_DEMO.className} · Nivel ${RIVAL_DEMO.level}`,
    icon: '🐂',
    className: 'rival-card',
    children: [
      el('div', {
        className: 'power-comparison',
        children: [
          powerValue('Tu poder', power, 'up'),
          el('span', { className: 'power-comparison__versus', text: 'VS' }),
          powerValue('Rival', RIVAL_DEMO.power, 'down')
        ]
      }),
      el('p', {
        className: 'comparison-label comparison-label--good',
        text: `▲ ${RIVAL_DEMO.comparison} · ${RIVAL_DEMO.difficulty}`
      }),
      el('p', {
        className: 'reward-line',
        text: `Premios: 🪙 ${RIVAL_DEMO.rewards.gold} · ⭐ ${RIVAL_DEMO.rewards.exp} EXP · 🧱 ${RIVAL_DEMO.rewards.materials}`
      }),
      button({ label: '¡LUCHAR!', className: 'btn btn--primary fight-button', action: 'open-precombat', attrs: { 'data-testid': 'btn-fight' } })
    ]
  });

  return renderScreenFrame({
    route: 'dashboard',
    title: 'Panel',
    eyebrow: `Capítulo ${state.progression.chapter} · Combate ${state.progression.fight}`,
    children: [
      el('div', { className: 'dashboard-grid', children: [heroCard, eventCard, rivalCard] }),
      el('nav', {
        className: 'quick-links',
        attrs: { 'aria-label': 'Accesos secundarios' },
        children: [
          iconButton({ icon: '✅', label: 'Misiones', action: 'navigate', attrs: { 'data-route': 'missions', 'data-testid': 'quick-missions' } }),
          iconButton({ icon: '🏅', label: 'Logros', action: 'navigate', attrs: { 'data-route': 'achievements', 'data-testid': 'quick-achievements' } }),
          iconButton({ icon: '✉️', label: 'Buzón', action: 'navigate', attrs: { 'data-route': 'inbox', 'data-testid': 'quick-inbox' } })
        ]
      })
    ]
  });
}

function displayStat(value, id) {
  return ['criticalChance', 'luck', 'dodge', 'accuracy', 'criticalResistance', 'criticalNullify'].includes(id)
    ? `${Math.round((Number(value) || 0) * 100)}%`
    : formatNumber(value);
}

function powerValue(label, value, direction) {
  return el('div', {
    className: `power-comparison__value power-comparison__value--${direction}`,
    children: [el('span', { text: label }), el('strong', { text: formatNumber(value) })]
  });
}
