import processStatsBasketball from "./processStats.basketball";
import type {
	TeamStatAttr,
	TeamStatType,
	TeamStats,
} from "../../../common/types";

const processStats = (
	ts: TeamStats,
	stats: Readonly<TeamStatAttr[]>,
	playoffs: boolean,
	statType: TeamStatType,
) => {
	return processStatsBasketball(ts, stats, playoffs, statType);
};

export default processStats;
