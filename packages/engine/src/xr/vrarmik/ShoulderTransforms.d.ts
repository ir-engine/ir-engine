import { Object3D } from "three";
import { ArmTransforms } from "./ArmTransforms";
import ShoulderPoser from "./ShoulderPoser";
declare class ShoulderTransforms {
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
    leftArmIk: any;
    rightArmIk: any;
    constructor(rig: any);
    Start(): void;
    Update(): void;
}
export default ShoulderTransforms;
