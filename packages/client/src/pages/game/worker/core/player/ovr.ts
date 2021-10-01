import ovrBasketball from "./ovr.basketball";
import type { MinimalPlayerRatings } from "../../../common/types";

const ovr = (ratings: MinimalPlayerRatings, pos?: string) => {
	return ovrBasketball(ratings as any);
};

export default ovr;
