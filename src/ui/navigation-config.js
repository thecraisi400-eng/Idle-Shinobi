import { ROUTES } from "./router.js";

export const NAVIGATION_ITEMS = Object.freeze([
  { route: ROUTES.HERO, label: "HÉROE", icon: "★" },
  { route: ROUTES.EQUIPMENT, label: "EQUIPO", icon: "⬡" },
  { route: ROUTES.SKILLS, label: "HABILIDAD", icon: "✦" },
  { route: ROUTES.EVENTS, label: "EVENTOS", icon: "◷", badge: 1 },
  { route: ROUTES.PVP, label: "PVP", icon: "⚔" },
  { route: ROUTES.SHOP, label: "TIENDA", icon: "◇" }
]);
