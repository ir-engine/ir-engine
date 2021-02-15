import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { getComponent, getMutableComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { PlayerInCar } from '@xr3ngine/engine/src/physics/components/PlayerInCar';
import { VehicleBody } from '@xr3ngine/engine/src/physics/components/VehicleBody';
import { setState } from "@xr3ngine/engine/src/state/behaviors/setState";
import { CharacterStateTypes } from "@xr3ngine/engine/src/templates/character/CharacterStateTypes";
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

function positionEnter(entity, entityCar, seat) {
  const transform = getMutableComponent<TransformComponent>(entity, TransformComponent);
  const vehicle = getComponent<VehicleBody>(entityCar, VehicleBody);
  const transformCar = getComponent<TransformComponent>(entityCar, TransformComponent);

  const position = new Vector3( ...vehicle.entrancesArray[seat] )
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
      new Matrix4().makeRotationY(- Math.PI / 2)
    )
  )
}

export const onAddEndingInCar = (entity: Entity, entityCar: Entity, seat: number, delta: number): void => {

  const playerInCar = getMutableComponent(entity, PlayerInCar);

  const carTimeOut = playerInCar.timeOut;//isServer ? playerInCar.timeOut / delta : playerInCar.timeOut;

  playerInCar.currentFrame += playerInCar.animationSpeed;

  doorAnimation(entityCar, seat, playerInCar.currentFrame, carTimeOut, playerInCar.angel);
  positionEnter(entity, entityCar, seat);
  let timeOut = false;

  if (playerInCar.currentFrame > carTimeOut) {
    playerInCar.currentFrame = 0;
    timeOut = true;
    getMutableComponent(entity, PlayerInCar).state = 'onUpdate';
  }

  if (isServer) return;
  if (timeOut) {
    setState(entity, {state: CharacterStateTypes.DRIVING});
  }
};
