/**
 * Ring de Campeones — Utilidades de renderizado seguro (Paso 2)
 *
 * Regla del proyecto: el texto variable se asigna con `textContent`.
 * Nunca se construye HTML a partir de datos del guardado.
 */

/**
 * Crea un elemento con atributos y contenido seguro.
 * @param {string} tag
 * @param {Object} [options]
 * @param {string} [options.className]
 * @param {string} [options.text] Texto asignado con textContent.
 * @param {Object<string,string>} [options.attrs]
 * @param {Object<string,string>} [options.dataset]
 * @param {(Node|null|false|undefined)[]} [options.children]
 * @returns {HTMLElement}
 */
export function el(tag, options = {}) {
  const node = document.createElement(tag);
  const { className, text, attrs, dataset, children } = options;

  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = String(text);

  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (value === undefined || value === null || value === false) continue;
      node.setAttribute(key, String(value));
    }
  }

  if (dataset) {
    for (const [key, value] of Object.entries(dataset)) {
      if (value === undefined || value === null) continue;
      node.dataset[key] = String(value);
    }
  }

  if (children) {
    for (const child of children) {
      if (child) node.appendChild(child);
    }
  }

  return node;
}

/** Crea un botón táctil accesible (mínimo 48×48 por CSS). */
export function button({ label, className = 'btn', action, attrs = {}, disabled = false, children }) {
  return el('button', {
    className,
    text: children ? undefined : label,
    attrs: { type: 'button', ...(disabled ? { disabled: 'disabled' } : {}), ...attrs },
    dataset: action ? { action } : undefined,
    children
  });
}

/** Vacía un contenedor sin usar innerHTML. */
export function clear(node) {
  if (!node) return node;
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

/** Reemplaza el contenido de un contenedor por un nodo nuevo. */
export function mount(container, node) {
  clear(container);
  if (node) container.appendChild(node);
  return container;
}

/** Devuelve una tarjeta simple con título y texto. */
export function card(title, text) {
  return el('section', {
    className: 'card',
    children: [
      el('h3', { className: 'card__title', text: title }),
      text ? el('p', { className: 'card__text', text }) : null
    ]
  });
}

/** Bloque provisional para pantallas que se completan en pasos posteriores. */
export function placeholder(icon, text) {
  return el('div', {
    className: 'placeholder',
    children: [
      el('span', { className: 'placeholder__icon', text: icon, attrs: { 'aria-hidden': 'true' } }),
      el('p', { className: 'placeholder__text', text })
    ]
  });
}
