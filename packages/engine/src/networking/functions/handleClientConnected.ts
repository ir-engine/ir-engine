import { Network } from '../components/Network';
import { createNetworkPrefab } from './createNetworkPrefab';
import { getComponent } from '../../ecs/functions/EntityFunctions';
import { NetworkObject } from '../components/NetworkObject';
import { TransformComponent } from '../../transform/components/TransformComponent';
// TODO: This should only be called on server, harmless, but yeah

export const handleClientConnected = (args: { id: any; }) => {
  // Client doesn't need to handle logic beyond this point
  if (!Network.instance.transport.isServer)
    return;

  if (Network.instance.clients[args.id] !== undefined)
    return console.error('Client is already in client list');
  Network.instance.clients[args.id] = {
    // BUG
    // TODO: Need this to be passed in
    userId: "uninitialized"
  };

  // Create the default client prefab
  const entity = createNetworkPrefab(
    Network.instance.schema.prefabs[Network.instance.schema.defaultClientPrefab],
    args.id,
    Network.getNetworkId()
  );

  // Get a reference to the network object we just created, we need the ID
  const networkObject = getComponent(entity, NetworkObject);

  // Get a reference to the transform on the object so we can send initial values
  const transform = getComponent(entity, TransformComponent);

  const createObjectMessage = {
    networkId: networkObject.networkId,
    ownerId: args.id,
    prefabType: Network.instance.schema.defaultClientPrefab,
    x: transform.position.x,
    y: transform.position.y,
    z: transform.position.z,
    q: {
      x: transform.rotation.x,
      y: transform.rotation.y,
      z: transform.rotation.z,
      w: transform.rotation.w
    }
  };

  // Added created to the worldState with networkId and ownerId
  Network.instance.worldState.createObjects.push(createObjectMessage);
  console.log("Added user ", args.id);
};
