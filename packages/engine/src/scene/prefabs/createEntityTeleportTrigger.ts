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
  createEntity,
  setComponent
} from '@ir-engine/ecs'
import { EntityTeleportTriggerComponent } from '../components/EntityTeleportTriggerComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { CollisionGroups } from '@ir-engine/spatial/src/physics/enums/CollisionGroups'
import { Shapes } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { Vector3 } from 'three'

/**
 * Creates an entity teleport trigger
 * @param targetEntityUUID The UUID of the entity to teleport to
 * @param position The position of the trigger
 * @param scale The scale of the trigger (determines the size of the box collider)
 * @param offset Optional offset to apply to the target position
 * @param force Whether to force the teleport even if the position is invalid
 * @returns The created entity
 */
export const createEntityTeleportTrigger = (
  targetEntityUUID: EntityUUID,
  position = new Vector3(0, 0, 0),
  scale = new Vector3(2, 2, 2),
  offset = { x: 0, y: 0, z: 0 },
  force = false
): Entity => {
  const entity = createEntity()

  // Set a name for the entity
  setComponent(entity, NameComponent, { name: 'Entity Teleport Trigger' })

  // Set up the transform
  setComponent(entity, TransformComponent, {
    position,
    scale
  })

  // Set up the physics components
  setComponent(entity, RigidBodyComponent, {
    type: 'fixed'
  })

  setComponent(entity, ColliderComponent, {
    shape: Shapes.Box,
    boxSize: new Vector3(1, 1, 1), // This will be scaled by the transform scale
    collisionLayer: CollisionGroups.Trigger,
    collisionMask: CollisionGroups.Avatars
  })

  // Set up the entity teleport trigger component
  setComponent(entity, EntityTeleportTriggerComponent, {
    targetEntityUUID,
    offset,
    force
  })

  return entity
}

export default createEntityTeleportTrigger
