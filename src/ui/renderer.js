export function renderDashboard(app, state) {
  const template = document.querySelector("#dashboard-template");
  app.replaceChildren(template.content.cloneNode(true));
  app.querySelector("#player-level").textContent = state.player.level;
  app.querySelector("#experience-value").textContent = state.player.experience;
  app.querySelector("#experience-required").textContent = state.player.experienceRequired;
  app.querySelector("#gold-value").textContent = state.currencies.gold;
  app.querySelector("#gems-value").textContent = state.currencies.gems;
}
