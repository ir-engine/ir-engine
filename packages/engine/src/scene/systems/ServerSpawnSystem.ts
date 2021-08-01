import { Entity } from '../../ecs/classes/Entity'
import { System } from '../../ecs/classes/System'
import { getComponent, hasComponent, removeComponent } from '../../ecs/functions/EntityFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { SpawnPointComponent } from '../components/SpawnPointComponent'
import { Quaternion, Vector3 } from 'three'
import { RespawnTagComponent } from '../components/RespawnTagComponent'
import { NetworkObjectUpdateType } from '../../networking/templates/NetworkObjectUpdateSchema'
import { sendClientObjectUpdate } from '../../networking/functions/sendClientObjectUpdate'
import { CharacterComponent } from '../../character/components/CharacterComponent'
import { ControllerColliderComponent } from '../../character/components/ControllerColliderComponent'
import { SpawnComponent } from '../components/SpawnComponent'
import { createNetworkPlayer } from '../../character/prefabs/NetworkPlayerCharacter'

const randomPositionCentered = (area: Vector3) => {
  return new Vector3((Math.random() - 0.5) * area.x, (Math.random() - 0.5) * area.y, (Math.random() - 0.5) * area.z)
}

export class ServerSpawnSystem extends System {
  private spawnPoints: Entity[] = []
  private lastSpawnIndex = 0

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
      const index = this.spawnPoints.indexOf(entity)

      if (index > -1) {
        this.spawnPoints.splice(index)
      }
    }

    for (const entity of this.queryResults.spawnPlayer.added) {
      const { userId } = getComponent(entity, SpawnComponent)
      createNetworkPlayer({ entity, ownerId: userId })
      removeComponent(entity, SpawnComponent)
    }

    // currently hard coded for characters, we should make this work with any entity
    for (const entity of this.queryResults.respawn.added) {
      const { position, rotation } = this.getRandomSpawnPoint()
      const actor = getComponent(entity, CharacterComponent)
      const transform = getComponent(entity, TransformComponent)
      const controller = getComponent(entity, ControllerColliderComponent)

      const pos = position.clone()
      pos.y += actor.actorHalfHeight

      console.log('[Player Respawn]', position)

      controller.controller.updateTransform({
        translation: pos,
        rotation
      })

      transform.position.copy(pos)
      transform.rotation.copy(rotation)

      sendClientObjectUpdate(entity, NetworkObjectUpdateType.ForceTransformUpdate, [
        pos.x,
        pos.y,
        pos.z,
        rotation.x,
        rotation.y,
        rotation.z,
        rotation.w
      ])
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
  },
  spawnPlayer: {
    components: [SpawnComponent],
    listen: {
      added: true,
      removed: true
    }
  },
  respawn: {
    components: [RespawnTagComponent, CharacterComponent],
    listen: {
      added: true,
      removed: true
    }
  }
}
