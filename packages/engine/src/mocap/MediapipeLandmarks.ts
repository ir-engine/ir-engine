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

const nose = 0
const left_eye_inner = 1
const left_eye = 2
const left_eye_outer = 3
const right_eye_inner = 4
const right_eye = 5
const right_eye_outer = 6
const left_ear = 7
const right_ear = 8
const mouth_left = 9
const mouth_right = 10
const left_shoulder = 11
const right_shoulder = 12
const left_elbow = 13
const right_elbow = 14
const left_wrist = 15
const right_wrist = 16
const left_pinky = 17
const right_pinky = 18
const left_index = 19
const right_index = 20
const left_thumb = 21
const right_thumb = 22
const left_hip = 23
const right_hip = 24
const left_knee = 25
const right_knee = 26
const left_ankle = 27
const right_ankle = 28
const left_heel = 29
const right_heel = 30
const left_foot_index = 31
const right_foot_index = 32

const landmarks = Object.freeze({
  nose,
  left_eye_inner,
  left_eye,
  left_eye_outer,
  right_eye_inner,
  right_eye,
  right_eye_outer,
  left_ear,
  right_ear,
  mouth_left,
  mouth_right,
  left_shoulder,
  right_shoulder,
  left_elbow,
  right_elbow,
  left_wrist,
  right_wrist,
  left_pinky,
  right_pinky,
  left_index,
  right_index,
  left_thumb,
  right_thumb,
  left_hip,
  right_hip,
  left_knee,
  right_knee,
  left_ankle,
  right_ankle,
  left_heel,
  right_heel,
  left_foot_index,
  right_foot_index
})

export default landmarks
