import { createState, none } from '@hookstate/core'
import { Quaternion, Vector3 } from 'three'

import { createActionQueue } from '@xrengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { Entity } from '../ecs/classes/Entity'
import { World } from '../ecs/classes/World'
import { defineQuery, getComponent, hasComponent } from '../ecs/functions/ComponentFunctions'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { SpawnPointComponent } from '../scene/components/SpawnPointComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { createAvatar } from './functions/createAvatar'

const randomPositionCentered = (area: Vector3) => {
  return new Vector3((Math.random() - 0.5) * area.x, (Math.random() - 0.5) * area.y, (Math.random() - 0.5) * area.z)
}

export class SpawnPoints {
  static instance = new SpawnPoints()

  spawnPoints = createState([] as Entity[])
  lastSpawnIndex = 0

  getRandomSpawnPoint(): { position: Vector3; rotation: Quaternion } {
    const lastSpawnPoint = this.spawnPoints[this.lastSpawnIndex].ornull
    if (lastSpawnPoint) {
      const spawnTransform = getComponent(lastSpawnPoint.value, TransformComponent)
      if (spawnTransform && this.spawnPoints.length > 0) {
        // Get new spawn point (round robin)
        this.lastSpawnIndex = (this.lastSpawnIndex + 1) % this.spawnPoints.length
        return {
          position: spawnTransform.position
            .clone()
            .add(randomPositionCentered(new Vector3(spawnTransform.scale.x, 0, spawnTransform.scale.z))),
          rotation: new Quaternion() //spawnTransform.rotation.clone()
        }
      }
    }

    console.warn("Couldn't spawn entity at spawn point, no spawn points available")

    return {
      position: randomPositionCentered(new Vector3(2, 0, 2)),
      rotation: new Quaternion()
    }
  }

  getSpawnPoint(id): { position: Vector3; rotation: Quaternion } {
    const spawnPointEntity = Engine.instance.currentWorld.entityTree.uuidNodeMap.get(id)
    try {
      const spawnTransform = getComponent(spawnPointEntity!.entity, TransformComponent)
      if (spawnTransform && this.spawnPoints.length > 0) {
        return {
          position: spawnTransform.position
            .clone()
            .add(randomPositionCentered(new Vector3(spawnTransform.scale.x, 0, spawnTransform.scale.z))),
          rotation: new Quaternion() //spawnTransform.rotation.clone()
        }
      }
      return this.getRandomSpawnPoint()
    } catch (err) {
      return this.getRandomSpawnPoint()
    }
  }
}

export default async function AvatarSpawnSystem(world: World) {
  const avatarSpawnQueue = createActionQueue(WorldNetworkAction.spawnAvatar.matches)
  const spawnPointQuery = defineQuery([SpawnPointComponent, TransformComponent])

  return () => {
    for (const action of avatarSpawnQueue()) createAvatar(action)

    // Keep a list of spawn points so we can send our user to one
    for (const entity of spawnPointQuery.enter(world)) {
      if (!hasComponent(entity, TransformComponent)) {
        console.warn("Can't add spawn point, no transform component on entity")
        continue
      }
      SpawnPoints.instance.spawnPoints.merge([entity])
    }
    for (const entity of spawnPointQuery.exit(world)) {
      const index = SpawnPoints.instance.spawnPoints.value.indexOf(entity)

      if (index > -1) {
        SpawnPoints.instance.spawnPoints[index].set(none)
      }
    }
  }
}
