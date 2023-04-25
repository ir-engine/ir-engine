import { useEffect } from 'react'

import { Entity } from '../../ecs/classes/Entity'
import {
  ComponentType,
  defineComponent,
  getComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
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

  reactor: function ({ root }) {
    const entity = root.entity

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
export const getHandTarget = (entity: Entity, hand: XRHandedness): ComponentType<typeof TransformComponent> | null => {
  const networkComponent = getComponent(entity, NetworkObjectComponent)
  const targetEntity = NameComponent.entitiesByName[networkComponent.ownerId + '_' + hand]?.[0] // todo, how should be choose which one to use?
  if (!targetEntity) return null
  return getComponent(targetEntity, TransformComponent)
}
