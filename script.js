import { createInitialState } from "./src/game/state.js";
import { loadGame } from "./src/game/save.js";
import { createApp } from "./src/ui/app.js";

const app = document.querySelector("#app");
createApp(app, loadGame() ?? createInitialState());
