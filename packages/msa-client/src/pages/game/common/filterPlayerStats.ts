
// Filter based on if player has any stats, for use in box score and player game log
const filterPlayerStats = (p: any, stats: string[], type: string) => {
	return p.min > 0;
};

export default filterPlayerStats;
