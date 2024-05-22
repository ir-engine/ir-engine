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

import { Types } from 'bitecs'
import { useEffect } from 'react'
import { Quaternion, Vector3 } from 'three'

import { UserID } from '@etherealengine/common/src/schema.type.module'
import { UUIDComponent } from '@etherealengine/ecs'
import {
  defineComponent,
  getComponent,
  getOptionalComponent,
  removeComponent,
  setComponent
} from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity, EntityUUID } from '@etherealengine/ecs/src/Entity'
import { useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { NetworkObjectComponent } from '@etherealengine/network'
import { AxesHelperComponent } from '@etherealengine/spatial/src/common/debug/AxesHelperComponent'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'
import { ObjectLayerMasks } from '@etherealengine/spatial/src/renderer/constants/ObjectLayers'
import { RendererState } from '@etherealengine/spatial/src/renderer/RendererState'
import { TransformComponent } from '@etherealengine/spatial/src/transform/components/TransformComponent'

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

    useEffect(() => {
      if (debugEnabled.value) {
        setComponent(entity, AxesHelperComponent, {
          name: 'avatar-ik-helper',
          size: 0.5,
          layerMask: ObjectLayerMasks.AvatarHelper
        })
      }

      return () => {
        removeComponent(entity, AxesHelperComponent)
      }
    }, [debugEnabled])

    return null
  },

  getTargetEntity: (ownerID: UserID, targetName: (typeof ikTargets)[keyof typeof ikTargets]) => {
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

  const rig = getOptionalComponent(entity, AvatarRigComponent)
  if (!rig?.rawRig) return getComponent(entity, TransformComponent)

  switch (hand) {
    case 'left':
      return {
        position: rig.rawRig.leftHand.node.getWorldPosition(vec3),
        rotation: rig.rawRig.leftHand.node.getWorldQuaternion(quat)
      }
    case 'right':
      return {
        position: rig.rawRig.rightHand.node.getWorldPosition(vec3),
        rotation: rig.rawRig.rightHand.node.getWorldQuaternion(quat)
      }
    default:
    case 'none':
      return {
        position: rig.rawRig.head.node.getWorldPosition(vec3),
        rotation: rig.rawRig.head.node.getWorldQuaternion(quat)
      }
  }
}
