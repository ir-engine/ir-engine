import * as THREE from 'three';
/**
 * Finds an angle between two vectors with a sign relative to normal vector.
 * @param v1 First Vector.
 * @param v2 Second Vector.
 * @param normal Normal Vector.
 * @param dotTreshold
 *
 * @returns Angle between two vectors.
 */
export declare function getSignedAngleBetweenVectors(v1: THREE.Vector3, v2: THREE.Vector3, normal?: THREE.Vector3, dotTreshold?: number): number;
