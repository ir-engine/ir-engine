import madeHofBasketball from "./madeHof.basketball";
import type {
	Player,
	MinimalPlayerRatings,
	PlayerWithoutKey,
} from "../../../common/types";

const madeHof = (
	p: Player<MinimalPlayerRatings> | PlayerWithoutKey<MinimalPlayerRatings>,
): boolean => {
	return madeHofBasketball(p);
};

export default madeHof;
