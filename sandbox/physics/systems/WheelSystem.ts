import { getComponent, getMutableComponent, registerComponent } from "../../../src/ecs"
import { Attributes, System } from "../../../src/ecs/classes/System"
import { TransformComponent } from "../../../src/transform/components/TransformComponent"
import { WheelBody } from "../components/WheelBody"

export class WheelSystem extends System {
  init(attributes?: Attributes): void {
    registerComponent(WheelBody)
  }
  execute(dt, t) {
    for (let i = 0; i < this.queryResults.wheelBody.results.length; i++) {
      const entity = this.queryResults.wheelBody.results[i]
      //  console.log(entity);
      const parentEntity = getComponent(entity, WheelBody as any)["vehicle"]
      const parentObject = parentEntity.getObject3D()
      const vehicle = parentObject.userData.vehicle
      vehicle.updateWheelTransform(i)
      //  console.log(vehicle);

      const transform = getMutableComponent(entity, TransformComponent) as TransformComponent

      transform.position = vehicle.wheelInfos[i].worldTransform.position

      //let euler2 = new THREE.Euler(euler.x, euler.y/2, euler.z, 'XYZ')
      transform.rotation = vehicle.wheelInfos[i].worldTransform.quaternion.toArray()
      //console.log(vehicle.wheelInfos[0].chassisConnectionPointWorld);
    }
  }
}

WheelSystem.systemQueries = {
  wheelBody: {
    components: [WheelBody],
    listen: {
      added: true
    }
  }
}
