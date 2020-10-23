import { Network } from '../components/Network';
import { createNetworkPrefab } from './createNetworkPrefab';
import { getComponent, hasComponent, addComponent } from '../../ecs/functions/EntityFunctions';
import { NetworkObject } from '../components/NetworkObject';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { MessageTypes } from '../enums/MessageTypes';
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

  // Create the default client prefab
  const entity = createNetworkPrefab(
    Network.instance.schema.prefabs[Network.instance.schema.defaultClientPrefab],
    args.id,
    Network.getNetworkId()
  );

  // Get a reference to the network object we just created, we need the ID
  const networkObject = getComponent(entity, NetworkObject);

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
  // console.log("Added user ", args.id);
  // console.log("Pushed object: ");
  // console.log(createObjectMessage);
};
