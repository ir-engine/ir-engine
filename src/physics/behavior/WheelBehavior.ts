import { Quaternion } from "cannon-es/src/math/Quaternion"
import { Vec3 } from "cannon-es/src/math/Vec3"
import { Behavior } from "../../common/interfaces/Behavior"
import { Object3DComponent } from "ecsy-three"
import { TransformComponent } from "../../transform/components/TransformComponent"
import { WheelBody } from "../components/WheelBody"
import { Entity } from "ecsy"

export const quaternion = new Quaternion()

export const WheelBehavior: Behavior = (entity: Entity, args): void => {
  if (args.phase == "onUpdate") {
    //  console.log(entity);
    const parentEntity = entity.getComponent(WheelBody).vehicle
    const transform = entity.getMutableComponent(TransformComponent)

    //  let parentObject = parentEntity.getComponent(Object3DComponent);
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
