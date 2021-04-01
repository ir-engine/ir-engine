import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { getComponent, getMutableComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { VehicleBody } from '@xr3ngine/engine/src/physics/components/VehicleBody';
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import { Matrix4, Vector3 } from 'three';
import { PhysicsSystem } from '@xr3ngine/engine/src/physics/systems/PhysicsSystem';
import { CharacterComponent } from "../../character/components/CharacterComponent";
import { isPlayerInVehicle } from '../../../common/functions/isPlayerInVehicle';

export const onUpdatePlayerInCar = (entity: Entity, entityCar: Entity, seat: number, delta): void => {

  const transform = getMutableComponent<TransformComponent>(entity, TransformComponent);
  const vehicle = getComponent<VehicleBody>(entityCar, VehicleBody);
  const transformCar = getComponent<TransformComponent>(entityCar, TransformComponent);


  // its then connected player seen other player in car
  if ( !isPlayerInVehicle(entity) ) {
    const actor = getComponent<CharacterComponent>(entity, CharacterComponent);
    PhysicsSystem.physicsWorld.removeBody(actor.actorCapsule.body);
  }

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
