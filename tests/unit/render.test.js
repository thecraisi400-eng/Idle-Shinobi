import { describe, expect, it } from 'vitest';
import { button, clear, el, mount } from '../../js/ui/render.js';
import { compactCard, progressBar, statusPanel } from '../../js/ui/components/ui-kit.js';

describe('render seguro', () => {
  it('asigna texto con textContent y nunca interpreta HTML', () => {
    const node = el('p', { text: '<img src=x onerror="alert(1)">' });
    expect(node.textContent).toBe('<img src=x onerror="alert(1)">');
    expect(node.querySelector('img')).toBeNull();
  });

  it('aplica clases, atributos y datos', () => {
    const node = el('div', {
      className: 'card',
      attrs: { 'aria-label': 'Tarjeta', hidden: false },
      dataset: { testid: 'x' }
    });
    expect(node.className).toBe('card');
    expect(node.getAttribute('aria-label')).toBe('Tarjeta');
    expect(node.hasAttribute('hidden')).toBe(false);
    expect(node.dataset.testid).toBe('x');
  });

  it('crea botones de tipo button con acción delegada', () => {
    const btn = button({ label: 'Luchar', action: 'start-fight' });
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.getAttribute('type')).toBe('button');
    expect(btn.dataset.action).toBe('start-fight');
    expect(button({ label: 'x', disabled: true }).disabled).toBe(true);
  });

  it('vacía y reemplaza contenedores', () => {
    const box = el('div', { children: [el('span'), el('span')] });
    expect(box.childElementCount).toBe(2);
    clear(box);
    expect(box.childElementCount).toBe(0);

    mount(box, el('p', { text: 'nuevo' }));
    expect(box.textContent).toBe('nuevo');
  });

  it('construye tarjetas, estados y barras accesibles', () => {
    expect(compactCard({ title: 'Título', meta: 'Texto' }).querySelector('h3').textContent).toBe('Título');
    expect(statusPanel({ title: 'Vacío', text: 'Sin resultados' }).getAttribute('role')).toBe('status');

    const progress = progressBar({ label: 'Experiencia', value: 25, max: 100 });
    const bar = progress.querySelector('[role="progressbar"]');
    expect(bar.getAttribute('aria-valuenow')).toBe('25');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
  });
});
