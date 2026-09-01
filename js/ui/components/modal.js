/**
 * Ring de Campeones — Modal global con foco atrapado (Paso 2)
 * Se monta en #modal-root. Sólo un modal a la vez.
 */

import { el, button, clear } from '../render.js';

const FOCUSABLE = 'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

let activeModal = null;

/** ¿Hay un modal abierto? (lo usa el interceptor del botón Atrás). */
export function isModalOpen() {
  return activeModal !== null;
}

/**
 * Abre un modal accesible.
 * @param {Object} options
 * @param {string} options.title
 * @param {string|Node} options.body
 * @param {{label:string, variant?:string, value?:any, autofocus?:boolean}[]} [options.actions]
 * @param {boolean} [options.dismissible=true]
 * @param {HTMLElement} [options.root]
 * @returns {Promise<any>} Valor de la acción pulsada, o null si se cerró.
 */
export function openModal({ title, body, actions = [], dismissible = true, root } = {}) {
  const modalRoot = root || document.querySelector('#modal-root');
  if (!modalRoot) return Promise.resolve(null);

  closeModal(null);

  const previouslyFocused = document.activeElement;

  return new Promise((resolve) => {
    const bodyNode =
      typeof body === 'string' ? el('p', { className: 'modal__body', text: body }) : el('div', { className: 'modal__body', children: [body] });

    const dialog = el('div', {
      className: 'modal',
      attrs: {
        role: 'dialog',
        'aria-modal': 'true',
        'aria-labelledby': 'modal-title',
        'data-testid': 'modal'
      },
      children: [el('h2', { className: 'modal__title', text: title, attrs: { id: 'modal-title' } }), bodyNode]
    });

    const finish = (value) => {
      cleanup();
      resolve(value);
    };

    const actionList = actions.length ? actions : [{ label: 'Aceptar', value: true, autofocus: true }];
    const actionsRow = el('div', { className: 'modal__actions' });

    for (const action of actionList) {
      const btn = button({
        label: action.label,
        className: `btn ${action.variant ? `btn--${action.variant}` : 'btn--ghost'}`,
        attrs: { 'data-testid': `modal-action-${action.value ?? action.label}` }
      });
      btn.addEventListener('click', () => finish(action.value ?? true));
      if (action.autofocus) btn.dataset.autofocus = 'true';
      actionsRow.appendChild(btn);
    }
    dialog.appendChild(actionsRow);

    const backdrop = el('div', { className: 'modal-backdrop', children: [dialog] });

    if (dismissible) {
      backdrop.addEventListener('click', (event) => {
        if (event.target === backdrop) finish(null);
      });
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && dismissible) {
        event.preventDefault();
        finish(null);
        return;
      }
      if (event.key !== 'Tab') return;

      const focusables = Array.from(dialog.querySelectorAll(FOCUSABLE));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    function cleanup() {
      document.removeEventListener('keydown', onKeyDown, true);
      clear(modalRoot);
      activeModal = null;
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') previouslyFocused.focus();
    }

    document.addEventListener('keydown', onKeyDown, true);
    clear(modalRoot);
    modalRoot.appendChild(backdrop);

    activeModal = { close: finish };

    const autofocusTarget = dialog.querySelector('[data-autofocus="true"]') || dialog.querySelector(FOCUSABLE);
    if (autofocusTarget) autofocusTarget.focus();
  });
}

/** Cierra el modal abierto, si lo hay. Devuelve true si cerró alguno. */
export function closeModal(value = null) {
  if (!activeModal) return false;
  const { close } = activeModal;
  activeModal = null;
  close(value);
  return true;
}

/**
 * Confirmación de dos botones.
 * @returns {Promise<boolean>}
 */
export async function confirmModal({ title, body, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', variant = 'primary' }) {
  const result = await openModal({
    title,
    body,
    actions: [
      { label: cancelLabel, value: false },
      { label: confirmLabel, value: true, variant, autofocus: true }
    ]
  });
  return result === true;
}
