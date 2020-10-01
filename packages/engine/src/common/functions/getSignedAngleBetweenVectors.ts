import * as THREE from 'three';
import { getAngleBetweenVectors } from './getAngleBetweenVectors';
/**
 * Finds an angle between two vectors with a sign relative to normal vector
 */

export function getSignedAngleBetweenVectors(v1: THREE.Vector3, v2: THREE.Vector3, normal: THREE.Vector3 = new THREE.Vector3(0, 1, 0), dotTreshold = 0.0005): number {
	let angle = getAngleBetweenVectors(v1, v2, dotTreshold);

	// Get vector pointing up or down
	const cross = new THREE.Vector3().crossVectors(v1, v2);
	// Compare cross with normal to find out direction
	if (normal.dot(cross) < 0) {
		angle = -angle;
	}

	return angle;
}
