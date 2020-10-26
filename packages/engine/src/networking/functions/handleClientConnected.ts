import { addComponent, getComponent, hasComponent } from '../../ecs/functions/EntityFunctions';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { Network } from '../components/Network';
import { NetworkObject } from '../components/NetworkObject';
import { createNetworkPrefab } from './createNetworkPrefab';
// TODO: This should only be called on server, harmless, but yeah

export const handleClientConnected = (args: { id: any; media: any }) => {
  console.log("handle client connected");
  if (Network.instance.clients[args.id] == null) {
    Network.instance.clients[args.id] = {
      // BUG
      // TODO: Need this to be passed in
      userId: args.id,
      media: args.media
    };
  }

  const networkId = Network.getNetworkId();

  // TODO: First, check if the client is already in our client list
  
  // TODO: Then, check if client already has network objects

  // TODO: Do they already have a default client prefab? Let's give it to them (but throw a warning)

  // TODO: Otherwise create a new one
  const entity = createNetworkPrefab(
    Network.instance.schema.prefabs[Network.instance.schema.defaultClientPrefab],
    args.id,
    networkId
  );

  // Get a reference to the network object we just created, we need the ID
  const networkObject = getComponent(entity, NetworkObject);

  // Add the network object to our list of network objects
    Network.instance.networkObjects[networkId] = {
      ownerId: args.id, // Owner's socket ID
      prefabType: Network.instance.schema.defaultClientPrefab, // All network objects need to be a registered prefab
      component: networkObject
    };

  if (!hasComponent(entity, TransformComponent)) addComponent(entity, TransformComponent);

  // Get a reference to the transform on the object so we can send initial values
  const transform = getComponent(entity, TransformComponent);

  // console.log(transform);

  const createObjectMessage = {
    networkId: networkObject.networkId,
    ownerId: args.id,
    prefabType: Network.instance.schema.defaultClientPrefab,
    x: transform.position.x,
    y: transform.position.y,
    z: transform.position.z,
    qX: transform.rotation.x,
    qY: transform.rotation.y,
    qZ: transform.rotation.z,
    qW: transform.rotation.w
  };

  // Added created to the worldState with networkId and ownerId
  Network.instance.worldState.createObjects.push(createObjectMessage);
};
