import { Object3D } from 'three';
import { Component } from '../../ecs/classes/Component';
import ShoulderPoser from '../classes/ShoulderPoser';
import XRArmIK from './XRArmIK';
import RightArm from './RightArm';
import LeftArm from './LeftArm';

/**
 * 
 * @author Avaer Kazmer
 */
class AvatarShoulders extends Component<AvatarShoulders> {
  transform: Object3D;
  hips: Object3D;
  spine: Object3D;
  neck: Object3D;
  head: Object3D;
  eyes: Object3D;
  leftShoulderAnchor: Object3D;
  rightShoulderAnchor: Object3D;
  leftArm: LeftArm;
  rightArm: RightArm;
  shoulderPoser: ShoulderPoser;
  leftArmIk: XRArmIK;
  rightArmIk: XRArmIK;

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

export default AvatarShoulders;