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


function doorAnimation(mesh, timer, timeAnimation) {
  let angel = Math.PI / 4;
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

function positionEnter(entity, transform, transformCar, point) {
  transform.position
  .copy(new Vector3( ...point )
  .applyQuaternion(transformCar.rotation)
  .add(transformCar.position)
  .setY(transform.position.y)
  )

  transform.rotation.setFromRotationMatrix(
    new Matrix4().multiplyMatrices(
      new Matrix4().makeRotationFromQuaternion(transformCar.rotation),
      new Matrix4().makeRotationY(- Math.PI / 2)
    )
  )
}

function positionExit(entity, transform, transformCar, point) {
  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

  let position = new Vector3( ...point )
  .applyQuaternion(transformCar.rotation)
  .add(transformCar.position)
  .setY(transform.position.y)

  actor.actorCapsule.body.position.set(position.x , position.y, position.z);
  PhysicsSystem.physicsWorld.addBody(actor.actorCapsule.body);
}


function toSeats(entity, actor, transform, transformCar, seat) {
  transform.position
    .copy(new Vector3(...seat)
    .applyQuaternion(transformCar.rotation)
    .add(transformCar.position)
  )

  transform.rotation.setFromRotationMatrix(
    new Matrix4().multiplyMatrices(
      new Matrix4().makeRotationFromQuaternion(transformCar.rotation),
      new Matrix4().makeRotationX(-0.35)
    )
  )
}





export const playerModelInCar: Behavior = (entity: Entity, args: { type: string; phase?: string }, delta): void => {

  if (isServer) {
    const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
    const stateComponent = getComponent<State>(entity, State);
    const networkObject = getComponent<NetworkObject>(entity, NetworkObject);
    const transform = getMutableComponent<TransformComponent>(entity, TransformComponent);

    if (args.phase === 'onAdded') {

      const playerInCar = getComponent<PlayerInCar>(entity, PlayerInCar);
      const focusedPart = playerInCar.currentFocusedPart;
      const entityCar = playerInCar.entityCar;
      testDrive(focusedPart);
      testDriveSteering(focusedPart);
      const networkCar = getComponent<NetworkObject>(entityCar, NetworkObject);
      const transformCar = getComponent<TransformComponent>(entityCar, TransformComponent);
      const interactable = getComponent<Interactable>(entityCar, Interactable);
      const vehicleComponent = getMutableComponent<VehicleBody>(entityCar, VehicleBody);

      vehicleComponent[vehicleComponent.seatsPlane[focusedPart]] = entity;

      PhysicsSystem.physicsWorld.removeBody(actor.actorCapsule.body);


      Network.instance.editObjects.push({
        networkId: networkObject.networkId,
        ownerId: networkObject.ownerId,
        changed: 'test',
        currentId: networkObject.networkId
      })
      Network.instance.editObjects.push({
        networkId: networkCar.networkId,
        ownerId: networkCar.ownerId,
        changed: vehicleComponent.seatsPlane[focusedPart]+'Enter',
        currentId: networkObject.networkId
      })
      /*
      Network.instance.editObjects.push({
        networkId: networkCar.networkId,
        ownerId: networkCar.ownerId,
        changed: 'openDoor',
        currentId: 0
      })
*/
      positionEnter(entity, transform, transformCar, vehicleComponent.entrancesArray[focusedPart]);
      actor.timer = -1
      return;
    } else

    if (args.phase === 'onRemoved') {


      let index = null;
      let entityCar = null;

      for (let id = 1; id < Object.keys(Network.instance.networkObjects).length + 1; id++) {
        if (Network.instance.networkObjects[id].ownerId === 'server' && hasComponent(Network.instance.networkObjects[id].component.entity,VehicleBody)) {
          entityCar = Network.instance.networkObjects[id].component.entity
        }
      }

      const vehicleComponent = getMutableComponent<VehicleBody>(entityCar, VehicleBody);
      const transformCar = getComponent<TransformComponent>(entityCar, TransformComponent);
      const networkCar = getComponent<NetworkObject>(entityCar, NetworkObject);

      for (let i = 0; i < vehicleComponent.seatsPlane.length; i++) {
        const entitySearch = vehicleComponent[vehicleComponent.seatsPlane[i]];
          if (entitySearch != null) {
          const networkId = getComponent(entitySearch, NetworkObject).networkId;
          if (networkId == getComponent(entity, NetworkObject).networkId) {
            index = i;
          }
        }
      }

      positionExit(entity, transform, transformCar, vehicleComponent.entrancesArray[index]);
      vehicleComponent[vehicleComponent.seatsPlane[index]] = null;

      Network.instance.editObjects.push({
        networkId: networkCar.networkId,
        ownerId: networkCar.ownerId,
        changed: vehicleComponent.seatsPlane[index]+'Exit',
        currentId: networkObject.networkId
      })

      return;

    } else
    if (args.phase === 'onUpdate') {
      const playerInCar = getComponent<PlayerInCar>(entity, PlayerInCar);
      const focusedPart = playerInCar.currentFocusedPart;
      const entityCar = playerInCar.entityCar;

      const networkCar = getComponent<NetworkObject>(entityCar, NetworkObject);
      const transformCar = getComponent<TransformComponent>(entityCar, TransformComponent);
      const interactable = getComponent<Interactable>(entityCar, Interactable);
      const vehicleComponent = getMutableComponent<VehicleBody>(entityCar, VehicleBody);

      if (actor.timer > 3) {
        addState(entity, {state: CharacterStateTypes.DRIVING_IDLE});
      }
      if (stateComponent.data.has(CharacterStateTypes.DRIVING_IDLE)) {
        toSeats(entity, actor, transform, transformCar, vehicleComponent.seatsArray[focusedPart]);
      }
    }
    return;
  }

// CLIENT // ////////////////////////////////////////////////////////////////
  const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

  if (args.phase === 'onAdded') {
    addState(entity, {state: CharacterStateTypes.ENTER_VEHICLE});
    return;
  }

  if (args.phase === 'onRemoved') {

    let index = null;
    let entityCar = null;



    for (let id = 1; id < Object.keys(Network.instance.networkObjects).length + 1; id++) {
      if (Network.instance.networkObjects[id] && Network.instance.networkObjects[id].ownerId === 'server' && hasComponent(Network.instance.networkObjects[id].component.entity,VehicleBody)) {
        entityCar = Network.instance.networkObjects[id].component.entity
      }
    }
    console.warn(entityCar);
    const vehicleComponent = getMutableComponent<VehicleBody>(entityCar, VehicleBody);
    for (let i = 0; i < vehicleComponent.seatsPlane.length; i++) {
      const entitySearch = vehicleComponent[vehicleComponent.seatsPlane[i]];
      console.warn(entitySearch);
        if (entitySearch != null) {
          console.warn(entitySearch);
        const networkId = getComponent(entitySearch, NetworkObject).networkId;
        console.warn(entitySearch);
        if (networkId == getComponent(entity, NetworkObject).networkId) {
          index = i;
        }
      }
    }
    console.warn(index);
    const transform = getComponent<TransformComponent>(entity, TransformComponent);
    const transformCar = getComponent<TransformComponent>(entityCar, TransformComponent);
    positionExit(entity, transform, transformCar, vehicleComponent.entrancesArray[index]);
    vehicleComponent[vehicleComponent.seatsPlane[index]] = null;
    //doorAnimation(vehicleComponent.vehicleDoorsArray[index], 0.5, 3);
    return;
  }



  const stateComponent = getComponent<State>(entity, State);
  const transform = getMutableComponent<TransformComponent>(entity, TransformComponent);
  const playerInCar = getComponent<PlayerInCar>(entity, PlayerInCar);
  const focusedPart = playerInCar.currentFocusedPart;
  const entityCar = playerInCar.entityCar;
  testDrive(focusedPart);
  testDriveSteering(focusedPart);
  const transformCar = getComponent<TransformComponent>(entityCar, TransformComponent);
  const interactable = getComponent<Interactable>(entityCar, Interactable);
  const vehicleComponent = getMutableComponent<VehicleBody>(entityCar, VehicleBody);

  if (stateComponent.data.has(CharacterStateTypes.ENTER_VEHICLE)) {
    if (!hasComponent(entityCar, LocalInputReceiver)) {
      addComponent(entityCar, LocalInputReceiver);
      addComponent(entityCar, FollowCameraComponent, { distance: 5, mode: "thirdPerson", raycastBoxOn: false });
      vehicleComponent[vehicleComponent.seatsPlane[focusedPart]] = entity;
      // Turn Off CapsuleCollider
      PhysicsSystem.physicsWorld.removeBody(actor.actorCapsule.body);
      actor.timer = -1

      positionEnter(entity, transform, transformCar, vehicleComponent.entrancesArray[focusedPart]);
    }

    doorAnimation(vehicleComponent.vehicleDoorsArray[focusedPart], actor.timer, 3);

    if (actor.timer > 3) {
      addState(entity, {state: CharacterStateTypes.DRIVING_IDLE});
    }

  } else if (stateComponent.data.has(CharacterStateTypes.DRIVING_IDLE)) {
    toSeats(entity, actor, transform, transformCar, vehicleComponent.seatsArray[focusedPart]);
  }

/*
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
*/
};
