import { Vector3 } from 'three';
import { Vec3 } from 'cannon-es';

export function cannonFromThreeVector(vec: Vector3): Vec3 {
	return new Vec3(vec.x, vec.y, vec.z);
}
