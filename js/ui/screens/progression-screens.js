/** Pantallas Héroe, Equipo y Habilidad con datos visuales simulados. */

import { calculateCombatPower } from '../../core/formulas.js';
import { formatNumber } from '../../core/formatters.js';
import { el, button } from '../render.js';
import {
  compactCard,
  paginator,
  progressBar,
  renderScreenFrame,
  segmentedControl,
  statusPanel
} from '../components/ui-kit.js';
import {
  EQUIPMENT_DEMO,
  EQUIPMENT_SLOTS_DEMO,
  HERO_DEMO,
  MATERIALS_DEMO,
  SKILL_BRANCHES_DEMO
} from '../mock-data.js';
import { className } from './onboarding.js';

const HERO_TABS = Object.freeze([
  { id: 'overview', label: 'Resumen', icon: '🥊' },
  { id: 'stats', label: 'Stats', icon: '📊' },
  { id: 'badges', label: 'Insignias', icon: '🏅' }
]);
const EQUIPMENT_TABS = Object.freeze([
  { id: 'equipped', label: 'Equipado', icon: '🛡️' },
  { id: 'inventory', label: 'Equipo', icon: '🎒' },
  { id: 'materials', label: 'Materiales', icon: '🧱' }
]);

export function renderHeroScreen({ state, tab = 'overview', statsPage = 0, upgradeQuantity = 1 }) {
  const selectedTab = HERO_TABS.some((item) => item.id === tab) ? tab : 'overview';
  const power = calculateCombatPower(state.baseStats);
  let content;

  if (selectedTab === 'stats') {
    content = renderHeroStats({ state, page: statsPage, quantity: upgradeQuantity });
  } else if (selectedTab === 'badges') {
    content = renderHeroBadges(state);
  } else {
    content = renderHeroOverview(state, power);
  }

  return renderScreenFrame({
    route: 'hero',
    title: 'Héroe',
    eyebrow: `${className(state.profile.classId)} · Poder ${formatNumber(power)}`,
    children: [
      segmentedControl({ label: 'Secciones del héroe', group: 'heroTab', selected: selectedTab, options: HERO_TABS }),
      el('div', { className: 'tab-panel', attrs: { 'data-testid': `hero-panel-${selectedTab}` }, children: [content] })
    ]
  });
}

function renderHeroOverview(state, power) {
  const radarStats = HERO_DEMO.stats.slice(0, 5);
  return el('div', {
    className: 'hero-overview',
    children: [
      compactCard({
        title: state.profile.heroName,
        meta: `${className(state.profile.classId)} · Clase permanente`,
        icon: '🥊',
        className: 'hero-identity',
        children: [el('strong', { className: 'hero-power', text: `Poder ${formatNumber(power)}` })]
      }),
      el('section', {
        className: 'radar-card compact-card',
        children: [
          el('div', {
            className: 'radar-visual',
            attrs: {
              role: 'img',
              'aria-label': radarStats.map((stat) => `${stat.label}: ${displayStateStat(state, stat.id)}`).join(', ')
            },
            children: [el('span', { text: 'PODER' }), el('strong', { text: formatNumber(power) })]
          }),
          el('dl', {
            className: 'radar-legend',
            children: radarStats.map((stat) =>
              el('div', {
                children: [el('dt', { text: `${stat.icon} ${stat.short}` }), el('dd', { text: displayStateStat(state, stat.id) })]
              })
            )
          })
        ]
      }),
      progressBar({ label: 'Próxima meta: Nivel 5', value: state.progression.level, max: 5, display: `${state.progression.level}/5` })
    ]
  });
}

function renderHeroStats({ state, page, quantity }) {
  const pageSize = 4;
  const totalPages = Math.ceil(HERO_DEMO.stats.length / pageSize);
  const safePage = clampPage(page, totalPages);
  const visible = HERO_DEMO.stats.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const qty = Math.min(10, Math.max(1, quantity));
  const unitCost = 75;
  const totalCost = unitCost * qty;

  return el('div', {
    className: 'hero-stats-panel',
    children: [
      el('div', {
        className: 'panel-summary',
        children: [
          el('span', { text: `Puntos disponibles: ${state.progression.statPoints}` }),
          el('strong', { text: `Costo total: 🪙 ${formatNumber(totalCost)}` })
        ]
      }),
      el('div', {
        className: 'stat-list',
        children: visible.map((stat) =>
          el('div', {
            className: 'stat-row',
            children: [
              el('span', { className: 'stat-row__icon', text: stat.icon, attrs: { 'aria-hidden': 'true' } }),
              el('span', { className: 'stat-row__name', text: stat.label }),
              el('strong', { text: displayStateStat(state, stat.id) }),
              button({
                label: `Mejorar ${stat.label}`,
                className: 'stat-row__add',
                action: 'confirm-stat-upgrade',
                attrs: { 'data-stat-id': stat.id, 'aria-label': `Mejorar ${stat.label} ${qty} veces` },
                children: [el('span', { text: `+${qty}`, attrs: { 'aria-hidden': 'true' } })]
              })
            ]
          })
        )
      }),
      el('div', {
        className: 'quantity-control',
        attrs: { role: 'group', 'aria-label': 'Cantidad de mejoras' },
        children: [
          button({ label: '−', className: 'quantity-control__button', action: 'stat-quantity', disabled: qty <= 1, attrs: { 'data-delta': '-1', 'aria-label': 'Reducir cantidad' } }),
          el('span', { text: `Comprar ×${qty}`, attrs: { 'aria-live': 'polite' } }),
          button({ label: '+', className: 'quantity-control__button', action: 'stat-quantity', disabled: qty >= 10, attrs: { 'data-delta': '1', 'aria-label': 'Aumentar cantidad' } })
        ]
      }),
      paginator({ group: 'heroStatsPage', page: safePage, totalPages, label: 'Stats' })
    ]
  });
}

function renderHeroBadges(state) {
  return el('div', {
    className: 'badges-panel',
    children: [
      el('div', {
        className: 'badge-list',
        children: HERO_DEMO.badges.map((badge, index) =>
          compactCard({
            title: badge.name,
            meta: badge.detail,
            icon: badge.icon,
            className: index === 0 ? 'badge-card badge-card--earned' : 'badge-card badge-card--locked'
          })
        )
      }),
      progressBar({ label: 'Próxima insignia: Retador', value: state.progression.victories, max: 10, display: `${state.progression.victories}/10 victorias` })
    ]
  });
}

export function renderEquipmentScreen({ tab = 'equipped', inventoryPage = 0, soldItemIds = new Set(), undoSale = null }) {
  const selectedTab = EQUIPMENT_TABS.some((item) => item.id === tab) ? tab : 'equipped';
  let content;
  if (selectedTab === 'inventory') content = renderInventory(inventoryPage, soldItemIds, undoSale);
  else if (selectedTab === 'materials') content = renderMaterials();
  else content = renderEquipped();

  return renderScreenFrame({
    route: 'equipment',
    title: 'Equipo',
    eyebrow: 'Poder equipado 257 · Inventario 6/50',
    children: [
      segmentedControl({ label: 'Secciones de equipo', group: 'equipmentTab', selected: selectedTab, options: EQUIPMENT_TABS }),
      el('div', { className: 'tab-panel', attrs: { 'data-testid': `equipment-panel-${selectedTab}` }, children: [content] })
    ]
  });
}

function renderEquipped() {
  return el('div', {
    className: 'equipment-panel',
    children: [
      el('div', {
        className: 'power-preview',
        children: [el('span', { text: 'Poder actual 257' }), el('strong', { text: '▲ 286 con selección' })]
      }),
      el('div', {
        className: 'slot-grid',
        children: EQUIPMENT_SLOTS_DEMO.map((slot) => {
          const item = EQUIPMENT_DEMO.find((entry) => entry.id === slot.itemId);
          return button({
            label: slot.label,
            className: `slot-card ${item ? 'slot-card--filled' : 'slot-card--empty'}`,
            action: item ? 'show-item-detail' : 'show-empty-slot',
            attrs: {
              'data-item-id': item?.id,
              'data-slot-id': slot.id,
              'data-testid': `slot-${slot.id}`,
              'aria-label': item ? `${slot.label}: ${item.name}, poder ${item.power}` : `${slot.label}: vacío`
            },
            children: [
              el('span', { className: 'slot-card__icon', text: slot.icon, attrs: { 'aria-hidden': 'true' } }),
              el('span', { className: 'slot-card__label', text: slot.label }),
              el('small', { text: item ? `+${item.level} · ${item.power}` : 'Vacío' })
            ]
          });
        })
      }),
      el('p', { className: 'help-line', text: 'Selecciona un hueco para comparar, mejorar o cambiar la pieza.' })
    ]
  });
}

function renderInventory(page, soldItemIds, undoSale) {
  const available = EQUIPMENT_DEMO.filter((item) => !soldItemIds.has(item.id));
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(available.length / pageSize));
  const safePage = clampPage(page, totalPages);
  const visible = available.slice(safePage * pageSize, safePage * pageSize + pageSize);

  return el('div', {
    className: 'inventory-panel',
    children: [
      undoSale
        ? el('aside', {
            className: 'undo-banner',
            attrs: { role: 'status', 'aria-live': 'polite' },
            children: [
              el('span', { text: `Vendiste ${undoSale.name}.` }),
              button({ label: 'Deshacer', className: 'btn btn--compact', action: 'undo-sale', attrs: { 'data-testid': 'undo-sale' } })
            ]
          })
        : null,
      visible.length
        ? el('div', {
            className: 'item-grid',
            children: visible.map((item) =>
              el('article', {
                className: 'item-card',
                children: [
                  button({
                    label: `Ver ${item.name}`,
                    className: 'item-card__main',
                    action: 'show-item-detail',
                    attrs: { 'data-item-id': item.id, 'aria-label': `${item.name}, ${item.rarity}, poder ${item.power}` },
                    children: [
                      el('span', { className: 'item-card__icon', text: item.icon, attrs: { 'aria-hidden': 'true' } }),
                      el('strong', { text: item.name }),
                      el('small', { text: `${item.rarity} · +${item.level} · Poder ${item.power}` }),
                      el('span', { className: 'comparison-label comparison-label--good', text: '▲ Mejora' })
                    ]
                  }),
                  el('div', {
                    className: 'item-card__actions',
                    children: [
                      button({ label: 'Equipar', className: 'mini-button', action: 'demo-equip', attrs: { 'data-item-id': item.id } }),
                      button({ label: 'Vender', className: 'mini-button mini-button--danger', action: 'demo-sell', attrs: { 'data-item-id': item.id } })
                    ]
                  })
                ]
              })
            )
          })
        : statusPanel({ kind: 'empty', icon: '🎒', title: 'Inventario vacío', text: 'Visita la tienda para conseguir equipo.' }),
      paginator({ group: 'inventoryPage', page: safePage, totalPages, label: 'Inventario' })
    ]
  });
}

function renderMaterials() {
  return el('div', {
    className: 'materials-panel',
    children: [
      el('div', {
        className: 'material-list',
        children: MATERIALS_DEMO.map((material) =>
          compactCard({
            title: material.name,
            meta: `${material.amount} unidades`,
            icon: material.icon,
            className: 'material-card'
          })
        )
      }),
      statusPanel({ kind: 'info', icon: '🔧', title: 'Mejoras seguras', text: 'Una mejora fallida consume materiales, pero nunca destruye la pieza.' })
    ]
  });
}

export function renderSkillsScreen({ state, branchId = 'attack', page = 0 }) {
  const branch = SKILL_BRANCHES_DEMO.find((entry) => entry.id === branchId) || SKILL_BRANCHES_DEMO[0];
  const pageSize = 3;
  const totalPages = Math.max(1, Math.ceil(branch.nodes.length / pageSize));
  const safePage = clampPage(page, totalPages);
  const nodes = branch.nodes.slice(safePage * pageSize, safePage * pageSize + pageSize);

  return renderScreenFrame({
    route: 'skills',
    title: 'Habilidad',
    eyebrow: `${state.progression.skillPoints} puntos disponibles · ${state.skills.spent} invertidos`,
    children: [
      segmentedControl({
        label: 'Ramas de habilidades',
        group: 'skillBranch',
        selected: branch.id,
        options: SKILL_BRANCHES_DEMO.map((entry) => ({ id: entry.id, label: entry.name, icon: entry.icon }))
      }),
      el('div', {
        className: 'skill-panel',
        children: [
          el('div', {
            className: 'skill-node-list',
            children: nodes.map((node, index) =>
              el('article', {
                className: `skill-node skill-node--${node.state}`,
                children: [
                  index > 0 ? el('span', { className: 'skill-node__connection', attrs: { 'aria-hidden': 'true' } }) : null,
                  el('span', { className: 'skill-node__state', text: node.state === 'available' ? 'Disponible' : 'Bloqueada' }),
                  el('div', {
                    children: [el('h3', { text: node.name }), el('p', { text: `${node.effect} · Nivel ${node.level} · Costo ${node.cost}` }), el('small', { text: `Requiere: ${node.prerequisite}` })]
                  }),
                  button({
                    label: node.state === 'available' ? 'Aprender' : 'Bloqueada',
                    className: 'mini-button',
                    action: 'demo-learn-skill',
                    disabled: node.state !== 'available',
                    attrs: { 'data-skill-id': node.id }
                  })
                ]
              })
            )
          }),
          paginator({ group: 'skillPage', page: safePage, totalPages, label: branch.name }),
          button({ label: 'Resetear por 💎 20', className: 'btn btn--ghost', action: 'reset-skills', attrs: { 'data-testid': 'reset-skills' } })
        ]
      })
    ]
  });
}

function displayStateStat(state, id) {
  const value = state.baseStats[id];
  return ['criticalChance', 'luck', 'dodge', 'accuracy', 'criticalResistance', 'criticalNullify'].includes(id)
    ? `${Math.round((Number(value) || 0) * 100)}%`
    : formatNumber(value ?? 0);
}

function clampPage(page, totalPages) {
  return Math.min(totalPages - 1, Math.max(0, Number(page) || 0));
}
