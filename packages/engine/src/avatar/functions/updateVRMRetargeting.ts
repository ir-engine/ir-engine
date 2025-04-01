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

import { Matrix4, Quaternion, Vector3 } from 'three'

import { getComponent, getOptionalComponent, hasComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { EntityTreeComponent } from '@ir-engine/ecs'
import { AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { VRMHumanBoneName } from '../maps/VRMHumanBoneName'

const emptyQuaternion = new Quaternion()

export const updateVRMRetargeting = (avatarEntity: Entity) => {
  const rig = getComponent(avatarEntity, AvatarRigComponent)
  if (!rig?.bonesToEntities.hips) return

  for (const boneName in rig.bonesToEntities) {
    const boneEntity = rig.bonesToEntities[boneName]
    if (!TransformComponent.dirty[boneEntity]) continue
    const bone = getOptionalComponent(boneEntity, TransformComponent)
    if (!bone) continue

    const parentWorldRotation = rig.parentWorldRotations[boneName] ?? emptyQuaternion
    const parentInverseWorldRotation = rig.parentWorldRotationInverses[boneName] ?? emptyQuaternion
    const worldRotation = rig.rotations[boneName] ?? emptyQuaternion

    _quatA
      .copy(bone.rotation)
      .multiply(parentWorldRotation)
      .premultiply(parentInverseWorldRotation)
      .multiply(worldRotation)

    TransformComponent.rotation.x[boneEntity] = _quatA.x
    TransformComponent.rotation.y[boneEntity] = _quatA.y
    TransformComponent.rotation.z[boneEntity] = _quatA.z
    TransformComponent.rotation.w[boneEntity] = _quatA.w

    if (boneName === VRMHumanBoneName.Hips) {
      const parentEntity = getOptionalComponent(boneEntity, EntityTreeComponent)?.parentEntity
      if (!parentEntity) continue
      const parentBone = getOptionalComponent(parentEntity, TransformComponent)
      if (!parentBone) continue
      _boneWorldPos.copy(bone.position).applyMatrix4(parentBone?.matrixWorld)
      _parentWorldMatrixInverse.copy(parentBone.matrixWorld).invert()

      _boneWorldPos.applyMatrix4(_parentWorldMatrixInverse)
      _boneWorldPos.applyQuaternion(parentInverseWorldRotation)

      if (hasComponent(avatarEntity, AvatarComponent)) {
        _boneWorldPos.multiplyScalar(getComponent(avatarEntity, AvatarComponent).hipsHeight)
      }
      bone.position.copy(_boneWorldPos)
    }
  }
}

const _quatA = new Quaternion()
const _boneWorldPos = new Vector3()
const _parentWorldMatrixInverse = new Matrix4()
