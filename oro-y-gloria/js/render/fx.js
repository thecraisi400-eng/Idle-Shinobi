/* ===== EFECTOS VISUALES =====
   11.04 sacudida + flash por golpe · 29.06 screen shake en críticos
   29.07 flash blanco en críticos · 11.05 cámara lenta puntual
   29.11 sin slow-mo en el golpe final · 29.14 respeta modo bajo rendimiento */

const bajo = () => document.body.classList.contains('perf-low');

/** Sacude un elemento (el sprite golpeado). */
export function sacudir(nodo, fuerza = 1) {
  if (!nodo || bajo()) return;
  nodo.classList.remove('fx-shake', 'fx-shake-fuerte');
  void nodo.offsetWidth;
  nodo.classList.add(fuerza > 1 ? 'fx-shake-fuerte' : 'fx-shake');
}

/** Flash de impacto sobre el luchador golpeado. */
export function flashImpacto(nodo) {
  if (!nodo || bajo()) return;
  nodo.classList.remove('fx-hit');
  void nodo.offsetWidth;
  nodo.classList.add('fx-hit');
}

/** Flash blanco a pantalla completa (29.07 críticos). */
export function flashBlanco(escena, intensidad = 1) {
  if (!escena || bajo()) return;
  const f = document.createElement('div');
  f.className = 'fx-flash';
  f.style.opacity = String(0.55 * intensidad);
  escena.append(f);
  f.addEventListener('animationend', () => f.remove(), { once: true });
}

/** Sacudida de toda la escena (29.06). */
export function screenShake(escena, fuerza = 1) {
  if (!escena || bajo()) return;
  escena.classList.remove('fx-scene-shake', 'fx-scene-shake-fuerte');
  void escena.offsetWidth;
  escena.classList.add(fuerza > 1 ? 'fx-scene-shake-fuerte' : 'fx-scene-shake');
}

/** Animación de golpe del atacante. */
export function animarGolpe(nodo, tipo = 'potencia') {
  if (!nodo) return;
  const clase = { potencia: 'fx-atk-poder', tecnica: 'fx-atk-tecnica', agilidad: 'fx-atk-rapido' }[tipo] || 'fx-atk-poder';
  nodo.classList.remove('fx-atk-poder', 'fx-atk-tecnica', 'fx-atk-rapido');
  void nodo.offsetWidth;
  nodo.classList.add(clase);
  setTimeout(() => nodo.classList.remove(clase), 420);
}

/** Postura de KO. */
export function animarKO(nodo) {
  if (!nodo) return;
  nodo.classList.add('fx-ko');
}

export function limpiarKO(nodo) {
  nodo?.classList.remove('fx-ko');
}

/** Chispa de impacto en el punto del golpe. */
export function chispa(escena, lado = 'izq', critico = false) {
  if (!escena || bajo()) return;
  const s = document.createElement('div');
  s.className = `fx-chispa ${lado} ${critico ? 'crit' : ''}`;
  s.textContent = critico ? '💥' : '✦';
  escena.append(s);
  s.addEventListener('animationend', () => s.remove(), { once: true });
}

/** Cámara lenta puntual (11.05): ralentiza la reproducción un instante. */
export function camaraLenta(escena, ms = 320) {
  if (!escena || bajo()) return Promise.resolve();
  escena.classList.add('fx-slow');
  return new Promise(r => setTimeout(() => {
    escena.classList.remove('fx-slow');
    r();
  }, ms));
}

/** Nombre del movimiento especial en texto pequeño (12.15). */
export function mostrarNombreEspecial(escena, nombre) {
  if (!escena) return;
  const n = document.createElement('div');
  n.className = 'fx-nombre-especial';
  n.textContent = nombre;
  escena.append(n);
  setTimeout(() => n.remove(), 1400);
}

/** Confeti — solo en campeonatos (29.12). */
export function confeti(escena, cantidad = 40) {
  if (!escena || bajo()) return;
  const cont = document.createElement('div');
  cont.className = 'fx-confeti';
  const colores = ['#e8b64c', '#c0202a', '#f5f0e6', '#4ec97a', '#6ec8ff'];
  for (let i = 0; i < cantidad; i++) {
    const p = document.createElement('i');
    p.style.left = `${Math.random() * 100}%`;
    p.style.background = colores[i % colores.length];
    p.style.animationDelay = `${Math.random() * 0.6}s`;
    p.style.animationDuration = `${1.6 + Math.random()}s`;
    cont.append(p);
  }
  escena.append(cont);
  setTimeout(() => cont.remove(), 3200);
}

/** Contador rodante de oro (29.08). */
export function contadorRodante(nodo, desde, hasta, ms = 900, formato = v => Math.floor(v)) {
  if (!nodo) return;
  if (bajo()) { nodo.textContent = formato(hasta); return; }
  const t0 = performance.now();
  const paso = ahora => {
    const p = Math.min(1, (ahora - t0) / ms);
    const eased = 1 - Math.pow(1 - p, 3);
    nodo.textContent = formato(desde + (hasta - desde) * eased);
    if (p < 1) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}
