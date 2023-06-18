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
import { AnimationClip, AnimationMixer, Object3D, Quaternion, Vector3 } from 'three'

import { getState } from '@etherealengine/hyperflux'

import { setTargetCameraRotation } from '../../camera/systems/CameraInputSystem'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  getComponent,
  hasComponent,
  removeComponent,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
//import { LocalVehicleTagComponent } from '../../input/components/LocalVehicleTagComponent'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { BoundingBoxComponent } from '../../interaction/components/BoundingBoxComponents'
import {
  NetworkObjectAuthorityTag,
  NetworkObjectSendPeriodicUpdatesTag
} from '../../networking/components/NetworkObjectComponent'
import { NetworkPeerFunctions } from '../../networking/functions/NetworkPeerFunctions'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { WorldState } from '../../networking/interfaces/WorldState'
import { Physics } from '../../physics/classes/Physics'
import { CollisionComponent } from '../../physics/components/CollisionComponent'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { CollisionGroups, VehicleCollisionMask } from '../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../physics/functions/getInteractionGroups'
import { NameComponent } from '../../scene/components/NameComponent'
import { ShadowComponent } from '../../scene/components/ShadowComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { DistanceFromCameraComponent, FrustumCullCameraComponent } from '../../transform/components/DistanceComponents'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { VehicleComponent } from '../components/VehicleComponent'

export const vehicleRadius = 0.25
export const defaultVehicleHeight = 1.8
export const defaultVehicleHalfHeight = defaultVehicleHeight / 2

export const spawnVehicleReceptor = (spawnAction: typeof WorldNetworkAction.spawnVehicle.matches._TYPE) => {
  const ownerId = spawnAction.$from
  const userId = spawnAction.uuid
  const primary = ownerId === userId

  const entity = Engine.instance.getNetworkObject(ownerId, spawnAction.networkId)
  if (!entity) return

  /*if (primary) {
    const existingVehicleEntity = Engine.instance.getUserVehicleEntity(userId)

    // already spawned into the world on another device or tab
    if (existingVehicleEntity) {
      const didSpawnEarlierThanThisClient = NetworkPeerFunctions.getCachedActionsForUser(ownerId).find(
        (action) =>
          WorldNetworkAction.spawnVehicle.matches.test(action) &&
          action !== spawnAction &&
          action.$time > spawnAction.$time
      )
      if (didSpawnEarlierThanThisClient) {
        hasComponent(existingVehicleEntity, NetworkObjectAuthorityTag) &&
          removeComponent(existingVehicleEntity, NetworkObjectAuthorityTag)
      }
      return
    }
  }*/
  // will get this back if we can let user own cars!!

  const transform = getComponent(entity, TransformComponent)

  addComponent(entity, VehicleComponent, {})

  const userNames = getState(WorldState).userNames
  const userName = userNames[userId]
  const shortId = ownerId.substring(0, 7)
  addComponent(entity, NameComponent, 'vehicle-' + (userName ? shortId + ' (' + userName + ')' : shortId))

  addComponent(entity, VisibleComponent, true)

  setComponent(entity, DistanceFromCameraComponent)
  setComponent(entity, FrustumCullCameraComponent)

  /*addComponent(entity, AnimationComponent, {
    mixer: new AnimationMixer(new Object3D()),
    animations: [] as AnimationClip[],
    animationSpeed: 1
  })
  // will have to bring back eventually

  addComponent(entity, VehicleAnimationComponent, {
    animationGraph: {
      states: {},
      transitionRules: {},
      currentState: null!,
      stateChanged: null!
    },
    rootYRatio: 1,
    locomotion: new Vector3()
  })

  addComponent(entity, SpawnPoseComponent, {
    position: new Vector3().copy(transform.position),
    rotation: new Quaternion().copy(transform.rotation)
  })
  */
  //will have to bring it back if vehicles are riggable
  /*
  if (ownerId === Engine.instance.userId) {
    createVehicleController(entity)
    addComponent(entity, LocalVehicleTagComponent, true)
    addComponent(entity, LocalInputTagComponent, true)
  } else {
    createVehicleRigidBody(entity)
    createVehicleCollider(entity)
  }*/
  // we need to build controller eventually

  createVehicleRigidBody(entity)
  createVehicleCollider(entity)

  setComponent(entity, NetworkObjectSendPeriodicUpdatesTag)

  setComponent(entity, ShadowComponent)
  setComponent(entity, BoundingBoxComponent)
}

export const createVehicleCollider = (entity: Entity): Collider => {
  const interactionGroups = getInteractionGroups(CollisionGroups.Vehicle, VehicleCollisionMask)
  const vehicleComponent = getComponent(entity, VehicleComponent)
  const rigidBody = getComponent(entity, RigidBodyComponent)
  const transform = getComponent(entity, TransformComponent)
  rigidBody.position.copy(transform.position)
  rigidBody.rotation.copy(transform.rotation)

  const bodyColliderDesc = ColliderDesc.capsule(
    vehicleComponent.vehicleHalfHeight - vehicleRadius,
    vehicleRadius
  ).setCollisionGroups(interactionGroups)
  bodyColliderDesc.setTranslation(0, vehicleComponent.vehicleHalfHeight, 0)

  return Physics.createColliderAndAttachToRigidBody(Engine.instance.physicsWorld, bodyColliderDesc, rigidBody.body)
}

const createVehicleRigidBody = (entity: Entity): RigidBody => {
  const rigidBodyDesc = RigidBodyDesc.kinematicPositionBased()
  const rigidBody = Physics.createRigidBody(entity, Engine.instance.physicsWorld, rigidBodyDesc, [])
  rigidBody.lockRotations(true, false)
  rigidBody.setEnabledRotations(false, true, false, false)

  return rigidBody
}
/*
export const createVehicleController = (entity: Entity) => {
  createVehicleRigidBody(entity)
  const rigidbody = getComponent(entity, RigidBodyComponent)
  const transform = getComponent(entity, TransformComponent)
  rigidbody.position.copy(transform.position)
  rigidbody.rotation.copy(transform.rotation)
  rigidbody.targetKinematicPosition.copy(transform.position)
  rigidbody.targetKinematicRotation.copy(transform.rotation)

  const CameraTransform = getComponent(Engine.instance.cameraEntity, TransformComponent)
  const vehicleForward = new Vector3(0, 0, -1).applyQuaternion(transform.rotation)
  const cameraForward = new Vector3(0, 0, 1).applyQuaternion(CameraTransform.rotation)
  let targetTheta = (cameraForward.angleTo(vehicleForward) * 180) / Math.PI
  const orientation = cameraForward.x * vehicleForward.z - cameraForward.z * vehicleForward.x
  if (orientation > 0) targetTheta = 2 * Math.PI - targetTheta
  setTargetCameraRotation(Engine.instance.cameraEntity, 0, targetTheta)

  setComponent(entity, VehicleControllerComponent, {
    bodyCollider: createVehicleCollider(entity),
    controller: Physics.createCharacterController(Engine.instance.physicsWorld, {})
  })

  addComponent(entity, CollisionComponent)
}*/
