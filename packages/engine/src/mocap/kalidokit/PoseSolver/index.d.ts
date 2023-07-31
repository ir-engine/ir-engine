import { TFVectorPose, IPoseSolveOptions, TPose } from "../Types";
/** Class representing pose solver. */
export declare class PoseSolver {
    /** expose arm rotation calculator as a static method */
    static calcArms: (lm: import("../Types").Results) => {
        UpperArm: {
            r: import("..").Vector;
            l: import("..").Vector;
        };
        LowerArm: {
            r: import("..").Vector;
            l: import("..").Vector;
        };
        Hand: {
            r: import("..").Vector;
            l: import("..").Vector;
        };
        Unscaled: {
            UpperArm: {
                r: import("..").Vector;
                l: import("..").Vector;
            };
            LowerArm: {
                r: import("..").Vector;
                l: import("..").Vector;
            };
            Hand: {
                r: import("..").Vector;
                l: import("..").Vector;
            };
        };
    };
    /** expose hips position and rotation calculator as a static method */
    static calcHips: (lm3d: TFVectorPose, lm2d: Omit<TFVectorPose, "z">) => {
        Hips: import("../Types").IHips;
        Spine: import("../Types").XYZ;
    };
    /** expose leg rotation calculator as a static method */
    static calcLegs: (lm: import("../Types").Results) => {
        UpperLeg: {
            r: import("../utils/euler").default;
            l: import("../utils/euler").default;
        };
        LowerLeg: {
            r: import("../utils/euler").default;
            l: import("../utils/euler").default;
        };
        Unscaled: {
            UpperLeg: {
                r: import("..").Vector;
                l: import("..").Vector;
            };
            LowerLeg: {
                r: import("..").Vector;
                l: import("..").Vector;
            };
        };
    };
    /**
     * Combines arm, hips, and leg calcs into one method
     * @param {Array} lm3d : array of 3D pose vectors from tfjs or mediapipe
     * @param {Array} lm2d : array of 2D pose vectors from tfjs or mediapipe
     * @param {String} runtime: set as either "tfjs" or "mediapipe"
     * @param {IPoseSolveOptions} options: options object
     */
    static solve(lm3d: TFVectorPose, lm2d: Omit<TFVectorPose, "z">, { runtime, video, imageSize, enableLegs }?: Partial<IPoseSolveOptions>): TPose | undefined;
}
