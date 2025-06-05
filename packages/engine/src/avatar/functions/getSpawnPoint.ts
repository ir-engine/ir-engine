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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { Quaternion, Vector3 } from 'three'

import { EntityUUID, UUIDComponent } from '@ir-engine/ecs'
import { getComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { defineQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { UserID } from '@ir-engine/hyperflux'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { SpawnPointComponent } from '../../scene/components/SpawnPointComponent'

export function getSpawnPoint(spawnPointNodeId: string, userId: UserID): { position: Vector3; rotation: Quaternion } {
  const entity = UUIDComponent.getEntityByUUID(spawnPointNodeId as EntityUUID)
  if (entity) {
    const spawnTransform = getComponent(entity, TransformComponent)
    const spawnComponent = getComponent(entity, SpawnPointComponent)
    if (!spawnComponent.permissionedUsers.length || spawnComponent.permissionedUsers.includes(userId)) {
      return {
        position: randomPositionCentered(spawnTransform.position, spawnTransform.scale),
        rotation: spawnTransform.rotation.clone()
      }
    }
  }
  return getRandomSpawnPoint(userId)
}
/**
 * Takes an origin point and scale to return a random point, within a retanglar area the size of the scale, with the origin in the center
 * @param origin
 * @param scale
 * @returns
 */
const randomPositionCentered = (origin: Vector3, scale: Vector3) => {
  const x = (Math.random() - 0.5) * scale.x + origin.x
  const z = (Math.random() - 0.5) * scale.z + origin.z
  return new Vector3(x, origin.y, z)
}

const spawnPointQuery = defineQuery([SpawnPointComponent, TransformComponent])

export function getRandomSpawnPoint(userId: UserID): { position: Vector3; rotation: Quaternion } {
  const spawnPoints = spawnPointQuery()
  const spawnPointForUser = spawnPoints.find((entity) =>
    getComponent(entity, SpawnPointComponent).permissionedUsers.includes(userId)
  )
  const entity = spawnPointForUser ?? spawnPoints[Math.round(Math.random() * (spawnPoints.length - 1))]
  if (entity) {
    const spawnTransform = getComponent(entity, TransformComponent)
    const worldPosition = TransformComponent.getWorldPosition(entity, new Vector3())
    return {
      position: randomPositionCentered(worldPosition, spawnTransform.scale),
      rotation: spawnTransform.rotation.clone()
    }
  }

  console.warn("Couldn't spawn entity at spawn point, no spawn points available")

  return {
    position: randomPositionCentered(new Vector3(2, 0, 2), new Vector3(1, 1, 1)),
    rotation: new Quaternion()
  }
}
