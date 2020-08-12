import { Attributes, System } from "../../ecs/System"
import { TransformComponent } from "../../transform/components/TransformComponent"
import { WheelBody } from "../components/WheelBody"

export class WheelSystem extends System {
  init(attributes?: Attributes): void {
    throw new Error("Method not implemented.")
  }
  execute(dt, t) {
    for (let i = 0; i < this.queries.wheelBody.results.length; i++) {
      const entity = this.queries.wheelBody.results[i]
      //  console.log(entity);
      const parentEntity = entity.getComponent(WheelBody as any)["vehicle"]
      const parentObject = parentEntity.getObject3D()
      const vehicle = parentObject.userData.vehicle
      vehicle.updateWheelTransform(i)
      //  console.log(vehicle);

      const transform = entity.getMutableComponent(TransformComponent) as TransformComponent

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
