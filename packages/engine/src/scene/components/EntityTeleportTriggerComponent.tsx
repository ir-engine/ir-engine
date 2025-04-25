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

import {
  Entity,
  EntityUUID,
  S,
  UUIDComponent,
  defineComponent,
  getComponent,
  getMutableComponent,
  setComponent,
  useComponent,
  useEntityContext
} from '@ir-engine/ecs'

import { setCallback } from '@ir-engine/spatial/src/common/CallbackComponent'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { teleportAvatar } from '../../avatar/functions/moveAvatar'
import { TriggerComponent } from '@ir-engine/spatial/src/physics/components/TriggerComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { useEffect } from 'react'
import { Vector3 } from 'three'

export const EntityTeleportTriggerComponent = defineComponent({
  name: 'EntityTeleportTriggerComponent',
  jsonID: 'EE_entity_teleport_trigger',

  schema: S.Object({
    /**
     * The UUID of the entity to teleport to.
     * This is required - the avatar will be teleported to the position of this entity.
     */
    targetEntityUUID: S.EntityUUID(),
    
    /**
     * Optional offset to apply to the target position.
     * This can be used to teleport the avatar to a position relative to the target entity.
     */
    offset: S.Object({
      x: S.Number(0),
      y: S.Number(0),
      z: S.Number(0)
    }),
    
    /**
     * Whether to force the teleport even if the position is invalid.
     * If false, the teleport will only happen if the position is valid.
     */
    force: S.Bool(false)
  }),

  reactor: () => {
    const entity = useEntityContext()
    const component = useComponent(entity, EntityTeleportTriggerComponent)

    console.log('EntityTeleportTriggerComponent')
    useEffect(() => {
      // Set up the callback for when an avatar enters the trigger
      setCallback(entity, 'onEntityTeleportTriggerEnter', (triggerEntity: Entity, otherEntity: Entity) => {
        console.log('onEntityTeleportTriggerEnter', triggerEntity, otherEntity)
        // Only teleport if the entity is the local avatar
        if (otherEntity !== AvatarComponent.getSelfAvatarEntity()) return

        // Get the target entity to teleport to
        let targetEntity = UUIDComponent.getEntityByUUID(component.targetEntityUUID.value as EntityUUID)
        if (!targetEntity) {
          console.warn(`EntityTeleportTriggerComponent: Target entity with UUID ${component.targetEntityUUID.value} not found`)
          return
        }

        // Get the position of the target entity
        const targetTransform = getComponent(targetEntity, TransformComponent)
        const targetPosition = targetTransform.position.clone()
        
        // Apply offset if specified
        const offset = component.offset.value
        if (offset) {
          targetPosition.add(new Vector3(offset.x, offset.y, offset.z))
        }

        // Teleport the avatar to the target position
        teleportAvatar(AvatarComponent.getSelfAvatarEntity(), targetPosition, component.force.value)
      })

      // Add the trigger to the TriggerComponent
      setComponent(entity, TriggerComponent)
      const triggerComp = getMutableComponent(entity, TriggerComponent)
      triggerComp?.triggers.merge([
        {
          onEnter: 'onEntityTeleportTriggerEnter',
          onExit: '',
          target: '' as EntityUUID
        }
      ])
    }, [component.targetEntityUUID, component.offset, component.force])

    return null
  }
})

export default EntityTeleportTriggerComponent
