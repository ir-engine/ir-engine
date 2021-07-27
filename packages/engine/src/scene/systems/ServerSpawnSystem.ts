import { Entity } from '../../ecs/classes/Entity'
import { System } from '../../ecs/classes/System'
import { getComponent, hasComponent } from '../../ecs/functions/EntityFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import SpawnPointComponent from '../components/SpawnPointComponent'
import { Quaternion, Vector3 } from 'three'

const randomPositionCentered = (area: Vector3) => {
  return new Vector3((Math.random() - 0.5) * area.x, (Math.random() - 0.5) * area.y, (Math.random() - 0.5) * area.z)
}

export class ServerSpawnSystem extends System {
  spawnPoints: Entity[] = []
  lastSpawnIndex = 0

  static instance: ServerSpawnSystem

  constructor() {
    super()
    ServerSpawnSystem.instance = this
  }

  getRandomSpawnPoint(): { position: Vector3; rotation: Quaternion } {
    const spawnTransform = getComponent(this.spawnPoints[this.lastSpawnIndex], TransformComponent)
    if (spawnTransform && this.spawnPoints.length > 0) {
      // Get new spawn point (round robin)
      this.lastSpawnIndex = (this.lastSpawnIndex + 1) % this.spawnPoints.length
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

  execute(): void {
    // Keep a list of spawn points so we can send our user to one
    for (const entity of this.queryResults.spawnPoint.added) {
      if (!hasComponent(entity, TransformComponent)) {
        console.warn("Can't add spawn point, no transform component on entity")
        continue
      }
      this.spawnPoints.push(entity)
    }
    for (const entity of this.queryResults.spawnPoint.removed) {
      this.spawnPoints.splice(this.spawnPoints.indexOf(entity))
    }
  }
}

ServerSpawnSystem.queries = {
  spawnPoint: {
    components: [SpawnPointComponent, TransformComponent],
    listen: {
      added: true,
      removed: true
    }
  }
}
