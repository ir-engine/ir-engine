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

import { dispatchAction } from '@etherealengine/hyperflux'
import { Euler, Quaternion, Vector3 } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'

import { Engine } from '../ecs/classes/Engine'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { UUIDComponent } from '../scene/components/UUIDComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { calcHips } from './solvers/PoseSolver/calcHips'

import { Landmark, POSE_LANDMARKS, POSE_LANDMARKS_LEFT, POSE_LANDMARKS_RIGHT } from '@mediapipe/holistic'
import { AvatarNetworkAction } from '../avatar/state/AvatarNetworkState'
import mediapipePoseNames from './MediapipePoseNames'

const indices = {
  rightEar: mediapipePoseNames.indexOf('right_ear'),
  leftEar: mediapipePoseNames.indexOf('left_ear'),
  rightHand: mediapipePoseNames.indexOf('right_wrist'),
  leftHand: mediapipePoseNames.indexOf('left_wrist'),
  rightAnkle: mediapipePoseNames.indexOf('right_ankle'),
  leftAnkle: mediapipePoseNames.indexOf('left_ankle')
}

const solvedPoses = {
  head: new Vector3(),
  hips: new Vector3(),
  leftHand: new Vector3(),
  rightHand: new Vector3(),
  leftAnkle: new Vector3(),
  rightAnkle: new Vector3()
}

const rawPoses = {
  leftHand: {} as Landmark,
  rightHand: {} as Landmark
}

const rotationOffset = new Quaternion().setFromEuler(new Euler(0, Math.PI, 0))

const UpdateRawPose = (lm3d: Landmark[], lm2d: Landmark[], bindHips, avatarRig, avatarTransform) => {
  if (!lm3d || !lm2d) return

  const targetSet = (key: string, xyz: Vector3) => {
    const entityUUID = `${Engine?.instance?.userId}_mocap_${key}` as EntityUUID
    const ikTarget = UUIDComponent.entitiesByUUID[entityUUID]
    if (!ikTarget) {
      dispatchAction(AvatarNetworkAction.spawnIKTarget({ entityUUID: entityUUID, name: key as any }))
    }
    const ikTransform = getComponent(ikTarget, TransformComponent)
    ikTransform.position.copy(xyz)
  }

  const landmarkToPose = (landmark3d) => {
    /*
    var _a
    const offscreen =
    data[indices[key]].y > 0.1 ||
    ((_a = data[indices[key]].visibility) !== null && _a !== void 0 ? _a : 0) < 0.23 ||
    0.995 < pose[indices[key]].y

    console.log(offscreen, key)
    */

    const xyz = new Vector3(landmark3d.x, landmark3d.y, landmark3d.z)
      .multiplyScalar(-1)
      .applyQuaternion(rotationOffset)
      .applyQuaternion(avatarTransform.rotation)
      .add(world)
      .add(bindHips)
      .sub(new Vector3(0, 0, 0.5))

    return xyz
  }

  // calculate hip ik target
  const hips = calcHips(lm3d, lm2d)
  const world = (hips.Hips.position as Vector3) || new Vector3(0, 0, 0)
  targetSet(
    'hips',
    new Vector3().copy(world).multiplyScalar(-1).applyQuaternion(avatarTransform.rotation).add(bindHips)
  )

  // calculate head ik target
  const leftEar = lm3d[POSE_LANDMARKS.LEFT_EAR]
  const rightEar = lm3d[POSE_LANDMARKS.RIGHT_EAR]
  const head = new Vector3()
    .set((leftEar.x + rightEar.x) / 2, (leftEar.y + rightEar.y) / 2, (leftEar.z + rightEar.z) / 2)
    .multiplyScalar(-1)
    .applyQuaternion(avatarTransform.rotation)
    .add(bindHips)

  targetSet('head', head)

  // set these extremities as ik targets - and don't set knees or elbows at all for now
  targetSet('leftHand', landmarkToPose(lm3d[POSE_LANDMARKS_LEFT.LEFT_WRIST]))
  targetSet('rightHand', landmarkToPose(lm3d[POSE_LANDMARKS_RIGHT.RIGHT_WRIST]))
  targetSet('leftAnkle', landmarkToPose(lm3d[POSE_LANDMARKS_LEFT.LEFT_ANKLE]))
  targetSet('rightAnkle', landmarkToPose(lm3d[POSE_LANDMARKS_RIGHT.RIGHT_ANKLE]))
}

export default UpdateRawPose
