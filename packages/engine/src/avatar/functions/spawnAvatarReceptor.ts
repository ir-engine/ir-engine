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
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import { getState } from '@etherealengine/hyperflux'

import { setTargetCameraRotation } from '../../camera/systems/CameraInputSystem'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { BoundingBoxComponent } from '../../interaction/components/BoundingBoxComponents'
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
import { NameComponent } from '../../scene/components/NameComponent'
import { ShadowComponent } from '../../scene/components/ShadowComponent'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { DistanceFromCameraComponent, FrustumCullCameraComponent } from '../../transform/components/DistanceComponents'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarControllerComponent } from '../components/AvatarControllerComponent'

export const avatarRadius = 0.25
export const defaultAvatarHeight = 1.8
export const defaultAvatarHalfHeight = defaultAvatarHeight / 2

export const spawnAvatarReceptor = (entityUUID: EntityUUID) => {
  const entity = UUIDComponent.entitiesByUUID[entityUUID]
  if (!entity) return

  const ownerID = getComponent(entity, NetworkObjectComponent).ownerId
  const primary = ownerID === (entityUUID as string as UserId)

  if (primary) {
    const existingAvatarEntity = Engine.instance.getUserAvatarEntity(entityUUID as string as UserId)

    // already spawned into the world on another device or tab
    if (existingAvatarEntity) return
  }

  const transform = getComponent(entity, TransformComponent)

  addComponent(entity, AvatarComponent, {
    primary,
    avatarHalfHeight: defaultAvatarHalfHeight,
    avatarHeight: defaultAvatarHeight,
    model: null
  })

  const userNames = getState(WorldState).userNames
  const userName = userNames[entityUUID]
  const shortId = ownerID.substring(0, 7)
  addComponent(entity, NameComponent, 'avatar-' + (userName ? shortId + ' (' + userName + ')' : shortId))

  addComponent(entity, VisibleComponent, true)

  setComponent(entity, DistanceFromCameraComponent)
  setComponent(entity, FrustumCullCameraComponent)

  addComponent(entity, AnimationComponent, {
    mixer: new AnimationMixer(new Object3D()),
    animations: [] as AnimationClip[],
    animationSpeed: 1
  })

  addComponent(entity, AvatarAnimationComponent, {
    animationGraph: {
      states: {},
      transitionRules: {},
      currentState: null!,
      stateChanged: null!
    },
    rootYRatio: 1,
    locomotion: new Vector3()
  })

  if (ownerID === Engine.instance.userId) {
    createAvatarController(entity)
    addComponent(entity, LocalInputTagComponent, true)
  } else {
    createAvatarRigidBody(entity)
    createAvatarCollider(entity)
  }

  setComponent(entity, NetworkObjectSendPeriodicUpdatesTag)

  setComponent(entity, ShadowComponent)
  setComponent(entity, BoundingBoxComponent)
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
    avatarComponent.avatarHalfHeight - avatarRadius,
    avatarRadius
  ).setCollisionGroups(interactionGroups)
  bodyColliderDesc.setTranslation(0, avatarComponent.avatarHalfHeight, 0)

  return Physics.createColliderAndAttachToRigidBody(Engine.instance.physicsWorld, bodyColliderDesc, rigidBody.body)
}

const createAvatarRigidBody = (entity: Entity): RigidBody => {
  const rigidBodyDesc = RigidBodyDesc.kinematicPositionBased()
  const rigidBody = Physics.createRigidBody(entity, Engine.instance.physicsWorld, rigidBodyDesc, [])
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
    controller: Physics.createCharacterController(Engine.instance.physicsWorld, {})
  })

  addComponent(entity, CollisionComponent)
}
