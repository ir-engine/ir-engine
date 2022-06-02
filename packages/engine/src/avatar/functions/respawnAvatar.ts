import { dispatchAction } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { SpawnPoseComponent } from '../components/SpawnPoseComponent'

export const respawnAvatar = (entity: Entity) => {
  const { position, rotation } = getComponent(entity, SpawnPoseComponent)
  const networkObject = getComponent(entity, NetworkObjectComponent)
  dispatchAction(
    WorldNetworkAction.teleportObject({
      object: {
        ownerId: Engine.instance.userId,
        networkId: networkObject.networkId
      },
      pose: [position.x, position.y, position.z, rotation.x, rotation.y, rotation.z, rotation.w]
    }),
    [Engine.instance.currentWorld.worldNetwork.hostId]
  )
}
