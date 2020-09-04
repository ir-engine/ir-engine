import { removeEntity } from '../../ecs/functions/EntityFunctions';
import { Network } from '../components/Network';

export function destroyNetworkObject(networkId) {
  // get network object
  const entity = Network.instance.networkObjects[networkId].component.entity;
  // Remove the entity and all of it's components
  removeEntity(entity);
  // Remove network object from list
  delete Network.instance.networkObjects[networkId];
  console.log(networkId, " removed from simulation");
}
