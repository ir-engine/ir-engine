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

import { VRM, VRMHumanBoneList } from '@pixiv/three-vrm'
import { Object3D, Quaternion, Vector3 } from 'three'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { EntityTreeComponent } from '../../ecs/functions/EntityTree'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { computeTransformMatrix } from '../../transform/systems/TransformSystem'
import { BoneComponent } from '../components/BoneComponent'

export const updateVRMRetargeting = (vrm: VRM, deltaTime: number) => {
  vrm.update(deltaTime)

  const humanoid = (vrm.humanoid as any)._normalizedHumanBones // as VRMHumanoidRig
  for (const boneName of VRMHumanBoneList) {
    const boneNode = humanoid.original.getBoneNode(boneName) as Object3D | null

    if (boneNode != null) {
      const rigBoneNode = humanoid.getBoneNode(boneName)!

      delete TransformComponent.dirtyTransforms[rigBoneNode.entity]

      const parentWorldRotation = humanoid._parentWorldRotations[boneName]!
      const invParentWorldRotation = _quatA.copy(parentWorldRotation).invert()
      const boneRotation = humanoid._boneRotations[boneName]!

      boneNode.quaternion
        .copy(rigBoneNode.quaternion)
        .multiply(parentWorldRotation)
        .premultiply(invParentWorldRotation)
        .multiply(boneRotation)

      // Move the mass center of the VRM
      if (boneName === 'hips') {
        const boneWorldPosition = rigBoneNode.getWorldPosition(_boneWorldPos)

        const boneEntity = boneNode.entity
        if (!boneEntity) continue

        const parentEntity = getComponent(boneEntity, EntityTreeComponent)?.parentEntity
        if (!parentEntity) continue

        const parentBoneNode = getComponent(parentEntity, BoneComponent)
        if (!parentBoneNode) continue

        computeTransformMatrix(parentEntity)
        const parentWorldMatrix = parentBoneNode.matrixWorld
        const localPosition = boneWorldPosition.applyMatrix4(parentWorldMatrix.invert())
        boneNode.position.copy(localPosition)
      }
    }
  }
}

const _quatA = new Quaternion()
const _boneWorldPos = new Vector3()
