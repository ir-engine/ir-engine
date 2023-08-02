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
import { clamp } from "../utils/helpers";
import { RIGHT, LEFT } from "./../constants";
import { PI } from "./../constants";

import MediapipeHandNames from './../../MediapipeHandNames'

/** Class representing hand solver. */
export class HandSolver {
    /**
     * Calculates finger and wrist as euler rotations
     * @param {Array} lm : array of 3D hand vectors from tfjs or mediapipe
     * @param {Side} side: left or right
     */
    static solve(lm, side = RIGHT) {
        if (!lm) {
            console.error("Need Hand Landmarks");
            return;
        }
        const palm = [
            new Vector(lm[MediapipeHandNames.indexOf('WRIST')]),
            new Vector(lm[side === RIGHT ? MediapipeHandNames.indexOf('PINKY_MCP') : MediapipeHandNames.indexOf('INDEX_FINGER_MCP')]),
            new Vector(lm[side === RIGHT ? MediapipeHandNames.indexOf('INDEX_FINGER_MCP') : MediapipeHandNames.indexOf('PINKY_MCP')]),
        ];
        const handRotation = Vector.rollPitchYaw(palm[MediapipeHandNames.indexOf('WRIST')], palm[MediapipeHandNames.indexOf('THUMB_CMC')], palm[MediapipeHandNames.indexOf('THUMB_MCP')]);
        handRotation.y = handRotation.z;
        handRotation.y -= side === LEFT ? 0.4 : 0.4;
        let hand = {};
        hand[side + "Wrist"] = { x: handRotation.x, y: handRotation.y, z: handRotation.z };
        hand[side + "RingProximal"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[MediapipeHandNames.indexOf('WRIST')], lm[MediapipeHandNames.indexOf('RING_FINGER_MCP')], lm[MediapipeHandNames.indexOf('RING_FINGER_PIP')]) };
        hand[side + "RingIntermediate"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[MediapipeHandNames.indexOf('RING_FINGER_MCP')], lm[MediapipeHandNames.indexOf('RING_FINGER_PIP')], lm[MediapipeHandNames.indexOf('RING_FINGER_DIP')]) };
        hand[side + "RingDistal"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[MediapipeHandNames.indexOf('RING_FINGER_PIP')], lm[MediapipeHandNames.indexOf('RING_FINGER_DIP')], lm[MediapipeHandNames.indexOf('RING_FINGER_TIP')]) };
        hand[side + "IndexProximal"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[MediapipeHandNames.indexOf('WRIST')], lm[MediapipeHandNames.indexOf('INDEX_FINGER_MCP')], lm[MediapipeHandNames.indexOf('INDEX_FINGER_PIP')]) };
        hand[side + "IndexIntermediate"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[MediapipeHandNames.indexOf('INDEX_FINGER_MCP')], lm[MediapipeHandNames.indexOf('INDEX_FINGER_PIP')], lm[MediapipeHandNames.indexOf('INDEX_FINGER_DIP')]) };
        hand[side + "IndexDistal"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[MediapipeHandNames.indexOf('INDEX_FINGER_PIP')], lm[MediapipeHandNames.indexOf('INDEX_FINGER_DIP')], lm[MediapipeHandNames.indexOf('INDEX_FINGER_TIP')]) };
        hand[side + "MiddleProximal"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[MediapipeHandNames.indexOf('WRIST')], lm[MediapipeHandNames.indexOf('MIDDLE_FINGER_MCP')], lm[MediapipeHandNames.indexOf('MIDDLE_FINGER_PIP')]) };
        hand[side + "MiddleIntermediate"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[MediapipeHandNames.indexOf('MIDDLE_FINGER_MCP')], lm[MediapipeHandNames.indexOf('MIDDLE_FINGER_PIP')], lm[MediapipeHandNames.indexOf('MIDDLE_FINGER_DIP')]) };
        hand[side + "MiddleDistal"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[MediapipeHandNames.indexOf('MIDDLE_FINGER_PIP')], lm[MediapipeHandNames.indexOf('MIDDLE_FINGER_DIP')], lm[MediapipeHandNames.indexOf('MIDDLE_FINGER_TIP')]) };
        hand[side + "ThumbProximal"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[MediapipeHandNames.indexOf('WRIST')], lm[MediapipeHandNames.indexOf('THUMB_CMC')], lm[MediapipeHandNames.indexOf('THUMB_MCP')]) };
        hand[side + "ThumbIntermediate"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[MediapipeHandNames.indexOf('THUMB_CMC')], lm[MediapipeHandNames.indexOf('THUMB_MCP')], lm[MediapipeHandNames.indexOf('THUMB_IP')]) };
        hand[side + "ThumbDistal"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[MediapipeHandNames.indexOf('THUMB_MCP')], lm[MediapipeHandNames.indexOf('THUMB_IP')], lm[MediapipeHandNames.indexOf('THUMB_TIP')]) };
        hand[side + "LittleProximal"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[MediapipeHandNames.indexOf('WRIST')], lm[MediapipeHandNames.indexOf('PINKY_MCP')], lm[MediapipeHandNames.indexOf('PINKY_PIP')]) };
        hand[side + "LittleIntermediate"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[MediapipeHandNames.indexOf('PINKY_MCP')], lm[MediapipeHandNames.indexOf('PINKY_PIP')], lm[MediapipeHandNames.indexOf('PINKY_DIP')]) };
        hand[side + "LittleDistal"] = { x: 0, y: 0, z: Vector.angleBetween3DCoords(lm[MediapipeHandNames.indexOf('PINKY_PIP')], lm[MediapipeHandNames.indexOf('PINKY_DIP')], lm[MediapipeHandNames.indexOf('PINKY_TIP')]) };
        hand = rigFingers(hand, side);
        return hand;
    }
}
/**
 * Converts normalized rotation values into radians clamped by human limits
 * @param {Object} hand : object of labeled joint with normalized rotation values
 * @param {Side} side : left or right
 */
const rigFingers = (hand, side = RIGHT) => {
    // Invert modifier based on left vs right side
    const invert = side === LEFT ? 1 : -1;
    const digits = ["Ring", "Index", "Little", "Thumb", "Middle"];
    const segments = ["Proximal", "Intermediate", "Distal"];
    hand[side + "Wrist"].x = clamp(hand[side + "Wrist"].x * 2 * invert, -0.3, 0.3); // twist
    hand[side + "Wrist"].y = clamp(hand[side + "Wrist"].y * 2.3, side === LEFT ? -1.2 : -0.6, side === LEFT ? 0.6 : 1.6);
    hand[side + "Wrist"].z = hand[side + "Wrist"].z * -2.3 * invert; //left right
    digits.forEach((e) => {
        segments.forEach((j) => {
            const trackedFinger = hand[side + e + j];
            if (e === "Thumb") {
                //dampen thumb rotation depending on segment
                const dampener = {
                    x: j === "Proximal" ? 2.2 : j === "Intermediate" ? 0 : 0,
                    y: j === "Proximal" ? 2.2 : j === "Intermediate" ? 0.7 : 1,
                    z: j === "Proximal" ? 0.5 : j === "Intermediate" ? 0.5 : 0.5,
                };
                const startPos = {
                    x: j === "Proximal" ? 1.2 : j === "Distal" ? -0.2 : -0.2,
                    y: j === "Proximal" ? 1.1 * invert : j === "Distal" ? 0.1 * invert : 0.1 * invert,
                    z: j === "Proximal" ? 0.2 * invert : j === "Distal" ? 0.2 * invert : 0.2 * invert,
                };
                const newThumb = { x: 0, y: 0, z: 0 };
                if (j === "Proximal") {
                    newThumb.z = clamp(startPos.z + trackedFinger.z * -PI * dampener.z * invert, side === LEFT ? -0.6 : -0.3, side === LEFT ? 0.3 : 0.6);
                    newThumb.x = clamp(startPos.x + trackedFinger.z * -PI * dampener.x, -0.6, 0.3);
                    newThumb.y = clamp(startPos.y + trackedFinger.z * -PI * dampener.y * invert, side === LEFT ? -1 : -0.3, side === LEFT ? 0.3 : 1);
                }
                else {
                    newThumb.z = clamp(startPos.z + trackedFinger.z * -PI * dampener.z * invert, -2, 2);
                    newThumb.x = clamp(startPos.x + trackedFinger.z * -PI * dampener.x, -2, 2);
                    newThumb.y = clamp(startPos.y + trackedFinger.z * -PI * dampener.y * invert, -2, 2);
                }
                trackedFinger.x = newThumb.x;
                trackedFinger.y = newThumb.y;
                trackedFinger.z = newThumb.z;
            }
            else {
                //will document human limits later
                trackedFinger.z = clamp(trackedFinger.z * -PI * invert, side === LEFT ? -PI : 0, side === LEFT ? 0 : PI);
            }
        });
    });
    return hand;
};
