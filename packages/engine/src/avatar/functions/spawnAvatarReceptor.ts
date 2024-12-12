/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { AnimationClip, AnimationMixer, Object3D, Vector3 } from 'three'

import {
  createEntity,
  Engine,
  Entity,
  EntityUUID,
  getComponent,
  getOptionalComponent,
  setComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { NetworkObjectComponent, NetworkObjectSendPeriodicUpdatesTag } from '@ir-engine/network'
import { setTargetCameraRotation } from '@ir-engine/spatial/src/camera/functions/CameraFunctions'
import { InputComponent } from '@ir-engine/spatial/src/input/components/InputComponent'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { AvatarCollisionMask, CollisionGroups } from '@ir-engine/spatial/src/physics/enums/CollisionGroups'
import { BodyTypes, Shapes } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import { addObjectToGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import {
  DistanceFromCameraComponent,
  FrustumCullCameraComponent
} from '@ir-engine/spatial/src/transform/components/DistanceComponents'
import { EntityTreeComponent } from '@ir-engine/spatial/src/transform/components/EntityTree'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { proxifyParentChildRelationships } from '@ir-engine/spatial/src/renderer/functions/proxifyParentChildRelationships'
import { GrabberComponent } from '../../grabbable/GrabbableComponent'
import { EnvmapComponent } from '../../scene/components/EnvmapComponent'
import { ShadowComponent } from '../../scene/components/ShadowComponent'
import { EnvMapSourceType } from '../../scene/constants/EnvMapEnum'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarAnimationComponent, AvatarRigComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarColliderComponent, AvatarControllerComponent, eyeOffset } from '../components/AvatarControllerComponent'

export const spawnAvatarReceptor = (entityUUID: EntityUUID) => {
  const entity = UUIDComponent.getEntityByUUID(entityUUID)
  if (!entity) return

  const ownerID = getComponent(entity, NetworkObjectComponent).ownerId
  setComponent(entity, TransformComponent)

  const obj3d = new Object3D()
  obj3d.entity = entity
  addObjectToGroup(entity, obj3d)
  proxifyParentChildRelationships(obj3d)

  setComponent(entity, VisibleComponent, true)

  setComponent(entity, DistanceFromCameraComponent)
  setComponent(entity, FrustumCullCameraComponent)

  setComponent(entity, EnvmapComponent, {
    type: EnvMapSourceType.Skybox,
    envMapIntensity: 1
  })

  setComponent(entity, AnimationComponent, {
    mixer: new AnimationMixer(new Object3D()),
    animations: [] as AnimationClip[]
  })

  setComponent(entity, AvatarAnimationComponent, {
    locomotion: new Vector3()
  })

  setComponent(entity, AvatarComponent)

  createAvatarCollider(entity)

  setComponent(entity, RigidBodyComponent, {
    type: BodyTypes.Kinematic,
    allowRolling: false,
    enabledRotations: [false, true, false]
  })

  if (ownerID === Engine.instance.userID) {
    createAvatarController(entity)
  }

  setComponent(entity, NetworkObjectSendPeriodicUpdatesTag)

  setComponent(entity, ShadowComponent)
  setComponent(entity, GrabberComponent)
  setComponent(entity, AvatarRigComponent)

  setComponent(entity, InputComponent)
}

export const createAvatarCollider = (entity: Entity) => {
  const colliderEntity = createEntity()
  setComponent(entity, AvatarColliderComponent, { colliderEntity })

  setComponent(colliderEntity, EntityTreeComponent, { parentEntity: entity })
  setComponent(colliderEntity, ColliderComponent, {
    shape: Shapes.Capsule,
    collisionLayer: CollisionGroups.Avatars,
    collisionMask: AvatarCollisionMask
  })
}

const avatarCapsuleOffset = 0.25
export const setAvatarColliderTransform = (entity: Entity) => {
  const avatarCollider = getOptionalComponent(entity, AvatarColliderComponent)
  if (!avatarCollider) {
    return
  }
  const colliderEntity = avatarCollider.colliderEntity
  const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
  const avatarRadius = eyeOffset + camera.near
  const avatarComponent = getComponent(entity, AvatarComponent)
  const halfHeight = avatarComponent.avatarHeight * 0.5

  setComponent(colliderEntity, TransformComponent, {
    position: new Vector3(0, halfHeight + avatarCapsuleOffset, 0),
    scale: new Vector3(avatarRadius, halfHeight - avatarRadius - avatarCapsuleOffset, avatarRadius)
  })
}

export const createAvatarController = (entity: Entity) => {
  const transform = getComponent(entity, TransformComponent)

  const avatarForward = new Vector3(0, 0, 1).applyQuaternion(transform.rotation)
  const cameraForward = new Vector3(0, 0, -1)
  let targetTheta = (cameraForward.angleTo(avatarForward) * 180) / Math.PI
  const orientation = cameraForward.x * avatarForward.z - cameraForward.z * avatarForward.x
  if (orientation > 0) targetTheta = 2 * Math.PI - targetTheta
  setTargetCameraRotation(Engine.instance.cameraEntity, 0, targetTheta, 0.01)

  setComponent(entity, AvatarControllerComponent)
}
