import { Vector3, Quaternion } from 'three';
import { getMutableComponent, getComponent } from '../../ecs/functions/EntityFunctions';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { Network } from '../components/Network';
import { NetworkObject } from '../components/NetworkObject';
import { createNetworkPrefab } from './createNetworkPrefab';

export function initializeNetworkObject(ownerId: string, networkId: number, prefabType: number, position?: Vector3, rotation?: Quaternion) {
console.log("Initializing network object")
  // Instantiate into the world
  const networkEntity = createNetworkPrefab(
    // Prefab from the Network singleton's schema, using the defaultClientPrefab as a key
    Network.instance.schema.prefabs[prefabType],
    // Connecting client's ID as a string
    ownerId,
    networkId
  );

  // Initialize with starting position and rotation
  const transform = getMutableComponent(networkEntity, TransformComponent);
  transform.position = position ? position: new Vector3();
  transform.rotation = rotation ? rotation : new Quaternion();

  // Add network object to list Network.networkObjects with user
  Network.instance.networkObjects[networkId] =
  {
    ownerId,
    prefabType,
    component: getComponent(networkEntity, NetworkObject)
  };

  // Tell the client
  console.log("Object ", networkId, " added to the simulation for owner ", ownerId, " with a prefab type: ", prefabType);
}
