import { saveGame } from "../game/save.js";
import { ROUTES, createUiState, navigate } from "./router.js";
import { renderScreen } from "./renderer.js";
import { renderEventPreview, renderSettings, renderToast } from "./overlays.js";
import { chooseClass, investStatPoint, trainStat } from "../game/progression/actions.js";

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
    if (action === "continue") return go(state.player.classId ? ROUTES.HOME : ROUTES.CLASS_SELECTION);
    if (action === "back") return go(uiState.previousRoute ?? ROUTES.HOME);
    if (action === "settings") return renderSettings(app, state);
    if (action === "event-preview") return renderEventPreview(app);
    if (action === "select-class") {
      const result = chooseClass(state, target.dataset.classId);
      if (result.error) return renderToast(app, result.error);
      state = saveGame(result.nextState); renderToast(app, "Clase elegida"); return go(ROUTES.HOME);
    }
    if (action === "invest-stat" || action === "train-stat") {
      const result = action === "invest-stat" ? investStatPoint(state, target.dataset.stat) : trainStat(state, target.dataset.stat);
      if (result.error) return renderToast(app, result.error);
      state = saveGame(result.nextState); render(); return renderToast(app, action === "invest-stat" ? "Atributo +1" : "Entrenamiento completado");
    }
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
