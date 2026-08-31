export const HERO_CLASSES = Object.freeze({
  heavy: { id: "heavy", name: "Pesado", description: "Aguanta más castigo.", bonuses: { health: 0.12, defense: 0.08, speed: -0.04 } },
  technical: { id: "technical", name: "Técnico", description: "Domina el daño y el crítico.", bonuses: { attack: 0.08, critical: 2 } },
  agile: { id: "agile", name: "Ágil", description: "Ataca con velocidad.", bonuses: { health: -0.04, speed: 0.12, evasion: 1 } },
  balanced: { id: "balanced", name: "Equilibrado", description: "Mejoras equilibradas.", bonuses: { health: 0.04, attack: 0.04, defense: 0.04, speed: 0.04 } }
});

export const LEGEND_CLASS = Object.freeze({ id: "legend", name: "Leyenda" });
