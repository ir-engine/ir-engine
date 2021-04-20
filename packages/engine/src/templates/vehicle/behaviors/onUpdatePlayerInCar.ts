import { Matrix4, Vector3 } from 'three';
import { CharacterComponent } from "../../character/components/CharacterComponent";
import { isPlayerInVehicle } from '../../../common/functions/isPlayerInVehicle';
import { VehicleComponent } from '../components/VehicleComponent';
import { Entity } from '../../../ecs/classes/Entity';
import { TransformComponent } from '../../../transform/components/TransformComponent';
import { getComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { PhysicsSystem } from '../../../physics/systems/PhysicsSystem';


/**
 * @author HydraFire <github.com/HydraFire>
 * @param entity is the entity to handle state changes to
 * @param seat idex array of seats
 */

export const onUpdatePlayerInCar = (entity: Entity, entityCar: Entity, seat: number, delta): void => {

  const transform = getMutableComponent<TransformComponent>(entity, TransformComponent);
  const vehicle = getComponent<VehicleComponent>(entityCar, VehicleComponent);
  const transformCar = getComponent<TransformComponent>(entityCar, TransformComponent);


  // its then connected player seen other player in car
  if ( !isPlayerInVehicle(entity) ) {
    const actor = getComponent<CharacterComponent>(entity, CharacterComponent);
    PhysicsSystem.instance.removeBody(actor.actorCapsule.body);
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
