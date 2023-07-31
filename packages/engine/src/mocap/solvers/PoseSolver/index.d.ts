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
                l: import("..").Vector;
                r: import("..").Vector;
            };
            LowerArm: {
                l: import("..").Vector;
                r: import("..").Vector;
            };
            Hand: {
                l: import("..").Vector;
                r: import("..").Vector;
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
