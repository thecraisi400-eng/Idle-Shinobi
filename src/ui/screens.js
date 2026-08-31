import { ROUTES } from "./router.js";
import { bottomNavigation, currencyBar, emptyState, panel, progressBar, statRow } from "./components.js";
import { HERO_CLASSES } from "../data/classes.js";
import { getHeroStats, getPower } from "../game/progression/hero-stats.js";
import { trainingCost } from "../game/progression/actions.js";

function header(title, state, { back = false } = {}) {
  return `<header class="app-header"><div>${back ? '<button class="back-button" type="button" data-action="back" aria-label="Volver">‹</button>' : ""}<p class="brand">RING <span>DE CAMPEONES</span></p><h1>${title}</h1></div>${currencyBar(state)}<button class="icon-button" type="button" data-action="settings" aria-label="Abrir ajustes">⚙</button></header>`;
}

function shell(title, state, route, content) {
  return `<div class="game-shell">${header(title, state)}<section id="screen-outlet" class="screen-outlet" tabindex="-1">${content}</section>${bottomNavigation(route)}</div>`;
}

export function startScreen(state) {
  return `<section class="start-screen" aria-labelledby="game-title"><p class="eyebrow">LUCHA · GLORIA · LEYENDA</p><div class="championship-mark" aria-hidden="true"><span>R</span></div><h1 id="game-title">Ring de <span>Campeones</span></h1><p>La gloria espera a <strong>El Campeón del Pueblo</strong>.</p><p class="level-pill">Nivel ${state.player.level}</p><div class="start-actions"><button class="button button--primary" type="button" data-action="continue">Continuar</button><button class="button button--secondary" type="button" data-action="settings">Ajustes</button></div></section>`;
}

export function classSelectionScreen() {
  return `<section class="start-screen" aria-labelledby="class-title"><p class="eyebrow">ELIGE TU DESTINO</p><h1 id="class-title">Tu clase</h1><p>Esta elección será permanente.</p><div class="class-grid">${Object.values(HERO_CLASSES).map((item) => `<button class="class-card" type="button" data-action="select-class" data-class-id="${item.id}"><strong>${item.name}</strong><span>${item.description}</span></button>`).join("")}</div></section>`;
}

export function homeScreen(state) {
  const heroStats = getHeroStats(state.player);
  const event = `<div class="event-chip"><span aria-hidden="true">◷</span> Próximo evento en <strong>02:14:08</strong></div>`;
  const hero = panel(`<div class="hero-card"><div class="hero-avatar" aria-hidden="true">★</div><div><p class="eyebrow">EL CAMPEÓN DEL PUEBLO</p><h2>Nivel ${state.player.level}</h2>${progressBar({ label: "Experiencia", value: state.player.experience, maximum: state.player.experienceRequired || 1 })}</div></div>`, "hero-card-panel");
  const stats = panel(`<div class="section-heading"><h2>Poder ${getPower(heroStats)}</h2><button class="text-button" type="button" data-route="${ROUTES.HERO}">Ver héroe</button></div><div class="stats-grid">${statRow("VIDA", heroStats.health)}${statRow("ATAQUE", heroStats.attack)}${statRow("DEFENSA", heroStats.defense)}${statRow("VELOCIDAD", heroStats.speed)}</div>`);
  const fight = `<section class="fight-card"><p class="eyebrow">PRÓXIMA LUCHA</p><h2>El Martillo</h2><p class="muted">Poder equilibrado · Recompensa: 50 oro · 25 EXP</p><button class="button button--primary" type="button" data-route="${ROUTES.COMBAT}">¡LUCHAR!</button></section>`;
  return shell("Inicio", state, ROUTES.HOME, `${event}${hero}${stats}${fight}`);
}

export function heroScreen(state) {
  const stats = getHeroStats(state.player);
  const rows = Object.entries(stats).filter(([key]) => ["health", "attack", "defense", "speed", "critical"].includes(key)).map(([key, value]) => `<div class="upgrade-row">${statRow(key === "health" ? "Vida" : key === "attack" ? "Ataque" : key === "defense" ? "Defensa" : key === "speed" ? "Velocidad" : "Crítico", key === "critical" ? `${value}%` : value)}<button class="small-button" type="button" data-action="invest-stat" data-stat="${key}" ${state.player.statPoints ? "" : "disabled"}>+ Punto</button><button class="small-button" type="button" data-action="train-stat" data-stat="${key}">+ ${trainingCost(state.player, key)} oro</button></div>`).join("");
  const className = HERO_CLASSES[state.player.classId]?.name ?? "Sin clase";
  return shell("Héroe", state, ROUTES.HERO, `${panel(`<div class="hero-detail"><div class="hero-avatar hero-avatar--large" aria-hidden="true">★</div><div><p class="eyebrow">${className.toUpperCase()} · PODER ${getPower(stats)}</p><h2>${state.player.name}</h2><p class="muted">Entrena tus estadísticas para dominar el ring.</p></div></div>`)}${panel(`<div class="section-heading"><h2>Atributos</h2><span class="point-chip">${state.player.statPoints} puntos</span></div><div class="stats-list">${rows}</div>`)}${panel(`<h2>Próxima meta</h2><p class="muted">Gana tu primera lucha para obtener EXP y oro.</p>`)}`);
}

export function equipmentScreen(state) {
  return shell("Equipo", state, ROUTES.EQUIPMENT, panel(`${emptyState("⬡", "Tu vestuario está vacío", "Gana combates para conseguir piezas y aumentar tu poder.")}<button class="button button--secondary" type="button" data-route="${ROUTES.HOME}">Ir a luchar</button>`));
}

export function skillsScreen(state) {
  return shell("Habilidad", state, ROUTES.SKILLS, `${panel(`<div class="section-heading"><h2>Puntos de habilidad</h2><span class="point-chip">${state.skills.points}</span></div><p class="muted">Los talentos pasivos se desbloquearán al subir de nivel.</p>`)}${panel(`<div class="skill-preview"><span>⚔</span><div><h2>Rama de ataque</h2><p class="muted">Mejora daño, crítico y ritmo de combate.</p></div></div><div class="locked-row">Disponible al nivel 2</div>`)}`);
}

export function eventsScreen(state) {
  return shell("Eventos", state, ROUTES.EVENTS, `${panel(`<p class="eyebrow">ACTIVO AHORA</p><h2>Torneo Relámpago</h2><p class="muted">Gana tantas luchas como puedas antes de que termine el reloj.</p><button class="button button--primary" type="button" data-action="event-preview">Ver evento</button>`)}${panel(`<h2>Calendario de hoy</h2><div class="timeline"><p><strong>Ahora</strong><span>Torneo Relámpago</span></p><p><strong>18:00</strong><span>Derriba al Gigante</span></p><p><strong>21:00</strong><span>Supervivencia Extrema</span></p></div>`)}`);
}

export function pvpScreen(state) {
  return shell("Lucha PVP", state, ROUTES.PVP, `${panel(`<p class="eyebrow">TORNEO DE 32</p><h2>Sala Bronce</h2><p class="muted">Entrada: 500 oro · Bolsa visible antes de competir.</p><button class="button button--primary" type="button" disabled>Necesitas más oro</button>`)}${panel(`<h2>Campeones recientes</h2><ol class="champions"><li>La Serpiente</li><li>El Martillo</li><li>Rayo Dorado</li></ol>`)}`);
}

export function shopScreen(state) {
  return shell("Tienda", state, ROUTES.SHOP, `${panel(`<div class="section-heading"><h2>Ofertas de hoy</h2><span class="sale-chip">03:18:44</span></div><div class="shop-grid"><article><span>⬡</span><strong>Cofre básico</strong><small>150 oro</small></article><article><span>✦</span><strong>Poción menor</strong><small>75 oro</small></article></div>`)}`);
}

export function combatScreen(state) {
  const stats = getHeroStats(state.player);
  return `<section class="combat-screen" aria-labelledby="combat-title"><header><button class="back-button" type="button" data-action="back" aria-label="Salir del combate">‹</button><p>COMBATE DE PRUEBA</p><button class="speed-button" type="button" disabled>×2</button></header><div class="combat-stage"><div class="fighter fighter--hero"><span class="fighter-art" aria-hidden="true">★</span><h2>${state.player.name}</h2>${progressBar({ label: "Vida", value: stats.health, maximum: stats.health, tone: "health" })}</div><p class="versus">VS</p><div class="fighter fighter--enemy"><span class="fighter-art" aria-hidden="true">◆</span><h2>El Martillo</h2>${progressBar({ label: "Vida", value: 120, maximum: 120, tone: "danger" })}</div></div><div class="combat-log"><h1 id="combat-title">La lucha estará disponible en el paso 5</h1><p>La interfaz de combate ya está preparada para conectarse al motor automático.</p></div></section>`;
}

export const SCREEN_RENDERERS = Object.freeze({
  [ROUTES.START]: startScreen,
  [ROUTES.CLASS_SELECTION]: classSelectionScreen,
  [ROUTES.HOME]: homeScreen,
  [ROUTES.HERO]: heroScreen,
  [ROUTES.EQUIPMENT]: equipmentScreen,
  [ROUTES.SKILLS]: skillsScreen,
  [ROUTES.EVENTS]: eventsScreen,
  [ROUTES.PVP]: pvpScreen,
  [ROUTES.SHOP]: shopScreen,
  [ROUTES.COMBAT]: combatScreen
});
