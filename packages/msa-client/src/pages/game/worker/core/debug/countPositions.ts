import { PLAYER, POSITION_COUNTS } from "../../../common";
import { idb } from "../../db";
import { player } from "..";

const countPositions = async () => {
	// All non-retired players
	const players = await idb.league
		.transaction("players")
		.store.index("tid")
		.getAll(IDBKeyRange.lowerBound(PLAYER.FREE_AGENT));
	const posCounts: {
		[key: string]: number;
	} = {};
	const posOvrs: {
		[key: string]: number;
	} = {};

	for (const p of players) {
		const r = p.ratings.at(-1); // Dynamically recompute, to make dev easier when changing position formula

		const position = player.pos(r);

		const ovr = player.ovr(r, position);

		if (posCounts[position] === undefined) {
			posCounts[position] = 0;
		}

		if (posOvrs[position] === undefined) {
			posOvrs[position] = 0;
		}

		posCounts[position] += 1;
		posOvrs[position] += ovr;
	}

	for (const position of Object.keys(posOvrs)) {
		posOvrs[position] /= posCounts[position];
	}

	console.table(posCounts);
	console.table(posOvrs);
};

export default countPositions;
