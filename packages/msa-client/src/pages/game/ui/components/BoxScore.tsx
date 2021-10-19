import BoxScoreBasketball from "./BoxScore.basketball";

const BoxScore = (props: {
	boxScore: any;
	injuredToBottom?: boolean;
	Row: any;
	forceRowUpdate: boolean;
}) => {
	return BoxScoreBasketball(props);
};

export default BoxScore;
