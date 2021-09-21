import { PHASE, PLAYER } from "../../common";
import { idb } from "../db";
import { defaultGameAttributes, g, helpers } from "../util";
import type { UpdateEvents, ViewInput } from "../../common/types";

const getCategoriesAndStats = () => {
	const categories = [
		{
			name: "Points",
			stat: "PTS",
			statProp: "pts",
			title: "Points Per Game",
			data: [],
			minStats: ["gp", "pts"],
			minValue: [70, 1400],
		},
		{
			name: "Rebounds",
			stat: "TRB",
			statProp: "trb",
			title: "Rebounds Per Game",
			data: [],
			minStats: ["gp", "trb"],
			minValue: [70, 800],
		},
		{
			name: "Assists",
			stat: "AST",
			statProp: "ast",
			title: "Assists Per Game",
			data: [],
			minStats: ["gp", "ast"],
			minValue: [70, 400],
		},
		{
			name: "Field Goal Percentage",
			stat: "FG%",
			statProp: "fgp",
			title: "Field Goal Percentage",
			data: [],
			minStats: ["fg"],
			minValue: [300 * g.get("twoPointAccuracyFactor")],
		},
		{
			name: "Three-Pointer Percentage",
			stat: "3PT%",
			statProp: "tpp",
			title: "Three-Pointer Percentage",
			data: [],
			minStats: ["tp"],
			minValue: [Math.max(55 * g.get("threePointTendencyFactor"), 12)],
		},
		{
			name: "Free Throw Percentage",
			stat: "FT%",
			statProp: "ftp",
			title: "Free Throw Percentage",
			data: [],
			minStats: ["ft"],
			minValue: [125],
		},
		{
			name: "Blocks",
			stat: "BLK",
			statProp: "blk",
			title: "Blocks Per Game",
			data: [],
			minStats: ["gp", "blk"],
			minValue: [70, 100],
		},
		{
			name: "Steals",
			stat: "STL",
			statProp: "stl",
			title: "Steals Per Game",
			data: [],
			minStats: ["gp", "stl"],
			minValue: [70, 125],
		},
		{
			name: "Minutes",
			stat: "MP",
			statProp: "min",
			title: "Minutes Per Game",
			data: [],
			minStats: ["gp", "min"],
			minValue: [70, 2000],
		},
		{
			name: "Player Efficiency Rating",
			stat: "PER",
			statProp: "per",
			title: "Player Efficiency Rating",
			data: [],
			minStats: ["min"],
			minValue: [2000],
		},
		{
			name: "Estimated Wins Added",
			stat: "EWA",
			statProp: "ewa",
			title: "Estimated Wins Added",
			data: [],
			minStats: ["min"],
			minValue: [2000],
		},
		{
			name: "Win Shares / 48 Mins",
			stat: "WS/48",
			statProp: "ws48",
			title: "Win Shares Per 48 Minutes",
			data: [],
			minStats: ["min"],
			minValue: [2000],
		},
		{
			name: "Offensive Win Shares",
			stat: "OWS",
			statProp: "ows",
			title: "Offensive Win Shares",
			data: [],
			minStats: ["min"],
			minValue: [2000],
		},
		{
			name: "Defensive Win Shares",
			stat: "DWS",
			statProp: "dws",
			title: "Defensive Win Shares",
			data: [],
			minStats: ["min"],
			minValue: [2000],
		},
		{
			name: "Win Shares",
			stat: "WS",
			statProp: "ws",
			title: "Win Shares",
			data: [],
			minStats: ["min"],
			minValue: [2000],
		},
		{
			name: "Offensive Box Plus-Minus",
			stat: "OBPM",
			statProp: "obpm",
			title: "Offensive Box Plus-Minus",
			data: [],
			minStats: ["min"],
			minValue: [2000],
		},
		{
			name: "Defensive Box Plus-Minus",
			stat: "DBPM",
			statProp: "dbpm",
			title: "Defensive Box Plus-Minus",
			data: [],
			minStats: ["min"],
			minValue: [2000],
		},
		{
			name: "Box Plus-Minus",
			stat: "BPM",
			statProp: "bpm",
			title: "Box Plus-Minus",
			data: [],
			minStats: ["min"],
			minValue: [2000],
		},
		{
			name: "Value Over Replacement Player",
			stat: "VORP",
			statProp: "vorp",
			title: "Value Over Replacement Player",
			data: [],
			minStats: ["min"],
			minValue: [2000],
		},
	];

	const statsSet = new Set<string>();
	for (const { minStats, statProp } of categories) {
		statsSet.add(statProp);

		for (const stat of minStats) {
			statsSet.add(stat);
		}
	}

	const stats = Array.from(statsSet);
	return {
		categories,
		stats,
	};
};

const updateLeaders = async (
	inputs: ViewInput<"leaders">,
	updateEvents: UpdateEvents,
	state: any,
) => {
	// Respond to watchList in case players are listed twice in different categories
	if (
		updateEvents.includes("watchList") ||
		(inputs.season === g.get("season") && updateEvents.includes("gameSim")) ||
		inputs.season !== state.season ||
		inputs.playoffs !== state.playoffs
	) {
		const { categories, stats } = getCategoriesAndStats(); // Calculate the number of games played for each team, which is used later to test if a player qualifies as a league leader

		const teamSeasons = await idb.getCopies.teamSeasons({
			season: inputs.season,
		});
		const gps: Record<number, number | undefined> = {};
		for (const teamSeason of teamSeasons) {
			if (inputs.playoffs === "playoffs") {
				if (teamSeason.gp < g.get("numGames")) {
					gps[teamSeason.tid] = 0;
				} else {
					gps[teamSeason.tid] = teamSeason.gp - g.get("numGames");
				}
			} else {
				// Don't count playoff games
				if (teamSeason.gp > g.get("numGames")) {
					gps[teamSeason.tid] = g.get("numGames");
				} else {
					gps[teamSeason.tid] = teamSeason.gp;
				}
			}
		}

		let players;
		if (g.get("season") === inputs.season && g.get("phase") <= PHASE.PLAYOFFS) {
			players = await idb.cache.players.indexGetAll("playersByTid", [
				PLAYER.FREE_AGENT,
				Infinity,
			]);
		} else {
			players = await idb.getCopies.players({
				activeSeason: inputs.season,
			});
		}

		players = await idb.getCopies.playersPlus(players, {
			attrs: ["pid", "nameAbbrev", "injury", "watch", "jerseyNumber"],
			ratings: ["skills", "pos"],
			stats: ["abbrev", "tid", ...stats],
			season: inputs.season,
			playoffs: inputs.playoffs === "playoffs",
			regularSeason: inputs.playoffs !== "playoffs",
			mergeStats: true,
		});
		const userAbbrev = helpers.getAbbrev(g.get("userTid"));

		// In theory this should be the same for all sports, like basketball. But for a while FBGM set it to the same value as basketball, which didn't matter since it doesn't influence game sim, but it would mess this up.
		const numPlayersOnCourtFactor = defaultGameAttributes.numPlayersOnCourt / g.get("numPlayersOnCourt");

		// To handle changes in number of games, playing time, etc
		const factor =
			(g.get("numGames") / defaultGameAttributes.numGames) *
			numPlayersOnCourtFactor *
			helpers.quarterLengthFactor();

		// minStats and minValues are the NBA requirements to be a league leader for each stat http://www.nba.com/leader_requirements.html. If any requirement is met, the player can appear in the league leaders
		for (const cat of categories) {
			if (cat.sortAscending) {
				players.sort((a, b) => a.stats[cat.statProp] - b.stats[cat.statProp]);
			} else {
				players.sort((a, b) => b.stats[cat.statProp] - a.stats[cat.statProp]);
			}

			for (const p of players) {
				// Test if the player meets the minimum statistical requirements for this category
				let pass = cat.minStats.length === 0 && (!cat.filter || cat.filter(p));

				if (!pass) {
					for (let k = 0; k < cat.minStats.length; k++) {
						// In basketball, everything except gp is a per-game average, so we need to scale them by games played
						let playerValue;
						if (cat.minStats[k] === "gp") {
							playerValue = p.stats[cat.minStats[k]];
						} else {
							playerValue = p.stats[cat.minStats[k]] * p.stats.gp;
						}

						// Compare against value normalized for team games played
						const gpTeam = gps[p.stats.tid];

						if (gpTeam !== undefined) {
							// Special case GP
							if (cat.minStats[k] === "gp") {
								if (
									playerValue / gpTeam >=
									cat.minValue[k] / g.get("numGames")
								) {
									pass = true;
									break; // If one is true, don't need to check the others
								}
							}

							// Other stats
							if (
								playerValue >=
								Math.ceil(
									(cat.minValue[k] * factor * gpTeam) / g.get("numGames"),
								)
							) {
								pass = true;
								break; // If one is true, don't need to check the others
							}
						}
					}
				}

				if (pass) {
					const leader = helpers.deepCopy(p);
					leader.stat = leader.stats[cat.statProp];
					leader.abbrev = leader.stats.abbrev;
					leader.tid = leader.stats.tid;
					// @ts-ignore
					delete leader.stats;
					leader.userTeam = userAbbrev === leader.abbrev;
					cat.data.push(leader);
				}

				// Stop when we found 10
				if (cat.data.length === 10) {
					break;
				}
			}

			// @ts-ignore
			delete cat.minStats;

			// @ts-ignore
			delete cat.minValue;

			delete cat.filter;
		}

		return {
			categories,
			playoffs: inputs.playoffs,
			season: inputs.season,
		};
	}
};

export default updateLeaders;
