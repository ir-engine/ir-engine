import { Quaternion } from "cannon-es/src/math/Quaternion"
import { Behavior } from "../../common/interfaces/Behavior"
import { TransformComponent } from "../../transform/components/TransformComponent"
import { getComponent, getMutableComponent } from "../../ecs/functions/EntityFunctions"
import { WheelBody } from "../../sandbox/physics/components/WheelBody"
import { Entity } from "../../ecs/classes/Entity"

export const quaternion = new Quaternion()

export const WheelBehavior: Behavior = (entity: Entity, args): void => {
  if (args.phase == "onUpdate") {
    //  console.log(entity);
    const parentEntity = getComponent<WheelBody>(entity, WheelBody).vehicle
    const transform = getMutableComponent<TransformComponent>(entity, TransformComponent)

    //  let parentObject = parentgetComponent(entity, Object3DComponent);
    const vehicle = parentEntity
    console.log(parentEntity)

    vehicle.updateWheelTransform(args.i)
    //  console.log(vehicle);

    transform.position = vehicle.wheelInfos[args.i].worldTransform.position

    quaternion.set(
      vehicle.wheelInfos[args.i].worldTransform.quaternion.x,
      vehicle.wheelInfos[args.i].worldTransform.quaternion.y,
      vehicle.wheelInfos[args.i].worldTransform.quaternion.z,
      vehicle.wheelInfos[args.i].worldTransform.quaternion.w
    )

    transform.rotation = vehicle.quaternion.toArray()
  }
}
