import { Vector3 } from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { Physics } from '../../physics/classes/PhysicsRapier'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { avatarRadius, createAvatarCollider } from './createAvatar'

export const resizeAvatar = (entity: Entity, height: number, center: Vector3) => {
  const avatar = getComponent(entity, AvatarComponent)

  avatar.avatarHeight = height
  avatar.avatarHalfHeight = avatar.avatarHeight / 2

  Physics.removeCollidersFromRigidBody(entity, Engine.instance.currentWorld.physicsWorld)

  const rigidBody = getComponent(entity, RigidBodyComponent)
  const colliders = createAvatarCollider(
    entity,
    avatar.avatarHalfHeight - avatarRadius,
    avatarRadius,
    rigidBody,
    center
  )
}
