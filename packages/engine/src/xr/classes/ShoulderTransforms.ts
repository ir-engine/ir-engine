import { Object3D } from 'three';
import ArmTransforms from '../classes/ArmTransforms';
import ShoulderPoser from './ShoulderPoser';
import XRArmIK from './XRArmIK';

class ShoulderTransforms {
  transform: Object3D;
  hips: Object3D;
  spine: Object3D;
  neck: Object3D;
  head: Object3D;
  eyes: Object3D;
  leftShoulderAnchor: Object3D;
  rightShoulderAnchor: Object3D;
  leftArm: ArmTransforms;
  rightArm: ArmTransforms;
  prone: boolean;
  proneFactor: number;
  lastStandTimestamp: number;
  lastProneTimestamp: number;
  shoulderPoser: ShoulderPoser;
  leftArmIk: XRArmIK;
  rightArmIk: XRArmIK;
  handsEnabled: boolean[];
  enabled: boolean;
  constructor(rig) {
    this.transform = new Object3D();
    this.hips = new Object3D();
    this.spine = new Object3D();
    this.neck = new Object3D();
    this.head = new Object3D();
    this.eyes = new Object3D();

    this.hips.add(this.spine);
    this.spine.add(this.transform);
    this.transform.add(this.neck);
    this.neck.add(this.head);
    this.head.add(this.eyes);

    this.leftShoulderAnchor = new Object3D();
    this.transform.add(this.leftShoulderAnchor);
    this.rightShoulderAnchor = new Object3D();
    this.transform.add(this.rightShoulderAnchor);

    this.leftArm = new ArmTransforms();
    this.rightArm = new ArmTransforms();

    this.leftShoulderAnchor.add(this.leftArm.transform);
    this.rightShoulderAnchor.add(this.rightArm.transform);

    this.prone = false;
    this.proneFactor = 0;
    const now = Date.now();
    this.lastStandTimestamp = now;
    this.lastProneTimestamp = now;

    this.shoulderPoser = new ShoulderPoser(rig, this);

    this.leftArmIk = new XRArmIK(this.leftArm, this, this.shoulderPoser, this.shoulderPoser.vrTransforms.leftHand, true);
    this.rightArmIk = new XRArmIK(this.rightArm, this, this.shoulderPoser, this.shoulderPoser.vrTransforms.rightHand, false);

    this.handsEnabled = [true, true];
    this.enabled = true;
  }

  Start() {
    this.leftArmIk.Start();
    this.rightArmIk.Start();
  }

  Update() {
  	if (this.enabled) {
	    this.shoulderPoser.Update();
	    this.handsEnabled[0] && this.leftArmIk.Update();
	    this.handsEnabled[1] && this.rightArmIk.Update();
	  }
  }
}

export default ShoulderTransforms;