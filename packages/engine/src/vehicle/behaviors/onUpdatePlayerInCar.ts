import { Matrix4, Vector3 } from 'three';
import { CharacterComponent } from '../../character/components/CharacterComponent';
import { Entity } from '../../ecs/classes/Entity';
import { getMutableComponent, getComponent, hasComponent } from '../../ecs/functions/EntityFunctions';
import { PlayerInCar } from '../components/PlayerInCar';
import { PhysicsSystem } from '../../physics/systems/PhysicsSystem';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { VehicleComponent } from '../components/VehicleComponent';
import { ControllerColliderComponent } from '../../character/components/ControllerColliderComponent';

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
  if (!hasComponent<PlayerInCar>(entity, PlayerInCar)) {
    const actor = getComponent<CharacterComponent>(entity, CharacterComponent);      
    const collider = getMutableComponent<ControllerColliderComponent>(entity, ControllerColliderComponent)
    PhysicsSystem.instance.removeBody(collider.controller);
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
