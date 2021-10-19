import PropTypes from "prop-types";
import { Fragment } from "react";
import { MoreLinks, ScoreBox } from "../components";
import useTitleBar from "../hooks/useTitleBar";
import type { View } from "../../common/types";
import { toWorker, useLocalShallow } from "../util";

const Schedule = ({ abbrev, completed, tid, upcoming }: View<"schedule">) => {
	useTitleBar({
		title: "Schedule",
		dropdownView: "schedule",
		dropdownFields: { teams: abbrev },
	});

	const { gameSimInProgress } = useLocalShallow(state => ({
		gameSimInProgress: state.gameSimInProgress,
	}));

	return (
		<>
			<MoreLinks type="team" page="schedule" abbrev={abbrev} tid={tid} />
			<div className="row">
				<div className="col-sm-6">
					<h2>Upcoming Games</h2>
					<ul className="list-group">
						{upcoming.map((game, i) => {
							const action = game.teams[0].playoffs
								? {}
								: {
										actionDisabled: gameSimInProgress || i === 0,
										actionText: (
											<>
												Sim to
												<br />
												game
											</>
										),
										actionOnClick: () => {
											toWorker("actions", "simToGame", game.gid);
										},
								  };

							return (
								<Fragment key={game.gid}>
									<ScoreBox game={game} header={i === 0} {...action} />
								</Fragment>
							);
						})}
					</ul>
				</div>
				<div className="col-sm-6">
					<h2>Completed Games</h2>
					{completed.map((game, i) => (
						<ScoreBox
							className="mb-3"
							key={game.gid}
							game={game}
							header={i === 0}
						/>
					))}
				</div>
			</div>
		</>
	);
};

Schedule.propTypes = {
	abbrev: PropTypes.string.isRequired,
	completed: PropTypes.arrayOf(PropTypes.object).isRequired,
	upcoming: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Schedule;
