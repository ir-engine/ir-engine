import { Behavior } from '../../common/interfaces/Behavior';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { ColliderComponent } from '../components/ColliderComponent';
import { VehicleBody } from '../components/VehicleBody';
import { PlayerInCar } from '../components/PlayerInCar';
import { Vector3 } from 'three';
import { Entity } from '../../ecs/classes/Entity';
import { PhysicsManager } from '../components/PhysicsManager';
import { getMutableComponent, hasComponent, getComponent, addComponent } from '../../ecs/functions/EntityFunctions';
import { Object3DComponent } from '../../common/components/Object3DComponent';
import { cannonFromThreeVector } from '../../common/functions/cannonFromThreeVector';

export const playerModelInCar: Behavior = (entity: Entity, args: { type: string, phase?: string }): void => {

  if (args.phase === 'onRemoved') {

    return
  }

  const transform = getMutableComponent<TransformComponent>(entity, TransformComponent);
  const playerInCarComponent = getComponent<PlayerInCar>(entity, PlayerInCar);
  const entityCar = playerInCarComponent.entityCar
  const transformCar = getComponent<TransformComponent>(entityCar, TransformComponent);
  const vehicleComponent = getMutableComponent<VehicleBody>(entityCar, VehicleBody);

  let entrance = new Vector3(
    vehicleComponent.seatsArray[0][0],
    vehicleComponent.seatsArray[0][1],
    vehicleComponent.seatsArray[0][2]
  ).applyQuaternion(transformCar.rotation)

  transform.position.copy( entrance.add(transformCar.position) )
  transform.rotation.copy( transformCar.rotation )
}
