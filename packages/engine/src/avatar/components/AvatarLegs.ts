import { Quaternion, Vector3, Euler, Matrix4 } from 'three';
import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
import { LeftLeg } from './LeftLeg';
import { Leg } from './Leg';
import { RightLeg } from './RightLeg';

export const zeroVector = new Vector3();
export const downHalfRotation = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI/2);
export const localVector = new Vector3();
export const localVector2 = new Vector3();
export const localVector4 = new Vector3();
export const localVector5 = new Vector3();
export const localVector6 = new Vector3();
export const localQuaternion2 = new Quaternion();
export const localMatrix = new Matrix4();

/**
 * 
 * @author Avaer Kazmer
 */
export class AvatarLegs extends Component<AvatarLegs> {
  hips: any;
  leftLeg: LeftLeg;
  rightLeg: RightLeg;
  rig: any;
  poseManager: any;
  legSeparation: number;
  lastHmdPosition: Vector3;
  hmdVelocity: Vector3;
  enabled: boolean;
  lastEnabled: boolean;
}

AvatarLegs._schema = {
	hips: { type: Types.Ref, default: null },
	leftLeg: { type: Types.Ref, default: null },
	rightLeg: { type: Types.Ref, default: null },
	rig: { type: Types.Ref, default: null },
	poseManager: { type: Types.Ref, default: null },
	legSeparation: { type: Types.Number, default: 0 },
	lastHmdPosition: { type: Types.Vector3Type, default: new Vector3(0,0,0) },
	hmdVelocity: { type: Types.Vector3Type, default: new Vector3(0,0,0) },
	enabled: { type: Types.Boolean, default: false },
	lastEnabled: { type: Types.Boolean, default: false }
}
