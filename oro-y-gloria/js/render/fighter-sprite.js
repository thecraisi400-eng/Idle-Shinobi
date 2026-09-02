/* ===== SPRITE DE LUCHADOR (11.03) =====
   "Cuerpo + animaciones": muñeco articulado en SVG, con color y máscara
   derivados de la clase. 05.09 sprites simples · 29.15 dibujo clásico.

   Sugerencia #2 del Paso 5: el RETRATO reacciona al % de vida
   (fresco / cansado / al borde), con solo cambiar cejas y boca. */

import { CLASES } from '../data/clases.js';

/** Construye el SVG del cuerpo completo. lado: 'izq' | 'der' */
export function svgLuchador(clase, lado = 'izq', opciones = {}) {
  const cl = CLASES[clase] || CLASES.bestia;
  const c = cl.color;
  const piel = opciones.piel || '#c98a5e';
  const flip = lado === 'der' ? 'scale(-1,1) translate(-100,0)' : '';

  return `
<svg class="spr" viewBox="0 0 100 150" aria-hidden="true">
  <g transform="${flip}">
    <!-- sombra -->
    <ellipse class="spr-sombra" cx="50" cy="146" rx="26" ry="4.5" fill="#000" opacity=".35"/>

    <!-- pierna trasera -->
    <g class="spr-pierna-tras">
      <rect x="52" y="96" width="13" height="34" rx="6" fill="${piel}"/>
      <rect x="50" y="124" width="18" height="12" rx="4" fill="#2a2a33"/>
    </g>

    <!-- brazo trasero -->
    <g class="spr-brazo-tras">
      <rect x="58" y="58" width="11" height="30" rx="5.5" fill="${piel}"/>
      <circle cx="63.5" cy="90" r="7" fill="${c}"/>
    </g>

    <!-- torso -->
    <g class="spr-torso">
      <path d="M34 56 Q50 50 66 56 L69 92 Q50 98 31 92 Z" fill="${c}"/>
      <path d="M34 56 Q50 50 66 56 L67 68 Q50 73 33 68 Z" fill="#fff" opacity=".12"/>
      <!-- cinturón -->
      <rect x="31" y="88" width="38" height="8" rx="3" fill="#e8b64c"/>
      <circle cx="50" cy="92" r="3.6" fill="#8a6415"/>
    </g>

    <!-- pierna delantera -->
    <g class="spr-pierna">
      <rect x="35" y="96" width="14" height="36" rx="6.5" fill="${piel}"/>
      <rect x="31" y="126" width="20" height="13" rx="4.5" fill="#1d1d27"/>
    </g>

    <!-- brazo delantero (el que golpea) -->
    <g class="spr-brazo">
      <rect x="28" y="58" width="12" height="32" rx="6" fill="${piel}"/>
      <circle cx="34" cy="92" r="7.5" fill="${c}"/>
      <circle cx="34" cy="92" r="4" fill="#fff" opacity=".18"/>
    </g>

    <!-- cabeza + máscara -->
    <g class="spr-cabeza">
      <circle cx="50" cy="40" r="15" fill="${piel}"/>
      <path d="M35 38 Q50 20 65 38 Q65 30 50 24 Q35 30 35 38 Z" fill="${c}"/>
      <path d="M36 40 Q50 26 64 40 L64 44 Q50 36 36 44 Z" fill="${c}"/>
      <!-- ojos de la máscara -->
      <ellipse class="spr-ojo" cx="44" cy="41" rx="3.2" ry="3.6" fill="#12121a"/>
      <ellipse class="spr-ojo" cx="56" cy="41" rx="3.2" ry="3.6" fill="#12121a"/>
      <!-- boca (cambia con el estado) -->
      <path class="spr-boca" d="M45 49 Q50 51 55 49" stroke="#12121a" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <!-- adorno superior -->
      <circle cx="50" cy="26" r="3" fill="#e8b64c" opacity=".9"/>
    </g>
  </g>
</svg>`;
}

/** Retrato circular para el HUD (11.08 barras + retratos). */
export function svgRetrato(clase, estado = 'fresco') {
  const cl = CLASES[clase] || CLASES.bestia;
  const c = cl.color;
  const piel = '#c98a5e';

  /* Sugerencia #2: la expresión cambia con la vida.
     Rasgos como FORMAS RELLENAS (no trazos): así se ven en cualquier
     renderizador, incluidos los que ignoran stroke con fill="none". */
  const caras = {
    fresco: {
      ojo: '<ellipse cx="41" cy="42" rx="3.6" ry="4.2" fill="#12121a"/><ellipse cx="59" cy="42" rx="3.6" ry="4.2" fill="#12121a"/>',
      ceja: '<path d="M36 38 L47 34 L47 37 L36 41 Z" fill="#12121a"/><path d="M64 38 L53 34 L53 37 L64 41 Z" fill="#12121a"/>',
      boca: '<path d="M40 65 Q50 74 60 65 Q50 70 40 65 Z" fill="#12121a"/>',
      extra: ''
    },
    cansado: {
      ojo: '<path d="M37 42 Q41 38 45 42 Q41 44 37 42 Z" fill="#12121a"/><path d="M55 42 Q59 38 63 42 Q59 44 55 42 Z" fill="#12121a"/>',
      ceja: '<path d="M36 34 L47 39 L47 42 L36 37 Z" fill="#12121a"/><path d="M64 34 L53 39 L53 42 L64 37 Z" fill="#12121a"/>',
      boca: '<path d="M40 70 Q50 63 60 70 Q50 66 40 70 Z" fill="#12121a"/>',
      extra: '<ellipse cx="34" cy="52" rx="5" ry="3" fill="#c0202a" opacity=".18"/><ellipse cx="66" cy="52" rx="5" ry="3" fill="#c0202a" opacity=".18"/>'
    },
    alBorde: {
      ojo: '<rect x="37" y="41" width="8" height="2.6" rx="1.3" fill="#12121a"/><rect x="55" y="41" width="8" height="2.6" rx="1.3" fill="#12121a"/>',
      ceja: '<path d="M35 32 L47 40 L47 43 L35 35 Z" fill="#12121a"/><path d="M65 32 L53 40 L53 43 L65 35 Z" fill="#12121a"/>',
      boca: '<path d="M39 72 Q50 58 61 72 Q50 64 39 72 Z" fill="#12121a"/>',
      extra: '<path d="M63 58 Q67 65 64 72 Q61 65 63 58 Z" fill="#c0202a"/><ellipse cx="34" cy="52" rx="6" ry="3.4" fill="#c0202a" opacity=".3"/>'
    }
  };
  const f = caras[estado] || caras.fresco;

  return `
<svg viewBox="0 0 100 100" class="retrato-svg" aria-hidden="true">
  <circle cx="50" cy="50" r="48" fill="#12121a"/>
  <circle cx="50" cy="55" r="30" fill="${piel}"/>
  <path d="M20 50 Q50 18 80 50 Q80 34 50 24 Q20 34 20 50 Z" fill="${c}"/>
  <path d="M22 52 Q50 30 78 52 L78 58 Q50 44 22 58 Z" fill="${c}"/>
  ${f.ceja}
  ${f.ojo}
  ${f.boca}
  ${f.extra}
  <circle cx="50" cy="50" r="46" fill="none" stroke="${c}" stroke-width="3"/>
</svg>`;
}

/** Estado facial según el % de vida. */
export function estadoPorVida(pct) {
  if (pct > 0.6) return 'fresco';
  if (pct > 0.28) return 'cansado';
  return 'alBorde';
}
