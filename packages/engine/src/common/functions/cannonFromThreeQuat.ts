import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export function cannonFromThreeQuat(quat: THREE.Quaternion): CANNON.Quaternion {
	return new CANNON.Quaternion(quat.x, quat.y, quat.z, quat.w);
}
