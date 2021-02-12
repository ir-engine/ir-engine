import { Vector3, Matrix4 } from 'three';
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { Entity } from '../../../ecs/classes/Entity';
import { removeComponent, addComponent, getComponent, hasComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { FollowCameraComponent } from "@xr3ngine/engine/src/camera/components/FollowCameraComponent";
import { LocalInputReceiver } from "@xr3ngine/engine/src/input/components/LocalInputReceiver";
import { VehicleBody } from '../../../physics/components/VehicleBody';
import { PlayerInCar } from '../../../physics/components/PlayerInCar';
import { TransformComponent } from '../../../transform/components/TransformComponent';
import { setPosition } from '../../../templates/character/behaviors/setPosition';
import { addState } from "../../../state/behaviors/addState";
import { CharacterStateTypes } from "@xr3ngine/engine/src/templates/character/CharacterStateTypes";
import { NetworkObject } from '@xr3ngine/engine/src/networking/components/NetworkObject';
import { Network } from '@xr3ngine/engine/src/networking/classes/Network';
import { isServer } from "../../../common/functions/isServer";
import { synchronizationComponents } from '@xr3ngine/engine/src/networking/functions/synchronizationComponents';

export const getOutCar: Behavior = (entityCar: Entity): void => {
  //console.warn('getOutCar: Behavior, networkId = '+getComponent(entity, NetworkObject).networkId);
  let entity = null;
  const vehicle = getComponent(entityCar, VehicleBody);

  let networkPlayerId = null

  if(isServer) {
    networkPlayerId = vehicle.wantsExit.filter(f => f != null)[0]
    console.warn('wantsExit: '+ vehicle.wantsExit);
  } else {
    networkPlayerId = Network.instance.userNetworkId
  }

  for (let i = 0; i < vehicle.seatPlane.length; i++) {
    if (networkPlayerId == vehicle[vehicle.seatPlane[i]]) {
      entity = Network.instance.networkObjects[networkPlayerId].component.entity;
    }
  }

  getMutableComponent(entity, PlayerInCar).state = 'onStartRemove';
  synchronizationComponents(entity, 'PlayerInCar', { state: 'onStartRemove', whoIsItFor: 'otherPlayers' });

/*
  const event = new CustomEvent('player-in-car', { detail:{inCar:false} });
  document.dispatchEvent(event);
*/
};
