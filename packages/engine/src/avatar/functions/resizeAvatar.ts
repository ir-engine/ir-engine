import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { ColliderComponent } from '../../physics/components/ColliderComponent'
import { RaycastComponent } from '../../physics/components/RaycastComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'

export const resizeAvatar = (entity: Entity, height: number) => {
  const avatar = getComponent(entity, AvatarComponent)

  avatar.avatarHeight = height
  avatar.avatarHalfHeight = avatar.avatarHeight / 2

  getComponent(entity, AvatarControllerComponent)?.controller.resize(avatar.avatarHeight - 0.5)
  const shape = getComponent(entity, ColliderComponent).body.getShapes() as PhysX.PxShape
  const geometry = new PhysX.PxCapsuleGeometry(0, 0)
  shape.getCapsuleGeometry(geometry)
  geometry.setHalfHeight(avatar.avatarHalfHeight - 0.25)
  shape.setGeometry(geometry)

  const raycast = getComponent(entity, RaycastComponent)
  raycast.maxDistance = avatar.avatarHalfHeight + 0.05 // add small offset so raycaster hits properly
}
