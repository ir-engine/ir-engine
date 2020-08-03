import * as ECSY from "ecsy"
import CANNON from "cannon"
import VehicleBody from "../components/VehicleBody"

export class VehicleSystem extends ECSY.System {
  execute(dt, t) {
    for (let entity of this.queries.physicsBody.added) {
      const physicsBody = entity.getComponent(CANNON.PhysicsBody)

      let shape

      if (physicsBody.geometryType == "box") {
        shape = new CANNON.Box(new CANNON.Vec3(physicsBody.scale.x / 2, physicsBody.scale.y / 2, physicsBody.scale.z / 2))
      } else {
        shape = new CANNON.Sphere(physicsBody.scale.x / 2)
      }

      //let shape = new CANNON.Sphere(0.1)
      let body = new CANNON.Body({
        mass: physicsBody.mass,
        position: new CANNON.Vec3(physicsBody.startPosition.x, physicsBody.startPosition.y, physicsBody.startPosition.z)
      })
      body.addShape(shape)

      //  body.angularVelocity.set(0,10,0);
      //  body.angularDamping = 0.5;

      entity.getMutableComponent(CANNON.PhysicsBody).body = body
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

VehicleSystem.queries = {
  vehicleBody: {
    components: [VehicleBody],
    listen: {
      added: true
    }
  }
}
