import { NAVIGATION_ITEMS } from "./navigation-config.js";

export function icon(symbol, label) {
  return `<span class="ui-icon" aria-hidden="true">${symbol}</span><span class="sr-only">${label}</span>`;
}

export function panel(content, extraClass = "") {
  return `<section class="panel ${extraClass}">${content}</section>`;
}

export function statRow(label, value, tone = "") {
  return `<div class="stat-row"><span>${label}</span><strong class="${tone}">${value}</strong></div>`;
}

export function progressBar({ label, value, maximum, tone = "gold" }) {
  const percent = Math.max(0, Math.min(100, Math.round((value / maximum) * 100)));
  return `<div class="progress-block"><div class="progress-label"><span>${label}</span><strong>${value} / ${maximum}</strong></div><div class="progress-track" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="${maximum}" aria-valuenow="${value}"><span class="progress-fill progress-fill--${tone}" style="width:${percent}%"></span></div></div>`;
}

export function currencyBar(state) {
  return `<div class="currency-bar" aria-label="Recursos"><span title="Oro">${icon("◉", "Oro")} <strong>${state.wallet.gold}</strong></span><span title="Gemas">${icon("◆", "Gemas")} <strong>${state.wallet.gems}</strong></span></div>`;
}

export function bottomNavigation(route) {
  return `<nav class="bottom-nav" aria-label="Navegación principal">${NAVIGATION_ITEMS.map((item) => `<button class="nav-item ${route === item.route ? "is-active" : ""}" type="button" data-route="${item.route}" ${route === item.route ? 'aria-current="page"' : ""}><span class="nav-icon" aria-hidden="true">${item.icon}</span><span>${item.label}</span>${item.badge ? `<b class="nav-badge" aria-label="${item.badge} novedad">${item.badge}</b>` : ""}</button>`).join("")}</nav>`;
}

export function emptyState(iconValue, title, description) {
  return `<div class="empty-state"><span aria-hidden="true">${iconValue}</span><h2>${title}</h2><p>${description}</p></div>`;
}
