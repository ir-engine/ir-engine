/**
 * Returns a clamped value between min and max values
 * @param {Number} val : transformed value
 * @param {Number} min : minimum value
 * @param {Number} max : maximum value
 */
export declare const clamp: (val: number, min: number, max: number) => number;
/**
 * Returns a remapped value between 0 and 1 using min and max values
 * @param {Number} value : transformed value
 * @param {Number} min : minimum value
 * @param {Number} max : maximum value
 */
export declare const remap: (val: number, min: number, max: number) => number;
/** A set of default pose values in radians to serve as "rest" values */
export declare const RestingDefault: {
    Face: {
        eye: {
            l: number;
            r: number;
        };
        mouth: {
            x: number;
            y: number;
            shape: {
                A: number;
                E: number;
                I: number;
                O: number;
                U: number;
            };
        };
        head: {
            x: number;
            y: number;
            z: number;
            width: number;
            height: number;
            position: {
                x: number;
                y: number;
                z: number;
            };
        };
        brow: number;
        pupil: {
            x: number;
            y: number;
        };
    };
    Pose: {
        RightUpperArm: {
            x: number;
            y: number;
            z: number;
        };
        LeftUpperArm: {
            x: number;
            y: number;
            z: number;
        };
        RightLowerArm: {
            x: number;
            y: number;
            z: number;
        };
        LeftLowerArm: {
            x: number;
            y: number;
            z: number;
        };
        LeftUpperLeg: {
            x: number;
            y: number;
            z: number;
        };
        RightUpperLeg: {
            x: number;
            y: number;
            z: number;
        };
        RightLowerLeg: {
            x: number;
            y: number;
            z: number;
        };
        LeftLowerLeg: {
            x: number;
            y: number;
            z: number;
        };
        LeftHand: {
            x: number;
            y: number;
            z: number;
        };
        RightHand: {
            x: number;
            y: number;
            z: number;
        };
        Spine: {
            x: number;
            y: number;
            z: number;
        };
        Hips: {
            position: {
                x: number;
                y: number;
                z: number;
            };
            rotation: {
                x: number;
                y: number;
                z: number;
            };
        };
    };
    RightHand: {
        RightWrist: {
            x: number;
            y: number;
            z: number;
        };
        RightRingProximal: {
            x: number;
            y: number;
            z: number;
        };
        RightRingIntermediate: {
            x: number;
            y: number;
            z: number;
        };
        RightRingDistal: {
            x: number;
            y: number;
            z: number;
        };
        RightIndexProximal: {
            x: number;
            y: number;
            z: number;
        };
        RightIndexIntermediate: {
            x: number;
            y: number;
            z: number;
        };
        RightIndexDistal: {
            x: number;
            y: number;
            z: number;
        };
        RightMiddleProximal: {
            x: number;
            y: number;
            z: number;
        };
        RightMiddleIntermediate: {
            x: number;
            y: number;
            z: number;
        };
        RightMiddleDistal: {
            x: number;
            y: number;
            z: number;
        };
        RightThumbProximal: {
            x: number;
            y: number;
            z: number;
        };
        RightThumbIntermediate: {
            x: number;
            y: number;
            z: number;
        };
        RightThumbDistal: {
            x: number;
            y: number;
            z: number;
        };
        RightLittleProximal: {
            x: number;
            y: number;
            z: number;
        };
        RightLittleIntermediate: {
            x: number;
            y: number;
            z: number;
        };
        RightLittleDistal: {
            x: number;
            y: number;
            z: number;
        };
    };
    LeftHand: {
        LeftWrist: {
            x: number;
            y: number;
            z: number;
        };
        LeftRingProximal: {
            x: number;
            y: number;
            z: number;
        };
        LeftRingIntermediate: {
            x: number;
            y: number;
            z: number;
        };
        LeftRingDistal: {
            x: number;
            y: number;
            z: number;
        };
        LeftIndexProximal: {
            x: number;
            y: number;
            z: number;
        };
        LeftIndexIntermediate: {
            x: number;
            y: number;
            z: number;
        };
        LeftIndexDistal: {
            x: number;
            y: number;
            z: number;
        };
        LeftMiddleProximal: {
            x: number;
            y: number;
            z: number;
        };
        LeftMiddleIntermediate: {
            x: number;
            y: number;
            z: number;
        };
        LeftMiddleDistal: {
            x: number;
            y: number;
            z: number;
        };
        LeftThumbProximal: {
            x: number;
            y: number;
            z: number;
        };
        LeftThumbIntermediate: {
            x: number;
            y: number;
            z: number;
        };
        LeftThumbDistal: {
            x: number;
            y: number;
            z: number;
        };
        LeftLittleProximal: {
            x: number;
            y: number;
            z: number;
        };
        LeftLittleIntermediate: {
            x: number;
            y: number;
            z: number;
        };
        LeftLittleDistal: {
            x: number;
            y: number;
            z: number;
        };
    };
};
