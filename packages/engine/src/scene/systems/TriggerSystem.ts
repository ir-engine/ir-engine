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

import { Entity } from '../../ecs/classes/Entity'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { CollisionComponent } from '../../physics/components/CollisionComponent'
import { ColliderHitEvent, CollisionEvents } from '../../physics/types/PhysicsTypes'
import { CallbackComponent } from '../components/CallbackComponent'
import { ColliderComponent } from '../components/ColliderComponent'
import { UUIDComponent } from '../components/UUIDComponent'

export const triggerEnter = (entity: Entity, triggerEntity: Entity, hit: ColliderHitEvent) => {
  const triggerComponent = getComponent(triggerEntity, ColliderComponent)
  if (!triggerComponent?.onEnter) return
  if (triggerComponent.target && !UUIDComponent.entitiesByUUID[triggerComponent.target]) return

  const targetEntity = triggerComponent.target ? UUIDComponent.entitiesByUUID[triggerComponent.target] : triggerEntity

  if (targetEntity) {
    const callbacks = getComponent(targetEntity, CallbackComponent)
    callbacks.get(triggerComponent.onEnter)?.(triggerEntity)
  }
}

export const triggerExit = (entity: Entity, triggerEntity: Entity, hit: ColliderHitEvent) => {
  const triggerComponent = getComponent(triggerEntity, ColliderComponent)
  if (!triggerComponent?.onExit) return
  if (triggerComponent.target && !UUIDComponent.entitiesByUUID[triggerComponent.target]) return
  const targetEntity = triggerComponent.target ? UUIDComponent.entitiesByUUID[triggerComponent.target] : triggerEntity

  if (targetEntity) {
    const callbacks = getComponent(targetEntity, CallbackComponent)
    callbacks.get(triggerComponent.onExit)?.(triggerEntity)
  }
}

const collisionQuery = defineQuery([CollisionComponent])

const execute = () => {
  for (const entity of collisionQuery()) {
    for (const [e, hit] of getComponent(entity, CollisionComponent)) {
      if (hit.type === CollisionEvents.TRIGGER_START) {
        triggerEnter(entity, e, hit)
      }
      if (hit.type === CollisionEvents.TRIGGER_END) {
        triggerExit(entity, e, hit)
      }
    }
  }
}

export const TriggerSystem = defineSystem({
  uuid: 'ee.engine.TriggerSystem',
  execute
})
