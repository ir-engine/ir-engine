import doAwardsBasketball from "./doAwards.basketball";
import type { Conditions } from "../../../common/types";

const doAwards = (conditions: Conditions) => {
	return doAwardsBasketball(conditions);
};

export default doAwards;
