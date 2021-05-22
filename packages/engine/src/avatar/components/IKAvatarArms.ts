import { Object3D } from 'three';
import { Component } from '../../ecs/classes/Component';
import IKArmLeft from './IKArmLeft';
import IKArmRight from './IKArmRight';

/**
 * 
 * @author Avaer Kazmer
 */
class IKAvatarArms extends Component<IKAvatarArms> {
  transform: Object3D;
  hips: Object3D;
  spine: Object3D;
  neck: Object3D;
  head: Object3D;
  eyes: Object3D;
  leftShoulderAnchor: Object3D;
  rightShoulderAnchor: Object3D;
  leftArm: IKArmLeft;
  rightArm: IKArmRight;

  rig: any;
  shoulder: any;
  poseManager: any;

	// Tracking references
	trackedHead: any;
	leftHand: any;
	rightHand: any;
	floorHeight: number;

	referencePlayerHeightHmd: number;
	referencePlayerWidthWrist: number;
	playerHeightHmd: number;
	playerWidthWrist: number;
}

export default IKAvatarArms;