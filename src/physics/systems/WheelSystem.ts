import * as THREE from "three"
import * as ECSY from "ecsy"
import * as ECSYTHREE from "ecsy-three"
import * as CANNON from "cannon-es"
import Transform from "../../transform/components/Transform"

import { WheelBody } from "../components/WheelBody"

const quaternion = new THREE.Quaternion()
const euler = new THREE.Euler()

export class WheelSystem extends ECSY.System {
  execute(dt, t) {
    for (let i = 0; i < this.queries.wheelBody.results.length; i++) {
      const entity = this.queries.wheelBody.results[i]
      //  console.log(entity);
      const parentEntity = entity.getComponent(WheelBody).vehicle

      const parentObject = parentEntity.getObject3D()
      const vehicle = parentObject.userData.vehicle
      vehicle.updateWheelTransform(i)
      //  console.log(vehicle);

      const transform = entity.getMutableComponent(Transform) as Transform

      transform.position = vehicle.wheelInfos[i].worldTransform.position

      //let euler2 = new THREE.Euler(euler.x, euler.y/2, euler.z, 'XYZ')
      transform.rotation = vehicle.wheelInfos[i].worldTransform.quaternion.toArray()
      //console.log(vehicle.wheelInfos[0].chassisConnectionPointWorld);
    }
  }
}

WheelSystem.queries = {
  wheelBody: {
    components: [WheelBody],
    listen: {
      added: true
    }
  }
}
