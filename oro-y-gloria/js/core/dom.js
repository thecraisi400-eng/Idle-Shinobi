/* ===== Helpers de DOM =====
   Utilidades mínimas para construir pantallas sin frameworks. */

export const $  = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Crea un elemento: el('div.card#id', {attrs}, ...hijos) */
export function el(tag, attrs = {}, ...children) {
  let id = null, classes = [];
  const name = tag.replace(/[.#][^.#]+/g, m => {
    if (m[0] === '.') classes.push(m.slice(1)); else id = m.slice(1);
    return '';
  }) || 'div';

  const node = document.createElement(name);
  if (id) node.id = id;
  if (classes.length) node.classList.add(...classes);

  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') node.classList.add(...String(v).split(' ').filter(Boolean));
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else node.setAttribute(k, v === true ? '' : v);
  }

  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

/** Bloque HTML rápido a partir de una cadena. */
export function frag(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content;
}

/** Toast compacto (10.10). tipo: 'info' | 'ok' | 'bad' */
export function toast(mensaje, tipo = 'info', ms = 2200) {
  const cont = $('#toasts');
  if (!cont) return;
  const ico = tipo === 'ok' ? '✅' : tipo === 'bad' ? '⚠️' : '💬';
  const t = el(`div.toast.${tipo}`, {}, el('span', { text: ico }), el('span', { text: mensaje }));
  cont.append(t);
  setTimeout(() => {
    t.classList.add('out');
    t.addEventListener('animationend', () => t.remove(), { once: true });
  }, ms);
}

/** Pantalla placeholder reutilizable para los pasos aún no construidos. */
export function placeholder({ icono, titulo, texto, paso }) {
  return el('div.empty', {},
    el('div.em-ico', { text: icono }),
    el('h2', { text: titulo }),
    el('p', { text: texto }),
    paso ? el('span.step-tag', { text: `Se construye en el Paso ${paso}` }) : null
  );
}
