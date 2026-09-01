import { afterEach, describe, expect, it, vi } from 'vitest';
import { activateView } from '../../js/ui/view-lifecycle.js';

describe('ciclo de vida de la vista', () => {
  afterEach(() => vi.useRealTimers());

  it('actualiza cuentas regresivas y detiene el intervalo al limpiar', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);
    const root = document.createElement('div');
    const clock = document.createElement('time');
    clock.dataset.countdown = '2';
    root.appendChild(clock);
    document.body.appendChild(root);

    const dispose = activateView(root, { win: window });
    expect(clock.textContent).toBe('00:00:02');

    vi.advanceTimersByTime(1_000);
    expect(clock.textContent).toBe('00:00:01');

    dispose();
    vi.advanceTimersByTime(2_000);
    expect(clock.textContent).toBe('00:00:01');
    root.remove();
  });
});
