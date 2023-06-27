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

import { Quaternion, Vector3 } from 'three'

import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { defineActionQueue, getMutableState } from '@etherealengine/hyperflux'

import { isClient } from '../common/functions/getEnvironment'
import { defineQuery, getComponent, hasComponent } from '../ecs/functions/ComponentFunctions'
import { defineSystem } from '../ecs/functions/SystemFunctions'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { WorldState } from '../networking/interfaces/WorldState'
import { SpawnPointComponent } from '../scene/components/SpawnPointComponent'
import { UUIDComponent } from '../scene/components/UUIDComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { loadAvatarForUser } from './functions/avatarFunctions'
import { spawnAvatarReceptor } from './functions/spawnAvatarReceptor'

const randomPositionCentered = (area: Vector3) => {
  return new Vector3((Math.random() - 0.5) * area.x, (Math.random() - 0.5) * area.y, (Math.random() - 0.5) * area.z)
}

export function getRandomSpawnPoint(userId: UserId): { position: Vector3; rotation: Quaternion } {
  const spawnPoints = spawnPointQuery()
  const spawnPointForUser = spawnPoints.find((entity) =>
    getComponent(entity, SpawnPointComponent).permissionedUsers.includes(userId)
  )
  const entity = spawnPointForUser ?? spawnPoints[Math.round(Math.random() * (spawnPoints.length - 1))]
  if (entity) {
    const spawnTransform = getComponent(entity, TransformComponent)
    return {
      position: spawnTransform.position
        .clone()
        .add(randomPositionCentered(new Vector3(spawnTransform.scale.x, 0, spawnTransform.scale.z))),
      rotation: spawnTransform.rotation.clone()
    }
  }

  console.warn("Couldn't spawn entity at spawn point, no spawn points available")

  return {
    position: randomPositionCentered(new Vector3(2, 0, 2)),
    rotation: new Quaternion()
  }
}

export function getSpawnPoint(spawnPointNodeId: string, userId: UserId): { position: Vector3; rotation: Quaternion } {
  const entity = UUIDComponent.entitiesByUUID[spawnPointNodeId]
  if (entity) {
    const spawnTransform = getComponent(entity, TransformComponent)
    const spawnComponent = getComponent(entity, SpawnPointComponent)
    if (!spawnComponent.permissionedUsers.length || spawnComponent.permissionedUsers.includes(userId)) {
      return {
        position: spawnTransform.position
          .clone()
          .add(randomPositionCentered(new Vector3(spawnTransform.scale.x, 0, spawnTransform.scale.z))),
        rotation: spawnTransform.rotation.clone()
      }
    }
  }
  return getRandomSpawnPoint(userId)
}

export function avatarDetailsReceptor(action: ReturnType<typeof WorldNetworkAction.avatarDetails>) {
  const userAvatarDetails = getMutableState(WorldState).userAvatarDetails
  userAvatarDetails[action.uuid].set(action.avatarDetail)
  if (isClient && action.avatarDetail.avatarURL) {
    const entity = UUIDComponent.entitiesByUUID[action.uuid]
    loadAvatarForUser(entity, action.avatarDetail.avatarURL)
  }
}

const spawnPointQuery = defineQuery([SpawnPointComponent, TransformComponent])

const avatarSpawnQueue = defineActionQueue(WorldNetworkAction.spawnAvatar.matches)
const avatarDetailsQueue = defineActionQueue(WorldNetworkAction.avatarDetails.matches)

const execute = () => {
  for (const action of avatarSpawnQueue()) spawnAvatarReceptor(action)
  for (const action of avatarDetailsQueue()) avatarDetailsReceptor(action)

  // Keep a list of spawn points so we can send our user to one
  for (const entity of spawnPointQuery.enter()) {
    if (!hasComponent(entity, TransformComponent)) {
      console.warn("Can't add spawn point, no transform component on entity")
      continue
    }
  }
}

export const AvatarSpawnSystem = defineSystem({
  uuid: 'ee.engine.AvatarSpawnSystem',
  execute
})
