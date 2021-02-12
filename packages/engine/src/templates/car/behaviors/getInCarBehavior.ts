import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { Entity } from '../../../ecs/classes/Entity';
import { Vector2 } from 'three';
import {
  removeComponent,
  addComponent,
  getComponent,
  getMutableComponent
} from '../../../ecs/functions/EntityFunctions';
import { FollowCameraComponent } from "@xr3ngine/engine/src/camera/components/FollowCameraComponent";
import { TransformComponent } from '../../../transform/components/TransformComponent';
import { LocalInputReceiver } from "@xr3ngine/engine/src/input/components/LocalInputReceiver";
import { VehicleBody } from '../../../physics/components/VehicleBody';
import { PlayerInCar } from '../../../physics/components/PlayerInCar';
import { addState } from "../../../state/behaviors/addState";
import { CharacterStateTypes } from "@xr3ngine/engine/src/templates/character/CharacterStateTypes";
import { cameraPointerLock } from "@xr3ngine/engine/src/camera/behaviors/cameraPointerLock";
import { isServer } from '@xr3ngine/engine/src/common/functions/isServer';
import { isClient } from '@xr3ngine/engine/src/common/functions/isClient';
import { NetworkObject } from '@xr3ngine/engine/src/networking/components/NetworkObject';
import { synchronizationComponents } from '@xr3ngine/engine/src/networking/functions/synchronizationComponents';

export const getInCar: Behavior = (entity: Entity, args: { currentFocusedPart: number }, delta, entityCar): void => {
  //console.warn('Behavior: getInCar');
  if (isClient) return;
  // isServer
  //console.warn('getInCar: '+args.currentFocusedPart);
  addComponent(entity, PlayerInCar, {
      state: 'onAddedEnding',
      networkCarId: getComponent(entityCar, NetworkObject).networkId,
      currentFocusedPart: args.currentFocusedPart
  });
  synchronizationComponents(entity, 'PlayerInCar', {
      state: 'onAddedEnding',
      networkCarId: getComponent(entityCar, NetworkObject).networkId,
      currentFocusedPart: args.currentFocusedPart,
      whoIsItFor: 'all'
  });

//  if (isServer) return;
  // is Client
//  removeComponent(entity, LocalInputReceiver);
//  removeComponent(entity, FollowCameraComponent);
  /*
  const event = new CustomEvent('player-in-car', { detail:{inCar:true, interactionText: 'get out of the car',} });
  document.dispatchEvent(event);
  */
};
