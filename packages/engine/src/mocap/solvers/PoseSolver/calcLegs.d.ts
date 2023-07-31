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
