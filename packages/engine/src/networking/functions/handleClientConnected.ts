import { Network } from '../components/Network';
import { createNetworkPrefab } from './createNetworkPrefab';
/**
 * Handle a client joining the world
 * @param clientID The ID of the client to disconnect (also their socket ID)
 */


export const handleClientConnected = (clientID: string): void => {
  console.log('Client ', clientID, ' connected.');
  // create a network prefab using network schema
  createNetworkPrefab(
    // Prefab from the Network singleton's schema, using the defaultClientPrefab as a key
    (Network.instance).schema.prefabs[(Network.instance).schema.defaultClientPrefab].prefab,
    // Connecting client's ID as a string
    clientID
  );
};
