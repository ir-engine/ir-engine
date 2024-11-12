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

import { UUIDComponent } from '@ir-engine/ecs'
import { getComponent, getOptionalComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { CallbackComponent } from '@ir-engine/spatial/src/common/CallbackComponent'
import { CollisionComponent } from '@ir-engine/spatial/src/physics/components/CollisionComponent'
import { PhysicsSystem } from '@ir-engine/spatial/src/physics/systems/PhysicsSystem'
import { ColliderHitEvent, CollisionEvents } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'

import { TriggerComponent } from '../components/TriggerComponent'

export const triggerEnterOrExit = (triggerEntity: Entity, otherEntity: Entity, hit: ColliderHitEvent) => {
  const triggerComponent = getOptionalComponent(hit.shapeSelf?.entity ?? triggerEntity, TriggerComponent)
  if (!triggerComponent) return
  for (const trigger of triggerComponent.triggers) {
    if (trigger.target && !UUIDComponent.getEntityByUUID(trigger.target)) continue
    const targetEntity = trigger.target ? UUIDComponent.getEntityByUUID(trigger.target) : triggerEntity
    if (targetEntity && (trigger.onEnter || trigger.onExit)) {
      const callbacks = getOptionalComponent(targetEntity, CallbackComponent)
      if (!callbacks) continue
      callbacks.get(hit.type === CollisionEvents.TRIGGER_START ? trigger.onEnter! : trigger.onExit!)?.(
        triggerEntity,
        otherEntity
      )
    }
  }
}

const collisionQuery = defineQuery([CollisionComponent])

const execute = () => {
  for (const entity of collisionQuery()) {
    for (const [e, hit] of getComponent(entity, CollisionComponent)) {
      if (hit.type === CollisionEvents.TRIGGER_START || hit.type === CollisionEvents.TRIGGER_END) {
        triggerEnterOrExit(entity, e, hit)
      }
    }
  }
}

export const TriggerSystem = defineSystem({
  uuid: 'ee.engine.TriggerSystem',
  insert: { with: PhysicsSystem },
  execute
})
