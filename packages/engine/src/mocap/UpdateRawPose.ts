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

import { PoseLandmarker } from '@mediapipe/tasks-vision'
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

const objs = [] as Mesh[]
const debug = true

const UpdateRawPose = (data, hipsPos, avatarRig, avatarTransform) => {
  if (data) {
    const engineState = getState(EngineState)
    for (let i = 0; i < data.length - 1; i++) {
      const name2 = PoseLandmarker.POSE_CONNECTIONS[i]
      const name = VRMHumanBoneList[i].toLowerCase()

      const pose = data[i]
      const posePos = new Vector3()

      posePos
        .set(pose?.x, pose?.y, pose?.z)
        .multiplyScalar(-1)
        .applyQuaternion(avatarTransform.rotation)
        .add(hipsPos.clone())

      const allowedTargets = ['head', 'lefthand', 'righthand', 'hips', 'leftfoot', 'rightfoot']

      if (debug) {
        if (objs[i] === undefined) {
          let matOptions = {}
          if (allowedTargets.includes(name)) {
            matOptions = { color: 0xff0000 }
          }
          const mesh = new Mesh(new SphereGeometry(i < 34 ? 0.05 : 0.025), new MeshBasicMaterial(matOptions))
          objs[i] = mesh
          Engine?.instance?.scene?.add(mesh)
        }

        objs[i].position.lerp(posePos.clone(), engineState.deltaSeconds * 10)
        objs[i].updateMatrixWorld()
      }

      if (allowedTargets.includes(name)) {
        const entityUUID = `${Engine?.instance?.userId}_mocap_${name}` as EntityUUID
        const ikTarget = UUIDComponent.entitiesByUUID[entityUUID]
        // if (ikTarget) removeEntity(ikTarget)

        if (!ikTarget) {
          const h = name === 'LeftHand' ? 'left' : name === 'RightHand' ? 'right' : 'none'
          dispatchAction(XRAction.spawnIKTarget({ handedness: h, entityUUID: entityUUID, name: name }))
        }

        const ik = getComponent(ikTarget, TransformComponent)
        ik?.position?.lerp(posePos.clone(), engineState.deltaSeconds * 10)

        // ik.quaternion.copy()
      }
    }
  }
}

export default UpdateRawPose
