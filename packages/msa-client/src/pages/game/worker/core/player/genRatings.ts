import { PHASE } from "../../../common";
import { g, helpers } from "../../util";
import genRatingsBasketball from "./genRatings.basketball";
import pos from "./pos";

const genRatings = (season: number, scoutingRank: number) => {
	const { heightInInches, ratings } = genRatingsBasketball(season, scoutingRank);

	// Should correspond to defaultGameAttributes.draftAges[0], but maybe they will diverge in the future..
	const DEFAULT_AGE = 19;

	// Apply bonus/penalty based on age, to simulate extra/fewer years of development that a player should have gotten. For older players, this is bounded by an upper limit, because players stop developing eventually. You might think player.develop should be used here, at least for old players, but that would result in old players all being horrible, which is no fun.
	const age = helpers.bound(g.get("draftAges")[0], -Infinity, 30);
	const ageDiff = age - DEFAULT_AGE;
	if (ageDiff !== 0) {
		const exponent = 0.8;

		const scale = Math.round(
			3 * Math.sign(ageDiff) * Math.abs(ageDiff) ** exponent,
		);

		const rtgs = [
				"stre",
				"endu",
				"ins",
				"dnk",
				"ft",
				"fg",
				"tp",
				"oiq",
				"diq",
			];

		const rtgsDevelopSlow = ["spd", "jmp", "drb", "pss", "reb"];

		for (const rtg of rtgs) {
			(ratings as any)[rtg] = helpers.bound(
				(ratings as any)[rtg] + scale,
				0,
				100,
			);
		}

		for (const rtg of rtgsDevelopSlow) {
			(ratings as any)[rtg] = helpers.bound(
				(ratings as any)[rtg] + Math.round(scale / 2),
				0,
				100,
			);
		}
	}

	// Higher fuzz for draft prospects
	let factor = 1;
	if (g.get("phase") >= PHASE.RESIGN_PLAYERS) {
		if (season === g.get("season") + 2) {
			factor = Math.sqrt(2);
		} else if (season >= g.get("season") + 3) {
			factor = 2;
		}
	} else {
		if (season === g.get("season") + 1) {
			factor = Math.sqrt(2);
		} else if (season >= g.get("season") + 2) {
			factor = 2;
		}
	}
	ratings.fuzz *= factor;

	ratings.pos = pos(ratings);

	return {
		heightInInches,
		ratings,
	};
};

export default genRatings;
