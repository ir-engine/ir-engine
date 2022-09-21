import { Quaternion, Vector3 } from 'three'

import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { createActionQueue, removeActionQueue } from '@xrengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { World } from '../ecs/classes/World'
import { defineQuery, getComponent, hasComponent, removeQuery } from '../ecs/functions/ComponentFunctions'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { SpawnPointComponent } from '../scene/components/SpawnPointComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { createAvatar } from './functions/createAvatar'

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
      rotation: new Quaternion() //spawnTransform.rotation.clone()
    }
  }

  console.warn("Couldn't spawn entity at spawn point, no spawn points available")

  return {
    position: randomPositionCentered(new Vector3(2, 0, 2)),
    rotation: new Quaternion()
  }
}

export function getSpawnPoint(spawnPointNodeId: string, userId: UserId): { position: Vector3; rotation: Quaternion } {
  const entity = Engine.instance.currentWorld.entityTree.uuidNodeMap.get(spawnPointNodeId)?.entity
  if (entity) {
    const spawnTransform = getComponent(entity, TransformComponent)
    const spawnComponent = getComponent(entity, SpawnPointComponent)
    if (!spawnComponent.permissionedUsers.length || spawnComponent.permissionedUsers.includes(userId)) {
      return {
        position: spawnTransform.position
          .clone()
          .add(randomPositionCentered(new Vector3(spawnTransform.scale.x, 0, spawnTransform.scale.z))),
        rotation: new Quaternion() //spawnTransform.rotation.clone()
      }
    }
  }
  return getRandomSpawnPoint(userId)
}

const spawnPointQuery = defineQuery([SpawnPointComponent, TransformComponent])

export default async function AvatarSpawnSystem(world: World) {
  const avatarSpawnQueue = createActionQueue(WorldNetworkAction.spawnAvatar.matches)

  const execute = () => {
    for (const action of avatarSpawnQueue()) createAvatar(action)

    // Keep a list of spawn points so we can send our user to one
    for (const entity of spawnPointQuery.enter(world)) {
      if (!hasComponent(entity, TransformComponent)) {
        console.warn("Can't add spawn point, no transform component on entity")
        continue
      }
    }
  }

  const cleanup = async () => {
    removeQuery(world, spawnPointQuery)
    removeActionQueue(avatarSpawnQueue)
  }

  return { execute, cleanup }
}
