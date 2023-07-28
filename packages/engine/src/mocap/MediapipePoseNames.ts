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

// https://developers.google.com/mediapipe/solutions/vision/pose_landmarker
const mediapipePoseNames = [
  'nose',
  'left eye inner',
  'left eye',
  'left eye outer',
  'right eye inner',
  'right eye',
  'right eye outer',
  'left ear',
  'right ear',
  'mouth (left)',
  'mouth (right)',
  'left shoulder',
  'right shoulder',
  'left elbow',
  'right elbow',
  'left wrist',
  'right wrist',
  'left pinky',
  'right pinky',
  'left index',
  'right index',
  'left thumb',
  'right thumb',
  'left hip',
  'right hip',
  'left knee',
  'right knee',
  'left ankle',
  'right ankle',
  'left heel',
  'right heel',
  'left foot index',
  'right foot index'
]

export default mediapipePoseNames
