import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { getComponent, getMutableComponent, removeComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { PlayerInCar } from '@xr3ngine/engine/src/physics/components/PlayerInCar';
import { VehicleBody } from '@xr3ngine/engine/src/physics/components/VehicleBody';
import { PhysicsSystem } from '@xr3ngine/engine/src/physics/systems/PhysicsSystem';
import { setState } from "@xr3ngine/engine/src/state/behaviors/setState";
import { CharacterStateTypes } from "@xr3ngine/engine/src/templates/character/CharacterStateTypes";
import { CharacterComponent } from "@xr3ngine/engine/src/templates/character/components/CharacterComponent";
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import { Matrix4, Vector3 } from 'three';
import { isServer } from "../../../common/functions/isServer";

function doorAnimation(entityCar, seat, timer, timeAnimation, angel) {
  const vehicle = getComponent<VehicleBody>(entityCar, VehicleBody);
  const mesh = vehicle.vehicleDoorsArray[seat];

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
  const vehicle = getComponent<VehicleBody>(entityCar, VehicleBody);
  const transformCar = getComponent<TransformComponent>(entityCar, TransformComponent);

  const position = new Vector3( ...vehicle.entrancesArray[seat] )
  .applyQuaternion(transformCar.rotation)
  .add(transformCar.position)
  .setY(transform.position.y)

  actor.actorCapsule.body.position.set(position.x , position.y, position.z);

  transform.position.set(
    position.x,
    position.y,
    position.z
  );

  PhysicsSystem.physicsWorld.addBody(actor.actorCapsule.body);
}


export const onStartRemoveFromCar = (entity: Entity, entityCar: Entity, seat: number, delta): void => {

  const transform = getMutableComponent<TransformComponent>(entity, TransformComponent);
  const vehicle = getComponent<VehicleBody>(entityCar, VehicleBody);
  const transformCar = getComponent<TransformComponent>(entityCar, TransformComponent);

  const playerInCar = getMutableComponent(entity, PlayerInCar);
  playerInCar.currentFrame += playerInCar.animationSpeed;
  const carTimeOut = playerInCar.timeOut//isServer ? playerInCar.timeOut / delta : playerInCar.timeOut;

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

  if (isServer) return;

  if (playerInCar.currentFrame == playerInCar.animationSpeed) {
    setState(entity, {state: CharacterStateTypes.EXITING_VEHICLE});
  }
};
