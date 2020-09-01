/**
 * Handle a client leaving the world
 * @param clientID The ID of the client to disconnect (also their socket ID)
 */


export const handleClientDisconnected = (clientID: string): void => {
  console.log('Client ', clientID, ' disconnected.');
  // Remove the network prefab using network schema
  // TODO
  // removeNetworkEntityWithPrefab(clientID, (Network.instance as Network).schema.defaultClientPrefab)
};
