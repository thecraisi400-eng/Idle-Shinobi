/* ===== PANTALLA DE CARGA CON ARTE (28.14) =====
   No es un truco de relleno: mientras se ve, el juego carga el estado, las
   misiones y los logros. Se va sola en cuanto todo está listo, con un
   mínimo visible para que no dé un parpadeo feo.

   Todo el arte es SVG inline: cero peticiones de red, funciona offline
   desde el primer arranque y escala a cualquier pantalla. */

const MINIMO_MS = 900;     // tiempo mínimo en pantalla, para que no parpadee

let nodo = null;
let nacida = 0;

const ARTE = `
<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" class="sp-arte" aria-hidden="true">
  <defs>
    <linearGradient id="spFoco" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"  stop-color="#e8b64c" stop-opacity=".22"/>
      <stop offset="100%" stop-color="#e8b64c" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="spLona" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"  stop-color="#2b2f3d"/>
      <stop offset="100%" stop-color="#171a24"/>
    </linearGradient>
  </defs>

  <!-- haz de luz cenital -->
  <polygon points="200,0 330,235 70,235" fill="url(#spFoco)"/>

  <!-- público en sombra -->
  <g fill="#14161e">
    <circle cx="30" cy="150" r="13"/><circle cx="62" cy="146" r="12"/>
    <circle cx="94" cy="151" r="13"/><circle cx="126" cy="147" r="11"/>
    <circle cx="274" cy="148" r="12"/><circle cx="306" cy="151" r="13"/>
    <circle cx="338" cy="146" r="12"/><circle cx="370" cy="150" r="13"/>
    <rect x="0" y="158" width="400" height="22" />
  </g>

  <!-- lona del ring -->
  <polygon points="55,178 345,178 385,238 15,238" fill="url(#spLona)"/>
  <polygon points="55,178 345,178 345,183 55,183" fill="#3a4055"/>

  <!-- postes -->
  <rect x="52" y="118" width="7" height="62" rx="3" fill="#c8912e"/>
  <rect x="341" y="118" width="7" height="62" rx="3" fill="#c8912e"/>
  <circle cx="55.5" cy="116" r="6" fill="#e8b64c"/>
  <circle cx="344.5" cy="116" r="6" fill="#e8b64c"/>

  <!-- cuerdas -->
  <g stroke-linecap="round">
    <line x1="55" y1="132" x2="345" y2="132" stroke="#d8443c" stroke-width="4"/>
    <line x1="55" y1="150" x2="345" y2="150" stroke="#e8e3d8" stroke-width="4"/>
    <line x1="55" y1="168" x2="345" y2="168" stroke="#4d7fd8" stroke-width="4"/>
  </g>

  <!-- luchador en silueta, brazos en alto -->
  <g fill="#0e1017">
    <circle cx="200" cy="112" r="15"/>
    <rect x="190" y="126" width="20" height="34" rx="8"/>
    <rect x="171" y="96"  width="10" height="36" rx="5" transform="rotate(24 176 114)"/>
    <rect x="219" y="96"  width="10" height="36" rx="5" transform="rotate(-24 224 114)"/>
    <rect x="191" y="158" width="8" height="24" rx="4"/>
    <rect x="201" y="158" width="8" height="24" rx="4"/>
  </g>
  <!-- cinturón al hombro -->
  <rect x="186" y="134" width="28" height="9" rx="4" fill="#e8b64c"/>
</svg>`;

/** Muestra la pantalla de carga. Devuelve el nodo creado. */
export function mostrar(doc = document) {
  if (nodo) return nodo;
  nacida = Date.now();
  nodo = doc.createElement('div');
  nodo.id = 'splash';
  nodo.innerHTML = `
    ${ARTE}
    <h1 class="sp-titulo">Oro y Gloria</h1>
    <p class="sp-sub">Lucha libre · carrera profesional</p>
    <div class="sp-barra"><i></i></div>
    <p class="sp-estado">Montando el ring…</p>`;
  doc.body.appendChild(nodo);
  return nodo;
}

/** Cambia el texto de estado mientras carga. */
export function estado(texto) {
  const p = nodo?.querySelector('.sp-estado');
  if (p) p.textContent = texto;
}

/** Oculta la pantalla respetando el tiempo mínimo visible. */
export function ocultar() {
  if (!nodo) return Promise.resolve(0);
  const espera = Math.max(0, MINIMO_MS - (Date.now() - nacida));
  return new Promise(res => {
    setTimeout(() => {
      nodo?.classList.add('fuera');
      setTimeout(() => { nodo?.remove(); nodo = null; res(espera); }, 420);
    }, espera);
  });
}

export function visible() { return !!nodo; }

/** Para pruebas: el tiempo mínimo configurado. */
export const MINIMO_VISIBLE_MS = MINIMO_MS;
