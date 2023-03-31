import { Vector3 } from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { ComponentType, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { Physics } from '../../physics/classes/Physics'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { createAvatarCollider } from './spawnAvatarReceptor'

const vec3 = new Vector3()

export const resizeAvatar = (entity: Entity, height: number, center: Vector3) => {
  const avatar = getComponent(entity, AvatarComponent)
  const transform = getComponent(entity, TransformComponent)
  const rigComponent = getComponent(entity, AvatarRigComponent)
  const rig = rigComponent.rig

  avatar.avatarHeight = height
  avatar.avatarHalfHeight = avatar.avatarHeight / 2
  rig.Hips.updateWorldMatrix(true, true)
  rigComponent.torsoLength = rig.Head.getWorldPosition(vec3).y - rig.Hips.getWorldPosition(vec3).y
  rigComponent.upperLegLength = rig.Hips.getWorldPosition(vec3).y - rig.LeftLeg.getWorldPosition(vec3).y
  rigComponent.lowerLegLength = rig.LeftLeg.getWorldPosition(vec3).y - rig.LeftFoot.getWorldPosition(vec3).y
  rigComponent.footHeight = rig.LeftFoot.getWorldPosition(vec3).y - transform.position.y

  if (!hasComponent(entity, RigidBodyComponent)) return

  Physics.removeCollidersFromRigidBody(entity, Engine.instance.physicsWorld)

  const collider = createAvatarCollider(entity)

  if (hasComponent(entity, AvatarControllerComponent)) {
    ;(getComponent(entity, AvatarControllerComponent) as ComponentType<typeof AvatarControllerComponent>).bodyCollider =
      collider
  }
}
