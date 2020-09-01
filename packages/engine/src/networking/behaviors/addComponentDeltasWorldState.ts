import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { Network } from '../components/Network';
import { NetworkObject } from '../components/NetworkObject';
import { Engine } from '../../ecs/classes/Engine';
import { Behavior } from '../../common/interfaces/Behavior';

// TODO: Do we need this?

export const addComponentDeltasWorldState: Behavior = (entity) => {
  const networkObject: NetworkObject = getComponent(entity, NetworkObject);
  Network.instance.worldState[entity.id] = {};
  // foreach in component map...
  for (const componentTypeId in networkObject.componentMap) {
    Network.instance.worldState[entity.id][componentTypeId] = {};
    // Get the component by looking it up in the component map
    const component = getMutableComponent(entity, Engine.componentsMap[componentTypeId] as any);
    // Iterate through attributes in the component map
    for (const attribute in networkObject.componentMap[componentTypeId]) {
      // If the value hasn't changed, ignore it
      if (component[attribute] === networkObject.componentMap[componentTypeId][attribute])
        return;
      // Otherwise, add to snapshot
      Network.instance.worldState[entity.id][componentTypeId][attribute] = networkObject.componentMap[componentTypeId][attribute];
      // And set the new value
      component[attribute] === networkObject.componentMap[componentTypeId][attribute];
    }
    // for each value on component
    // check if value has changed
    // If so, add to message queue
  }
};
