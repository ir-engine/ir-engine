import { Entity } from '../ecs/classes/Entity'
import { System } from '../ecs/classes/System'
import { getComponent, hasComponent, removeComponent } from '../ecs/functions/EntityFunctions'
import { TransformComponent } from '../transform/components/TransformComponent'
import { SpawnPointComponent } from '../scene/components/SpawnPointComponent'
import { Quaternion, Vector3 } from 'three'
import { SpawnNetworkObjectComponent } from '../scene/components/SpawnNetworkObjectComponent'
import { createAvatar } from './functions/createAvatar'
import { Network } from '../networking/classes/Network'
import { PrefabType } from '../networking/templates/PrefabType'
import { EngineEvents } from '../ecs/classes/EngineEvents'
import { AvatarTagComponent } from './components/AvatarTagComponent'

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
    const spawnTransform = getComponent(
      SpawnPoints.instance.spawnPoints[SpawnPoints.instance.lastSpawnIndex],
      TransformComponent
    )
    if (spawnTransform && SpawnPoints.instance.spawnPoints.length > 0) {
      // Get new spawn point (round robin)
      SpawnPoints.instance.lastSpawnIndex =
        (SpawnPoints.instance.lastSpawnIndex + 1) % SpawnPoints.instance.spawnPoints.length
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
}

export class ServerAvatarSpawnSystem extends System {
  execute(): void {
    // Keep a list of spawn points so we can send our user to one
    for (const entity of this.queryResults.spawnPoint.added) {
      if (!hasComponent(entity, TransformComponent)) {
        console.warn("Can't add spawn point, no transform component on entity")
        continue
      }
      SpawnPoints.instance.spawnPoints.push(entity)
    }
    for (const entity of this.queryResults.spawnPoint.removed) {
      const index = SpawnPoints.instance.spawnPoints.indexOf(entity)

      if (index > -1) {
        SpawnPoints.instance.spawnPoints.splice(index)
      }
    }

    for (const entity of this.queryResults.spawnPlayer.added) {
      const { uniqueId, networkId, parameters } = removeComponent(entity, SpawnNetworkObjectComponent)
      createAvatar(entity, parameters)

      const transform = getComponent(entity, TransformComponent)

      Network.instance.worldState.createObjects.push({
        networkId,
        ownerId: uniqueId,
        prefabType: PrefabType.Player,
        uniqueId,
        parameters: { position: transform.position, rotation: transform.rotation }
      })

      EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.CLIENT_USER_LOADED, networkId, uniqueId })
    }
  }
}

ServerAvatarSpawnSystem.queries = {
  spawnPoint: {
    components: [SpawnPointComponent, TransformComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  spawnPlayer: {
    components: [SpawnNetworkObjectComponent, AvatarTagComponent],
    listen: {
      added: true,
      removed: true
    }
  }
}
