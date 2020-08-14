import { Vec3 } from "cannon-es/src/math/Vec3"
import { Body } from "cannon-es/src/objects/Body"
import { Box } from "cannon-es/src/shapes/Box"
import { Sphere } from "cannon-es/src/shapes/Sphere"
import { getComponent, getMutableComponent, registerComponent } from "../../../src/ecs"
import { Attributes, System } from "../../../src/ecs/classes/System"
import { RigidBody } from "../components/RigidBody"
import { VehicleBody } from "../components/VehicleBody"

export class VehicleSystem extends System {
  init(attributes?: Attributes): void {
    registerComponent(VehicleBody)
  }
  execute(dt, t) {
    for (const entity of this.queryResults.physicsBody.added) {
      const physicsBody = getComponent<RigidBody>(entity, RigidBody) as any

      let shape

      if (physicsBody.type == "box") {
        shape = new Box(new Vec3(physicsBody.scale.x / 2, physicsBody.scale.y / 2, physicsBody.scale.z / 2))
      } else {
        shape = new Sphere(physicsBody.scale.x / 2)
      }

      //let shape = new CANNON.Sphere(0.1)
      const body = new Body({
        mass: physicsBody.mass,
        position: new Vec3(physicsBody.startPosition.x, physicsBody.startPosition.y, physicsBody.startPosition.z)
      })
      body.addShape(shape)

      //  body.angularVelocity.set(0,10,0);
      //  body.angularDamping = 0.5;
      const rigidBody = getMutableComponent<RigidBody>(entity, RigidBody) as any
      rigidBody.body = body
      //  console.log(body.position);
      //  console.log(body.mass);

      /*
      worldPhysics.addContactMaterial(
        new CANNON.ContactMaterial(groundMaterial, mat, { friction: 0.0, restitution: 0.0 })
      );
*/
    }
  }
}

VehicleSystem.systemQueries = {
  vehicleBody: {
    components: [VehicleBody],
    listen: {
      added: true
    }
  }
}
