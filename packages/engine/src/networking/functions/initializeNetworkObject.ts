import { Vector3, Quaternion } from 'three';
import { getMutableComponent, getComponent } from '../../ecs/functions/EntityFunctions';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { Network } from '../components/Network';
import { NetworkObject } from '../components/NetworkObject';
import { createNetworkPrefab } from './createNetworkPrefab';
import { PrefabType } from "../../templates/networking/DefaultNetworkSchema";

export function initializeNetworkObject(ownerId: string, networkId: number, prefabType: string | number, position?: Vector3, rotation?: Quaternion): NetworkObject {
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

  const networkObject = getComponent(networkEntity, NetworkObject);

  // Add network object to list Network.networkObjects with user
  Network.instance.networkObjects[networkId] =
  {
    ownerId,
    prefabType,
    component: networkObject
  };

  if (prefabType === PrefabType.Player && ownerId === (Network.instance).userId) {
    console.log('Set localClientEntity', networkEntity);
    Network.instance.localClientEntity = networkEntity;
  }

  // Tell the client
  console.log("Object ", networkId, " added to the simulation for owner ", ownerId, " with a prefab type: ", prefabType);

  return networkObject;
}
