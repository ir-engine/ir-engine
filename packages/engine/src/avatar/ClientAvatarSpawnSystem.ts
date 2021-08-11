import { defineQuery, defineSystem, enterQuery, System } from '../ecs/bitecs'
import { FollowCameraComponent } from '../camera/components/FollowCameraComponent'
import { CameraModes } from '../camera/types/CameraModes'
import { EngineEvents } from '../ecs/classes/EngineEvents'
import { ECSWorld } from '../ecs/classes/World'
import { addComponent, removeComponent } from '../ecs/functions/EntityFunctions'
import { LocalInputReceiverComponent } from '../input/components/LocalInputReceiverComponent'
import { InteractorComponent } from '../interaction/components/InteractorComponent'
import { Network } from '../networking/classes/Network'
import { InterpolationComponent } from '../physics/components/InterpolationComponent'
import { CollisionGroups } from '../physics/enums/CollisionGroups'
import { PersistTagComponent } from '../scene/components/PersistTagComponent'
import { ShadowComponent } from '../scene/components/ShadowComponent'
import { SpawnNetworkObjectComponent } from '../scene/components/SpawnNetworkObjectComponent'
import { AvatarTagComponent } from './components/AvatarTagComponent'
import { createAvatar } from './functions/createAvatar'
import { AudioTagComponent } from '../audio/components/AudioTagComponent'

export const ClientAvatarSpawnSystem = async (): Promise<System> => {
  const spawnQuery = defineQuery([SpawnNetworkObjectComponent, AvatarTagComponent])
  const spawnAddQuery = enterQuery(spawnQuery)

  return defineSystem((world: ECSWorld) => {
    for (const entity of spawnAddQuery(world)) {
      const { uniqueId, networkId, parameters } = removeComponent(entity, SpawnNetworkObjectComponent)

      const isLocalPlayer = uniqueId === Network.instance.userId
      createAvatar(entity, parameters, !isLocalPlayer)

      addComponent(entity, AudioTagComponent, {})
      addComponent(entity, InterpolationComponent, {})
      addComponent(entity, ShadowComponent, { receiveShadow: true, castShadow: true })

      if (isLocalPlayer) {
        addComponent(entity, LocalInputReceiverComponent, {})
        addComponent(entity, FollowCameraComponent, {
          mode: CameraModes.ThirdPerson,
          distance: 3,
          minDistance: 2,
          maxDistance: 7,
          theta: 0,
          phi: 0,
          shoulderSide: true,
          locked: true,
          raycastQuery: null,
          rayHasHit: false,
          collisionMask: CollisionGroups.Default
        })
        addComponent(entity, InteractorComponent, {
          focusedInteractive: null,
          subFocusedArray: []
        })
        addComponent(entity, PersistTagComponent, {})

        Network.instance.localAvatarNetworkId = networkId
        Network.instance.localClientEntity = entity
      }

      EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.CLIENT_USER_LOADED, networkId, uniqueId })
    }

    return world
  })
}
