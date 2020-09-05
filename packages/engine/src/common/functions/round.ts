export function round(value: number, decimals: number = 0): number {
	return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
