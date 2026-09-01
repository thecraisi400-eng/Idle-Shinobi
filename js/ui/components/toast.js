/**
 * Ring de Campeones — Mensajes breves (toasts) (Paso 2)
 */

import { el } from '../render.js';

const DEFAULT_DURATION_MS = 2200;
const MAX_VISIBLE = 3;

/**
 * Muestra un aviso breve en #toast-root.
 * @param {string} message
 * @param {Object} [options]
 * @param {'info'|'success'|'error'} [options.variant='info']
 * @param {number} [options.duration=2200]
 * @param {HTMLElement} [options.root]
 * @returns {() => void} Función para retirarlo antes de tiempo.
 */
export function showToast(message, { variant = 'info', duration = DEFAULT_DURATION_MS, root } = {}) {
  const toastRoot = root || document.querySelector('#toast-root');
  if (!toastRoot) return () => {};

  const toast = el('p', {
    className: `toast toast--${variant}`,
    text: message,
    attrs: { role: 'status', 'data-testid': 'toast' }
  });

  toastRoot.appendChild(toast);

  while (toastRoot.childElementCount > MAX_VISIBLE) {
    toastRoot.removeChild(toastRoot.firstElementChild);
  }

  const remove = () => {
    if (toast.parentNode === toastRoot) toastRoot.removeChild(toast);
  };

  const timer = setTimeout(remove, duration);

  return () => {
    clearTimeout(timer);
    remove();
  };
}

/** Retira todos los avisos visibles. */
export function clearToasts(root) {
  const toastRoot = root || document.querySelector('#toast-root');
  if (!toastRoot) return;
  while (toastRoot.firstChild) toastRoot.removeChild(toastRoot.firstChild);
}
