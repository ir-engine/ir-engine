import { Quaternion } from "cannon-es/src/math/Quaternion"
import { Object3DComponent } from "../../../src/common/components/Object3DComponent"
import { getComponent, getMutableComponent } from "../../../src/ecs/functions/EntityFunctions"
import { registerComponent } from "../../../src/ecs/functions/ComponentFunctions"
import { System } from "../../../src/ecs/classes/System"

import { TransformComponent } from "../../../src/transform/components/TransformComponent"
// import {
//   _createBox,
//   _createConvexGeometry,
//   _createCylinder,
//   _createGroundGeometry,
//   _createShare,
//   _createVehicleBody
// } from "../behavior/PhysicsBehaviors"
import { PhysicsWorld } from "../components/PhysicsWorld"
import { RigidBody } from "../components/RigidBody"
import { VehicleBody } from "../components/VehicleBody"

export const quaternion = new Quaternion()

export class PhysicsSystem extends System {
  init(): void {
    registerComponent(RigidBody)
  }
  execute(dt, t) {
    PhysicsWorld.instance.frame++
    PhysicsWorld.instance.physicsWorld.step(PhysicsWorld.instance.timeStep)

    for (const entity of this.queryResults.physicsRigidBody.added) {
      const physicsRigidBody = getComponent<RigidBody>(entity, RigidBody) as any
      const obj = getComponent<Object3DComponent>(entity, Object3DComponent).value
      let body
      // if (physicsRigidBody.type === "box") body = _createBox(entity)
      // else if (physicsRigidBody.type === "cylinder") body = _createCylinder(entity)
      // else if (physicsRigidBody.type === "share") body = _createShare(entity)
      // else if (physicsRigidBody.type === "convex") body = _createConvexGeometry(entity, null)
      // else if (physicsRigidBody.type === "ground") body = _createGroundGeometry(entity)

      //   obj.userData.body = body
      //   PhysicsWorld.instance.physicsWorld.addBody(body)
      // }

      // for (const entity of this.queryResults.vehicleBody.added) {
      //   const object = getComponent<Object3DComponent>(entity, Object3DComponent).value

      //   const vehicleComponent = getComponent(entity, VehicleBody) as VehicleBody

      //   const [vehicle, wheelBodies] = _createVehicleBody(entity, vehicleComponent.convexMesh)
      //   object.userData.vehicle = vehicle
      //   vehicle.addToWorld(PhysicsWorld.instance.physicsWorld)

      //   for (let i = 0; i < wheelBodies.length; i++) {
      //     PhysicsWorld.instance.physicsWorld.addBody(wheelBodies[i])
      //   }
    }

    for (const entity of this.queryResults.physicsRigidBody.all) {
      //  if (rigidBody.weight === 0.0) continue;
      const transform = getMutableComponent<TransformComponent>(entity, TransformComponent)
      const object = getComponent<Object3DComponent>(entity, Object3DComponent).value
      const body = object.userData.body
      //console.log(body);
      transform.position = body.position

      quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w)

      transform.rotation = quaternion.toArray()
    }

    for (const entity of this.queryResults.vehicleBody.all) {
      //  if (rigidBody.weight === 0.0) continue;
      const transform = getMutableComponent<TransformComponent>(entity, TransformComponent)
      const object = getComponent<Object3DComponent>(entity, Object3DComponent).value
      const vehicle = object.userData.vehicle.chassisBody

      transform.position = vehicle.position
      //transform.position.y += 0.6
      quaternion.set(vehicle.quaternion.x, vehicle.quaternion.y, vehicle.quaternion.z, vehicle.quaternion.w)
      transform.rotation = vehicle.quaternion.toArray()
    }
  }
}
PhysicsSystem.queries = {
  physicsRigidBody: {
    components: [RigidBody],
    listen: {
      added: true
    }
  },
  vehicleBody: {
    components: [VehicleBody],
    listen: {
      added: true
    }
  }
}
