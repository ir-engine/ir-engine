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

export const vehicleInputCheck = (clientInput): void => {
  const entity = Network.instance.networkObjects[clientInput.networkId].component.entity;
  if(!hasComponent(entity, PlayerInCar)) return;
  const playerInCar = getComponent(entity, PlayerInCar);
  const entityCar = Network.instance.networkObjects[playerInCar.networkCarId].component.entity;
  if(!hasComponent(entityCar, VehicleBody)) return;
  // its warns the car that a passenger or driver wants to get out
  for (let i = 0; i < clientInput.buttons.length; i++) {
    if (clientInput.buttons[i].input == 8) { // TO DO get interact button for every device
      const vehicle = getMutableComponent(entityCar, VehicleBody);
      for (let li = 0; li < vehicle.seatPlane.length; li++) {
        const driverId = vehicle[vehicle.seatPlane[li]];
        if (driverId == clientInput.networkId) {
          vehicle.wantsExit = [null, null];
          vehicle.wantsExit[li] = clientInput.networkId;
        }
      };
    }
  }
  const vehicle = getComponent(entityCar, VehicleBody);
  // its does not allow the passenger to drive the car
  if (vehicle.passenger == clientInput.networkId) {
    clientInput.buttons = clientInput.buttons.filter(buttons => buttons.input == 8); // TO DO get interact button for every device
  }

};
