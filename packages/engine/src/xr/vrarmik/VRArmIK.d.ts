declare class VRArmIK {
    arm: any;
    shoulder: any;
    shoulderPoser: any;
    target: any;
    left: any;
    upperArmLength: number;
    lowerArmLength: number;
    armLength: number;
    constructor(arm: any, shoulder: any, shoulderPoser: any, target: any, left: any);
    Start(): void;
    Update(): void;
}
export default VRArmIK;
