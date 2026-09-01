/** Flujo visual de precombate, combate, evento inmersivo y resultado. */

import { calculateCombatPower } from '../../core/formulas.js';
import { formatNumber } from '../../core/formatters.js';
import { el, button } from '../render.js';
import { compactCard, countdownText, progressBar, renderScreenFrame } from '../components/ui-kit.js';
import { EVENTS_DEMO, RIVAL_DEMO } from '../mock-data.js';
import { className } from './onboarding.js';

export function renderPrecombatScreen({ state }) {
  const power = calculateCombatPower(state.baseStats);
  return renderScreenFrame({
    route: 'precombat',
    title: 'Próximo combate',
    eyebrow: `Capítulo ${state.progression.chapter} · Pelea ${state.progression.fight}`,
    className: 'immersive-screen precombat-screen',
    children: [
      el('div', {
        className: 'versus-stage',
        children: [
          fighterPreview('🥊', state.profile.heroName, className(state.profile.classId), power, 'player'),
          el('div', { className: 'versus-stage__mark', text: 'VS' }),
          fighterPreview('🐂', RIVAL_DEMO.name, RIVAL_DEMO.className, RIVAL_DEMO.power, 'rival')
        ]
      }),
      compactCard({
        title: 'Pronóstico favorable',
        meta: `Tu poder es ${RIVAL_DEMO.comparison} superior`,
        icon: '▲',
        className: 'forecast-card forecast-card--good',
        children: [
          el('p', { className: 'reward-line', text: `Victoria: 🪙 ${RIVAL_DEMO.rewards.gold} · ⭐ ${RIVAL_DEMO.rewards.exp} EXP · 🧱 ${RIVAL_DEMO.rewards.materials}` }),
          el('p', { className: 'help-line', text: 'La demostración visual no modificará tu progreso.' })
        ]
      }),
      el('div', {
        className: 'precombat-actions',
        children: [
          button({ label: 'Volver', className: 'btn btn--ghost', action: 'go-dashboard' }),
          button({ label: 'COMENZAR', className: 'btn btn--primary', action: 'start-demo-combat', attrs: { 'data-testid': 'btn-start-combat' } })
        ]
      })
    ]
  });
}

export function renderCombatScreen({ state }) {
  return renderScreenFrame({
    route: 'combat',
    title: 'Combate',
    eyebrow: 'Demostración visual · Motor disponible en Paso 6',
    className: 'immersive-screen combat-screen',
    children: [
      el('div', {
        className: 'combat-hud',
        children: [
          combatantHealth(state.profile.heroName, 88, '88/120'),
          el('div', { className: 'combat-round', children: [el('span', { text: 'RONDA 1' }), countdownText(178, { className: 'combat-round__time' })] }),
          combatantHealth(RIVAL_DEMO.name, 64, '76/118')
        ]
      }),
      el('div', {
        className: 'ring-stage',
        attrs: { 'aria-label': `${state.profile.heroName} combate contra ${RIVAL_DEMO.name}` },
        children: [
          el('div', { className: 'ring-stage__fighter ring-stage__fighter--player', children: [el('span', { text: '🥊' }), el('strong', { text: state.profile.heroName })] }),
          el('div', { className: 'ring-stage__impact', text: '¡PUM!', attrs: { 'aria-hidden': 'true' } }),
          el('div', { className: 'ring-stage__fighter ring-stage__fighter--rival', children: [el('span', { text: '🐂' }), el('strong', { text: RIVAL_DEMO.name })] })
        ]
      }),
      el('ol', {
        className: 'combat-log',
        attrs: { 'aria-label': 'Registro del combate', 'aria-live': 'polite' },
        children: [
          el('li', { text: `${state.profile.heroName} conecta Lazo Clásico: 22 de daño.` }),
          el('li', { text: `${RIVAL_DEMO.name} responde con Bota a la Quijada: 14 de daño.` }),
          el('li', { className: 'combat-log__critical', text: '¡Golpe crítico! 31 de daño.' })
        ]
      }),
      el('div', {
        className: 'combat-actions',
        children: [
          button({ label: 'Salir', className: 'btn btn--ghost', action: 'leave-active-mode' }),
          button({ label: 'Ver resultado demo', className: 'btn btn--primary', action: 'resolve-demo-combat', attrs: { 'data-testid': 'btn-resolve-combat' } })
        ]
      })
    ]
  });
}

export function renderEventPlayScreen({ state, eventId = 'lightning' }) {
  const event = EVENTS_DEMO.find((entry) => entry.id === eventId) || EVENTS_DEMO[0];
  return renderScreenFrame({
    route: 'event-play',
    title: event.name,
    eyebrow: 'Evento inmersivo · Intento de demostración',
    className: 'immersive-screen event-play-screen',
    children: [
      el('div', {
        className: 'event-stage',
        children: [
          el('span', { className: 'event-stage__icon', text: event.icon, attrs: { 'aria-hidden': 'true' } }),
          el('h2', { text: 'Racha actual: 2' }),
          countdownText(87, { className: 'event-stage__timer' }),
          progressBar({ label: 'Rival 3 de 10', value: 3, max: 10, display: '3/10' }),
          el('div', { className: 'event-stage__fighters', children: [el('span', { text: '🥊' }), el('span', { text: '⚡' }), el('span', { text: '🦹' })] })
        ]
      }),
      compactCard({ title: state.profile.heroName, meta: 'Vida conservada entre rondas', icon: '❤️', children: [progressBar({ label: 'Vida', value: 93, max: 120, display: '93/120' })] }),
      el('div', {
        className: 'combat-actions',
        children: [
          button({ label: 'Abandonar', className: 'btn btn--ghost', action: 'leave-active-mode' }),
          button({ label: 'Completar demo', className: 'btn btn--primary', action: 'complete-demo-event' })
        ]
      })
    ]
  });
}

export function renderResultScreen({ state, kind = 'combat' }) {
  const eventResult = kind === 'event';
  return renderScreenFrame({
    route: 'result',
    title: eventResult ? 'Evento completado' : '¡Victoria!',
    eyebrow: 'Resultado de demostración',
    className: 'immersive-screen result-screen',
    children: [
      el('div', {
        className: 'result-trophy',
        children: [
          el('span', { text: eventResult ? '⚡' : '🏆', attrs: { 'aria-hidden': 'true' } }),
          el('h2', { text: eventResult ? 'Mejor racha: 4' : `${state.profile.heroName} gana por KO` }),
          el('p', { text: eventResult ? 'Puesto simulado: 12 de 100' : 'Toro Mendoza cayó en la primera ronda.' })
        ]
      }),
      el('section', {
        className: 'result-rewards',
        children: [
          reward('🪙', eventResult ? '250' : String(RIVAL_DEMO.rewards.gold), 'Oro'),
          reward('⭐', eventResult ? '80' : String(RIVAL_DEMO.rewards.exp), 'EXP'),
          reward('🧱', eventResult ? '5' : String(RIVAL_DEMO.rewards.materials), 'Materiales')
        ]
      }),
      progressBar({ label: 'Experiencia demostrativa', value: 35, max: 100, display: '+35 EXP (sin aplicar)' }),
      el('p', { className: 'demo-notice', text: 'Este resultado valida la interfaz. Las recompensas reales se conectarán con los sistemas de juego.' }),
      button({ label: 'VOLVER AL PANEL', className: 'btn btn--primary', action: 'go-dashboard', attrs: { 'data-testid': 'btn-result-dashboard' } })
    ]
  });
}

function fighterPreview(icon, name, fighterClass, power, variant) {
  return el('article', {
    className: `fighter-preview fighter-preview--${variant}`,
    children: [
      el('span', { className: 'fighter-preview__portrait', text: icon, attrs: { 'aria-hidden': 'true' } }),
      el('h2', { text: name }),
      el('p', { text: fighterClass }),
      el('strong', { text: `Poder ${formatNumber(power)}` })
    ]
  });
}

function combatantHealth(name, value, display) {
  return el('section', {
    className: 'combatant-health',
    children: [el('strong', { text: name }), progressBar({ label: `Vida de ${name}`, value, max: 120, display })]
  });
}

function reward(icon, value, label) {
  return el('div', { children: [el('span', { text: icon, attrs: { 'aria-hidden': 'true' } }), el('strong', { text: value }), el('small', { text: label })] });
}
