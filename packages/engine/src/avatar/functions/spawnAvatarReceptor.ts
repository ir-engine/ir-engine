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

import { Collider, ColliderDesc, RigidBody, RigidBodyDesc } from '@dimforge/rapier3d-compat'
import { AnimationClip, AnimationMixer, Object3D, Vector3 } from 'three'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import { getState } from '@etherealengine/hyperflux'

import { setTargetCameraRotation } from '../../camera/systems/CameraInputSystem'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { SceneState } from '../../ecs/classes/Scene'
import { getComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { BoundingBoxComponent, BoundingBoxDynamicTag } from '../../interaction/components/BoundingBoxComponents'
import { GrabberComponent } from '../../interaction/components/GrabbableComponent'
import {
  NetworkObjectComponent,
  NetworkObjectSendPeriodicUpdatesTag
} from '../../networking/components/NetworkObjectComponent'
import { WorldState } from '../../networking/interfaces/WorldState'
import { Physics } from '../../physics/classes/Physics'
import { CollisionComponent } from '../../physics/components/CollisionComponent'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { AvatarCollisionMask, CollisionGroups } from '../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../physics/functions/getInteractionGroups'
import { PhysicsState } from '../../physics/state/PhysicsState'
import { EnvmapComponent } from '../../scene/components/EnvmapComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { ShadowComponent } from '../../scene/components/ShadowComponent'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { EnvMapSourceType } from '../../scene/constants/EnvMapEnum'
import { DistanceFromCameraComponent, FrustumCullCameraComponent } from '../../transform/components/DistanceComponents'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'

export const avatarRadius = 0.125
export const defaultAvatarHeight = 1.8
export const defaultAvatarHalfHeight = defaultAvatarHeight / 2

export const spawnAvatarReceptor = (entityUUID: EntityUUID) => {
  const entity = UUIDComponent.entitiesByUUID[entityUUID]
  if (!entity) return

  const ownerID = getComponent(entity, NetworkObjectComponent).ownerId
  const isOwner = ownerID === (entityUUID as string as UserID)

  if (isOwner) {
    const existingAvatarEntity = NetworkObjectComponent.getUserAvatarEntity(entityUUID as string as UserID)

    // already spawned into the world on another device or tab
    if (existingAvatarEntity) return
  }

  setComponent(entity, AvatarComponent, {
    avatarHalfHeight: defaultAvatarHalfHeight,
    avatarHeight: defaultAvatarHeight,
    model: null
  })

  const userNames = getState(WorldState).userNames
  const userName = userNames[entityUUID]
  const shortId = ownerID.substring(0, 7)
  setComponent(entity, NameComponent, 'avatar-' + (userName ? shortId + ' (' + userName + ')' : shortId))

  setComponent(entity, VisibleComponent, true)

  setComponent(entity, BoundingBoxDynamicTag)
  setComponent(entity, BoundingBoxComponent)
  setComponent(entity, DistanceFromCameraComponent)
  setComponent(entity, FrustumCullCameraComponent)

  setComponent(entity, EnvmapComponent, {
    type: EnvMapSourceType.Bake,
    envMapIntensity: 0.5,
    envMapSourceEntityUUID: getComponent(SceneState.getRootEntity(), UUIDComponent)
  })

  setComponent(entity, AnimationComponent, {
    mixer: new AnimationMixer(new Object3D()),
    animations: [] as AnimationClip[]
  })

  setComponent(entity, AvatarAnimationComponent, {
    rootYRatio: 1,
    locomotion: new Vector3()
  })

  if (ownerID === Engine.instance.userID) {
    createAvatarController(entity)
  } else {
    createAvatarRigidBody(entity)
    createAvatarCollider(entity)
  }

  setComponent(entity, NetworkObjectSendPeriodicUpdatesTag)

  setComponent(entity, ShadowComponent)
  setComponent(entity, GrabberComponent)
}

export const createAvatarCollider = (entity: Entity): Collider => {
  const interactionGroups = getInteractionGroups(CollisionGroups.Avatars, AvatarCollisionMask)
  const avatarComponent = getComponent(entity, AvatarComponent)
  const rigidBody = getComponent(entity, RigidBodyComponent)
  const transform = getComponent(entity, TransformComponent)
  rigidBody.position.copy(transform.position)
  rigidBody.rotation.copy(transform.rotation)

  const bodyColliderDesc = ColliderDesc.capsule(
    avatarComponent.avatarHalfHeight - avatarRadius - 0.25,
    avatarRadius
  ).setCollisionGroups(interactionGroups)
  bodyColliderDesc.setTranslation(0, avatarComponent.avatarHalfHeight + 0.25, 0)

  return Physics.createColliderAndAttachToRigidBody(
    getState(PhysicsState).physicsWorld,
    bodyColliderDesc,
    rigidBody.body
  )
}

const createAvatarRigidBody = (entity: Entity): RigidBody => {
  const rigidBodyDesc = RigidBodyDesc.kinematicPositionBased()
  const rigidBody = Physics.createRigidBody(entity, getState(PhysicsState).physicsWorld, rigidBodyDesc, [])
  rigidBody.lockRotations(true, false)
  rigidBody.setEnabledRotations(false, true, false, false)

  return rigidBody
}

export const createAvatarController = (entity: Entity) => {
  createAvatarRigidBody(entity)
  const rigidbody = getComponent(entity, RigidBodyComponent)
  const transform = getComponent(entity, TransformComponent)
  rigidbody.position.copy(transform.position)
  rigidbody.rotation.copy(transform.rotation)
  rigidbody.targetKinematicPosition.copy(transform.position)
  rigidbody.targetKinematicRotation.copy(transform.rotation)

  const avatarForward = new Vector3(0, 0, 1).applyQuaternion(transform.rotation)
  const cameraForward = new Vector3(0, 0, -1)
  let targetTheta = (cameraForward.angleTo(avatarForward) * 180) / Math.PI
  const orientation = cameraForward.x * avatarForward.z - cameraForward.z * avatarForward.x
  if (orientation > 0) targetTheta = 2 * Math.PI - targetTheta
  setTargetCameraRotation(Engine.instance.cameraEntity, 0, targetTheta, 0.01)

  setComponent(entity, AvatarControllerComponent, {
    bodyCollider: createAvatarCollider(entity),
    controller: Physics.createCharacterController(getState(PhysicsState).physicsWorld, {})
  })

  setComponent(entity, CollisionComponent)
}
