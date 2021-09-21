import limitRating from "./limitRating";

const heightToRating = (heightInInches: number) => {
	const minHgt = 66; // 5'6"

	const maxHgt = 93; // 7'9"

	return limitRating((100 * (heightInInches - minHgt)) / (maxHgt - minHgt));
};

export default heightToRating;
