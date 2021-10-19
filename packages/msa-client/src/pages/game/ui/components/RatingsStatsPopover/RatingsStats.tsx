import RatingsStatsBasketball from "./RatingsStats.basketball";
import { useLocal } from "../../util";

const RatingsStats = (props: {
	ratings: any;
	stats: any;
	type?: "career" | "current" | "draft" | number;
}) => {
	const challengeNoRatings = useLocal(state => state.challengeNoRatings);

	return RatingsStatsBasketball({
			...props,
			challengeNoRatings,
		});
};

export default RatingsStats;
