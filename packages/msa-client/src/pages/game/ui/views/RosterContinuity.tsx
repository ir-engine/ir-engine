import PropTypes from "prop-types";
import { DataTable } from "../components";
import useTitleBar from "../hooks/useTitleBar";
import { getCols, gradientStyleFactory } from "../util";
import type { Col } from "../components/DataTable";
import type { View } from "../../common/types";
import { frivolitiesMenu } from "./Frivolities";

const gradientStyle = gradientStyleFactory(0.5, 0.775, 0.85, 1);

const RosterContinuity = ({
	abbrevs,
	season,
	seasons,
	userAbbrev,
}: View<"rosterContinuity">) => {
	useTitleBar({
		title: "Roster Continuity",
		customMenu: frivolitiesMenu,
	});
	const cols = [
		...getCols(["Season"]),
		...abbrevs.map((abbrev): Col => {
			return {
				classNames: userAbbrev === abbrev ? "table-info" : undefined,
				sortSequence: ["desc", "asc"],
				sortType: "number",
				title: abbrev,
			};
		}),
	];
	const rows = seasons.map((seasonRow, i) => {
		return {
			key: season - i,
			data: [
				season - i,
				...seasonRow.map(pct => {
					if (pct === undefined) {
						return null;
					}

					return {
						style: gradientStyle(pct),
						value: pct.toFixed(2),
					};
				}),
			],
		};
	});
	return (
		<>
			<p>
				Each cell in the table shows the percentage of minutes played that
				season by players who were on the same team the previous season.
			</p>

			<DataTable
				cols={cols}
				defaultSort={[0, "desc"]}
				name="RosterContinuity"
				pagination={rows.length > 100}
				rows={rows}
			/>
		</>
	);
};

RosterContinuity.propTypes = {
	abbrevs: PropTypes.arrayOf(PropTypes.string).isRequired,
	season: PropTypes.number.isRequired,
	seasons: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
};

export default RosterContinuity;
