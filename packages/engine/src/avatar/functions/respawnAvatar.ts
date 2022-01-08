import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { NetworkWorldAction } from '../../networking/functions/NetworkWorldAction'
import { dispatchLocal } from '../../networking/functions/dispatchFrom'
import { SpawnPoseComponent } from '../components/SpawnPoseComponent'

export const respawnAvatar = (entity: Entity) => {
  const { position, rotation } = getComponent(entity, SpawnPoseComponent)
  console.log('\n\n\n\n\n\n\n\n\n\n\nRESPAWN AVATAR\n\n\n\n\n\n', position)
  const networkObject = getComponent(entity, NetworkObjectComponent)
  dispatchLocal(
    NetworkWorldAction.teleportObject({
      object: {
        ownerId: Engine.userId,
        networkId: networkObject.networkId
      },
      pose: [position.x, position.y, position.z, rotation.x, rotation.y, rotation.z, rotation.w]
    })
  )
}
