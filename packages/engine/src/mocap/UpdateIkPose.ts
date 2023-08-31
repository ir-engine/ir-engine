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

import { VRMHumanBoneName } from '@pixiv/three-vrm'
import { Matrix4, Quaternion, Vector3 } from 'three'

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// helper to apply landmark to rig
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function UpdateIkPose(data) {
  const lm3d = data?.za
  const lm2d = data?.poseLandmarks
  const face = data?.faceLandmarks
  const wingspan = 1.2

  const changes = {}

  // @todo go and do a real hips calculation from the landmarks (see updatelandmarkpose.ts)
  // this hips value is also used by hands and other targets since all targets have to be in world coords
  // for now just force it to be a floater because hips in general are super flakey upstream; isolate that first
  const hips = { x: 0, y: 0.8, z: 0 }

  /*
  // hips target
  {
    const threshhold = 0.5
    const shown =
      lm3d[23] &&
      lm3d[23].visibility &&
      lm3d[23].visibility > threshhold &&
      lm3d[24] &&
      lm3d[24].visibility &&
      lm3d[24].visibility > threshhold
    if (shown) {
      const hipleft = new Vector3(lm3d[23].x, lm3d[23].y, lm3d[23].z)
      const hipright = new Vector3(lm3d[24].x, lm3d[24].y, lm3d[24].z)
      const hipdir = hipright.clone().sub(hipleft).normalize()
      const x = 0 // - Math.atan2( spine3d.y, spine3d.z) - Math.PI/2
      const y = -Math.atan2(hipdir.x, hipdir.z) - Math.PI / 2
      const z = 0 // Math.atan2( hipdir.y, hipdir.x) + Math.PI
      changes[VRMHumanBoneName.Hips] = {
        ik: true,
        euler: { x, y, z },
        xyz: hips,
        color: 0xffff00
      }
    }
  }
  */

  // left hand visible?
  if (data?.leftHandLandmarks) {
    const hand = data?.leftHandLandmarks

    // left wrist kalidokit from lo res data; pretty noisy results and rotation calc is questionable
    // const l = Vector.findRotation(
    //  Vector.fromArray(lm2d[15]),
    //  Vector.lerp(Vector.fromArray(lm2d[17]), Vector.fromArray(lm2d[19]), 0.5)
    // )

    // left wrist by hand from lo res data; noisy
    //const lf = new Vector3(lm2d[17].x,lm2d[17].y,lm2d[17].z)
    //const lb = new Vector3(lm2d[15].x,lm2d[15].y,lm2d[15].z)
    //const lu = new Vector3(lm2d[19].x,lm2d[19].y,lm2d[19].z)

    // left wrist by hand from high resolution hand data - seems "ok"
    // see https://developers.google.com/mediapipe/solutions/vision/hand_landmarker

    const f = new Vector3(hand[0].x, hand[0].y, hand[0].z)
    const b = new Vector3(hand[4].x, hand[4].y, hand[4].z)
    const u = new Vector3(hand[20].x, hand[20].y, hand[20].z)
    const w = u.clone().sub(b)
    const x = f.clone().sub(b)
    const z = x.clone().cross(w)
    const y = z.clone().cross(x)
    x.normalize()
    y.normalize()
    z.normalize()
    const m = new Matrix4(x.x, x.y, x.z, 0, y.x, y.y, y.z, 0, z.x, z.y, z.z, 0, 0, 0, 0, 1)
    const quaternion = new Quaternion().setFromRotationMatrix(m)
    changes[VRMHumanBoneName.LeftHand] = {
      ik: true,
      quaternion,
      xyz: {
        x: (hips.x + lm3d[15].x) * wingspan,
        y: (hips.y - lm3d[15].y) * wingspan,
        z: (hips.z - lm3d[15].z) * wingspan
      },
      //wingspan: 1.0,
      color: 0xee0000
    }
  }

  // right hand visible?
  if (data?.rightHandLandmarks) {
    const hand = data?.rightHandLandmarks

    // kalidokit approach
    // const r = Vector.findRotation(
    //  Vector.fromArray(lm3d[16]),
    //  Vector.lerp(Vector.fromArray(lm3d[18]), Vector.fromArray(lm3d[20]), 0.5)
    //)
    // const quaternion = new Quaternion().setFromEuler(new Euler(r.x, r.y, r.z))

    const f = new Vector3(hand[0].x, hand[0].y, hand[0].z)
    const b = new Vector3(hand[4].x, hand[4].y, hand[4].z)
    const u = new Vector3(hand[20].x, hand[20].y, hand[20].z)
    const w = u.clone().sub(b)
    const x = f.clone().sub(b)
    const z = x.clone().cross(w)
    const y = z.clone().cross(x)
    x.normalize()
    y.normalize()
    z.normalize()
    const m = new Matrix4(x.x, x.y, x.z, 0, y.x, y.y, y.z, 0, z.x, z.y, z.z, 0, 0, 0, 0, 1)
    const quaternion = new Quaternion().setFromRotationMatrix(m)
    changes[VRMHumanBoneName.RightHand] = {
      ik: true,
      quaternion,
      xyz: {
        x: (hips.x + lm3d[16].x) * wingspan,
        y: (hips.y - lm3d[16].y) * wingspan,
        z: (hips.z - lm3d[16].z) * wingspan
      },
      //wingspan: 1.0,
      color: 0xee0000
    }
  }

  return changes
}

export default UpdateIkPose
