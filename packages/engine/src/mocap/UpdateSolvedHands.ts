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

import { Mesh, MeshBasicMaterial, SphereGeometry, Vector3 } from 'three'

import { dispatchAction, getState } from '@etherealengine/hyperflux'

import { VRMHumanBoneList } from '@pixiv/three-vrm'
import { Engine } from '../ecs/classes/Engine'
import { EngineState } from '../ecs/classes/EngineState'

import { UUIDComponent } from '../scene/components/UUIDComponent'
import { XRAction } from '../xr/XRState'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../transform/components/TransformComponent'

export const motionCaptureHeadSuffix = '_motion_capture_head'
export const motionCaptureLeftHandSuffix = '_motion_capture_left_hand'
export const motionCaptureRightHandSuffix = '_motion_capture_right_hand'

const objs = [] as Mesh[]
const debug = true

if (debug)
  for (let i = 0; i < 33; i++) {
    objs.push(new Mesh(new SphereGeometry(0.05), new MeshBasicMaterial()))
    Engine?.instance?.scene.add(objs[i])
  }

const UpdateSolvedHands = (data, hipsPos, avatarRig, avatarTransform) => {
  if (data) {
    const engineState = getState(EngineState)

    const leftWrist = avatarRig?.vrm?.humanoid?.getRawBone('leftWrist')?.node
    const rightWrist = avatarRig?.vrm?.humanoid?.getRawBone('rightWrist')?.node

    for (let i = 0; i < data.length - 1; i++) {
      // fingers start at 25
      const name = VRMHumanBoneList[i + 25].toLowerCase()
      const hand = data[i]

      const lwPos = new Vector3()
      leftWrist?.getWorldPosition(lwPos)
      const rwPos = new Vector3()
      rightWrist?.getWorldPosition(rwPos)

      const targetPos = new Vector3()
      targetPos
        .set(hand?.x, hand?.y, hand?.z)
        .multiplyScalar(-1)
        .applyQuaternion(avatarTransform.rotation)
        .add(name.startsWith('left') ? lwPos : rwPos)

      // const Part = avatarRig?.vrm?.humanoid?.getRawBone(VRMHumanBoneList[i])

      // if (!Part) continue

      // const partPos = Part?.node?.worldToLocal(posePos.clone()).clone()

      const allowedTargets = ['leftwrist', 'rightwrist', 'lefthand', 'righthand']
      if (debug) {
        if (objs[i] === undefined) {
          let matOptions = {}
          if (allowedTargets.includes(name)) {
            matOptions = { color: 0x0000ff }
          } else if (name === 'righthand') {
            matOptions = { color: 0xff0000 }
          }
          const mesh = new Mesh(new SphereGeometry(0.05), new MeshBasicMaterial(matOptions))
          objs[i] = mesh
          Engine?.instance?.scene?.add(mesh)
        }

        objs[i].position.lerp(targetPos.clone(), engineState.deltaSeconds * 10)
        objs[i].updateMatrixWorld()
      }

      const entityUUID = `${Engine?.instance?.userId}_mocap_${name}` as EntityUUID
      const ikTarget = UUIDComponent.entitiesByUUID[entityUUID]
      // if (ikTarget) removeEntity(ikTarget)

      if (!ikTarget) {
        const h = name.startsWith('left') ? 'left' : 'right'
        dispatchAction(XRAction.spawnIKTarget({ handedness: h, entityUUID: entityUUID }))
      }

      const ik = getComponent(ikTarget, TransformComponent)
      ik.position.lerp(targetPos, engineState.deltaSeconds * 10)

      // ik.quaternion.copy()
    }
  }
  // const engineState = getState(EngineState)

  //   const leftHips = data[POSE_LANDMARKS.LEFT_HIP]
  //   const rightHips = data[POSE_LANDMARKS.RIGHT_HIP]
  //   const nose = data[POSE_LANDMARKS.NOSE]
  //   const leftEar = data[POSE_LANDMARKS.LEFT_EAR]
  //   const rightEar = data[POSE_LANDMARKS.RIGHT_EAR]
  //   const leftShoulder = data[POSE_LANDMARKS.LEFT_SHOULDER]
  //   const rightShoulder = data[POSE_LANDMARKS.RIGHT_SHOULDER]
  //   const leftElbow = data[POSE_LANDMARKS.LEFT_ELBOW]
  //   const rightElbow = data[POSE_LANDMARKS.RIGHT_ELBOW]
  //   const rightWrist = data[POSE_LANDMARKS.LEFT_WRIST]
  //   const leftWrist = data[POSE_LANDMARKS.RIGHT_WRIST]

  //   const head = !!nose.visibility && nose.visibility > 0.5
  //   const leftHand = !!leftWrist.visibility && leftWrist.visibility > 0.1
  //   const rightHand = !!rightWrist.visibility && rightWrist.visibility > 0.1

  //   const headUUID = (userID + motionCaptureHeadSuffix) as EntityUUID
  //   const leftHandUUID = (userID + motionCaptureLeftHandSuffix) as EntityUUID
  //   const rightHandUUID = (userID + motionCaptureRightHandSuffix) as EntityUUID

  //   const ikTargetHead = UUIDComponent.entitiesByUUID[headUUID]
  //   const ikTargetLeftHand = UUIDComponent.entitiesByUUID[leftHandUUID]
  //   const ikTargetRightHand = UUIDComponent.entitiesByUUID[rightHandUUID]

  //   if (!head && ikTargetHead) removeEntity(ikTargetHead)
  //   if (!leftHand && ikTargetLeftHand) removeEntity(ikTargetLeftHand)
  //   if (!rightHand && ikTargetRightHand) removeEntity(ikTargetRightHand)

  //   if (head && !ikTargetHead) dispatchAction(XRAction.spawnIKTarget({ handedness: 'none', entityUUID: headUUID }))
  //   if (leftHand && !ikTargetLeftHand)
  //     dispatchAction(XRAction.spawnIKTarget({ handedness: 'left', entityUUID: leftHandUUID }))
  //   if (rightHand && !ikTargetRightHand)
  //     dispatchAction(XRAction.spawnIKTarget({ handedness: 'right', entityUUID: rightHandUUID }))

  //   if (debug)
  //     for (let i = 0; i < 33; i++) {
  //       objs[i].position
  //         .set(data[i].x, data[i].y, data[i].z)
  //         .multiplyScalar(-1)
  //         .applyQuaternion(avatarTransform.rotation)
  //         .add(hipsPos)
  //       objs[i].visible = !!data[i].visibility && data[i].visibility! > 0.5
  //       objs[i].updateMatrixWorld(true)
  //     }

  //   if (ikTargetHead) {
  //     // if (!nose.visibility || nose.visibility < 0.1) continue
  //     // if (!nose.x || !nose.y || !nose.z) continue
  //     const ik = getComponent(ikTargetHead, TransformComponent)
  //     headPos
  //       .set((leftEar.x + rightEar.x) / 2, (leftEar.y + rightEar.y) / 2, (leftEar.z + rightEar.z) / 2)
  //       .multiplyScalar(-1)
  //       .applyQuaternion(avatarTransform.rotation)
  //       .add(hipsPos)
  //     ik.position.copy(headPos)
  //     // ik.rotation.setFromUnitVectors(
  //     //   new Vector3(0, 1, 0),
  //     //   new Vector3(nose.x, -nose.y, nose.z).sub(headPos).normalize()
  //     // ).multiply(avatarTransform.rotation)
  //   }

  //   if (ikTargetLeftHand) {
  //     // if (!leftWrist.visibility || leftWrist.visibility < 0.1) continue
  //     // if (!leftWrist.x || !leftWrist.y || !leftWrist.z) continue
  //     const ik = getComponent(ikTargetLeftHand, TransformComponent)
  //     leftHandPos
  //       .set(leftWrist.x, leftWrist.y, leftWrist.z)
  //       .multiplyScalar(-1)
  //       .applyQuaternion(avatarTransform.rotation)
  //       .add(hipsPos)
  //     ik.position.lerp(leftHandPos, engineState.deltaSeconds * 10)
  //     // ik.quaternion.copy()
  //   }

  //   if (ikTargetRightHand) {
  //     // if (!rightWrist.visibility || rightWrist.visibility < 0.5) continue
  //     // if (!rightWrist.x || !rightWrist.y || !rightWrist.z) continue
  //     const ik = getComponent(ikTargetRightHand, TransformComponent)
  //     rightHandPos
  //       .set(rightWrist.x, rightWrist.y, rightWrist.z)
  //       .multiplyScalar(-1)
  //       .applyQuaternion(avatarTransform.rotation)
  //       .add(hipsPos)
  //     ik.position.lerp(rightHandPos, engineState.deltaSeconds * 10)
  //     // ik.quaternion.copy()
  //   }
}

export default UpdateSolvedHands
