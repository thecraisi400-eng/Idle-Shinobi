/**
 * Activa comportamientos efímeros de una vista y devuelve siempre su limpieza.
 * Evita que cada render acumule intervalos o listeners propios.
 */

import { formatCountdown } from './components/ui-kit.js';

export function activateView(root, { win = window } = {}) {
  const countdowns = Array.from(root.querySelectorAll('[data-countdown]')).map((node) => ({
    node,
    initial: Math.max(0, Number(node.dataset.countdown) || 0),
    startedAt: Date.now()
  }));

  if (countdowns.length === 0) return () => {};

  const update = () => {
    const now = Date.now();
    for (const countdown of countdowns) {
      if (!countdown.node.isConnected) continue;
      const elapsed = Math.floor((now - countdown.startedAt) / 1000);
      const remaining = Math.max(0, countdown.initial - elapsed);
      countdown.node.textContent = formatCountdown(remaining);
      countdown.node.dateTime = `PT${remaining}S`;
    }
  };

  update();
  const timer = win.setInterval(update, 1000);
  return () => win.clearInterval(timer);
}
