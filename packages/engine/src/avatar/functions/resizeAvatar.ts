/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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
const vec3_2 = new Vector3()

export const resizeAvatar = (entity: Entity, height: number, center: Vector3) => {
  const avatar = getComponent(entity, AvatarComponent)
  const transform = getComponent(entity, TransformComponent)
  const rigComponent = getComponent(entity, AvatarRigComponent)
  const rig = rigComponent.rig

  avatar.avatarHeight = height
  avatar.avatarHalfHeight = avatar.avatarHeight / 2
  rig.hips.node.updateWorldMatrix(true, true)
  rigComponent.torsoLength = rig.head.node.getWorldPosition(vec3).y - rig.hips.node.getWorldPosition(vec3).y
  rigComponent.upperLegLength = rig.hips.node.getWorldPosition(vec3).y - rig.leftUpperLeg.node.getWorldPosition(vec3).y
  rigComponent.lowerLegLength =
    rig.leftLowerLeg.node.getWorldPosition(vec3).y - rig.leftFoot.node.getWorldPosition(vec3).y
  rigComponent.footHeight = rig.leftFoot.node.getWorldPosition(vec3).y - transform.position.y
  rigComponent.armLength = rig.leftUpperArm.node.getWorldPosition(vec3).y - rig.leftHand.node.getWorldPosition(vec3).y
  if (!hasComponent(entity, RigidBodyComponent)) return

  Physics.removeCollidersFromRigidBody(entity, Engine.instance.physicsWorld)

  const collider = createAvatarCollider(entity)

  if (hasComponent(entity, AvatarControllerComponent)) {
    ;(getComponent(entity, AvatarControllerComponent) as ComponentType<typeof AvatarControllerComponent>).bodyCollider =
      collider
  }
}
