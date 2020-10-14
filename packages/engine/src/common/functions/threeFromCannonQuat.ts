import { Quaternion as THREEQuaternion } from 'three';
import { Quaternion as CANNONQuaternion } from 'cannon-es';

export function threeFromCannonQuat(quat: CANNONQuaternion): THREEQuaternion {
	return new THREEQuaternion(quat.x, quat.y, quat.z, quat.w);
}
