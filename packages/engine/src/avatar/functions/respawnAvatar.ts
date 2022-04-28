import { dispatchAction } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { NetworkWorldAction } from '../../networking/functions/NetworkWorldAction'
import { SpawnPoseComponent } from '../components/SpawnPoseComponent'

export const respawnAvatar = (entity: Entity) => {
  const { position, rotation } = getComponent(entity, SpawnPoseComponent)
  console.log('\n\n\n\n\n\n\n\n\n\n\nRESPAWN AVATAR\n\n\n\n\n\n', position)
  const networkObject = getComponent(entity, NetworkObjectComponent)
  dispatchAction(
    Engine.instance.currentWorld.store,
    NetworkWorldAction.teleportObject({
      object: {
        ownerId: Engine.instance.userId,
        networkId: networkObject.networkId
      },
      pose: [position.x, position.y, position.z, rotation.x, rotation.y, rotation.z, rotation.w]
    })
  )
}
