import posBasketball from "./pos.basketball";
import type { MinimalPlayerRatings } from "../../../common/types";

const pos = (ratings: MinimalPlayerRatings) => {
	return posBasketball(ratings as any);
};

export default pos;
