import Vector from "../utils/vector";
import { Results, XYZ, Side } from "../Types";
/**
 * Calculate eye open ratios and remap to 0-1
 * @param {Array} lm : array of results from tfjs or mediapipe
 * @param {Side} side : designate left or right
 * @param {Number} high : ratio at which eye is considered open
 * @param {Number} low : ratio at which eye is comsidered closed
 */
export declare const getEyeOpen: (lm: Results, side?: Side, { high, low }?: {
    high?: number | undefined;
    low?: number | undefined;
}) => {
    norm: number;
    raw: number;
};
/**
 * Calculate eyelid distance ratios based on landmarks on the face
 */
export declare const eyeLidRatio: (eyeOuterCorner: XYZ | Vector | number[], eyeInnerCorner: XYZ | Vector | number[], eyeOuterUpperLid: XYZ | Vector | number[], eyeMidUpperLid: XYZ | Vector | number[], eyeInnerUpperLid: XYZ | Vector | number[], eyeOuterLowerLid: XYZ | Vector | number[], eyeMidLowerLid: XYZ | Vector | number[], eyeInnerLowerLid: XYZ | Vector | number[]) => number;
/**
 * Calculate pupil position [-1,1]
 * @param {Results} lm : array of results from tfjs or mediapipe
 * @param {Side} side : left or right
 */
export declare const pupilPos: (lm: Results, side?: Side) => {
    x: number;
    y: number;
};
/**
 * Method to stabilize blink speeds to fix inconsistent eye open/close timing
 * @param {Object} eye : object with left and right eye values
 * @param {Number} headY : head y axis rotation in radians
 * @param {Object} options: Options for blink stabilization
 */
export declare const stabilizeBlink: (eye: Record<"r" | "l", number>, headY: number, { enableWink, maxRot, }?: {
    /**
     * Enable wink detection
     * @default true
     * @type {Boolean}
     */
    enableWink?: boolean | undefined;
    /**
     * Maximum rotation of head to trigger wink
     * @default 0.5
     * @type {Number}
     */
    maxRot?: number | undefined;
}) => {
    l: number;
    r: number;
};
/**
 * Calculate Eyes
 * @param {Array} lm : array of results from tfjs or mediapipe
 */
export declare const calcEyes: (lm: Results, { high, low, }?: {
    /**
     * Upper bound for eye open ratio
     * @default 0.85
     * @type {Number}
     */
    high?: number | undefined;
    /**
     * Lower bound for eye open ratio
     * @default 0.55
     * @type {Number}
     **/
    low?: number | undefined;
}) => {
    l: number;
    r: number;
};
/**
 * Calculate pupil location normalized to eye bounds
 * @param {Array} lm : array of results from tfjs or mediapipe
 */
export declare const calcPupils: (lm: Results) => {
    x: number;
    y: number;
};
/**
 * Calculate brow raise
 * @param {Results} lm : array of results from tfjs or mediapipe
 * @param {Side} side : designate left or right
 */
export declare const getBrowRaise: (lm: Results, side?: Side) => number;
/**
 * Take the average of left and right eyebrow raise values
 * @param {Array} lm : array of results from tfjs or mediapipe
 */
export declare const calcBrow: (lm: Results) => number;
