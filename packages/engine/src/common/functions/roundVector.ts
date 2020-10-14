import { Vector3 } from "three";
import { round } from "./round";

export function roundVector(vector: Vector3, decimals = 0): Vector3 {
	return new Vector3(
		round(vector.x, decimals),
		round(vector.y, decimals),
		round(vector.z, decimals));
}
