import { Quaternion } from 'cannon-es';
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';

const quaternion = new Quaternion();

export const WheelBehavior: Behavior = (entity: Entity, args): void => {
  if (args.phase == 'onUpdate') {
/*

    const transform = getMutableComponent<TransformComponent>(entity, TransformComponent);
    const parentEntity = getComponent<WheelBody>(entity, WheelBody).vehicle;
  //  console.log(parentEntity);

    const object = getComponent<Object3DComponent>(parentEntity, Object3DComponent).value;

    const vehicle = object.userData.vehicle

    if(vehicle){
    //console.log(vehicle);


    //  let parentObject = parentgetComponent(entity, Object3DComponent);


    vehicle.updateWheelTransform(args.i);

    transform.position.set(
      vehicle.wheelInfos[args.i].worldTransform.position.x,
      vehicle.wheelInfos[args.i].worldTransform.position.y,
      vehicle.wheelInfos[args.i].worldTransform.position.z
    )

    transform.rotation.set(
      vehicle.wheelInfos[args.i].worldTransform.quaternion.x,
      vehicle.wheelInfos[args.i].worldTransform.quaternion.y,
      vehicle.wheelInfos[args.i].worldTransform.quaternion.z,
      vehicle.wheelInfos[args.i].worldTransform.quaternion.w
    )

    } else console.warn("Could not find vehicle")

*/
  }
};
