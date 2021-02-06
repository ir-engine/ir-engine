declare class ShoulderPoser {
    rig: any;
    shoulder: any;
    poseManager: any;
    vrTransforms: any;
    constructor(rig: any, shoulder: any);
    Update(): void;
    updateHips(): void;
    updateNeck(): void;
    rotateShoulderBase(): void;
    getCombinedDirectionAngleUp(): number;
    getProneFactor(): number;
}
export default ShoulderPoser;
