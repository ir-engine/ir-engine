
export function easeInOutSine(x: number): number {
	return -(Math.cos(Math.PI * x) - 1) / 2;
}
