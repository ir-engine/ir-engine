import { Quaternion } from 'three';
import { Quaternion as CANNONQuaternion } from 'cannon-es';

export function cannonFromThreeQuat(quat: Quaternion): CANNONQuaternion {
	return new CANNONQuaternion(quat.x, quat.y, quat.z, quat.w);
}
