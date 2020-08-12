import { Quaternion } from "cannon-es/src/math/Quaternion"
import { RigidBody } from "../components/RigidBody"
import { VehicleBody } from "../components/VehicleBody"
import {
  _createBox,
  _createCylinder,
  _createShare,
  _createConvexGeometry,
  _createGroundGeometry,
  _createVehicleBody
} from "../behavior/PhysicsBehaviors"

import { Object3DComponent } from "ecsy-three"
import { TransformComponent } from "../../transform/components/TransformComponent"
import { PhysicsWorld } from "../components/PhysicsWorld"
import { System } from "ecsy"

export const quaternion = new Quaternion()

export class PhysicsSystem extends System {
  execute(dt, t) {
    PhysicsWorld.instance.frame++
    PhysicsWorld.instance._physicsWorld.step(PhysicsWorld.instance.timeStep)

    for (const entity of this.queries.physicsRigidBody.added) {
      const physicsRigidBody = entity.getComponent(RigidBody)
      let object = physicsRigidBody.getObject3D()
      object ? "" : (object = { userData: { body: {} } })
      let body
      if (physicsRigidBody.type === "box") body = _createBox(entity)
      else if (physicsRigidBody.type === "cylinder") body = _createCylinder(entity)
      else if (physicsRigidBody.type === "share") body = _createShare(entity)
      else if (physicsRigidBody.type === "convex") body = _createConvexGeometry(entity, null)
      else if (physicsRigidBody.type === "ground") body = _createGroundGeometry(entity)

      object.userData.body = body
      PhysicsWorld.instance._physicsWorld.addBody(body)
    }

    for (const entity of this.queries.vehicleBody.added) {
      const object = entity.getComponent<Object3DComponent>(Object3DComponent).value

      const vehicleComponent = entity.getComponent(VehicleBody) as VehicleBody

      const [vehicle, wheelBodies] = _createVehicleBody(entity, vehicleComponent.convexMesh)
      object.userData.vehicle = vehicle
      vehicle.addToWorld(PhysicsWorld.instance._physicsWorld)

      for (let i = 0; i < wheelBodies.length; i++) {
        PhysicsWorld.instance._physicsWorld.addBody(wheelBodies[i])
      }
    }

    for (const entity of this.queries.physicsRigidBody.results) {
      //  if (rigidBody.weight === 0.0) continue;
      const transform = entity.getMutableComponent(TransformComponent)
      const object = entity.getComponent(Object3DComponent).value
      const body = object.userData.body
      //console.log(body);
      transform.position = body.position

      quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w)

      transform.rotation = quaternion.toArray()
    }

    for (const entity of this.queries.vehicleBody.results) {
      //  if (rigidBody.weight === 0.0) continue;
      const transform = entity.getMutableComponent(TransformComponent)
      const object = entity.getComponent(Object3DComponent).value
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
