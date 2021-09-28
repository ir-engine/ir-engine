import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { dispatchFromClient } from '../../networking/functions/dispatch'
import { NetworkWorldAction } from '../../networking/interfaces/NetworkWorldActions'
import { SpawnPoseComponent } from '../components/SpawnPoseComponent'

export const respawnAvatar = (entity: Entity) => {
  const { position, rotation } = getComponent(entity, SpawnPoseComponent)
  const networkObject = getComponent(entity, NetworkObjectComponent)
  dispatchFromClient(
    NetworkWorldAction.teleportObject(networkObject.networkId, [
      position.x,
      position.y,
      position.z,
      rotation.x,
      rotation.y,
      rotation.z,
      rotation.w
    ])
  )
}
