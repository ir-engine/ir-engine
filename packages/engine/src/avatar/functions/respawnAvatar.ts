import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { SpawnPoseComponent } from '../components/SpawnPoseComponent'
import { teleportAvatar } from './moveAvatar'

export const respawnAvatar = (entity: Entity) => {
  const { position } = getComponent(entity, SpawnPoseComponent)
  const controller = getComponent(entity, AvatarControllerComponent)
  controller.verticalVelocity = 0
  teleportAvatar(entity, position)
}
