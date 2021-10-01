import ovrBasketball from "./ovr.basketball";

// pos is used for position-specific rankings
// wholeRoster=true is used for computing team value of the whole roster, like for determining who to draft or sign
const ovr = (
	players: {
		value: number;
		ratings: {
			ovr: number;
			ovrs: Record<string, number> | undefined;
			pos: string;
		};
	}[],
	options: {
		pos?: string;
		rating?: string;
		wholeRoster?: boolean;
	} = {},
) => {
	return ovrBasketball(players, {
		rating: options.rating,
	});
};

export default ovr;
