/** Elección de clase y tutorial inicial del Paso 4. */

import { CLASSES } from '../../config/classes.js';
import { el, button } from '../render.js';
import { renderScreenFrame, progressBar } from '../components/ui-kit.js';

const CLASS_ICONS = Object.freeze({ heavy: '🗿', technical: '🎯', agile: '⚡', balanced: '⚖️' });
const CLASS_TRAITS = Object.freeze({
  heavy: 'Más Vida y Defensa · Menos Velocidad',
  technical: 'Más Precisión y Crítico · Menos Vida',
  agile: 'Más Velocidad y Esquiva · Menos Defensa',
  balanced: 'Bonificación equilibrada a los cuatro atributos'
});

const TUTORIAL_PAGES = Object.freeze([
  {
    icon: '🏟️',
    title: 'Este es tu panel',
    text: 'Aquí verás tu progreso, el evento activo y al próximo rival. El botón ¡LUCHAR! inicia un combate de campaña.',
    tip: 'Toca el nivel de la cabecera para regresar al panel desde cualquier sección.'
  },
  {
    icon: '🥊',
    title: 'Hazte más fuerte',
    text: 'Mejora estadísticas, equipa siete piezas y desbloquea habilidades pasivas para aumentar tu poder.',
    tip: 'Las flechas y el texto muestran siempre si un cambio mejora o reduce tu poder.'
  },
  {
    icon: '📅',
    title: 'Compite cada día',
    text: 'Participa en siete eventos rotativos o entra a torneos PVP locales contra rivales fantasma.',
    tip: 'No necesitas conexión y no existe energía: puedes luchar cuanto quieras.'
  },
  {
    icon: '🏆',
    title: 'Tu carrera comienza',
    text: 'Gana combates, consigue Oro y Materiales, completa misiones y alcanza el nivel 200.',
    tip: 'Todo se guarda automáticamente en este dispositivo.'
  }
]);

export function renderClassSelectionScreen({ selectedClassId = null } = {}) {
  const classes = Object.values(CLASSES).filter((fighterClass) => fighterClass.isPlayable);
  return renderScreenFrame({
    route: 'class-select',
    title: 'Elige tu clase',
    eyebrow: 'Nueva carrera',
    className: 'onboarding onboarding--class',
    children: [
      el('p', { className: 'onboarding__lead', text: 'Esta elección será permanente para la partida.' }),
      el('div', {
        className: 'class-grid',
        attrs: { role: 'radiogroup', 'aria-label': 'Clases jugables' },
        children: classes.map((fighterClass) =>
          button({
            label: fighterClass.name,
            className: 'class-option',
            action: 'select-class',
            attrs: {
              role: 'radio',
              'aria-checked': fighterClass.id === selectedClassId ? 'true' : 'false',
              'data-class-id': fighterClass.id,
              'data-testid': `class-${fighterClass.id}`
            },
            children: [
              el('span', { className: 'class-option__icon', text: CLASS_ICONS[fighterClass.id], attrs: { 'aria-hidden': 'true' } }),
              el('strong', { className: 'class-option__name', text: fighterClass.name }),
              el('span', { className: 'class-option__description', text: fighterClass.description }),
              el('span', { className: 'class-option__trait', text: CLASS_TRAITS[fighterClass.id] })
            ]
          })
        )
      }),
      button({
        label: selectedClassId ? `Confirmar ${className(selectedClassId)}` : 'Selecciona una clase',
        className: 'btn btn--primary onboarding__continue',
        action: 'confirm-class',
        disabled: !selectedClassId,
        attrs: { 'data-testid': 'btn-confirm-class' }
      })
    ]
  });
}

export function renderTutorialScreen({ page = 0, classId = 'balanced' } = {}) {
  const safePage = Math.min(TUTORIAL_PAGES.length - 1, Math.max(0, page));
  const content = TUTORIAL_PAGES[safePage];
  const isLast = safePage === TUTORIAL_PAGES.length - 1;

  return renderScreenFrame({
    route: 'tutorial',
    title: 'Entrenamiento',
    eyebrow: `${className(classId)} · Paso ${safePage + 1} de ${TUTORIAL_PAGES.length}`,
    className: 'onboarding onboarding--tutorial',
    children: [
      progressBar({ label: 'Progreso del tutorial', value: safePage + 1, max: TUTORIAL_PAGES.length, display: `${safePage + 1}/${TUTORIAL_PAGES.length}` }),
      el('article', {
        className: 'tutorial-card',
        children: [
          el('span', { className: 'tutorial-card__icon', text: content.icon, attrs: { 'aria-hidden': 'true' } }),
          el('h2', { text: content.title }),
          el('p', { className: 'tutorial-card__text', text: content.text }),
          el('p', { className: 'tutorial-card__tip', text: `Consejo: ${content.tip}` })
        ]
      }),
      el('div', {
        className: 'tutorial-actions',
        children: [
          button({
            label: 'Anterior',
            className: 'btn btn--ghost',
            action: 'tutorial-previous',
            disabled: safePage === 0,
            attrs: { 'data-testid': 'tutorial-previous' }
          }),
          button({
            label: isLast ? 'Entrar al panel' : 'Siguiente',
            className: 'btn btn--primary',
            action: isLast ? 'finish-tutorial' : 'tutorial-next',
            attrs: { 'data-testid': isLast ? 'tutorial-finish' : 'tutorial-next' }
          })
        ]
      }),
      !isLast
        ? button({ label: 'Saltar tutorial', className: 'btn-link', action: 'skip-tutorial', attrs: { 'data-testid': 'tutorial-skip' } })
        : null
    ]
  });
}

export function className(classId) {
  return Object.values(CLASSES).find((fighterClass) => fighterClass.id === classId)?.name || 'Sin clase';
}

export { TUTORIAL_PAGES };
