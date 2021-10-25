import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { dispatchFrom } from '../../networking/functions/dispatchFrom'
import { NetworkWorldAction } from '../../networking/functions/NetworkWorldAction'
import { SpawnPoseComponent } from '../components/SpawnPoseComponent'

export const respawnAvatar = (entity: Entity) => {
  debugger
  const { position, rotation } = getComponent(entity, SpawnPoseComponent)
  const networkObject = getComponent(entity, NetworkObjectComponent)
  dispatchFrom(useWorld().hostId, () =>
    NetworkWorldAction.teleportObject({
      networkId: networkObject.networkId,
      pose: [position.x, position.y, position.z, rotation.x, rotation.y, rotation.z, rotation.w]
    })
  )
}
