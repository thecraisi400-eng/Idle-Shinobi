import { saveGame } from "../game/save.js";
import { ROUTES, createUiState, navigate } from "./router.js";
import { renderScreen } from "./renderer.js";
import { renderEventPreview, renderSettings, renderToast } from "./overlays.js";

export function createApp(app, initialState) {
  let state = initialState;
  let uiState = createUiState();

  function render() {
    renderScreen(app, state, uiState);
  }

  function go(route) {
    uiState = navigate(uiState, route);
    render();
  }

  app.addEventListener("click", (event) => {
    const target = event.target.closest("button, [data-action], [data-route]");
    if (!target) return;
    const { action, route } = target.dataset;
    if (route) return go(route);
    if (action === "continue") return go(ROUTES.HOME);
    if (action === "back") return go(uiState.previousRoute ?? ROUTES.HOME);
    if (action === "settings") return renderSettings(app, state);
    if (action === "event-preview") return renderEventPreview(app);
    if (action === "close-modal") app.querySelector("#modal-root").replaceChildren();
  });

  app.addEventListener("change", (event) => {
    if (event.target.dataset.setting !== "fontScale") return;
    state = { ...state, settings: { ...state.settings, fontScale: Number(event.target.value) } };
    document.documentElement.style.setProperty("--font-scale", state.settings.fontScale);
    saveGame(state);
    renderToast(app, "Tamaño de texto guardado");
  });

  document.documentElement.style.setProperty("--font-scale", state.settings.fontScale);
  render();
  return { go, getState: () => state };
}
