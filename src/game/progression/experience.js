import { PLAYER_CONFIG } from "../../config/player-config.js";

export function experienceRequiredForLevel(level) {
  if (!Number.isInteger(level) || level < 1 || level >= PLAYER_CONFIG.maximumLevel) return 0;
  return Math.floor(100 * (level ** 1.42) + level * 25);
}
