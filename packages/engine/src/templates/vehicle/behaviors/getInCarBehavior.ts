import { isClient } from '@xr3ngine/engine/src/common/functions/isClient';
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { NetworkObject } from '@xr3ngine/engine/src/networking/components/NetworkObject';
import { synchronizationComponents } from '@xr3ngine/engine/src/networking/functions/synchronizationComponents';
import { Entity } from '../../../ecs/classes/Entity';
import {
  addComponent,
  getComponent
} from '../../../ecs/functions/EntityFunctions';
import { PlayerInCar } from '../../../physics/components/PlayerInCar';

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
