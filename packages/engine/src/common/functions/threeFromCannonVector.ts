import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export function threeFromCannonVector(vec: CANNON.Vec3): THREE.Vector3 {
	return new THREE.Vector3(vec.x, vec.y, vec.z);
}
