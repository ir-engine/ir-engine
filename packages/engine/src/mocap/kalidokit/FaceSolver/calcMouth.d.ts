import { Results } from "../Types";
/**
 * Calculate Mouth Shape
 * @param {Array} lm : array of results from tfjs or mediapipe
 */
export declare const calcMouth: (lm: Results) => {
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
