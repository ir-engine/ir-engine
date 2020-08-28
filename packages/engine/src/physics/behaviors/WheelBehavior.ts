import { Quaternion } from 'cannon-es';
import { Behavior } from '../../common/interfaces/Behavior';
import { Object3DComponent } from '../../common/components/Object3DComponent';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { VehicleBody } from '../../physics/components/VehicleBody';
import { WheelBody } from '../../physics/components/WheelBody';
import { Entity } from '../../ecs/classes/Entity';

const quaternion = new Quaternion();

export const WheelBehavior: Behavior = (entity: Entity, args): void => {
  if (args.phase == 'onUpdate') {


    const transform = getMutableComponent<TransformComponent>(entity, TransformComponent);
    const parentEntity = getComponent<WheelBody>(entity, WheelBody).vehicle;
  //  console.log(parentEntity);

    const object = getComponent<Object3DComponent>(parentEntity, Object3DComponent).value;

    const vehicle = object.userData.vehicle

    //console.log(vehicle);


    //  let parentObject = parentgetComponent(entity, Object3DComponent);


    vehicle.updateWheelTransform(args.i);

    transform.position[0] = vehicle.wheelInfos[args.i].worldTransform.position.x;
    transform.position[1] = vehicle.wheelInfos[args.i].worldTransform.position.y;
    transform.position[2] = vehicle.wheelInfos[args.i].worldTransform.position.z;


    transform.rotation[0] = vehicle.wheelInfos[args.i].worldTransform.quaternion.x,
    transform.rotation[1] = vehicle.wheelInfos[args.i].worldTransform.quaternion.y,
    transform.rotation[2] = vehicle.wheelInfos[args.i].worldTransform.quaternion.z,
    transform.rotation[3] = vehicle.wheelInfos[args.i].worldTransform.quaternion.w



  }
};
