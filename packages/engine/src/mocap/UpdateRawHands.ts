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

const UpdateRawHands = (data, hipsPos, avatarRig, avatarTransform) => {
  if (data) {
    const engineState = getState(EngineState)

    const leftHand = avatarRig?.vrm?.humanoid?.getRawBone('leftHand')?.node
    const rightHand = avatarRig?.vrm?.humanoid?.getRawBone('rightHand')?.node

    for (let i = 0; i < data.length - 1; i++) {
      // fingers start at 25
      const name = VRMHumanBoneList[i + 25].toLowerCase()
      const hand = data[i]

      const lhPos = new Vector3()
      leftHand?.getWorldPosition(lhPos)
      const rhPos = new Vector3()
      rightHand?.getWorldPosition(rhPos)

      const targetPos = new Vector3()
      targetPos
        .set(hand?.x, hand?.y, hand?.z)
        .multiplyScalar(-1)
        .applyQuaternion(avatarTransform.rotation)
        .add(hipsPos.clone())
      // .add(name.startsWith('left') ? lhPos : rhPos)

      const allowedTargets = ['']
      if (debug) {
        if (objs[i] === undefined) {
          let matOptions = {}
          if (allowedTargets.includes(name)) {
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
        dispatchAction(XRAction.spawnIKTarget({ handedness: 'none', entityUUID: entityUUID }))
      }

      const ik = getComponent(ikTarget, TransformComponent)
      // ik.position.lerp(targetPos, engineState.deltaSeconds * 10)

      // ik.quaternion.copy()
    }
  }
}

export default UpdateRawHands
