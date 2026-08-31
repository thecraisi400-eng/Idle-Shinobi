import { PLAYER_CONFIG } from "../../config/player-config.js";
import { PROGRESSION_CONFIG } from "../../config/progression-config.js";
import { HERO_CLASSES } from "../../data/classes.js";
import { experienceRequiredForLevel } from "./experience.js";

function failure(state, error) { return { nextState: state, events: [], error }; }
function levelGold(level) { return PROGRESSION_CONFIG.baseLevelGold + (level - 1) * PROGRESSION_CONFIG.goldGrowthPerLevel; }

export function chooseClass(state, classId) {
  if (state.player.classId) return failure(state, "La clase ya fue elegida.");
  if (!HERO_CLASSES[classId]) return failure(state, "La clase no es válida.");
  return { nextState: { ...state, player: { ...state.player, classId } }, events: [{ type: "class-selected", classId }] };
}

export function gainExperience(state, amount) {
  if (!Number.isInteger(amount) || amount < 0) return failure(state, "La experiencia debe ser un entero positivo.");
  let player = { ...state.player, experience: state.player.experience + amount };
  let gold = state.wallet.gold;
  const events = amount ? [{ type: "experience-gained", amount }] : [];
  while (player.level < PLAYER_CONFIG.maximumLevel && player.experience >= player.experienceRequired) {
    player = { ...player, level: player.level + 1, experience: player.experience - player.experienceRequired, experienceRequired: experienceRequiredForLevel(player.level) };
    gold += levelGold(player.level);
    player.statPoints += PLAYER_CONFIG.statPointsPerLevel;
    events.push({ type: "level-up", level: player.level, gold: levelGold(player.level), statPoints: PLAYER_CONFIG.statPointsPerLevel });
  }
  if (player.level === PLAYER_CONFIG.maximumLevel) player = { ...player, experience: 0, experienceRequired: 0 };
  return { nextState: { ...state, player, wallet: { ...state.wallet, gold } }, events };
}

export function investStatPoint(state, stat) {
  if (!PLAYER_CONFIG.statKeys.includes(stat)) return failure(state, "La estadística no es válida.");
  if (state.player.statPoints < 1) return failure(state, "No tienes puntos de atributo.");
  return { nextState: { ...state, player: { ...state.player, statPoints: state.player.statPoints - 1, baseStats: { ...state.player.baseStats, [stat]: state.player.baseStats[stat] + 1 } } }, events: [{ type: "stat-improved", stat, amount: 1 }] };
}

export function trainingCost(player, stat) {
  return Math.ceil(PROGRESSION_CONFIG.trainingBaseCost * (PROGRESSION_CONFIG.trainingCostGrowth ** player.training[stat]));
}

export function trainStat(state, stat) {
  if (!PLAYER_CONFIG.statKeys.includes(stat)) return failure(state, "La estadística no es válida.");
  const limit = Math.floor(state.player.level * PROGRESSION_CONFIG.trainingLimitMultiplier);
  if (state.player.training[stat] >= limit) return failure(state, "Has alcanzado el límite de entrenamiento de este nivel.");
  const cost = trainingCost(state.player, stat);
  if (state.wallet.gold < cost) return failure(state, "No tienes oro suficiente.");
  return { nextState: { ...state, player: { ...state.player, training: { ...state.player.training, [stat]: state.player.training[stat] + 1 } }, wallet: { ...state.wallet, gold: state.wallet.gold - cost } }, events: [{ type: "stat-trained", stat, cost }] };
}
