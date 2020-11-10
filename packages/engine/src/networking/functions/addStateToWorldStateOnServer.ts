import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { State } from '../../state/components/State';
import { Network } from '../components/Network';
import { NetworkObject } from '../components/NetworkObject';

export const addStateToWorldStateOnServer: Behavior = (entity: Entity) => {
  console.log("addStateToWorldStateOnServer", entity.id);
  const state = getComponent(entity, State);
    
  const networkState = {
    networkId: getComponent(entity, NetworkObject).networkId,
    states: {}
  };

  state.data.forEach((stateValue, stateKey) => {
    networkState.states[stateKey] = stateValue;
  });

  // Add inputs to world state
  Network.instance.worldState.states.push(networkState);
};
