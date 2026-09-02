/* ===== ESCENA DEL RING (11.02) =====
   "Ring + público": lona blanca, cuerdas rojas, focos cálidos (01.09).
   Todo en SVG inline: cero peticiones de red, funciona en la vista previa
   sandbox y en la PWA offline. */

/** Siluetas del público (11.06) — generadas por reglas, no dibujadas a mano. */
function publico(filas = 3, porFila = 22) {
  let out = '';
  for (let f = 0; f < filas; f++) {
    const y = 46 - f * 13;
    const op = 0.30 - f * 0.07;
    const r = 5.5 - f * 0.5;
    for (let i = 0; i < porFila; i++) {
      const x = (i * (400 / porFila)) + (f % 2 ? 5 : 0) + (i % 3) * 1.5;
      const delay = ((i * 7 + f * 13) % 20) / 10;
      out += `<g class="pub" style="animation-delay:${delay}s" opacity="${op}">
        <circle cx="${x}" cy="${y}" r="${r}" fill="#0a0a0f"/>
        <rect x="${x - r * 1.25}" y="${y + r * 0.7}" width="${r * 2.5}" height="${r * 2.2}" rx="${r * 0.7}" fill="#0a0a0f"/>
      </g>`;
    }
  }
  return out;
}

/** Devuelve el SVG completo de la escena. */
export function svgRing() {
  return `
<svg class="ring-svg" viewBox="0 0 400 210" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs>
    <linearGradient id="gFondo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"  stop-color="#141420"/>
      <stop offset="100%" stop-color="#08080d"/>
    </linearGradient>
    <radialGradient id="gFoco" cx="50%" cy="0%" r="80%">
      <stop offset="0%"   stop-color="#ffd89b" stop-opacity=".28"/>
      <stop offset="55%"  stop-color="#ffd89b" stop-opacity=".06"/>
      <stop offset="100%" stop-color="#ffd89b" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="gLona" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="#efe8da"/>
      <stop offset="55%"  stop-color="#ded5c3"/>
      <stop offset="100%" stop-color="#bdb3a0"/>
    </linearGradient>
    <linearGradient id="gFalda" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#8e1a1f"/>
      <stop offset="100%" stop-color="#5d1013"/>
    </linearGradient>
  </defs>

  <!-- Fondo y público -->
  <rect width="400" height="210" fill="#0e0e18"/>
  <rect width="400" height="210" fill="url(#gFondo)"/>
  <g class="crowd">${publico()}</g>

  <!-- Focos cálidos -->
  <ellipse cx="200" cy="0" rx="230" ry="150" fill="url(#gFoco)"/>
  <g class="focos" opacity=".5">
    <path d="M120 0 L150 118 L90 118 Z" fill="#ffd89b" opacity=".07"/>
    <path d="M280 0 L310 118 L250 118 Z" fill="#ffd89b" opacity=".07"/>
  </g>

  <!-- Postes traseros -->
  <rect x="44"  y="58" width="7" height="72" rx="3" fill="#3a2f22"/>
  <rect x="349" y="58" width="7" height="72" rx="3" fill="#3a2f22"/>

  <!-- Cuerdas traseras (11.02 cuerdas rojas) -->
  <g class="cuerdas-tras" stroke="#c0202a" stroke-width="2.6" stroke-linecap="round" opacity=".95">
    <line x1="47" y1="72"  x2="352" y2="72"/>
    <line x1="47" y1="88"  x2="352" y2="88"/>
    <line x1="47" y1="104" x2="352" y2="104"/>
  </g>

  <!-- Lona -->
  <path d="M28 126 L372 126 L400 178 L0 178 Z" fill="#ded5c3"/>
  <path d="M28 126 L372 126 L400 178 L0 178 Z" fill="url(#gLona)"/>
  <path d="M28 126 L372 126 L400 178 L0 178 Z" fill="none" stroke="#a89a84" stroke-width="1"/>
  <ellipse cx="200" cy="152" rx="86" ry="18" fill="#c9202a" opacity=".10"/>
  <text x="200" y="157" text-anchor="middle" font-size="13" font-weight="900"
        fill="#b8302f" opacity=".22" letter-spacing="3">ORO Y GLORIA</text>

  <!-- Faldón -->
  <path d="M0 178 L400 178 L400 210 L0 210 Z" fill="#7a1418"/>
  <path d="M0 178 L400 178 L400 210 L0 210 Z" fill="url(#gFalda)"/>
  <g stroke="#4a0c0f" stroke-width="1" opacity=".5">
    <line x1="60"  y1="178" x2="60"  y2="210"/>
    <line x1="140" y1="178" x2="140" y2="210"/>
    <line x1="200" y1="178" x2="200" y2="210"/>
    <line x1="260" y1="178" x2="260" y2="210"/>
    <line x1="340" y1="178" x2="340" y2="210"/>
  </g>

  <!-- Postes delanteros -->
  <rect x="8"   y="140" width="10" height="62" rx="4" fill="#4a3c28"/>
  <rect x="382" y="140" width="10" height="62" rx="4" fill="#4a3c28"/>
  <circle cx="13"  cy="140" r="6" fill="#c0202a"/>
  <circle cx="387" cy="140" r="6" fill="#c0202a"/>
</svg>`;
}

/** Cuerdas delanteras: van ENCIMA de los luchadores para dar profundidad. */
export function svgCuerdasFrente() {
  return `
<svg class="ring-cuerdas-frente" viewBox="0 0 400 210" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <g stroke="#d8262f" stroke-width="3.4" stroke-linecap="round" opacity=".92">
    <line x1="12" y1="168" x2="388" y2="168"/>
    <line x1="12" y1="186" x2="388" y2="186"/>
    <line x1="12" y1="203" x2="388" y2="203"/>
  </g>
  <g stroke="#7a1418" stroke-width="1" opacity=".6">
    <line x1="12" y1="170.5" x2="388" y2="170.5"/>
    <line x1="12" y1="188.5" x2="388" y2="188.5"/>
    <line x1="12" y1="205.5" x2="388" y2="205.5"/>
  </g>
</svg>`;
}
