import { Matrix4, Vector3 } from 'three';
import { initializeMovingState } from '../../character/animations/MovingAnimations';
import { CharacterAnimations } from '../../character/CharacterAnimations';
import { CharacterComponent } from '../../character/components/CharacterComponent';
import { changeAnimation } from '../../character/functions/updateVectorAnimation';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent, getMutableComponent, removeComponent } from '../../ecs/functions/EntityFunctions';
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

function doorAnimation(entityCar, seat, timer, timeAnimation, angel) {
  const vehicle = getComponent<VehicleComponent>(entityCar, VehicleComponent);
  const mesh = vehicle.vehicleDoorsArray[seat];
  if (mesh === undefined) return;

  const andelPetTick = angel / (timeAnimation / 2);
  if (timer > (timeAnimation/2)) {

    mesh.quaternion.setFromRotationMatrix(new Matrix4().makeRotationY(
       mesh.position.x > 0 ? -((timeAnimation - timer)* andelPetTick): (timeAnimation - timer)* andelPetTick
    ));
  } else {
    mesh.quaternion.setFromRotationMatrix(new Matrix4().makeRotationY(
       mesh.position.x > 0 ? -(timer * andelPetTick) : (timer * andelPetTick)
    ));
  }
}


function positionExit(entity, entityCar, seat) {
  const transform = getMutableComponent<TransformComponent>(entity, TransformComponent);
  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  const vehicle = getComponent<VehicleComponent>(entityCar, VehicleComponent);
  const transformCar = getComponent<TransformComponent>(entityCar, TransformComponent);
  const collider = getMutableComponent<ControllerColliderComponent>(entity, ControllerColliderComponent)

  const position = new Vector3( ...vehicle.entrancesArray[seat] )
  .applyQuaternion(transformCar.rotation)
  .add(transformCar.position)
  .setY(transform.position.y)

  collider.controller.transform.translation.x = position.x;
  collider.controller.transform.translation.y = position.y;
  collider.controller.transform.translation.z = position.z;

  transform.position.set(
    position.x,
    position.y,
    position.z
  );

  PhysicsSystem.instance.createController(collider.controller);
}


export const onStartRemoveFromCar = (entity: Entity, entityCar: Entity, seat: number, delta): void => {

  const transform = getMutableComponent<TransformComponent>(entity, TransformComponent);
  const vehicle = getComponent<VehicleComponent>(entityCar, VehicleComponent);
  const transformCar = getComponent<TransformComponent>(entityCar, TransformComponent);

  const playerInCar = getMutableComponent(entity, PlayerInCar);
  playerInCar.currentFrame += playerInCar.animationSpeed;
  const carTimeOut = playerInCar.timeOut//!isClient ? playerInCar.timeOut / delta : playerInCar.timeOut;

  doorAnimation(entityCar, seat, playerInCar.currentFrame, carTimeOut, playerInCar.angel);


  if (playerInCar.currentFrame > carTimeOut) {
    positionExit(entity, entityCar, seat);
    removeComponent(entity, PlayerInCar)
  } else {

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
        new Matrix4().makeRotationX(0)
      )
    )

  }

  // if (!isClient) return;



  if (playerInCar.currentFrame == playerInCar.animationSpeed) {
    // setState(entity, { state: CharacterAnimations.DEFAULT });
    initializeMovingState(entity)

    changeAnimation(entity, {
      animationId: CharacterAnimations.EXITING_VEHICLE_DRIVER,
      transitionDuration: 0.3
     })
  }

};
