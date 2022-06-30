import { Quaternion, Vector3 } from 'three'
import matches from 'ts-matches'

import { createActionQueue } from '@xrengine/hyperflux'

import { AudioTagComponent } from '../audio/components/AudioTagComponent'
import { FollowCameraComponent, FollowCameraDefaultValues } from '../camera/components/FollowCameraComponent'
import { isClient } from '../common/functions/isClient'
import { Engine } from '../ecs/classes/Engine'
import { Entity } from '../ecs/classes/Entity'
import { World } from '../ecs/classes/World'
import { addComponent, defineQuery, getComponent, hasComponent } from '../ecs/functions/ComponentFunctions'
import { LocalInputTagComponent } from '../input/components/LocalInputTagComponent'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { ShadowComponent } from '../scene/components/ShadowComponent'
import { SpawnPointComponent } from '../scene/components/SpawnPointComponent'
import { TransformComponent } from '../transform/components/TransformComponent'
import { AvatarComponent } from './components/AvatarComponent'
import { createAvatar } from './functions/createAvatar'

const randomPositionCentered = (area: Vector3) => {
  return new Vector3((Math.random() - 0.5) * area.x, (Math.random() - 0.5) * area.y, (Math.random() - 0.5) * area.z)
}

export class SpawnPoints {
  static instance = new SpawnPoints()

  spawnPoints: Entity[] = []
  lastSpawnIndex = 0

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

export function avatarSpawnReceptor(
  spawnAction: ReturnType<typeof WorldNetworkAction.spawnAvatar>,
  world = Engine.instance.currentWorld
) {
  if (isClient) {
    /**
     * When changing location via a portal, the local client entity will be
     * defined when the new world dispatches this action, so ignore it
     */
    if (Engine.instance.userId === spawnAction.$from && hasComponent(world.localClientEntity, AvatarComponent)) {
      return
    }
  }
  const entity = createAvatar(spawnAction)
  if (isClient) {
    addComponent(entity, AudioTagComponent, {})
    addComponent(entity, ShadowComponent, { receiveShadow: true, castShadow: true })

    if (spawnAction.$from === Engine.instance.userId) {
      addComponent(entity, LocalInputTagComponent, {})
    }
    /*
    dispatchAction(
      Engine.store,
      EngineActions.setupAnimation({
        entity: entity
      })
    )*/
  }
}

export default async function AvatarSpawnSystem(world: World) {
  const avatarSpawnQueue = createActionQueue(WorldNetworkAction.spawnAvatar.matches)

  const spawnPointQuery = defineQuery([SpawnPointComponent, TransformComponent])
  return () => {
    for (const action of avatarSpawnQueue()) avatarSpawnReceptor(action, world)

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
  }
}
