import { isClient } from '../../../common/functions/isClient';
import { Behavior } from '../../../common/interfaces/Behavior';
import { Entity } from '../../../ecs/classes/Entity';
import {
  addComponent,
  getComponent
} from '../../../ecs/functions/EntityFunctions';
import { NetworkObject } from '../../../networking/components/NetworkObject';
import { sendClientObjectUpdate } from '../../../networking/functions/sendClientObjectUpdate';
import { PlayerInCar } from '../../../physics/components/PlayerInCar';
import { VehicleState, VehicleStateUpdateSchema } from '../enums/VehicleStateEnum';

export const getInCar: Behavior = (entity: Entity, args: { currentFocusedPart: number }, delta, entityCar): void => {
  console.warn('Behavior: getInCar');
  if (isClient) return;
  // isServer
  console.warn('getInCar: '+args.currentFocusedPart);
  addComponent(entity, PlayerInCar, {
      state: VehicleState.onAddedEnding,
      networkCarId: getComponent(entityCar, NetworkObject).networkId,
      currentFocusedPart: args.currentFocusedPart
  });
  sendClientObjectUpdate(entity, [
      VehicleState.onAddedEnding,
      getComponent(entityCar, NetworkObject).networkId,
      args.currentFocusedPart
    ] as VehicleStateUpdateSchema
  );
//  if (isServer) return;
  // is Client
//  removeComponent(entity, LocalInputReceiver);
//  removeComponent(entity, FollowCameraComponent);
  /*
  const event = new CustomEvent('player-in-car', { detail:{inCar:true, interactionText: 'get out of the car',} });
  document.dispatchEvent(event);
  */
};
