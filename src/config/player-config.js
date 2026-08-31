export const PLAYER_CONFIG = Object.freeze({
  maximumLevel: 200,
  initialExperienceRequired: 100,
  initialStats: Object.freeze({ health: 100, attack: 12, defense: 6, speed: 10, critical: 5 }),
  statKeys: Object.freeze(["health", "attack", "defense", "speed", "critical"]),
  statPointsPerLevel: 3,
  classes: Object.freeze(["heavy", "technical", "agile", "balanced"])
});
