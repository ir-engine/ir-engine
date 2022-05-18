import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { dispatchFrom, dispatchLocal } from '../../networking/functions/dispatchFrom'
import { NetworkWorldAction } from '../../networking/functions/NetworkWorldAction'
import { SpawnPoseComponent } from '../components/SpawnPoseComponent'

export const respawnAvatar = (entity: Entity) => {
  const { position, rotation } = getComponent(entity, SpawnPoseComponent)
  console.log('\n\n\n\n\n\n\n\n\n\n\nRESPAWN AVATAR\n\n\n\n\n\n', position)
  const networkObject = getComponent(entity, NetworkObjectComponent)
  dispatchLocal(
    NetworkWorldAction.teleportObject({
      networkId: networkObject.networkId,
      pose: [position.x, position.y, position.z, rotation.x, rotation.y, rotation.z, rotation.w]
    })
  )
}
