import useTitleBar from "../hooks/useTitleBar";
import { helpers } from "../util";
import type { View } from "../../common/types";
import Overall from "./TeamHistory/Overall";
import Players from "./TeamHistory/Players";
import Seasons from "./TeamHistory/Seasons";

const GmHistory = ({
	bestRecord,
	championships,
	finalsAppearances,
	players,
	playoffAppearances,
	stats,
	teamHistories,
	totalLost,
	totalTied,
	totalOtl,
	totalWinp,
	totalWon,
	userTid,
	worstRecord,
}: View<"gmHistory">) => {
	useTitleBar({
		title: "GM History",
	});

	return (
		<>
			<p>
				More:{" "}
				<a href={helpers.leagueUrl(["team_records", "by_team", "your_teams"])}>
					Your Team Records
				</a>{" "}
				|{" "}
				<a href={helpers.leagueUrl(["draft_team_history", "your_teams"])}>
					Your Draft Picks
				</a>
			</p>

			<div className="row">
				<div className="col-sm-5 col-md-3">
					{teamHistories.length !== 1 ? (
						<Overall
							bestRecord={bestRecord}
							championships={championships}
							finalsAppearances={finalsAppearances}
							playoffAppearances={playoffAppearances}
							totalLost={totalLost}
							totalTied={totalTied}
							totalOtl={totalOtl}
							totalWinp={totalWinp}
							totalWon={totalWon}
							worstRecord={worstRecord}
						/>
					) : null}

					{teamHistories.map((teamHistory, i) => (
						<div key={i} className="mt-3">
							<Overall
								bestRecord={teamHistory.bestRecord}
								championships={teamHistory.championships}
								finalsAppearances={teamHistory.finalsAppearances}
								playoffAppearances={teamHistory.playoffAppearances}
								totalLost={teamHistory.totalLost}
								totalTied={teamHistory.totalTied}
								totalOtl={teamHistory.totalOtl}
								totalWinp={teamHistory.totalWinp}
								totalWon={teamHistory.totalWon}
								worstRecord={teamHistory.worstRecord}
								title={teamHistory.history[0].name}
							/>
							<Seasons history={teamHistory.history} />
						</div>
					))}
				</div>
				<div className="col-sm-7 col-md-9 mt-3 mt-sm-0">
					<p>
						This GM History page is similar to the{" "}
						<a href={helpers.leagueUrl(["team_history"])}>Team History page</a>,
						except it's not just for one team. It's for every team you were the
						GM of.
					</p>
					<p>
						Currently, there are two ways to change teams: (1) do a really bad
						job and the owner will fire you; (2) do a really good job and other
						teams may try to hire you after the playoffs end.
					</p>
					<Players gmHistory players={players} stats={stats} tid={userTid} />
				</div>
			</div>
		</>
	);
};

export default GmHistory;
