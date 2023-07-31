import Vector from "../utils/vector";
import { Results, Side } from "../Types";
/**
 * Calculates arm rotation as euler angles
 * @param {Array} lm : array of 3D pose vectors from tfjs or mediapipe
 */
export declare const calcArms: (lm: Results) => {
    UpperArm: {
        r: Vector;
        l: Vector;
    };
    LowerArm: {
        r: Vector;
        l: Vector;
    };
    Hand: {
        r: Vector;
        l: Vector;
    };
    Unscaled: {
        UpperArm: {
            r: Vector;
            l: Vector;
        };
        LowerArm: {
            r: Vector;
            l: Vector;
        };
        Hand: {
            r: Vector;
            l: Vector;
        };
    };
};
/**
 * Converts normalized rotation values into radians clamped by human limits
 * @param {Object} UpperArm : normalized rotation values
 * @param {Object} LowerArm : normalized rotation values
 * @param {Object} Hand : normalized rotation values
 * @param {Side} side : left or right
 */
export declare const rigArm: (UpperArm: Vector, LowerArm: Vector, Hand: Vector, side?: Side) => {
    UpperArm: Vector;
    LowerArm: Vector;
    Hand: Vector;
};
