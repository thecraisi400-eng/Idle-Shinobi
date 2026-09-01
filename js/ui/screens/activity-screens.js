/** Pantallas de Eventos, PVP y Tienda con navegación paginada. */

import { el, button } from '../render.js';
import {
  compactCard,
  countdownText,
  paginator,
  progressBar,
  renderScreenFrame,
  segmentedControl,
  statusPanel
} from '../components/ui-kit.js';
import { EVENTS_DEMO, PVP_ROOMS_DEMO, SHOP_ITEMS_DEMO } from '../mock-data.js';

const EVENT_TABS = Object.freeze([
  { id: 'current', label: 'Actual', icon: '⚡' },
  { id: 'day', label: 'Hoy', icon: '📅' },
  { id: 'history', label: 'Historial', icon: '📜' }
]);
const PVP_TABS = Object.freeze([
  { id: 'rooms', label: 'Salas', icon: '🏆' },
  { id: 'bracket', label: 'Bracket', icon: '🌿' },
  { id: 'champions', label: 'Campeones', icon: '👑' }
]);
const SHOP_TABS = Object.freeze([
  { id: 'equipment', label: 'Equipo', icon: '🛡️' },
  { id: 'materials', label: 'Materiales', icon: '🧱' },
  { id: 'consumables', label: 'Consumibles', icon: '🧪' },
  { id: 'premium', label: 'Premium', icon: '💎' }
]);

export function renderEventsScreen({ tab = 'current', dayPage = 0 }) {
  const selectedTab = EVENT_TABS.some((entry) => entry.id === tab) ? tab : 'current';
  let content;
  if (selectedTab === 'day') content = renderDailyEvents(dayPage);
  else if (selectedTab === 'history') content = renderEventHistory();
  else content = renderCurrentEvent();

  return renderScreenFrame({
    route: 'events',
    title: 'Eventos',
    eyebrow: 'Siete desafíos · Día operativo 06:00',
    children: [
      segmentedControl({ label: 'Secciones de eventos', group: 'eventsTab', selected: selectedTab, options: EVENT_TABS }),
      el('div', { className: 'tab-panel', attrs: { 'data-testid': `events-panel-${selectedTab}` }, children: [content] })
    ]
  });
}

function renderCurrentEvent() {
  const event = EVENTS_DEMO[0];
  return el('div', {
    className: 'current-event-panel',
    children: [
      compactCard({
        title: event.name,
        meta: event.description,
        icon: event.icon,
        className: 'featured-event',
        children: [
          el('div', {
            className: 'event-clock',
            children: [el('span', { text: 'Tiempo restante' }), countdownText(6136, { className: 'event-clock__value' })]
          }),
          progressBar({ label: 'Mejor racha de hoy', value: 2, max: 10, display: '2 victorias' }),
          el('p', { className: 'reward-line', text: 'Premios: 🪙 Oro · 💎 Gemas · 🧱 Materiales' }),
          button({ label: 'ENTRAR AL EVENTO', className: 'btn btn--primary', action: 'open-event', attrs: { 'data-event-id': event.id, 'data-testid': 'btn-enter-event' } })
        ]
      }),
      compactCard({
        title: `Próximo: ${EVENTS_DEMO[1].name}`,
        meta: EVENTS_DEMO[1].description,
        icon: EVENTS_DEMO[1].icon,
        className: 'next-event-card',
        children: [el('p', { className: 'help-line', text: 'Comienza en 03:00:00' })]
      }),
      button({ label: 'Abrir buzón de premios', className: 'btn btn--ghost', action: 'navigate', attrs: { 'data-route': 'inbox' } })
    ]
  });
}

function renderDailyEvents(page) {
  const pageSize = 3;
  const totalPages = Math.ceil(EVENTS_DEMO.length / pageSize);
  const safePage = Math.min(totalPages - 1, Math.max(0, Number(page) || 0));
  const visible = EVENTS_DEMO.slice(safePage * pageSize, safePage * pageSize + pageSize);
  return el('div', {
    className: 'daily-events-panel',
    children: [
      el('div', {
        className: 'event-list',
        children: visible.map((event) =>
          button({
            label: event.name,
            className: 'list-card',
            action: 'show-event-detail',
            attrs: { 'data-event-id': event.id, 'aria-label': `${event.name}, ${event.status}, ${event.time}` },
            children: [
              el('span', { className: 'list-card__icon', text: event.icon, attrs: { 'aria-hidden': 'true' } }),
              el('span', { className: 'list-card__copy', children: [el('strong', { text: event.name }), el('small', { text: event.description })] }),
              el('span', { className: 'list-card__meta', children: [el('strong', { text: event.status }), el('small', { text: event.time })] })
            ]
          })
        )
      }),
      paginator({ group: 'eventsDayPage', page: safePage, totalPages, label: 'Eventos' })
    ]
  });
}

function renderEventHistory() {
  return el('div', {
    className: 'event-history-panel',
    children: [
      statusPanel({ kind: 'empty', icon: '📜', title: 'Aún no hay resultados', text: 'Tus mejores marcas aparecerán aquí cuando completes un evento.' }),
      compactCard({ title: 'Récord destacado', meta: 'Torneo Relámpago · Sin marca', icon: '🏅', className: 'record-card' }),
      button({ label: 'Ver premios pendientes', className: 'btn btn--ghost', action: 'navigate', attrs: { 'data-route': 'inbox' } })
    ]
  });
}

export function renderPvpScreen({ tab = 'rooms', roomPage = 0 }) {
  const selectedTab = PVP_TABS.some((entry) => entry.id === tab) ? tab : 'rooms';
  let content;
  if (selectedTab === 'bracket') content = renderBracket();
  else if (selectedTab === 'champions') content = renderChampions();
  else content = renderRooms(roomPage);

  return renderScreenFrame({
    route: 'pvp',
    title: 'Lucha PVP',
    eyebrow: 'Torneos locales de 32 · Sin conexión',
    children: [
      segmentedControl({ label: 'Secciones de PVP', group: 'pvpTab', selected: selectedTab, options: PVP_TABS }),
      el('div', { className: 'tab-panel', attrs: { 'data-testid': `pvp-panel-${selectedTab}` }, children: [content] })
    ]
  });
}

function renderRooms(page) {
  const safePage = Math.min(PVP_ROOMS_DEMO.length - 1, Math.max(0, Number(page) || 0));
  const room = PVP_ROOMS_DEMO[safePage];
  return el('div', {
    className: 'room-panel',
    children: [
      compactCard({
        title: room.name,
        meta: `Rivales entre ${room.range} de tu poder`,
        icon: room.icon,
        className: `room-card room-card--${room.id}`,
        children: [
          el('dl', {
            className: 'room-values',
            children: [valuePair('Entrada', room.price), valuePair('Bolsa neta', room.netPool), valuePair('Campeón', '50% de la bolsa')]
          }),
          el('p', { className: 'help-line', text: 'Reparto Top 7: 50% · 25% · 10% · 6% · 4% · 3% · 2%' }),
          button({
            label: room.available ? `Entrar por ${room.price}` : 'Fondos insuficientes',
            className: 'btn btn--primary',
            action: 'enter-pvp-room',
            disabled: !room.available,
            attrs: { 'data-room-id': room.id, 'data-testid': `enter-room-${room.id}` }
          })
        ]
      }),
      compactCard({ title: 'Siguiente rival', meta: 'Se genera al confirmar la entrada', icon: '❔', className: 'next-rival-card' }),
      paginator({ group: 'pvpRoomPage', page: safePage, totalPages: PVP_ROOMS_DEMO.length, label: 'Sala' })
    ]
  });
}

function renderBracket() {
  const rounds = [
    ['Ronda de 32', 'Pendiente'],
    ['Octavos', 'Bloqueado'],
    ['Cuartos', 'Bloqueado'],
    ['Semifinal', 'Bloqueado'],
    ['Final', 'Bloqueado']
  ];
  return el('div', {
    className: 'bracket-panel',
    children: [
      el('ol', {
        className: 'bracket-list',
        children: rounds.map(([name, state], index) =>
          el('li', {
            className: index === 0 ? 'bracket-round bracket-round--current' : 'bracket-round',
            children: [el('span', { text: String(index + 1) }), el('strong', { text: name }), el('small', { text: state })]
          })
        )
      }),
      statusPanel({ kind: 'info', icon: '🎲', title: 'Bracket determinista', text: 'La llave se crea y se guarda al entrar a una sala.' })
    ]
  });
}

function renderChampions() {
  return el('div', {
    className: 'champions-panel',
    children: [
      statusPanel({ kind: 'empty', icon: '👑', title: 'Sin campeones recientes', text: 'Completa un torneo para estrenar este salón de la fama.' }),
      compactCard({ title: 'Tu mejor resultado', meta: 'Todavía no has participado', icon: '🏆' })
    ]
  });
}

export function renderShopScreen({ category = 'equipment', page = 0 }) {
  const selectedCategory = SHOP_TABS.some((entry) => entry.id === category) ? category : 'equipment';
  const products = SHOP_ITEMS_DEMO.filter((item) => item.category === selectedCategory);
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const safePage = Math.min(totalPages - 1, Math.max(0, Number(page) || 0));
  const visible = products.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const dailyOffers = SHOP_ITEMS_DEMO.slice(0, 3);

  return renderScreenFrame({
    route: 'shop',
    title: 'Tienda',
    eyebrow: 'Ofertas cambian en 06:18:42',
    children: [
      el('section', {
        className: 'daily-offers',
        attrs: { 'aria-label': 'Tres ofertas diarias' },
        children: [
          el('div', {
            className: 'daily-offers__header',
            children: [el('strong', { text: 'Ofertas diarias 3/3' }), countdownText(22722, { className: 'daily-offers__time' })]
          }),
          el('div', {
            className: 'daily-offers__list',
            children: dailyOffers.map((item, index) =>
              button({
                label: `Oferta ${index + 1}: ${item.name}`,
                className: 'offer-chip',
                action: 'show-shop-item',
                attrs: { 'data-item-id': item.id },
                children: [el('span', { text: item.icon, attrs: { 'aria-hidden': 'true' } }), el('small', { text: `-${15 + index * 5}%` })]
              })
            )
          })
        ]
      }),
      segmentedControl({ label: 'Categorías de tienda', group: 'shopCategory', selected: selectedCategory, options: SHOP_TABS }),
      el('div', {
        className: 'shop-panel',
        children: [
          visible.length
            ? el('div', {
                className: 'shop-grid',
                children: visible.map((item) =>
                  el('article', {
                    className: 'shop-card',
                    children: [
                      button({
                        label: `Ver ${item.name}`,
                        className: 'shop-card__detail',
                        action: 'show-shop-item',
                        attrs: { 'data-item-id': item.id },
                        children: [
                          el('span', { className: 'shop-card__icon', text: item.icon, attrs: { 'aria-hidden': 'true' } }),
                          el('strong', { text: item.name }),
                          el('small', { text: item.rarity }),
                          el('span', { text: item.stats })
                        ]
                      }),
                      button({
                        label: `${item.currency === 'gems' ? '💎' : '🪙'} ${item.price}`,
                        className: 'mini-button shop-card__buy',
                        action: 'buy-demo-item',
                        attrs: { 'data-item-id': item.id, 'aria-label': `Comprar ${item.name} por ${item.price} ${item.currency === 'gems' ? 'Gemas' : 'Oro'}` }
                      })
                    ]
                  })
                )
              })
            : statusPanel({ kind: 'empty', icon: '🛒', title: 'Sin productos', text: 'Esta categoría se renovará con la próxima oferta.' }),
          paginator({ group: 'shopPage', page: safePage, totalPages, label: 'Tienda' })
        ]
      })
    ]
  });
}

function valuePair(label, value) {
  return el('div', { children: [el('dt', { text: label }), el('dd', { text: value })] });
}
