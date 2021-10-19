import rosterAutoSortBasketball from "./rosterAutoSort.basketball";

const rosterAutoSort = (
	tid: number,
	onlyNewPlayers?: boolean,
	pos?: string,
) => {
	return rosterAutoSortBasketball(tid, onlyNewPlayers);
};

export default rosterAutoSort;
