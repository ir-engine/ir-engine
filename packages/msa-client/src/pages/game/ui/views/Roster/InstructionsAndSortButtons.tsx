import PropTypes from "prop-types";
import type { View } from "../../../common/types";
import { confirm, toWorker } from "../../util";

const handleAutoSort = async () => {
	await toWorker("main", "autoSortRoster", undefined, undefined);
};

const handleResetPT = async () => {
	await toWorker("main", "resetPlayingTime", undefined);
};

const InstructionsAndSortButtons = ({
	keepRosterSorted,
	editable,
	players,
	tid,
}: Pick<View<"roster">, "editable" | "players" | "tid"> & {
	keepRosterSorted: boolean;
}) => {
	return (
		<>
			{editable ? (
				<p
					style={{
						clear: "both",
					}}
				>
					Click or drag row handles to move players between the starting lineup{" "}
					<span className="table-info legend-square" /> and the bench{" "}
					<span className="table-secondary legend-square" />.
				</p>
			) : null}

			{editable ? (
				<div className="mb-3">
					<div className="btn-group">
						{editable ? (
							<button
								className="btn btn-light-bordered"
								onClick={handleAutoSort}
							>
								Auto sort roster
							</button>
						) : null}
						{editable ? (
							<button
								className="btn btn-light-bordered"
								onClick={handleResetPT}
							>
								Reset playing time
							</button>
						) : null}
					</div>
					{editable ? (
						<div className="form-check mt-2">
							<input
								className="form-check-input"
								type="checkbox"
								checked={keepRosterSorted}
								id="ai-sort-user-roster"
								onChange={async () => {
									if (!keepRosterSorted) {
										await handleAutoSort();
									}
									await toWorker(
										"main",
										"updateKeepRosterSorted",
										tid,
										!keepRosterSorted,
									);
								}}
							/>
							<label className="form-check-label" htmlFor="ai-sort-user-roster">
								Keep auto sorted
							</label>
						</div>
					) : null}
				</div>
			) : null}
		</>
	);
};

InstructionsAndSortButtons.propTypes = {
	editable: PropTypes.bool.isRequired,
};

export default InstructionsAndSortButtons;
