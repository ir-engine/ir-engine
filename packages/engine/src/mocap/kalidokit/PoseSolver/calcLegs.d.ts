import Vector from "../utils/vector";
import Euler from "../utils/euler";
import { Results, Side } from "../Types";
export declare const offsets: {
    upperLeg: {
        z: number;
    };
};
/**
 * Calculates leg rotation angles
 * @param {Results} lm : array of 3D pose vectors from tfjs or mediapipe
 */
export declare const calcLegs: (lm: Results) => {
    UpperLeg: {
        r: Euler;
        l: Euler;
    };
    LowerLeg: {
        r: Euler;
        l: Euler;
    };
    Unscaled: {
        UpperLeg: {
            r: Vector;
            l: Vector;
        };
        LowerLeg: {
            r: Vector;
            l: Vector;
        };
    };
};
/**
 * Converts normalized rotation values into radians clamped by human limits
 * @param {Object} UpperLeg : normalized rotation values
 * @param {Object} LowerLeg : normalized rotation values
 * @param {Side} side : left or right
 */
export declare const rigLeg: (UpperLeg: Vector, LowerLeg: Vector, side?: Side) => {
    UpperLeg: Euler;
    LowerLeg: Euler;
};
