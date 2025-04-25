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

import { Quaternion, Vector3 } from 'three'

import {
  createEntity,
  Engine,
  Entity,
  EntityTreeComponent,
  EntityUUID,
  getComponent,
  getOptionalComponent,
  setComponent,
  UUIDComponent
} from '@ir-engine/ecs'
import { NetworkObjectComponent, NetworkObjectSendPeriodicUpdatesTag } from '@ir-engine/network'
import { setTargetCameraRotation } from '@ir-engine/spatial/src/camera/functions/CameraFunctions'
import { ColliderComponent } from '@ir-engine/spatial/src/physics/components/ColliderComponent'
import { RigidBodyComponent } from '@ir-engine/spatial/src/physics/components/RigidBodyComponent'
import { AvatarCollisionMask, CollisionGroups } from '@ir-engine/spatial/src/physics/enums/CollisionGroups'
import { BodyTypes, Shapes } from '@ir-engine/spatial/src/physics/types/PhysicsTypes'
import {
  DistanceFromCameraComponent,
  FrustumCullCameraComponent
} from '@ir-engine/spatial/src/transform/components/DistanceComponents'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import { ObjectLayerMasks } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { EnvMapComponent } from '../../scene/components/EnvmapComponent'
import { ShadowComponent } from '../../scene/components/ShadowComponent'
import { EnvMapSourceType } from '../../scene/constants/EnvMapEnum'
import { AvatarComponent } from '../components/AvatarComponent'
import { AvatarColliderComponent, AvatarControllerComponent } from '../components/AvatarControllerComponent'
import { BallControllerComponent } from '../components/BallControllerComponent'

export const spawnAvatarReceptor = (entityUUID: EntityUUID) => {
  const entity = UUIDComponent.getEntityByUUID(entityUUID)
  if (!entity) return

  const ownerID = getComponent(entity, NetworkObjectComponent).ownerId

  setComponent(entity, VisibleComponent)
  setComponent(entity, TransformComponent)
  setComponent(entity, DistanceFromCameraComponent)
  setComponent(entity, FrustumCullCameraComponent)
  setComponent(entity, ObjectLayerMaskComponent, ObjectLayerMasks.Avatar)

  setComponent(entity, EnvMapComponent, {
    type: EnvMapSourceType.Skybox,
    envMapIntensity: 1
  })

  setComponent(entity, AvatarComponent, {
    avatarHeight: 1.0,
    eyeHeight: 0.5,
    hipsHeight: 0.5
  })

  createAvatarCollider(entity)
  setAvatarColliderTransform(entity)

  setComponent(entity, RigidBodyComponent, {
    type: BodyTypes.Dynamic,
    allowRolling: true,
    enabledRotations: [true, true, true] as [boolean, boolean, boolean],
    canSleep: false
  })

  if (ownerID === Engine.instance.userID) {
    createAvatarController(entity)
    //const viewerEntity = getState(ReferenceSpaceState).viewerEntity
    //const targetCameraRotation = getComponent(viewerEntity, TargetCameraRotationComponent)
    // setComponent(viewerEntity, FollowCameraComponent, {
    //   targetEntity: entity,
    //   phi: targetCameraRotation.phi,
    //   theta: targetCameraRotation.theta,
    //   firstPersonOffset: new Vector3(0, 0, eyeOffset),
    //   thirdPersonOffset: new Vector3(0, 0, 0)
    // })
    // Add ball controller instead of avatar controller
    setComponent(entity, BallControllerComponent)
  }

  setComponent(entity, NetworkObjectSendPeriodicUpdatesTag)
  setComponent(entity, ShadowComponent)
}

export const createAvatarCollider = (entity: Entity) => {
  const colliderEntity = createEntity()
  setComponent(entity, AvatarColliderComponent, { colliderEntity })
  setComponent(colliderEntity, TransformComponent)
  setComponent(colliderEntity, EntityTreeComponent, { parentEntity: entity })
  setComponent(colliderEntity, ColliderComponent, {
    shape: Shapes.Sphere,
    collisionLayer: CollisionGroups.Avatars,
    collisionMask: AvatarCollisionMask,
    matchMesh: true
  })

  setComponent(colliderEntity, TransformComponent, {
    position: new Vector3(0, 0, 0),
    rotation: new Quaternion(),
    scale: new Vector3(1, 1, 1)
  })
}

const avatarCapsuleOffset = 0.125
export const setAvatarColliderTransform = (entity: Entity) => {
  const avatarCollider = getOptionalComponent(entity, AvatarColliderComponent)
  if (!avatarCollider) return

  const colliderEntity = avatarCollider.colliderEntity

  // Update transform to stay centered
  setComponent(colliderEntity, TransformComponent, {
    position: new Vector3(0, 0, 0),
    rotation: new Quaternion(),
    scale: new Vector3(1, 1, 1)
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
