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


import { calcHead } from "./calcHead";
import { calcEyes, stabilizeBlink, calcPupils, calcBrow } from "./calcEyes";
import { calcMouth } from "./calcMouth";
/** Class representing face solver. */
export class FaceSolver {
    /**
     * Combines head, eye, pupil, and eyebrow calcs into one method
     * @param {Results} lm : array of results from tfjs or mediapipe
     * @param {String} runtime: set as either "tfjs" or "mediapipe"
     * @param {IFaceSolveOptions} options: options for face solver
     */
    static solve(lm, { runtime = "tfjs", video = null, imageSize = null, smoothBlink = false, blinkSettings = [], } = {}) {
        if (!lm) {
            console.error("Need Face Landmarks");
            return;
        }
        // set image size based on video
        if (video) {
            const videoEl = (typeof video === "string" ? document.querySelector(video) : video);
            imageSize = {
                width: videoEl.videoWidth,
                height: videoEl.videoHeight,
            };
        }
        //if runtime is mediapipe, we need the image dimentions for accurate calculations
        if (runtime === "mediapipe" && imageSize) {
            for (const e of lm) {
                e.x *= imageSize.width;
                e.y *= imageSize.height;
                e.z *= imageSize.width;
            }
        }
        const getHead = calcHead(lm);
        const getMouth = calcMouth(lm);
        //set high and low remapping values based on the runtime (tfjs vs mediapipe) of the results
        blinkSettings = blinkSettings.length > 0 ? blinkSettings : runtime === "tfjs" ? [0.55, 0.85] : [0.35, 0.5];
        let getEye = calcEyes(lm, {
            high: blinkSettings[1],
            low: blinkSettings[0],
        });
        // apply blink stabilizer if true
        if (smoothBlink) {
            getEye = stabilizeBlink(getEye, getHead.y);
        }
        const getPupils = calcPupils(lm);
        const getBrow = calcBrow(lm);
        return {
            head: getHead,
            eye: getEye,
            brow: getBrow,
            pupil: getPupils,
            mouth: getMouth,
        };
    }
}
/** expose blink stabilizer as a static method */
FaceSolver.stabilizeBlink = stabilizeBlink;
