import { Entity } from '../ecs/classes/Entity'
import { defineQuery, getComponent, hasComponent, removeComponent } from '../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../transform/components/TransformComponent'
import { SpawnPointComponent } from '../scene/components/SpawnPointComponent'
import { Quaternion, Vector3 } from 'three'
import { SpawnNetworkObjectComponent } from '../scene/components/SpawnNetworkObjectComponent'
import { createAvatar } from './functions/createAvatar'
import { Network } from '../networking/classes/Network'
import { PrefabType } from '../networking/templates/PrefabType'
import { EngineEvents } from '../ecs/classes/EngineEvents'
import { AvatarTagComponent } from './components/AvatarTagComponent'
import { System } from '../ecs/classes/System'
import { World } from '../ecs/classes/World'

const randomPositionCentered = (area: Vector3) => {
  return new Vector3((Math.random() - 0.5) * area.x, (Math.random() - 0.5) * area.y, (Math.random() - 0.5) * area.z)
}

export class SpawnPoints {
  static instance: SpawnPoints

  spawnPoints: Entity[] = []
  lastSpawnIndex = 0

  constructor() {
    SpawnPoints.instance = this
  }

  getRandomSpawnPoint(): { position: Vector3; rotation: Quaternion } {
    if (typeof this.spawnPoints[this.lastSpawnIndex] !== 'undefined') {
      const spawnTransform = getComponent(this.spawnPoints[this.lastSpawnIndex], TransformComponent)
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
}

export default async function ServerAvatarSpawnSystem(world: World): Promise<System> {
  const spawnPointQuery = defineQuery([SpawnPointComponent, TransformComponent])
  const spawnPlayerQuery = defineQuery([SpawnNetworkObjectComponent, AvatarTagComponent])

  return () => {
    // Keep a list of spawn points so we can send our user to one
    for (const entity of spawnPointQuery.enter(world)) {
      if (!hasComponent(entity, TransformComponent)) {
        console.warn("Can't add spawn point, no transform component on entity")
        continue
      }
      SpawnPoints.instance.spawnPoints.push(entity)
    }
    for (const entity of spawnPointQuery.exit(world)) {
      const index = SpawnPoints.instance.spawnPoints.indexOf(entity)

      if (index > -1) {
        SpawnPoints.instance.spawnPoints.splice(index)
      }
    }

    for (const entity of spawnPlayerQuery.enter(world)) {
      const { uniqueId, networkId, parameters } = removeComponent(entity, SpawnNetworkObjectComponent)
      createAvatar(world, entity, parameters)
      EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.CLIENT_USER_LOADED, networkId, uniqueId })
    }
  }
}
