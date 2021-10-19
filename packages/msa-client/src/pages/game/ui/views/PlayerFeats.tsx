import PropTypes from "prop-types";
import { DataTable, PlayerNameLabels } from "../components";
import useTitleBar from "../hooks/useTitleBar";
import { getCols, helpers } from "../util";
import type { View } from "../../common/types";

const PlayerFeats = ({
  abbrev,
  feats,
  quarterLengthFactor,
  season,
  stats,
  userTid,
}: View<"playerFeats">) => {
  useTitleBar({
    title: "Statistical Feats",
    dropdownView: "player_feats",
    dropdownFields: { teamsAndAll: abbrev, seasonsAndAll: season },
  });

  const cols = getCols([
    "Name",
    "Pos",
    "Team",
    ...stats.map((stat) => `stat:${stat}`),
    "Opp",
    "Result",
    "Season",
    "Type",
  ]);

  const rows = feats.map((p) => {
    const result = `${p.diff === 0 ? "T" : p.won ? "W" : "L"} ${p.score}`;

    return {
      key: p.fid,
      data: [
        <PlayerNameLabels
          pid={p.pid}
          season={typeof season === "number" ? season : undefined}
        >
          {p.name}
        </PlayerNameLabels>,
        p.pos,
        <a
          href={helpers.leagueUrl(["roster", `${p.abbrev}_${p.tid}`, p.season])}
        >
          {p.abbrev}
        </a>,
        ...stats.map((stat) => helpers.roundStat(p.stats[stat], stat, true)),
        <a
          href={helpers.leagueUrl([
            "roster",
            `${p.oppAbbrev}_${p.oppTid}`,
            p.season,
          ])}
        >
          {p.oppAbbrev}
        </a>,
        {
          value: (
            <a
              href={helpers.leagueUrl([
                "game_log",
                p.abbrev === undefined ? "special" : `${p.abbrev}_${p.tid}`,
                p.season,
                p.gid,
              ])}
            >
              {result}
            </a>
          ),
          sortValue: p.diff,
          searchValue: result,
        },
        p.season,
        p.type,
      ],
      classNames: {
        "table-info": p.tid === userTid,
      },
    };
  });

  const superCols = undefined;

  const scaleMinimum = (amount: number) => {
    return Math.ceil(amount * quarterLengthFactor);
  };

  const scaleSpecial = (name: string, description: string, amount: number) => {
    const scaledAmount = scaleMinimum(amount);
    if (scaledAmount === amount) {
      return name;
    }

    return `scaled ${name} (${scaledAmount}+ ${description})`;
  };

  return (
    <>
      <p>
        This lists all games where a player got a{" "}
        {scaleSpecial("triple double", "in 3 stats", 10)}, a{" "}
        {scaleSpecial("5x5", "pts/reb/ast/stl/blk", 5)}, {scaleMinimum(50)}{" "}
        points, {scaleMinimum(25)} rebounds, {scaleMinimum(20)} assists,{" "}
        {scaleMinimum(10)} steals, {scaleMinimum(10)} blocks, or{" "}
        {scaleMinimum(10)} threes
        {quarterLengthFactor !== 1
          ? " (cutoffs are scaled due to a non-default period length)"
          : null}
        . Statistical feats from your players are{" "}
        <span className="text-info">highlighted in blue</span>.
      </p>

      <DataTable
        cols={cols}
        defaultSort={[23, "desc"]}
        name="PlayerFeats"
        rows={rows}
        superCols={superCols}
        pagination
      />
    </>
  );
};

PlayerFeats.propTypes = {
  abbrev: PropTypes.string.isRequired,
  feats: PropTypes.arrayOf(PropTypes.object).isRequired,
  season: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  stats: PropTypes.arrayOf(PropTypes.string).isRequired,
  userTid: PropTypes.number.isRequired,
};

export default PlayerFeats;
