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


function positionExit(entity, entityCar, seat) {
  const transform = getMutableComponent<TransformComponent>(entity, TransformComponent);
  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  const vehicle = getComponent<VehicleBody>(entityCar, VehicleBody);
  const transformCar = getComponent<TransformComponent>(entityCar, TransformComponent);

  let position = new Vector3( ...vehicle.entrancesArray[seat] )
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

  const playerInCar = getMutableComponent<PlayerInCar>(entity, PlayerInCar);
  playerInCar.currentFrame += playerInCar.animationSpeed;
  let carTimeOut = playerInCar.timeOut//isServer ? playerInCar.timeOut / delta : playerInCar.timeOut;

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
        new Matrix4().makeRotationX(-0.35)
      )
    )
  }

  if (isServer) return;

  if (playerInCar.currentFrame == playerInCar.animationSpeed) {
    addState(entity, {state: CharacterStateTypes.EXIT_VEHICLE});
  }

};
