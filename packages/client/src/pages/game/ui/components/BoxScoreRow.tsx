import type { MouseEvent } from "react";
import BoxScoreRowBasketball from "./BoxScoreRow.basketball";

const BoxScoreRow = (props: {
	className?: string;
	lastStarter?: boolean;
	liveGameInProgress?: boolean;
	onClick?: (event: MouseEvent) => void;
	p: any;
	stats?: string[];
}) => {
	return BoxScoreRowBasketball(props);
};

export default BoxScoreRow;
