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

import { Types } from 'bitecs'
import { AxesHelper, Quaternion, Vector3 } from 'three'

import { S, UUIDComponent } from '@ir-engine/ecs'
import { defineComponent, getComponent, getOptionalComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, EntityUUID } from '@ir-engine/ecs/src/Entity'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { NetworkObjectComponent } from '@ir-engine/network'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { ObjectLayerMasks } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { useHelperEntity } from '@ir-engine/spatial/src/common/debug/useHelperEntity'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'
import { ikTargets } from '../animation/Util'
import { AvatarRigComponent } from './AvatarAnimationComponent'

export const AvatarHeadDecapComponent = defineComponent({
  name: 'AvatarHeadDecapComponent'
})

export type AvatarIKTargetsType = {
  head: boolean
  leftHand: boolean
  rightHand: boolean
}

export const AvatarIKTargetComponent = defineComponent({
  name: 'AvatarIKTargetComponent',
  schema: { blendWeight: Types.f64 },

  reactor: function () {
    const entity = useEntityContext()
    const debugEnabled = useHookstate(getMutableState(RendererState).avatarDebug)

    useHelperEntity(entity, () => new AxesHelper(0.125), debugEnabled.value, ObjectLayerMasks.AvatarHelper)

    return null
  },

  getTargetEntity: (ownerID: EntityUUID, targetName: (typeof ikTargets)[keyof typeof ikTargets]) => {
    return UUIDComponent.getEntityByUUID((ownerID + targetName) as EntityUUID)
  }
})

/**
 * Gets the hand position in world space
 * @param entity the player entity
 * @param hand which hand to get
 * @returns {Vector3}
 */

const vec3 = new Vector3()
const quat = new Quaternion()

type HandTargetReturn = { position: Vector3; rotation: Quaternion } | null
export const getHandTarget = (entity: Entity, hand: XRHandedness): HandTargetReturn => {
  const networkComponent = getComponent(entity, NetworkObjectComponent)

  const targetEntity = NameComponent.entitiesByName[networkComponent.ownerId + '_' + hand]?.[0] // todo, how should be choose which one to use?
  if (targetEntity && AvatarIKTargetComponent.blendWeight[targetEntity] > 0)
    return getComponent(targetEntity, TransformComponent)

  const rig = getOptionalComponent(entity, AvatarRigComponent)?.bonesToEntities
  if (!rig?.rightHand || !rig?.leftHand || !rig?.head) return getComponent(entity, TransformComponent)

  switch (hand) {
    case 'left': {
      return {
        position: TransformComponent.getWorldPosition(rig.leftHand, vec3),
        rotation: TransformComponent.getWorldRotation(rig.leftHand, quat)
      }
    }
    case 'right':
      return {
        position: TransformComponent.getWorldPosition(rig.rightHand, vec3),
        rotation: TransformComponent.getWorldRotation(rig.rightHand, quat)
      }
    default:
    case 'none':
      return {
        position: TransformComponent.getWorldPosition(rig.head, vec3),
        rotation: TransformComponent.getWorldRotation(rig.head, quat)
      }
  }
}

export const IKMatrixComponent = defineComponent({
  name: 'IKMatricesComponent',
  schema: S.Object({
    /** contains ik solve data */
    local: T.Mat4(),
    world: T.Mat4()
  })
})

export const AvatarIKComponent = defineComponent({
  name: 'AvatarIKComponent'
})
