import { Vector3 } from 'three';
/**
 * Finds an angle between two vectors
 * @param {Vector3} v1
 * @param {Vector3} v2
 */

export function getAngleBetweenVectors(v1: Vector3, v2: Vector3, dotTreshold = 0.0005): number {
	let angle: number;
	const dot = v1.dot(v2);

	// If dot is close to 1, we'll round angle to zero
	if (dot > 1 - dotTreshold) {
		angle = 0;
	}
	else {
		// Dot too close to -1
		if (dot < -1 + dotTreshold) {
			angle = Math.PI;
		}
		else {
			// Get angle difference in radians
			angle = Math.acos(dot);
		}
	}

	return angle;
}
