import { Quaternion } from "cannon-es/src/math/Quaternion"
import { RigidBody } from "../components/RigidBody"
import { VehicleBody } from "../components/VehicleBody"
import { PhysicsSystem } from "../behavior/PhysicsBehaviors"

export const quaternion = new Quaternion()

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
