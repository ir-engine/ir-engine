import { isClient } from '../../common/functions/isClient';
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent, getMutableComponent, addComponent } from '../../ecs/functions/EntityFunctions';
import { DelegatedInputReceiver } from '../../input/components/DelegatedInputReceiver';
import { NetworkObject } from '../../networking/components/NetworkObject';
import { sendClientObjectUpdate } from '../../networking/functions/sendClientObjectUpdate';
import { NetworkObjectUpdateType } from '../../networking/templates/NetworkObjectUpdateSchema';
import { PlayerInCar } from '../components/PlayerInCar';
import { VehicleComponent } from '../components/VehicleComponent';
import { VehicleState, VehicleStateUpdateSchema } from '../enums/VehicleStateEnum';

/**
 * @author HydraFire <github.com/HydraFire>
 */


export const getInCar: Behavior = (entity: Entity, args: { currentFocusedPart: number }, delta, entityCar): void => {
  if (isClient) return;
  const carNetworkId = getComponent(entityCar, NetworkObject).networkId
  getMutableComponent(entityCar, VehicleComponent).driver = getComponent(entity, NetworkObject).networkId
  addComponent(entity, PlayerInCar, {
      state: VehicleState.onAddedEnding,
      networkCarId: carNetworkId,
      currentFocusedPart: args.currentFocusedPart
  });
  sendClientObjectUpdate(entity, NetworkObjectUpdateType.VehicleStateChange, [
      VehicleState.onAddedEnding,
      carNetworkId,
      args.currentFocusedPart
    ] as VehicleStateUpdateSchema
  );
  addComponent(entity, DelegatedInputReceiver, { networkId: carNetworkId })
};
