import { createInitialState } from "./src/game/state.js";
import { loadGame, saveGame } from "./src/game/save.js";
import { renderDashboard } from "./src/ui/renderer.js";

const app = document.querySelector("#app");
let state = loadGame() ?? createInitialState();

function startGame() {
  state = saveGame(state);
  renderDashboard(app, state);
}

document.querySelector("#continue-button").addEventListener("click", startGame);
