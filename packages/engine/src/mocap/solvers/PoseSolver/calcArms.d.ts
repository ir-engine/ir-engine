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
            l: Vector;
            r: Vector;
        };
        LowerArm: {
            l: Vector;
            r: Vector;
        };
        Hand: {
            l: Vector;
            r: Vector;
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
