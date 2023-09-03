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

import { NormalizedLandmarkList, POSE_LANDMARKS } from '@mediapipe/holistic'
import { Box3, Vector3 } from 'three'

const bboxWorld = new Box3()
const bboxScreen = new Box3()

export const normalizeLandmarks = (worldLandmarks: NormalizedLandmarkList, screenLandmarks: NormalizedLandmarkList) => {
  // take the head height in world space, and multiiply all screen space landmarks by this to get world space landmarks

  bboxWorld.setFromPoints(worldLandmarks as Vector3[])
  bboxScreen.setFromPoints(screenLandmarks as Vector3[])

  const xRatio = (bboxWorld.max.x - bboxWorld.min.x) / (bboxScreen.max.x - bboxScreen.min.x)
  const yRatio = (bboxWorld.max.y - bboxWorld.min.y) / (bboxScreen.max.y - bboxScreen.min.y)
  const zRatio = (bboxWorld.max.z - bboxWorld.min.z) / (bboxScreen.max.z - bboxScreen.min.z)

  const normalizedScreenLandmarks = screenLandmarks.map((landmark) => ({
    ...landmark,
    x: landmark.x * xRatio,
    y: landmark.y * yRatio,
    z: landmark.z * zRatio
  }))

  const hipCenterX =
    (normalizedScreenLandmarks[POSE_LANDMARKS.LEFT_HIP].x + normalizedScreenLandmarks[POSE_LANDMARKS.RIGHT_HIP].x) / 2
  const hipCenterZ =
    (normalizedScreenLandmarks[POSE_LANDMARKS.LEFT_HIP].z + normalizedScreenLandmarks[POSE_LANDMARKS.RIGHT_HIP].z) / 2

  // translate all landmarks to the origin
  for (const landmark of normalizedScreenLandmarks) {
    landmark.x -= hipCenterX
    landmark.z -= hipCenterZ
  }

  return normalizedScreenLandmarks as NormalizedLandmarkList
}
