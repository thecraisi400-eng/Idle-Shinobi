import { SCREEN_RENDERERS } from "./screens.js";

export function renderScreen(app, state, uiState) {
  const render = SCREEN_RENDERERS[uiState.route] ?? SCREEN_RENDERERS.start;
  app.innerHTML = `${render(state)}<div id="modal-root"></div><div id="toast-root" class="toast-root" aria-live="polite"></div>`;
  requestAnimationFrame(() => app.querySelector("#screen-outlet, .start-screen, .combat-screen")?.focus?.());
}
