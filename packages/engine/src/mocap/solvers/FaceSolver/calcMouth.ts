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

import { Results } from '../Types'
import { clamp, remap } from '../utils/helpers'
import Vector from '../utils/vector'

/**
 * Calculate Mouth Shape
 * @param {Array} lm : array of results from tfjs or mediapipe
 */
export const calcMouth = (lm: Results) => {
  // eye keypoints
  const eyeInnerCornerL = new Vector(lm[133])
  const eyeInnerCornerR = new Vector(lm[362])
  const eyeOuterCornerL = new Vector(lm[130])
  const eyeOuterCornerR = new Vector(lm[263])

  // eye keypoint distances
  const eyeInnerDistance = eyeInnerCornerL.distance(eyeInnerCornerR)
  const eyeOuterDistance = eyeOuterCornerL.distance(eyeOuterCornerR)

  // mouth keypoints
  const upperInnerLip = new Vector(lm[13])
  const lowerInnerLip = new Vector(lm[14])
  const mouthCornerLeft = new Vector(lm[61])
  const mouthCornerRight = new Vector(lm[291])

  // mouth keypoint distances
  const mouthOpen = upperInnerLip.distance(lowerInnerLip)
  const mouthWidth = mouthCornerLeft.distance(mouthCornerRight)

  // mouth open and mouth shape ratios
  // let ratioXY = mouthWidth / mouthOpen;
  let ratioY = mouthOpen / eyeInnerDistance
  let ratioX = mouthWidth / eyeOuterDistance

  // normalize and scale mouth open
  ratioY = remap(ratioY, 0.15, 0.7)

  // normalize and scale mouth shape
  ratioX = remap(ratioX, 0.45, 0.9)
  ratioX = (ratioX - 0.3) * 2

  // const mouthX = remap(ratioX - 0.4, 0, 0.5);
  const mouthX = ratioX
  const mouthY = remap(mouthOpen / eyeInnerDistance, 0.17, 0.5)

  //Depricated: Change sensitivity due to facemesh and holistic have different point outputs.
  // const fixFacemesh = runtime === "tfjs" ? 1.3 : 0;

  // let ratioI = remap(mouthXY, 1.3 + fixFacemesh * 0.8, 2.6 + fixFacemesh) * remap(mouthY, 0, 1);
  const ratioI = clamp(remap(mouthX, 0, 1) * 2 * remap(mouthY, 0.2, 0.7), 0, 1)
  const ratioA = mouthY * 0.4 + mouthY * (1 - ratioI) * 0.6
  const ratioU = mouthY * remap(1 - ratioI, 0, 0.3) * 0.1
  const ratioE = remap(ratioU, 0.2, 1) * (1 - ratioI) * 0.3
  const ratioO = (1 - ratioI) * remap(mouthY, 0.3, 1) * 0.4

  return {
    x: ratioX || 0,
    y: ratioY || 0,
    shape: {
      A: ratioA || 0,
      E: ratioE || 0,
      I: ratioI || 0,
      O: ratioO || 0,
      U: ratioU || 0
    }
  }
}
