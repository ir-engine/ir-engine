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

import { useEffect } from 'react'
import { Quaternion, Vector3 } from 'three'

import matches from 'ts-matches'
import { Entity } from '../../ecs/classes/Entity'
import { defineComponent, getComponent, useOptionalComponent } from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AvatarRigComponent } from './AvatarAnimationComponent'

const EPSILON = 1e-6

export const AvatarHeadDecapComponent = defineComponent({
  name: 'AvatarHeadDecapComponent',

  reactor: function () {
    const entity = useEntityContext()

    const headDecap = useOptionalComponent(entity, AvatarHeadDecapComponent)
    const rig = useOptionalComponent(entity, AvatarRigComponent)

    useEffect(() => {
      if (!rig?.value?.vrm?.humanoid?.rawHumanBones?.head?.node || !headDecap?.value) return

      rig.value.vrm.humanoid.rawHumanBones.head.node.scale.setScalar(EPSILON)

      return () => {
        rig.value.vrm.humanoid.rawHumanBones.head.node.scale.setScalar(1)
      }
    }, [headDecap, rig])

    return null
  }
})

export type AvatarIKTargetsType = {
  head: boolean
  leftHand: boolean
  rightHand: boolean
}

export const AvatarIKTargetComponent = defineComponent({
  name: 'AvatarIKTargetComponent',

  onInit(entity) {
    return { blendWeight: 0 }
  },

  onSet(entity, component, json) {
    if (json && matches.number.test(json?.blendWeight)) component.blendWeight.set(json.blendWeight)
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
  if (targetEntity) return getComponent(targetEntity, TransformComponent)

  const rig = getComponent(entity, AvatarRigComponent)
  if (!rig) return getComponent(entity, TransformComponent)

  switch (hand) {
    case 'left':
      return {
        position: rig.rig.leftHand.node.getWorldPosition(vec3),
        rotation: rig.rig.leftHand.node.getWorldQuaternion(quat)
      }
    case 'right':
      return {
        position: rig.rig.rightHand.node.getWorldPosition(vec3),
        rotation: rig.rig.rightHand.node.getWorldQuaternion(quat)
      }
    default:
    case 'none':
      return {
        position: rig.rig.head.node.getWorldPosition(vec3),
        rotation: rig.rig.head.node.getWorldQuaternion(quat)
      }
  }
}
