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
import { clamp } from "../utils/helpers";
import { RIGHT, LEFT } from "./../constants";
import { PI } from "./../constants";
export const offsets = {
    upperLeg: {
        z: 0.1,
    },
};

import MediapipePoseNames from './../../MediapipePoseNames'

/**
 * Calculates leg rotation angles
 * @param {Results} lm : array of 3D pose vectors from tfjs or mediapipe
 */
export const calcLegs = (lm) => {
    const rightUpperLegSphericalCoords = Vector.getSphericalCoords(lm[MediapipePoseNames.indexOf('left hip')], lm[MediapipePoseNames.indexOf('left knee')], { x: "y", y: "z", z: "x" });
    const leftUpperLegSphericalCoords = Vector.getSphericalCoords(lm[MediapipePoseNames.indexOf('right hip')], lm[MediapipePoseNames.indexOf('right knee')], { x: "y", y: "z", z: "x" });
    const rightLowerLegSphericalCoords = Vector.getRelativeSphericalCoords(lm[MediapipePoseNames.indexOf('left hip')], lm[MediapipePoseNames.indexOf('left knee')], lm[MediapipePoseNames.indexOf('left ankle')], {
        x: "y",
        y: "z",
        z: "x",
    });
    const leftLowerLegSphericalCoords = Vector.getRelativeSphericalCoords(lm[MediapipePoseNames.indexOf('right hip')], lm[MediapipePoseNames.indexOf('right knee')], lm[MediapipePoseNames.indexOf('right ankle')], {
        x: "y",
        y: "z",
        z: "x",
    });
    const hipRotation = Vector.findRotation(lm[MediapipePoseNames.indexOf('left hip')], lm[MediapipePoseNames.indexOf('right hip')]);
    const UpperLeg = {
        r: new Vector({
            x: rightUpperLegSphericalCoords.theta,
            y: rightLowerLegSphericalCoords.phi,
            z: rightUpperLegSphericalCoords.phi - hipRotation.z,
        }),
        l: new Vector({
            x: leftUpperLegSphericalCoords.theta,
            y: leftLowerLegSphericalCoords.phi,
            z: leftUpperLegSphericalCoords.phi - hipRotation.z,
        }),
    };
    const LowerLeg = {
        r: new Vector({
            x: -Math.abs(rightLowerLegSphericalCoords.theta),
            y: 0,
            z: 0, // not relevant
        }),
        l: new Vector({
            x: -Math.abs(leftLowerLegSphericalCoords.theta),
            y: 0,
            z: 0, // not relevant
        }),
    };
    //Modify Rotations slightly for more natural movement
    const rightLegRig = rigLeg(UpperLeg.r, LowerLeg.r, RIGHT);
    const leftLegRig = rigLeg(UpperLeg.l, LowerLeg.l, LEFT);
    return {
        //Scaled
        UpperLeg: {
            r: rightLegRig.UpperLeg,
            l: leftLegRig.UpperLeg,
        },
        LowerLeg: {
            r: rightLegRig.LowerLeg,
            l: leftLegRig.LowerLeg,
        },
        //Unscaled
        Unscaled: {
            UpperLeg,
            LowerLeg,
        },
    };
};
/**
 * Converts normalized rotation values into radians clamped by human limits
 * @param {Object} UpperLeg : normalized rotation values
 * @param {Object} LowerLeg : normalized rotation values
 * @param {Side} side : left or right
 */
export const rigLeg = (UpperLeg, LowerLeg, side = RIGHT) => {
    const invert = side === RIGHT ? 1 : -1;
    const rigedUpperLeg = new Euler({
        x: clamp(UpperLeg.x, 0, 0.5) * PI,
        y: clamp(UpperLeg.y, -0.25, 0.25) * PI,
        z: clamp(UpperLeg.z, -0.5, 0.5) * PI + invert * offsets.upperLeg.z,
        rotationOrder: "XYZ",
    });
    const rigedLowerLeg = new Euler({
        x: LowerLeg.x * PI,
        y: LowerLeg.y * PI,
        z: LowerLeg.z * PI,
    });
    return {
        UpperLeg: rigedUpperLeg,
        LowerLeg: rigedLowerLeg,
    };
};
