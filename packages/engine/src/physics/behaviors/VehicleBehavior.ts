import { Quaternion } from "cannon-es/src/math/Quaternion"
import { Box } from "cannon-es/src/shapes/Box"
import { Cylinder } from "cannon-es/src/shapes/Cylinder"
import { Vec3 } from "cannon-es/src/math/Vec3"
import { Behavior } from "../../common/interfaces/Behavior"
import { TransformComponent } from "../../transform/components/TransformComponent"
import { RaycastVehicle } from "cannon-es/src/objects/RaycastVehicle"
import { Body } from "cannon-es/src/objects/Body"

export const quaternion = new Quaternion()

import { getMutableComponent, getComponent } from "../../ecs/functions/EntityFunctions"
import { PhysicsWorld } from "../../sandbox/physics/components/PhysicsWorld"
import { VehicleBody } from "../../sandbox/physics/components/VehicleBody"
import { Object3DComponent } from "../../common/components/Object3DComponent"
import { Entity } from "../../ecs/classes/Entity"

export const VehicleBehavior: Behavior = (entity: Entity, args): void => {
  if (args.phase == "onAdded") {
    const object = getComponent<Object3DComponent>(entity, Object3DComponent).value

    const vehicleComponent = getComponent(entity, VehicleBody) as VehicleBody

    const [vehicle, wheelBodies] = _createVehicleBody(entity, vehicleComponent.convexMesh)
    object.userData.vehicle = vehicle
    vehicle.addToWorld(PhysicsWorld.instance.physicsWorld)

    for (let i = 0; i < wheelBodies.length; i++) {
      PhysicsWorld.instance.physicsWorld.addBody(wheelBodies[i])
    }
  } else if (args.phase == "onUpdate") {
    const transform = getMutableComponent<TransformComponent>(entity, TransformComponent)
    const object = getComponent<Object3DComponent>(entity, Object3DComponent).value
    const vehicle = object.userData.vehicle.chassisBody

    transform.position = vehicle.position
    //transform.position.y += 0.6
    quaternion.set(vehicle.quaternion.x, vehicle.quaternion.y, vehicle.quaternion.z, vehicle.quaternion.w)
    transform.rotation = vehicle.quaternion.toArray()
  } else if (args.phase == "onRemoved") {
    const object = getComponent<Object3DComponent>(entity, Object3DComponent).value
    const body = object.userData.vehicle
    delete object.userData.vehicle
    PhysicsWorld.instance.physicsWorld.removeBody(body)
  }
}

export function _createVehicleBody(entity: Entity, mesh: any): [RaycastVehicle, Body[]] {
  const transform = getComponent<TransformComponent>(entity, TransformComponent)
  let chassisBody
  if (mesh) {
    chassisBody = this._createConvexGeometry(entity, mesh)
  } else {
    const chassisShape = new Box(new Vec3(1, 1.2, 2.8))
    chassisBody = new Body({ mass: 150 })
    chassisBody.addShape(chassisShape)
  }
  //  let
  chassisBody.position.copy(transform.position)
  //  chassisBody.angularVelocity.set(0, 0, 0.5);
  const options = {
    radius: 0.5,
    directionLocal: new Vec3(0, -1, 0),
    suspensionStiffness: 30,
    suspensionRestLength: 0.3,
    frictionSlip: 5,
    dampingRelaxation: 2.3,
    dampingCompression: 4.4,
    maxSuspensionForce: 100000,
    rollInfluence: 0.01,
    axleLocal: new Vec3(-1, 0, 0),
    chassisConnectionPointLocal: new Vec3(),
    maxSuspensionTravel: 0.3,
    customSlidingRotationalSpeed: -30,
    useCustomSlidingRotationalSpeed: true
  }

  // Create the vehicle
  const vehicle = new RaycastVehicle({
    chassisBody: chassisBody,
    indexUpAxis: 1,
    indexRightAxis: 0,
    indexForwardAxis: 2
  })

  options.chassisConnectionPointLocal.set(1.4, -0.6, 2.35)
  vehicle.addWheel(options)

  options.chassisConnectionPointLocal.set(-1.4, -0.6, 2.35)
  vehicle.addWheel(options)

  options.chassisConnectionPointLocal.set(-1.4, -0.6, -2.2)
  vehicle.addWheel(options)

  options.chassisConnectionPointLocal.set(1.4, -0.6, -2.2)
  vehicle.addWheel(options)

  const wheelBodies = []
  for (let i = 0; i < vehicle.wheelInfos.length; i++) {
    const wheel = vehicle.wheelInfos[i]
    const cylinderShape = new Cylinder(1, 1, 0.1, 20)
    const wheelBody = new Body({
      mass: 0
    })
    wheelBody.type = Body.KINEMATIC
    wheelBody.collisionFilterGroup = 0 // turn off collisions
    const q = new Quaternion()
    //   q.setFromAxisAngle(new Vec3(1,0,0), -Math.PI / 2);
    wheelBody.addShape(cylinderShape)
    //   wheelBody.quaternion.setFromAxisAngle(new Vec3(1,0,0), -Math.PI/2)
    wheelBodies.push(wheelBody)
    //demo.addVisual(wheelBody);
    //world.addBody(wheelBody);
  }

  return [vehicle, wheelBodies]
}
