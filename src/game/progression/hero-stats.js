import { HERO_CLASSES } from "../../data/classes.js";

const round = (value) => Math.round(value * 100) / 100;

export function getHeroStats(player) {
  const classBonuses = HERO_CLASSES[player.classId]?.bonuses ?? {};
  const stats = {};
  for (const [key, base] of Object.entries(player.baseStats)) {
    const growth = key === "critical" ? Math.floor((player.level - 1) / 10) : Math.floor((player.level - 1) * (key === "health" ? 5 : 1));
    const raw = base + player.training[key] + growth;
    const bonus = classBonuses[key] ?? 0;
    stats[key] = round(raw * (typeof bonus === "number" && Math.abs(bonus) < 1 ? 1 + bonus : 1) + (Math.abs(bonus) >= 1 ? bonus : 0));
  }
  return { ...stats, luck: 0, evasion: classBonuses.evasion ?? 0, accuracy: 100, criticalResistance: 0, criticalBlockChance: 0 };
}

export function getPower(stats) {
  return Math.round(stats.health * 0.2 + stats.attack * 5 + stats.defense * 3.5 + stats.speed * 2 + stats.critical * 2);
}
