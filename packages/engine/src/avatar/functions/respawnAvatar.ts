import { Entity } from '../../ecs/Entity'
import { getComponent } from '../../ecs/ComponentFunctions'
import { useWorld } from '../../ecs/SystemHooks'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { dispatchFrom } from '../../networking/functions/dispatchFrom'
import { NetworkWorldAction } from '../../networking/functions/NetworkWorldAction'
import { SpawnPoseComponent } from '../components/SpawnPoseComponent'

export const respawnAvatar = (entity: Entity) => {
  const { position, rotation } = getComponent(entity, SpawnPoseComponent)
  const networkObject = getComponent(entity, NetworkObjectComponent)
  dispatchFrom(useWorld().hostId, () =>
    NetworkWorldAction.teleportObject({
      networkId: networkObject.networkId,
      pose: [position.x, position.y, position.z, rotation.x, rotation.y, rotation.z, rotation.w]
    })
  )
}
