import { useEffect } from 'react'
import { Quaternion, Vector3 } from 'three'

import { Entity } from '../../ecs/classes/Entity'
import {
  ComponentType,
  defineComponent,
  getComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AvatarRigComponent } from './AvatarAnimationComponent'

export const xrTargetHeadSuffix = '_xr_target_head'
export const xrTargetLeftHandSuffix = '_xr_target_left_hand'
export const xrTargetRightHandSuffix = '_xr_target_right_hand'

const EPSILON = 1e-6

export const AvatarHeadDecapComponent = defineComponent({
  name: 'AvatarHeadDecapComponent',

  reactor: function () {
    const entity = useEntityContext()

    const headDecap = useOptionalComponent(entity, AvatarHeadDecapComponent)
    const rig = useOptionalComponent(entity, AvatarRigComponent)

    useEffect(() => {
      if (rig?.value) {
        if (headDecap?.value) rig.value.rig.Head?.scale.setScalar(EPSILON)
        return () => {
          rig.value.rig.Head?.scale.setScalar(1)
        }
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
    return {
      handedness: 'none' as XRHandedness
    }
  },

  onSet(entity, component, json) {
    if (!json) return
    if (typeof json.handedness === 'string') component.handedness.set(json.handedness)
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
        position: rig.rig.LeftHand.getWorldPosition(vec3),
        rotation: rig.rig.LeftHand.getWorldQuaternion(quat)
      }
    case 'right':
      return {
        position: rig.rig.RightHand.getWorldPosition(vec3),
        rotation: rig.rig.RightHand.getWorldQuaternion(quat)
      }
    default:
    case 'none':
      return {
        position: rig.rig.Head.getWorldPosition(vec3),
        rotation: rig.rig.Head.getWorldQuaternion(quat)
      }
  }
}
