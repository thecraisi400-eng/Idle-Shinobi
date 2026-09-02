/* ===== TUTORIAL FORZADO DE 8 PASOS (01.14) =====
   Una capa oscura con un "agujero" iluminado sobre el elemento que toca
   mirar, más un globo de texto. El jugador no puede tocar otra cosa: el
   agujero es la única zona clicable.

   10.14 → después del tutorial NO hay ayudas por pantalla. Se enseña una
   vez, bien, y se calla para siempre.

   Sugerencia #1 del Paso 15: a partir del paso 3 aparece "Saltar guía",
   porque quien reinicia partida no debe tragarse 8 pantallas otra vez. */

import { S } from '../core/state.js';

export const CLAVE_TUTORIAL = 'oro-y-gloria:tutorial';
export const PASO_SALTABLE = 3;      // desde aquí se puede saltar (Sug#1)

/* Los 8 pasos, en el orden del plan. `objetivo` es un selector CSS;
   si no se encuentra, el paso se muestra centrado sin foco. */
export const PASOS = [
  {
    id: 'luchador',
    pantalla: 'panel',
    objetivo: '.hero-stage',
    titulo: 'Este eres tú',
    texto: 'Tu luchador. Aquí verás siempre su clase, su rango y la división en la que compites. Todo el juego gira en torno a hacerlo más fuerte.',
    posicion: 'abajo'
  },
  {
    id: 'rival',
    pantalla: 'panel',
    objetivo: '.btn-fight',
    titulo: 'Elige a tu rival',
    texto: 'Este botón te lleva al ring. Si no tienes rival asignado, primero escogerás uno entre tres candidatos: cada uno con su poder y su recompensa.',
    posicion: 'arriba'
  },
  {
    id: 'lucha',
    pantalla: 'panel',
    objetivo: '.hero-stage',
    titulo: 'La lucha se pelea sola',
    texto: 'Oro y Gloria es de autobatalla: tú preparas al luchador, él resuelve el combate golpe a golpe. Tu trabajo es decidir bien ANTES de sonar la campana.',
    posicion: 'abajo'
  },
  {
    id: 'botin',
    pantalla: 'panel',
    objetivo: '#hud .hud-right',
    titulo: 'Tu botín',
    texto: 'Al ganar te llevas oro y experiencia. El oro compra mejoras y objetos; las gemas, más escasas, son para lujos y comodidades. Nunca se pagan con dinero real.',
    posicion: 'abajo'
  },
  {
    id: 'stat',
    pantalla: 'heroe',
    objetivo: '.stat-row, .stats-lista, .card',
    titulo: 'Sube una estadística',
    texto: 'Cada nivel te da 3 puntos libres. Repártelos según tu estilo: potencia para pegar, vida y defensa para aguantar, agilidad para golpear más veces.',
    posicion: 'abajo'
  },
  {
    id: 'equipo',
    pantalla: 'panel',
    objetivo: '.accesos button:nth-child(1)',
    titulo: 'Equipa tu primer objeto',
    texto: 'Los rivales sueltan máscaras, botas y capas de seis rarezas distintas. Ocho huecos que puedes mejorar con material de las piezas que ya no uses.',
    posicion: 'arriba'
  },
  {
    id: 'arbol',
    pantalla: 'panel',
    objetivo: '.accesos button:nth-child(2)',
    titulo: 'El árbol de habilidades',
    texto: 'Seis ramas que se abren según subes de nivel. Los nodos clave cambian tu forma de luchar, no solo tus números. Elige con cabeza: no hay vuelta atrás.',
    posicion: 'arriba'
  },
  {
    id: 'eventos',
    pantalla: 'panel',
    objetivo: '#menu [data-screen="eventos"]',
    titulo: 'La rueda de eventos',
    texto: 'Cada tres horas empieza un evento distinto con premios gordos para el top 10. Los domingos pagan el doble. Ya estás listo: sal ahí y hazte un nombre.',
    posicion: 'arriba'
  }
];

/* ---------- Estado persistido ---------- */

export function tutorialHecho() {
  try { return localStorage.getItem(CLAVE_TUTORIAL) === 'ok'; }
  catch (_) { return false; }
}

export function marcarHecho() {
  try { localStorage.setItem(CLAVE_TUTORIAL, 'ok'); } catch (_) {}
  if (S && S.meta) S.meta.tutorial = true;
}

export function reiniciarTutorial() {
  try { localStorage.removeItem(CLAVE_TUTORIAL); } catch (_) {}
  if (S && S.meta) S.meta.tutorial = false;
}

/** ¿Debe arrancar el tutorial? Solo con clase elegida y sin haberlo visto. */
export function debeArrancar(estado = S) {
  return !tutorialHecho() && !!estado?.perfil?.clase;
}

/** Sugerencia #1: el botón de saltar solo desde el paso 3. */
export function puedeSaltar(indice) {
  return indice >= PASO_SALTABLE;
}

/* ---------- Motor visual ---------- */

let capa = null;
let indice = 0;
let alSalir = null;
let irA = null;

/** Calcula el rectángulo del objetivo, con margen. */
function rectoDe(selector, margen = 8) {
  if (!selector) return null;
  let nodo = null;
  for (const sel of selector.split(',')) {
    nodo = document.querySelector(sel.trim());
    if (nodo) break;
  }
  if (!nodo) return null;
  const r = nodo.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return {
    x: Math.max(0, r.left - margen),
    y: Math.max(0, r.top - margen),
    w: r.width + margen * 2,
    h: r.height + margen * 2
  };
}

function construirCapa() {
  const c = document.createElement('div');
  c.id = 'tutorial';
  c.innerHTML = `
    <div class="tut-hueco"></div>
    <div class="tut-globo">
      <div class="tut-cont"><b class="tut-n">1 de 8</b></div>
      <h3 class="tut-titulo"></h3>
      <p class="tut-texto"></p>
      <div class="tut-puntos"></div>
      <div class="tut-botones">
        <button class="btn sm tut-saltar" hidden>Saltar guía</button>
        <button class="btn primary tut-siguiente">Entendido</button>
      </div>
    </div>`;
  document.body.appendChild(c);
  c.querySelector('.tut-siguiente').addEventListener('click', siguiente);
  c.querySelector('.tut-saltar').addEventListener('click', terminar);
  return c;
}

function pintar() {
  const paso = PASOS[indice];
  if (!paso) return terminar();

  const hueco = capa.querySelector('.tut-hueco');
  const globo = capa.querySelector('.tut-globo');
  const r = rectoDe(paso.objetivo);

  if (r) {
    hueco.style.display = 'block';
    hueco.style.left = `${r.x}px`;
    hueco.style.top = `${r.y}px`;
    hueco.style.width = `${r.w}px`;
    hueco.style.height = `${r.h}px`;
  } else {
    hueco.style.display = 'none';
  }

  capa.querySelector('.tut-n').textContent = `${indice + 1} de ${PASOS.length}`;
  capa.querySelector('.tut-titulo').textContent = paso.titulo;
  capa.querySelector('.tut-texto').textContent = paso.texto;

  // puntitos de progreso
  capa.querySelector('.tut-puntos').innerHTML =
    PASOS.map((_, i) => `<i class="${i === indice ? 'on' : i < indice ? 'ya' : ''}"></i>`).join('');

  // Sugerencia #1
  const saltar = capa.querySelector('.tut-saltar');
  saltar.hidden = !puedeSaltar(indice);

  capa.querySelector('.tut-siguiente').textContent =
    indice === PASOS.length - 1 ? '¡A luchar!' : 'Entendido';

  // colocar el globo arriba o abajo del hueco, sin salirse de la pantalla
  const alto = window.innerHeight;
  globo.style.top = '';
  globo.style.bottom = '';
  if (!r) {
    globo.style.top = `${alto * 0.32}px`;
  } else if (paso.posicion === 'arriba' || r.y > alto * 0.55) {
    globo.style.bottom = `${Math.max(16, alto - r.y + 14)}px`;
  } else {
    globo.style.top = `${Math.min(alto - 240, r.y + r.h + 14)}px`;
  }
}

function siguiente() {
  indice++;
  if (indice >= PASOS.length) return terminar();
  const paso = PASOS[indice];
  if (paso.pantalla && irA) {
    irA(paso.pantalla);
    // se espera al render de la pantalla antes de medir el objetivo
    setTimeout(pintar, 260);
  } else {
    pintar();
  }
}

function terminar() {
  marcarHecho();
  capa?.remove();
  capa = null;
  window.removeEventListener('resize', pintar);
  if (typeof alSalir === 'function') alSalir();
}

/** Arranca el tutorial. `navegar` es la función `ir` del router. */
export function iniciarTutorial({ navegar, alTerminar } = {}) {
  if (capa) return false;
  indice = 0;
  irA = navegar || null;
  alSalir = alTerminar || null;
  capa = construirCapa();
  const p0 = PASOS[0];
  if (p0.pantalla && irA) irA(p0.pantalla);
  setTimeout(pintar, 260);
  window.addEventListener('resize', pintar);
  return true;
}

/** Para pruebas: estado interno del tutorial. */
export function estadoTutorial() {
  return { activo: !!capa, indice, total: PASOS.length };
}
