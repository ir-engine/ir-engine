import isNullOrUndefined from '../../common/functions/isNullOrUndefined';
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/EntityFunctions';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { Network } from '../components/Network';
import { NetworkObject } from '../components/NetworkObject';
import { createNetworkPrefab } from './createNetworkPrefab';

export const handleClientConnected = (args: { id: any; media: any }) => {
  console.log("handle client connected");

  const clientExists = isNullOrUndefined(Network.instance.clients[args.id]);

  // get network objects that match client id, this is a validation check
  let networkObjectsClientOwns = []

  for (const key in Network.instance.networkObjects)
    if (Network.instance.networkObjects[key].ownerId === args.id)
      networkObjectsClientOwns.push(key)

  const clientHasNetworkObjects = networkObjectsClientOwns.length > 0;

  // // Reset the client object
  // Network.instance.clients[args.id] = {
  //   userId: args.id,
  //   media: args.media
  // };

  let networkObject;
  let hasCharacter = false;

  if (clientExists) console.warn("Connecting client", args.id, "is already in our user list");

  // Client already had network objects
  if (clientExists && clientHasNetworkObjects) {
    console.warn("Client already exists and has network objects")
    // Do they have a player character object?
    // If  they don't let's get them one
    // For each object client owns, check if it's the character network prefab
    for (let i = 0; i < networkObjectsClientOwns.length; i++) {
      if (Network.instance.networkObjects[networkObjectsClientOwns[i]].prefabType === Network.instance.schema.defaultClientPrefab) {
        console.warn("Found player character, assigning as their avatar object")
        // has character
        hasCharacter = true;
        // and this is the network object
        networkObject = Network.instance.networkObjects[networkObjectsClientOwns[i]];
        break;
      }
    }
  }

  // If we have a a character already, use network id, otherwise create a new one
  const networkId = hasCharacter ? networkObject.networkId : Network.getNetworkId();

  if (!hasCharacter) {
    
    // No character, so let's make a new one
    const entity = createNetworkPrefab(
      Network.instance.schema.prefabs[Network.instance.schema.defaultClientPrefab],
      args.id,
      networkId
    );

    // Get a reference to the network object we just created, we need the ID
    networkObject = getComponent(entity, NetworkObject);
  }


  // Add the network object to our list of network objects
  Network.instance.networkObjects[networkId] = {
    ownerId: args.id, // Owner's socket ID
    prefabType: Network.instance.schema.defaultClientPrefab, // All network objects need to be a registered prefab
    component: networkObject
  };

  if (!hasComponent(networkObject.entity, TransformComponent)) addComponent(networkObject.entity, TransformComponent);

  // Get a reference to the transform on the object so we can send initial values
  const transform = getComponent(networkObject.entity, TransformComponent);

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
