import PropTypes from "prop-types";
import { POSITION_COUNTS } from "../../common";

type Players = {
  ratings: {
    pos: string;
  };
}[];

const PositionFraction = ({
  players,
  pos,
}: {
  players: Players;
  pos: string;
}) => {
  const count = players.filter((p) => p.ratings.pos === pos).length;
  const target = POSITION_COUNTS[pos];
  const ratio = count / target;

  let classes: string | undefined;
  if (count === 0 || ratio < 2 / 3) {
    classes = "text-danger";
  }

  return (
    <span className={classes}>
      {pos}: {count}/{target}
    </span>
  );
};
PositionFraction.propTypes = {
  players: PropTypes.arrayOf(PropTypes.object).isRequired,
  pos: PropTypes.string.isRequired,
};

const RosterComposition = ({
  className = "",
  players,
}: {
  className?: string;
  players: Players;
}) => {
  return null;
};
RosterComposition.propTypes = {
  className: PropTypes.string,
  players: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default RosterComposition;
