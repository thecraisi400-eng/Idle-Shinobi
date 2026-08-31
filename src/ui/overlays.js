export function renderSettings(app, state) {
  app.querySelector("#modal-root").innerHTML = `<div class="modal-backdrop" data-action="close-modal"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="settings-title"><div class="modal-heading"><h2 id="settings-title">Ajustes</h2><button class="icon-button" type="button" data-action="close-modal" aria-label="Cerrar ajustes">×</button></div><label class="setting-row">Tamaño de texto <select data-setting="fontScale"><option value="0.9">Pequeño</option><option value="1" ${state.settings.fontScale === 1 ? "selected" : ""}>Normal</option><option value="1.2">Grande</option><option value="1.4">Extra grande</option></select></label><label class="setting-row">Música <input type="range" min="0" max="1" step="0.1" value="${state.settings.musicVolume}" disabled /></label><label class="setting-row">Efectos <input type="range" min="0" max="1" step="0.1" value="${state.settings.effectsVolume}" disabled /></label><label class="setting-row">Vibración <input type="checkbox" ${state.settings.vibration ? "checked" : ""} disabled /></label><p class="form-help">Los controles de audio y vibración se activarán al añadir sonido en un paso posterior.</p></section></div>`;
}

export function renderEventPreview(app) {
  app.querySelector("#modal-root").innerHTML = `<div class="modal-backdrop" data-action="close-modal"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="event-title"><div class="modal-heading"><h2 id="event-title">Torneo Relámpago</h2><button class="icon-button" type="button" data-action="close-modal" aria-label="Cerrar">×</button></div><p>Esta vista se convertirá en una pantalla inmersiva cuando el sistema de eventos esté implementado.</p><button class="button button--primary" type="button" data-action="close-modal">Entendido</button></section></div>`;
}

export function renderToast(app, message) {
  app.querySelector("#toast-root").innerHTML = `<p class="toast">${message}</p>`;
}
