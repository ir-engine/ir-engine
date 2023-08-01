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
import { clamp, remap } from "../utils/helpers";
import { PI } from "./../constants";

import MediapipePoseNames from './../../MediapipePoseNames'

/**
 * Calculates Hip rotation and world position
 * @param {Array} lm3d : array of 3D pose vectors from tfjs or mediapipe
 * @param {Array} lm2d : array of 2D pose vectors from tfjs or mediapipe
 */
export const calcHips = (lm3d, lm2d) => {
    //Find 2D normalized Hip and Shoulder Joint Positions/Distances
    const hipLeft2d = Vector.fromArray(lm2d[MediapipePoseNames.indexOf('left hip')]);
    const hipRight2d = Vector.fromArray(lm2d[MediapipePoseNames.indexOf('right hip')]);
    const shoulderLeft2d = Vector.fromArray(lm2d[MediapipePoseNames.indexOf('left shoulder')]);
    const shoulderRight2d = Vector.fromArray(lm2d[MediapipePoseNames.indexOf('right shoulder')]);
    const hipCenter2d = hipLeft2d.lerp(hipRight2d, 0.5);
    const shoulderCenter2d = shoulderLeft2d.lerp(shoulderRight2d, 0.5);
    const spineLength = hipCenter2d.distance(shoulderCenter2d);
    const hips = {
        position: {
            x: clamp(hipCenter2d.x - 0.4, -1, 1),
            y: 0,
            z: clamp(spineLength - 1, -2, 0),
        },
    };
    hips.worldPosition = {
        x: hips.position.x,
        y: 0,
        z: hips.position.z * Math.pow(hips.position.z * -2, 2),
    };
    hips.worldPosition.x *= hips.worldPosition.z;
    hips.rotation = Vector.rollPitchYaw(lm3d[MediapipePoseNames.indexOf('left hip')], lm3d[MediapipePoseNames.indexOf('right hip')]);
    //fix -PI, PI jumping
    if (hips.rotation.y > 0.5) {
        hips.rotation.y -= 2;
    }
    hips.rotation.y += 0.5;
    //Stop jumping between left and right shoulder tilt
    if (hips.rotation.z > 0) {
        hips.rotation.z = 1 - hips.rotation.z;
    }
    if (hips.rotation.z < 0) {
        hips.rotation.z = -1 - hips.rotation.z;
    }
    const turnAroundAmountHips = remap(Math.abs(hips.rotation.y), 0.2, 0.4);
    hips.rotation.z *= 1 - turnAroundAmountHips;
    hips.rotation.x = 0; //temp fix for inaccurate X axis
    const spine = Vector.rollPitchYaw(lm3d[MediapipePoseNames.indexOf('left shoulder')], lm3d[MediapipePoseNames.indexOf('right shoulder')]);
    //fix -PI, PI jumping
    if (spine.y > 0.5) {
        spine.y -= 2;
    }
    spine.y += 0.5;
    //Stop jumping between left and right shoulder tilt
    if (spine.z > 0) {
        spine.z = 1 - spine.z;
    }
    if (spine.z < 0) {
        spine.z = -1 - spine.z;
    }
    //fix weird large numbers when 2 shoulder points get too close
    const turnAroundAmount = remap(Math.abs(spine.y), 0.2, 0.4);
    spine.z *= 1 - turnAroundAmount;
    spine.x = 0; //temp fix for inaccurate X axis
    return rigHips(hips, spine);
};
/**
 * Converts normalized rotations to radians and estimates world position of hips
 * @param {Object} hips : hip position and rotation values
 * @param {Object} spine : spine position and rotation values
 */
export const rigHips = (hips, spine) => {
    //convert normalized values to radians
    if (hips.rotation) {
        hips.rotation.x *= Math.PI;
        hips.rotation.y *= Math.PI;
        hips.rotation.z *= Math.PI;
    }
    spine.x *= PI;
    spine.y *= PI;
    spine.z *= PI;
    return {
        Hips: hips,
        Spine: spine,
    };
};
