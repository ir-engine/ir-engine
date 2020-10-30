import { removeEntity } from '../../ecs/functions/EntityFunctions';
import { Network } from '../components/Network';

export function destroyNetworkObject(objectKey) {
  console.log("Destroying network object ", Network.instance.networkObjects[objectKey].component.networkId);
  if(Network.instance.networkObjects[objectKey] === undefined)
    return console.warn("Can't destroy object as it doesn't appear to exist")
  // get network object
  const entity = Network.instance.networkObjects[objectKey].component.entity;
  // Remove the entity and all of it's components
  removeEntity(entity);
  // Remove network object from list
  delete Network.instance.networkObjects[objectKey];
  console.log(objectKey, " removed from simulation");
}
