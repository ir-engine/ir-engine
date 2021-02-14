import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { getComponent, getMutableComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { VehicleBody } from '@xr3ngine/engine/src/physics/components/VehicleBody';
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import { Matrix4, Vector3 } from 'three';

export const onUpdatePlayerInCar = (entity: Entity, entityCar: Entity, seat: number, delta): void => {

  const transform = getMutableComponent<TransformComponent>(entity, TransformComponent);
  const vehicle = getComponent<VehicleBody>(entityCar, VehicleBody);
  const transformCar = getComponent<TransformComponent>(entityCar, TransformComponent);

  const position = new Vector3(...vehicle.seatsArray[seat])
    .applyQuaternion(transformCar.rotation)
    .add(transformCar.position)
    .setY(transform.position.y)

  transform.position.set(
    position.x,
    position.y,
    position.z
  )

  transform.rotation.setFromRotationMatrix(
    new Matrix4().multiplyMatrices(
      new Matrix4().makeRotationFromQuaternion(transformCar.rotation),
      new Matrix4().makeRotationX(-0.35)
    )
  )
};
