import { Object3D, Vector3 } from "three";
declare class Leg {
    transform: Object3D;
    upperLeg: Object3D;
    lowerLeg: Object3D;
    foot: any;
    upperLegLength: number;
    lowerLegLength: number;
    legLength: number;
    eyesToUpperLegOffset: Vector3;
    legsManager: any;
    left: any;
    standing: boolean;
    standFactor: number;
    lastStandTimestamp: number;
    lastJumpTimestamp: number;
    stepping: boolean;
    lastStepTimestamp: number;
    balance: number;
    stepFactor: number;
    constructor(legsManager: any, left: any);
    Start(): void;
    Update(): void;
    getStandFactor(): number;
}
declare class LegsManager {
    hips: any;
    leftLeg: Leg;
    rightLeg: Leg;
    rig: any;
    poseManager: any;
    legSeparation: number;
    lastHmdPosition: Vector3;
    hmdVelocity: Vector3;
    constructor(rig: any);
    Start(): void;
    Update(): void;
}
export default LegsManager;
