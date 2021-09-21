import PropTypes from "prop-types";
import { Fragment, ChangeEvent, useState, useEffect } from "react";
import { RATINGS } from "../../../common";
import { getCols, helpers, toWorker } from "../../util";

const rows = [
		[
			{ Physical: ["hgt", "stre", "spd", "jmp", "endu"] },
			{ Shooting: ["ins", "dnk", "ft", "fg", "tp"] },
			{ Skill: ["oiq", "diq", "drb", "pss", "reb"] },
		],
	];

const RatingsForm = ({
	challengeNoRatings,
	handleChange,
	ratingsRow,
}: {
	challengeNoRatings: boolean;
	handleChange: (
		type: string,
		field: string,
		event: ChangeEvent<HTMLInputElement>,
	) => void;
	ratingsRow: any;
}) => {
	const [ovr, setOvr] = useState(ratingsRow.ovr);

	useEffect(() => {
		let mounted = true;
		(async () => {
			const boundedRatings = {
				...ratingsRow,
			};
			for (const key of RATINGS) {
				boundedRatings[key] = helpers.bound(boundedRatings[key], 0, 100);
			}

			const newOvr = await toWorker(
				"main",
				"ovr",
				boundedRatings,
				boundedRatings.pos,
			);
			if (mounted) {
				setOvr(newOvr);
			}
		})();

		return () => {
			mounted = false;
		};
	}, [ratingsRow]);

	const hideRatings = challengeNoRatings;

	const fuzzRating = (
		ratingsRow: any,
		rating: string,
		ratingOverride?: number,
	) => {
		if (hideRatings) {
			return "";
		}

		const raw = ratingOverride ?? ratingsRow[rating];

		return rating === "hgt"
			? raw
			: Math.round(helpers.bound(raw + ratingsRow.fuzz, 0, 100));
	};

	return (
		<>
			{rows.map((row, i) => {
				return (
					<Fragment key={i}>
						<p>
							Overall:{" "}
							{Number.isNaN(ovr) ? (
								<span className="text-danger">error</span>
							) : (
								fuzzRating(ratingsRow, "ovr", ovr)
							)}
						</p>
						<div className="row">
							{row.map((block, j) => {
								return (
									<div key={j} className="col-4">
										{Object.entries(block).map(([title, ratings]) => {
											return (
												<Fragment key={title}>
													<h3>{title}</h3>
													{ratings.map(rating => {
														return (
															<div key={rating} className="form-group">
																<label>
																	{getCols([`rating:${rating}`])[0].desc}
																</label>
																<input
																	type="text"
																	className="form-control"
																	onChange={event => {
																		handleChange("rating", rating, event);
																	}}
																	value={fuzzRating(ratingsRow, rating)}
																	disabled={true}
																/>
															</div>
														);
													})}
												</Fragment>
											);
										})}
									</div>
								);
							})}
						</div>
					</Fragment>
				);
			})}

			<div className="ml-1">
				<label className="form-check-label ml-3 mb-3">
					<input
						className="form-check-input"
						onChange={event => {
							handleChange("rating", "locked", event);
						}}
						type="checkbox"
						checked={!!ratingsRow.locked}
						disabled={true}
					/>
					Lock ratings (ratings will not change as player ages)
				</label>
			</div>
		</>
	);
};

RatingsForm.propTypes = {
	handleChange: PropTypes.func,
	ratingsRow: PropTypes.object,
};

export default RatingsForm;
