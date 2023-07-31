/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/


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
