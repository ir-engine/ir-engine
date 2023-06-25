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

import {
  Collider,
  ColliderDesc,
  JointData,
  MotorModel,
  RevoluteImpulseJoint,
  RigidBody,
  RigidBodyDesc,
  Vector3
} from '@dimforge/rapier3d-compat'
import { RawRotation } from '@dimforge/rapier3d-compat/rapier_wasm3d'

import { createEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'

import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
import { addEntityNodeChild } from '../../ecs/functions/EntityTree'
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

export const defaultWheelDimensions = { hy: 0.5, r: 0.2 }
export const defaultVehicleDimensions = { x: 1.8, z: 3, y: 1.8 }
export const defaultAxleDimensions = { x: 0.03, z: 0.03, y: 0.03 }
export const defaultVehicleHalfy = defaultVehicleDimensions.y / 2

export const spawnVehicleReceptor = (spawnAction: typeof WorldNetworkAction.spawnVehicle.matches._TYPE) => {
  const ownerId = spawnAction.$from

  const entity = Engine.instance.getNetworkObject(ownerId, spawnAction.networkId)
  if (!entity) return

  addComponent(entity, VehicleComponent, {})
  // create vehicle body
  createVehicleBody(entity)
  // create vehicle axle
  // create vehicle wheel

  setComponent(entity, NetworkObjectSendPeriodicUpdatesTag)

  setComponent(entity, ShadowComponent)
  setComponent(entity, BoundingBoxComponent)
}

const createVehicleBody = (entity: Entity): any => {
  // body with its collider
  const interactionGroups = getInteractionGroups(CollisionGroups.Default, DefaultCollisionMask)
  const vehicleBodyRigidBody = RigidBodyDesc.dynamic()

  const vehicleBodyCollider = ColliderDesc.cuboid(
    defaultVehicleDimensions.z,
    defaultVehicleDimensions.x,
    defaultVehicleDimensions.y
  ).setCollisionGroups(interactionGroups)
  Physics.createRigidBody(entity, Engine.instance.physicsWorld, vehicleBodyRigidBody, [vehicleBodyCollider])

  const rigidBodyComponent = getComponent(entity, RigidBodyComponent)
  const transformComponent = getComponent(entity, TransformComponent)

  rigidBodyComponent.position.copy(transformComponent.position)
  rigidBodyComponent.rotation.copy(transformComponent.rotation)

  //VehicleBodyCollider.setTranslation(0, defaultVehicleHalfy, 0)
  createVehicleAxle(entity)
}

const createVehicleAxle = (chassis: Entity): any => {
  // front
  const axlePositions = [
    new Vector3(-defaultVehicleDimensions.x / 2, -defaultVehicleDimensions.z / 2, 0),
    new Vector3(defaultVehicleDimensions.x / 2, -defaultVehicleDimensions.z / 2, 0),
    new Vector3(-defaultVehicleDimensions.x / 2, defaultVehicleDimensions.z / 2, 0),
    new Vector3(defaultVehicleDimensions.x / 2, defaultVehicleDimensions.z / 2, 0)
  ]
  // get 4 axle postions and create
  for (const axlePosition of axlePositions) {
    const axle = createEntity() // creating new entities atm might change later
    const interactionGroups = getInteractionGroups(CollisionGroups.Default, DefaultCollisionMask)
    const vechicleAxleRigidBody = RigidBodyDesc.dynamic()
    const vehicleAxleCollider = ColliderDesc.cuboid(
      defaultAxleDimensions.z,
      defaultAxleDimensions.x,
      defaultAxleDimensions.y
    ).setCollisionGroups(interactionGroups)
    const axleRigidbody = Physics.createRigidBody(axle, Engine.instance.physicsWorld, vechicleAxleRigidBody, [
      vehicleAxleCollider
    ])
    const rigidBodyComponent = getComponent(axle, RigidBodyComponent)
    const transformComponent = getComponent(axle, TransformComponent)
    rigidBodyComponent.position.copy(transformComponent.position)
    rigidBodyComponent.rotation.copy(transformComponent.rotation)
    const chassisRigidBody = getComponent(chassis, RigidBodyComponent).body
    // still figuring out how to add joints
    const axleJointData = JointData.revolute(new Vector3(0, 0, 0), new Vector3(0, 0, 0), new Vector3(0, 1, 0))
    Engine.instance.physicsWorld.createImpulseJoint(axleJointData, chassisRigidBody, axleRigidbody, false)
    createVehicleWheel(axle)
    addEntityNodeChild(axle, chassis)
  }
}

const createVehicleWheel = (axle: Entity): any => {
  console.log('create wheels')
  const wheel = createEntity() // creating new entities atm might change later
  const interactionGroups = getInteractionGroups(CollisionGroups.Default, DefaultCollisionMask)
  const vechicleWheelRigidBody = RigidBodyDesc.dynamic()
  const vehicleWheelCollider = ColliderDesc.cylinder(
    defaultWheelDimensions.hy,
    defaultWheelDimensions.r
  ).setCollisionGroups(interactionGroups)
  const wheelRigidbody = Physics.createRigidBody(wheel, Engine.instance.physicsWorld, vechicleWheelRigidBody, [
    vehicleWheelCollider
  ])
  const rigidBodyComponent = getComponent(wheel, RigidBodyComponent)
  const transformComponent = getComponent(wheel, TransformComponent)
  rigidBodyComponent.position.copy(transformComponent.position)
  rigidBodyComponent.rotation.copy(transformComponent.rotation)
  const axleRigidBody = getComponent(axle, RigidBodyComponent).body
  const wheelJointData = JointData.revolute(new Vector3(0, 0, 0), new Vector3(0, 0, 0), new Vector3(1, 0, 0))
  Engine.instance.physicsWorld.createImpulseJoint(wheelJointData, axleRigidBody, wheelRigidbody, false)
  addEntityNodeChild(axle, wheel)
  // handle suspension
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
