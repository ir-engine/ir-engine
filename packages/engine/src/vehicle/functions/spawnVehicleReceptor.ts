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

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
//import { LocalVehicleTagComponent } from '../../input/components/LocalVehicleTagComponent'
import { BoundingBoxComponent } from '../../interaction/components/BoundingBoxComponents'
import { NetworkObjectSendPeriodicUpdatesTag } from '../../networking/components/NetworkObjectComponent'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { Physics } from '../../physics/classes/Physics'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { CollisionGroups, DefaultCollisionMask } from '../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../physics/functions/getInteractionGroups'
import { ShadowComponent } from '../../scene/components/ShadowComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { VehicleComponent } from '../components/VehicleComponent'

export const vehicleRadius = 0.25
export const defaultVehicleHeight = 1.8
export const defaultVehicleHalfHeight = defaultVehicleHeight / 2

export const spawnVehicleReceptor = (spawnAction: typeof WorldNetworkAction.spawnVehicle.matches._TYPE) => {
  const ownerId = spawnAction.$from

  const entity = Engine.instance.getNetworkObject(ownerId, spawnAction.networkId)
  if (!entity) return

  addComponent(entity, VehicleComponent, {})

  createVehicleRigidBody(entity)
  createVehicleCollider(entity)

  setComponent(entity, NetworkObjectSendPeriodicUpdatesTag)

  setComponent(entity, ShadowComponent)
  setComponent(entity, BoundingBoxComponent)
}

export const createVehicleCollider = (entity: Entity): Collider => {
  const interactionGroups = getInteractionGroups(CollisionGroups.Default, DefaultCollisionMask)
  const rigidBody = getComponent(entity, RigidBodyComponent)
  const transform = getComponent(entity, TransformComponent)
  rigidBody.position.copy(transform.position)
  rigidBody.rotation.copy(transform.rotation)

  const bodyColliderDesc = ColliderDesc.capsule(
    defaultVehicleHalfHeight - vehicleRadius,
    vehicleRadius
  ).setCollisionGroups(interactionGroups)
  bodyColliderDesc.setTranslation(0, defaultVehicleHalfHeight, 0)

  return Physics.createColliderAndAttachToRigidBody(Engine.instance.physicsWorld, bodyColliderDesc, rigidBody.body)
}

const createVehicleRigidBody = (entity: Entity): RigidBody => {
  const rigidBodyDesc = RigidBodyDesc.dynamic()
  const rigidBody = Physics.createRigidBody(entity, Engine.instance.physicsWorld, rigidBodyDesc, [])
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
