/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { VRMHumanBoneList } from '@pixiv/three-vrm'
import { Matrix4, Object3D, Quaternion, Vector3 } from 'three'

import { getComponent, getOptionalComponent, hasComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { BoneComponent } from '@ir-engine/spatial/src/renderer/components/BoneComponent'
import { AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'

export const updateVRMRetargeting = (avatarEntity: Entity) => {
  const vrm = getComponent(avatarEntity, AvatarRigComponent).vrm
  if (!vrm?.humanoid) return

  const humanoidRig = (vrm.humanoid as any)._normalizedHumanBones // as VRMHumanoidRig
  for (const boneName of VRMHumanBoneList) {
    const boneNode = humanoidRig.original.getBoneNode(boneName) as Object3D | null

    if (boneNode != null) {
      const rigBoneNode = humanoidRig.getBoneNode(boneName)! as Object3D

      delete TransformComponent.dirtyTransforms[rigBoneNode.entity]

      const parentWorldRotation = humanoidRig._parentWorldRotations[boneName]!
      const invParentWorldRotation = _quatA.copy(parentWorldRotation).invert()
      const boneRotation = humanoidRig._boneRotations[boneName]!

      boneNode.quaternion
        .copy(rigBoneNode.quaternion)
        .multiply(parentWorldRotation)
        .premultiply(invParentWorldRotation)
        .multiply(boneRotation)

      if (boneName === 'hips') {
        const entity = boneNode.entity
        const parentEntity = getOptionalComponent(entity, EntityTreeComponent)?.parentEntity
        if (!parentEntity) continue
        const parentBone =
          getOptionalComponent(parentEntity, BoneComponent) ?? getOptionalComponent(parentEntity, TransformComponent)
        if (!parentBone) continue
        _boneWorldPos.copy(rigBoneNode.position).applyMatrix4(parentBone?.matrixWorld)
        _parentWorldMatrixInverse.copy(parentBone.matrixWorld).invert()

        _boneWorldPos.applyMatrix4(_parentWorldMatrixInverse)
        if (hasComponent(avatarEntity, AvatarComponent)) {
          _boneWorldPos.multiplyScalar(getComponent(avatarEntity, AvatarComponent).hipsHeight)
        }
        boneNode.position.copy(_boneWorldPos)
      }
    }
  }
}

const _quatA = new Quaternion()
const _boneWorldPos = new Vector3()
const _parentWorldMatrixInverse = new Matrix4()
