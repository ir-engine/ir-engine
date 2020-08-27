import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export function cannonFromThreeVector(vec: THREE.Vector3): CANNON.Vec3 {
	return new CANNON.Vec3(vec.x, vec.y, vec.z);
}
