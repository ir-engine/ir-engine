import { Results } from "../Types";
import Vector from "../utils/vector";
/**
 * Calculate stable plane (triangle) from 4 face landmarks
 * @param {Array} lm : array of results from tfjs or mediapipe
 */
export declare const createEulerPlane: (lm: Results) => {
    vector: Vector[];
    points: Vector[];
};
/**
 * Calculate roll, pitch, yaw, centerpoint, and rough dimentions of face plane
 * @param {Array} lm : array of results from tfjs or mediapipe
 */
export declare const calcHead: (lm: Results) => {
    y: number;
    x: number;
    z: number;
    width: number;
    height: number;
    position: Vector;
    normalized: {
        y: number;
        x: number;
        z: number;
    };
    degrees: {
        y: number;
        x: number;
        z: number;
    };
};
