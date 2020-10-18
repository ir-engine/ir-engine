import { FollowCameraComponent } from "@xr3ngine/engine/src/camera/components/FollowCameraComponent";
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { addComponent, getComponent, getMutableComponent, hasComponent, removeComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { LocalInputReceiver } from "@xr3ngine/engine/src/input/components/LocalInputReceiver";
import { PlayerInCar } from '@xr3ngine/engine/src/physics/components/PlayerInCar';
import { VehicleBody } from '@xr3ngine/engine/src/physics/components/VehicleBody';
import { addState } from "@xr3ngine/engine/src/state/behaviors/addState";
import { State } from "@xr3ngine/engine/src/state/components/State";
import { setDropState } from "@xr3ngine/engine/src/templates/character/behaviors/setDropState";
import { setPosition } from "@xr3ngine/engine/src/templates/character/behaviors/setPosition";
import { CharacterStateTypes } from "@xr3ngine/engine/src/templates/character/CharacterStateTypes";
import { CharacterComponent } from "@xr3ngine/engine/src/templates/character/components/CharacterComponent";
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import { Matrix4, Vector3 } from 'three';

function openCarDoorAnimation(mesh, timer, timeAnimation) {
  if (timer > (timeAnimation/2)) {
    mesh.quaternion.setFromRotationMatrix(new Matrix4().makeRotationZ(
       timeAnimation/1.3 - timer/1.3
    ));
  } else {
    mesh.quaternion.setFromRotationMatrix(new Matrix4().makeRotationZ(
       timer/1.3
    ));
  }
}

function setPlayerToPositionEnter(entity, transformCar, entrances) {
  let entrance = new Vector3(
    entrances[0] + 0.9,
    entrances[1],
    entrances[2]
  ).applyQuaternion(transformCar.rotation);
  entrance = entrance.add(transformCar.position);
  setPosition(entity, entrance);
}

function setPlayerToSeats(transform, transformCar, seat) {
  const entrance = new Vector3(
    seat[0],
    seat[1]+0.2,
    seat[2]+0.51
  ).applyQuaternion(transformCar.rotation);

  transform.position.copy( entrance.add(transformCar.position) );
  transform.rotation.copy( transformCar.rotation );
}



export const playerModelInCar: Behavior = (entity: Entity, args: { type: string, phase?: string }, delta): void => {
  const transform = getMutableComponent<TransformComponent>(entity, TransformComponent);

  if (args.phase === 'onAdded') {
    addState(entity, {state: CharacterStateTypes.ENTER_VEHICLE});
    return;
  }

  if (args.phase === 'onRemoved') {
    return;
  }

  const playerInCarComponent = getComponent<PlayerInCar>(entity, PlayerInCar);
  const entityCar = playerInCarComponent.entityCar;
  const transformCar = getComponent<TransformComponent>(entityCar, TransformComponent);
  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  const stateComponent = getComponent<State>(entity, State);
  const vehicleComponent = getMutableComponent<VehicleBody>(entityCar, VehicleBody);



  if (stateComponent.data.has(CharacterStateTypes.ENTER_VEHICLE)) {
    if (!hasComponent(entityCar, LocalInputReceiver)) {
      addComponent(entityCar, LocalInputReceiver);
      addComponent(entityCar, FollowCameraComponent, { distance: 4, mode: "thirdPerson" });
      vehicleComponent.currentDriver = entity;
    }

    openCarDoorAnimation(vehicleComponent.vehicleDoorsArray[0], actor.timer, 2.1);
    if (actor.timer > 2.1) {
      addState(entity, {state: CharacterStateTypes.DRIVING_IDLE});
      return;
    }

    // when ENTER VEHICLE
    setPlayerToPositionEnter(entity, transformCar, vehicleComponent.entrancesArray[0]);

    const hhh = new Matrix4().multiplyMatrices(
      new Matrix4().makeRotationFromQuaternion(transformCar.rotation),
      new Matrix4().makeRotationY(-Math.PI / 2)
    );
    transform.rotation.setFromRotationMatrix(hhh);
  }




  if (stateComponent.data.has(CharacterStateTypes.DRIVING_IDLE)) {

    //<-----setPlayerToSeats(
    setPlayerToSeats(transform, transformCar, vehicleComponent.seatsArray[0]);
  }


  if (stateComponent.data.has(CharacterStateTypes.EXIT_VEHICLE)){
    if (actor.timer > 2.1) {

      if (hasComponent(entity, PlayerInCar)) {
        removeComponent(entityCar, LocalInputReceiver);
        removeComponent(entityCar, FollowCameraComponent);
        vehicleComponent.currentDriver = null;

        addComponent(entity, LocalInputReceiver);
        addComponent(entity, FollowCameraComponent);
        setDropState(entity, null, delta);
        removeComponent(entity, PlayerInCar);
        setPlayerToPositionEnter(entity, transformCar, vehicleComponent.entrancesArray[0]);
      }
    } else {
      openCarDoorAnimation(vehicleComponent.vehicleDoorsArray[0], actor.timer, 2.1);

      // set position character when get out car
      setPlayerToSeats(transform, transformCar, vehicleComponent.seatsArray[0]);

      const hhh = new Matrix4().multiplyMatrices(
        new Matrix4().makeRotationFromQuaternion(transformCar.rotation),
        new Matrix4().makeRotationY(-0.18539)
      );
      transform.rotation.setFromRotationMatrix(hhh);
    }
  }

};
