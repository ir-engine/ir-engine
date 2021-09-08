import { FollowCameraComponent } from '../camera/components/FollowCameraComponent'
import { CameraMode } from '../camera/types/CameraMode'
import { EngineEvents } from '../ecs/classes/EngineEvents'
import { addComponent, defineQuery, removeComponent } from '../ecs/functions/EntityFunctions'
import { LocalInputTagComponent } from '../input/components/LocalInputTagComponent'
import { Network } from '../networking/classes/Network'
import { InterpolationComponent } from '../physics/components/InterpolationComponent'
import { CollisionGroups } from '../physics/enums/CollisionGroups'
import { PersistTagComponent } from '../scene/components/PersistTagComponent'
import { ShadowComponent } from '../scene/components/ShadowComponent'
import { SpawnNetworkObjectComponent } from '../scene/components/SpawnNetworkObjectComponent'
import { AvatarTagComponent } from './components/AvatarTagComponent'
import { createAvatar } from './functions/createAvatar'
import { AudioTagComponent } from '../audio/components/AudioTagComponent'
import { Quaternion, Vector3 } from 'three'
import { System } from '../ecs/classes/System'
import { World } from '../ecs/classes/World'

const spawnQuery = defineQuery([SpawnNetworkObjectComponent, AvatarTagComponent])

export default async function ClientAvatarSpawnSystem(world: World): Promise<System> {
  return () => {
    for (const entity of spawnQuery.enter()) {
      const { uniqueId, networkId, parameters } = removeComponent(entity, SpawnNetworkObjectComponent)

      const isLocalPlayer = uniqueId === Network.instance.userId
      createAvatar(
        entity,
        { position: new Vector3().copy(parameters.position), rotation: new Quaternion().copy(parameters.rotation) },
        !isLocalPlayer
      )

      addComponent(entity, AudioTagComponent, {})
      addComponent(entity, InterpolationComponent, {})
      addComponent(entity, ShadowComponent, { receiveShadow: true, castShadow: true })

      if (isLocalPlayer) {
        addComponent(entity, LocalInputTagComponent, {})
        addComponent(entity, FollowCameraComponent, {
          mode: CameraMode.ThirdPerson,
          distance: 5,
          minDistance: 2,
          maxDistance: 7,
          theta: Math.PI,
          phi: 0,
          shoulderSide: true,
          locked: true,
          raycastQuery: null,
          rayHasHit: false,
          collisionMask: CollisionGroups.Default
        })
        addComponent(entity, PersistTagComponent, {})

        Network.instance.localClientEntity = entity
      }

      EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.CLIENT_USER_LOADED, networkId, uniqueId })
    }
  }
}
