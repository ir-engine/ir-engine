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
  Quaternion as RapierQuat,
  RevoluteImpulseJoint,
  RigidBody,
  RigidBodyDesc
} from '@dimforge/rapier3d-compat'
import { RawRotation } from '@dimforge/rapier3d-compat/rapier_wasm3d'
import { Quaternion, Vector3 } from 'three'
import { DEG2RAD } from 'three/src/math/MathUtils'

import { createEntity } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'

import { setTargetCameraRotation } from '../../camera/systems/CameraInputSystem'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent, setComponent } from '../../ecs/functions/ComponentFunctions'
//import { LocalVehicleTagComponent } from '../../input/components/LocalVehicleTagComponent'
import { BoundingBoxComponent } from '../../interaction/components/BoundingBoxComponents'
import { NetworkObjectSendPeriodicUpdatesTag } from '../../networking/components/NetworkObjectComponent'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { Physics } from '../../physics/classes/Physics'
import { RigidBodyComponent } from '../../physics/components/RigidBodyComponent'
import { CollisionGroups, DefaultCollisionMask } from '../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../physics/functions/getInteractionGroups'
import { ShadowComponent } from '../../scene/components/ShadowComponent'
import { setTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'
import { VehicleComponent } from '../components/VehicleComponent'
import { VehicleControllerComponent } from '../components/VehicleControllerComponent'

export const defaultChassisDimensions = { x: 0.36, y: 0.26, z: 0.6 }
export const defaultWheelDimensions = { hy: 0.1, r: 0.3 }
export const defaultAxleDimensions = { x: 0.03, y: 0.03, z: 0.03 }
export const axleDisplacements: Vector3[] = [
  new Vector3(-defaultChassisDimensions.x * 0.9, -defaultChassisDimensions.y, (-defaultChassisDimensions.z * 2) / 3),
  new Vector3(-defaultChassisDimensions.x * 0.9, -defaultChassisDimensions.y, (defaultChassisDimensions.z * 2) / 3),
  new Vector3(defaultChassisDimensions.x * 0.9, -defaultChassisDimensions.y, (-defaultChassisDimensions.z * 2) / 3),
  new Vector3(defaultChassisDimensions.x * 0.9, -defaultChassisDimensions.y, (defaultChassisDimensions.z * 2) / 3)
]
export const wheelDisplacement = defaultWheelDimensions.hy * 1.3

export const spawnVehicleReceptor = (spawnAction: typeof WorldNetworkAction.spawnVehicle.matches._TYPE) => {
  const ownerId = spawnAction.$from

  const entity = Engine.instance.getNetworkObject(ownerId, spawnAction.networkId)
  if (!entity) return
  // over simplified for this static config, need to write a dynamic algo for this
  // considers case where chassis + wheels and where you have monster wheels
  const vehicleHeight = Math.max(
    defaultWheelDimensions.r + defaultChassisDimensions.y + Math.abs(axleDisplacements[0].y),
    defaultWheelDimensions.r * 2
  )
  // considers case where chassis is big and a normal vehicle with wheels extending out
  const vehicleWidth = Math.max(
    (Math.abs(axleDisplacements[0].x) + wheelDisplacement + defaultWheelDimensions.hy) * 2,
    defaultChassisDimensions.x * 2
  )
  // case where we have very long car and one where wheels are very big
  const vehicleLength = Math.max(
    Math.abs(axleDisplacements[0].z) * 2 + defaultWheelDimensions.r,
    defaultChassisDimensions.z * 2
  )
  const { chassis, axles, wheels, jointMap } = createVehicle(entity)

  setComponent(entity, VehicleComponent, {
    vehicleHeight: vehicleHeight,
    vehicleWidth: vehicleWidth,
    vehicleLength: vehicleLength,
    chassis: chassis,
    axles: axles,
    wheels: wheels,
    jointMap: jointMap
  })

  setComponent(entity, NetworkObjectSendPeriodicUpdatesTag)

  setComponent(entity, ShadowComponent)
  setComponent(entity, BoundingBoxComponent)
}

const createVehicle = (entity: Entity): any => {
  const axles = [] as Entity[]
  const wheels = [] as Entity[]
  createVehicleChassis(entity)
  const chassisTransform = getComponent(entity, TransformComponent)
  const jointMap = new Map()
  for (let i = 0; i < axleDisplacements.length; i++) {
    const wheelSide = Math.sign(axleDisplacements[i].x) // right is + ve , left is - ve
    const wheelIsSteered = Boolean(Math.min(0, Math.sign(axleDisplacements[i].z)))
    const axleJointData = JointData.revolute(
      new Vector3(axleDisplacements[i].x, axleDisplacements[i].y, axleDisplacements[i].z),
      new Vector3(0, 0, 0),
      new Vector3(0, 1, 0)
    )

    const wheelJointData = JointData.revolute(
      new Vector3(wheelDisplacement * 1.2 * wheelSide, 0, 0),
      new Vector3(defaultAxleDimensions.x * wheelSide * -1, 0, 0),
      new Vector3(1 * wheelSide, 0, 0)
    )

    const axleDisplacement = axleDisplacements[i]
    const axlePosition = axleDisplacement.add(chassisTransform.position)
    axles.push(createVehicleAxle(entity, axlePosition))

    const wheelPosition = axleDisplacement.add(new Vector3(wheelSide * wheelDisplacement, 0, 0))
    wheels.push(
      createVehicleWheel(
        entity,
        wheelPosition,
        new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), -90 * DEG2RAD * wheelSide)
      )
    )

    const chassisRigidBody = getComponent(entity, RigidBodyComponent)
    const axleRigidBody = getComponent(axles[i], RigidBodyComponent)
    const wheelRigidBody = getComponent(wheels[i], RigidBodyComponent)

    const wheelJoint = Engine.instance.physicsWorld.createImpulseJoint(
      wheelJointData,
      axleRigidBody.body,
      wheelRigidBody.body,
      true
    )
    const axleJoint = Engine.instance.physicsWorld.createImpulseJoint(
      axleJointData,
      chassisRigidBody.body,
      axleRigidBody.body,
      true
    )
    jointMap.set(axleRigidBody.body.handle, axleJoint.handle)
    jointMap.set(wheelRigidBody.body.handle, wheelJoint.handle)
    ;(wheelJoint as RevoluteImpulseJoint).configureMotorModel(MotorModel.AccelerationBased)
  }

  return { entity, axles, wheels, jointMap }
}

const createVehicleChassis = (entity: Entity): Entity => {
  // body with its collider
  // definition
  const interactionGroups = getInteractionGroups(CollisionGroups.Default, DefaultCollisionMask)
  const vehicleBodyRigidBody = RigidBodyDesc.kinematicPositionBased().lockRotations()
  const vehicleBodyCollider = ColliderDesc.roundCuboid(
    defaultChassisDimensions.x,
    defaultChassisDimensions.y,
    defaultChassisDimensions.z,
    0.02
  ).setCollisionGroups(interactionGroups)
  // creation
  Physics.createRigidBody(entity, Engine.instance.physicsWorld, vehicleBodyRigidBody, [vehicleBodyCollider])

  return entity
}

const createVehicleAxle = (entity: Entity, axlePosiiton: Vector3, axleRotation?: Quaternion): Entity => {
  const interactionGroups = getInteractionGroups(CollisionGroups.Default, DefaultCollisionMask)
  const vechicleAxleRigidBody = RigidBodyDesc.dynamic()
    .enabledRotations(false, true, false)
    .enabledTranslations(false, true, true)
  const vehicleAxleCollider = ColliderDesc.cuboid(
    defaultAxleDimensions.x,
    defaultAxleDimensions.y,
    defaultAxleDimensions.z
  ).setCollisionGroups(interactionGroups)

  const axle = createEntity()
  setTransformComponent(axle, axlePosiiton, axleRotation)
  setComponent(axle, ShadowComponent)
  setComponent(axle, BoundingBoxComponent)
  setComponent(axle, NetworkObjectSendPeriodicUpdatesTag)

  const axleRigidbody = Physics.createRigidBody(axle, Engine.instance.physicsWorld, vechicleAxleRigidBody, [
    vehicleAxleCollider
  ])

  return axle
}

const createVehicleWheel = (entity: Entity, wheelPosition: Vector3, wheelRotation?: Quaternion): Entity => {
  const interactionGroups = getInteractionGroups(CollisionGroups.Default, DefaultCollisionMask)
  const vechicleWheelRigidBody = RigidBodyDesc.dynamic()
  const vehicleWheelCollider = ColliderDesc.roundCylinder(defaultWheelDimensions.hy, defaultWheelDimensions.r, 0.03)
    .setCollisionGroups(interactionGroups)
    .setRotation(new RapierQuat(wheelRotation!.x, wheelRotation!.y, wheelRotation!.z, wheelRotation!.w))

  const wheel = createEntity()

  setTransformComponent(wheel, wheelPosition, wheelRotation)
  setComponent(wheel, ShadowComponent)
  setComponent(wheel, BoundingBoxComponent)
  setComponent(wheel, NetworkObjectSendPeriodicUpdatesTag)
  Physics.createRigidBody(wheel, Engine.instance.physicsWorld, vechicleWheelRigidBody, [vehicleWheelCollider])
  return wheel
}

export const createVehicleController = (entity: Entity) => {
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
    controller: Physics.createCharacterController(Engine.instance.physicsWorld, {})
  })
}
