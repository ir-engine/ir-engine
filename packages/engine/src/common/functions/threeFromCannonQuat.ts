import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export function threeFromCannonQuat(quat: CANNON.Quaternion): THREE.Quaternion {
	return new THREE.Quaternion(quat.x, quat.y, quat.z, quat.w);
}
