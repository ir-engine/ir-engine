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

import { Vector3 } from 'three'

import { dispatchAction } from '@etherealengine/hyperflux'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { Landmark } from '@mediapipe/tasks-vision'
import { Engine } from '../ecs/classes/Engine'
import { getComponent } from '../ecs/functions/ComponentFunctions'
import { UUIDComponent } from '../scene/components/UUIDComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { XRAction } from '../xr/XRState'

const indices = {
  rightEar: 8,
  leftEar: 7,
  rightHand: 16,
  leftHand: 15
}

const solvedPoses = {
  head: new Vector3(),
  leftHand: new Vector3(),
  rightHand: new Vector3()
}

const rawPoses = {
  leftHand: {} as Landmark,
  rightHand: {} as Landmark
}

const UpdateRawPose = (data: Landmark[], hipsPos, avatarRig, avatarTransform) => {
  if (data) {
    const rightEar = data[indices.rightEar]
    const leftEar = data[indices.leftEar]
    solvedPoses.head
      .set((leftEar.x + rightEar.x) / 2, (leftEar.y + rightEar.y) / 2, (leftEar.z + rightEar.z) / 2)
      .multiplyScalar(-1)
      .applyQuaternion(avatarTransform.rotation)
      .add(hipsPos)

    for (const key of Object.keys(solvedPoses)) {
      switch (key) {
        case 'rightHand':
        case 'leftHand':
          rawPoses[key] = data[indices[key]]
          solvedPoses[key] = new Vector3(rawPoses[key].x, rawPoses[key].y, rawPoses[key].z)
            .multiplyScalar(-1)
            .add(hipsPos)
          break
      }

      console.log(solvedPoses[key].x, solvedPoses[key].y, solvedPoses[key].z)

      const entityUUID = `${Engine?.instance?.userId}_mocap_${key}` as EntityUUID
      const ikTarget = UUIDComponent.entitiesByUUID[entityUUID]
      // if (ikTarget) removeEntity(ikTarget)

      if (!ikTarget) {
        dispatchAction(XRAction.spawnIKTarget({ entityUUID: entityUUID, name: key }))
      }

      const ikTransform = getComponent(ikTarget, TransformComponent)
      ikTransform.position.copy(solvedPoses[key])
    }
  }
}

export default UpdateRawPose
