export const ROUTES = Object.freeze({
  START: "start",
  HOME: "home",
  HERO: "hero",
  EQUIPMENT: "equipment",
  SKILLS: "skills",
  EVENTS: "events",
  PVP: "pvp",
  SHOP: "shop",
  COMBAT: "combat"
});

const validRoutes = new Set(Object.values(ROUTES));

export function createUiState(route = ROUTES.START) {
  return { route, previousRoute: null, activeModal: null, toast: null };
}

export function navigate(uiState, route) {
  if (!validRoutes.has(route)) return uiState;
  return { ...uiState, previousRoute: uiState.route, route, activeModal: null };
}
