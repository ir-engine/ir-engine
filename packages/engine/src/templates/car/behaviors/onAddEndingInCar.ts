import { Matrix4, Vector3 } from 'three';
import { FollowCameraComponent } from "@xr3ngine/engine/src/camera/components/FollowCameraComponent";
import { Interactable } from "@xr3ngine/engine/src/interaction/components/Interactable";
import { Interactor } from "@xr3ngine/engine/src/interaction/components/Interactor";
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { addComponent, getComponent, getMutableComponent, hasComponent, removeComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { LocalInputReceiver } from "@xr3ngine/engine/src/input/components/LocalInputReceiver";
import { PlayerInCar } from '@xr3ngine/engine/src/physics/components/PlayerInCar';
import { VehicleBody } from '@xr3ngine/engine/src/physics/components/VehicleBody';
import { CapsuleCollider } from '@xr3ngine/engine/src/physics/components/CapsuleCollider';
import { addState } from "@xr3ngine/engine/src/state/behaviors/addState";
import { State } from "@xr3ngine/engine/src/state/components/State";
import { setDropState } from "@xr3ngine/engine/src/templates/character/behaviors/setDropState";
import { setPosition } from "@xr3ngine/engine/src/templates/character/behaviors/setPosition";
import { setOrientation } from "@xr3ngine/engine/src/templates/character/behaviors/setOrientation";
//import { deactivateCapsuleCollision } from "@xr3ngine/engine/src/templates/character/behaviors/deactivateCapsuleCollision";
import { CharacterStateTypes } from "@xr3ngine/engine/src/templates/character/CharacterStateTypes";
import { CharacterComponent } from "@xr3ngine/engine/src/templates/character/components/CharacterComponent";
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import { isServer } from "../../../common/functions/isServer";
import { PhysicsSystem } from '@xr3ngine/engine/src/physics/systems/PhysicsSystem';

import { Network } from '@xr3ngine/engine/src/networking/classes/Network';
import { NetworkObject } from '@xr3ngine/engine/src/networking/components/NetworkObject';



function doorAnimation(entityCar, seat, timer, timeAnimation, angel) {
  const vehicle = getComponent<VehicleBody>(entityCar, VehicleBody);
  const mesh = vehicle.vehicleDoorsArray[seat];

  let andelPetTick = angel / (timeAnimation / 2);
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

  let position = new Vector3( ...vehicle.entrancesArray[seat] )
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

  const playerInCar = getMutableComponent<PlayerInCar>(entity, PlayerInCar);

  let carTimeOut = playerInCar.timeOut//isServer ? playerInCar.timeOut / delta : playerInCar.timeOut;

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
    addState(entity, {state: CharacterStateTypes.DRIVING_IDLE});
  }
};
