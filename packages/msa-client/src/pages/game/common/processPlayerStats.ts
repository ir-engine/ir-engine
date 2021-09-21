import processPlayerStatsBasketball from "./processPlayerStats.basketball";
import type { PlayerStats, PlayerStatType } from "./types";

const processPlayerStats = (
  ps: PlayerStats,
  stats: string[],
  statType?: PlayerStatType,
  bornYear?: number
) => {
  return processPlayerStatsBasketball(ps, stats, statType, bornYear);
};

export default processPlayerStats;
