import { APP_CONFIG } from "../../config/app-config.js";

export function migrateState(state) {
  const hasModernMetadata = Number.isInteger(state?.meta?.schemaVersion);
  const version = state?.meta?.schemaVersion ?? state?.version ?? 0;
  if (version > APP_CONFIG.schemaVersion) throw new Error("La partida fue creada con una versión más reciente del juego.");
  if (hasModernMetadata && version === APP_CONFIG.schemaVersion) return state;

  // La versión 0 corresponde al prototipo inicial: `currencies` e inventario
  // estaban ubicados en rutas diferentes. La normalización completa el resto.
  return {
    ...state,
    meta: { ...(state?.meta ?? {}), schemaVersion: APP_CONFIG.schemaVersion },
    wallet: state?.wallet ?? state?.currencies,
    inventory: state?.inventory ?? { items: state?.equipment?.inventory ?? [] }
  };
}
