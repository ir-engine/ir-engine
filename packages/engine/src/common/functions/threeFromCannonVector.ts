import { Vector3 } from 'three';
import { Vec3 } from 'cannon-es';

export function threeFromCannonVector(vec: Vec3): Vector3 {
	return new Vector3(vec.x, vec.y, vec.z);
}
