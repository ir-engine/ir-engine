import * as THREE from 'three';
import { round } from "./round";

export function roundVector(vector: THREE.Vector3, decimals = 0): THREE.Vector3 {
	return new THREE.Vector3(
		round(vector.x, decimals),
		round(vector.y, decimals),
		round(vector.z, decimals));
}
