import { FollowCameraComponent } from '../camera/components/FollowCameraComponent'
import { EngineEvents } from '../ecs/classes/EngineEvents'
import { System } from '../ecs/classes/System'
import { addComponent, removeComponent } from '../ecs/functions/EntityFunctions'
import { LocalInputReceiver } from '../input/components/LocalInputReceiver'
import { Interactor } from '../interaction/components/Interactor'
import { Network } from '../networking/classes/Network'
import { InterpolationComponent } from '../physics/components/InterpolationComponent'
import { PersistTagComponent } from '../scene/components/PersistTagComponent'
import { ShadowComponent } from '../scene/components/ShadowComponent'
import { SpawnNetworkObjectComponent } from '../scene/components/SpawnNetworkObjectComponent'
import { AvatarTagComponent } from './components/AvatarTagComponent'
import { createAvatar } from './functions/createAvatar'

export class ClientAvatarSpawnSystem extends System {
  execute(): void {
    for (const entity of this.queryResults.spawn.added) {
      const { uniqueId, networkId, parameters } = removeComponent(entity, SpawnNetworkObjectComponent)

      const isLocalPlayer = uniqueId === Network.instance.userId
      createAvatar(entity, parameters, !isLocalPlayer)

      addComponent(entity, InterpolationComponent)
      addComponent(entity, ShadowComponent)

      if (isLocalPlayer) {
        addComponent(entity, LocalInputReceiver)
        addComponent(entity, FollowCameraComponent)
        addComponent(entity, Interactor)
        addComponent(entity, PersistTagComponent)

        Network.instance.localAvatarNetworkId = networkId
        Network.instance.localClientEntity = entity
      }

      EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.CLIENT_USER_LOADED, networkId, uniqueId })
    }
  }

  static queries = {
    spawn: {
      components: [SpawnNetworkObjectComponent, AvatarTagComponent],
      listen: {
        added: true,
        removed: true
      }
    }
  }
}
