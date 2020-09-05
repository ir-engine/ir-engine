import { Network as NetworkComponent } from '../components/Network';
import { addClient } from "./addClient";

export function initializeClient(myClientId, allClientIds): void {
  NetworkComponent.instance.mySocketID = myClientId;
  console.log('Initialized with socket ID', myClientId);
  if (allClientIds === undefined)
    return console.log('All IDs are null');
  // for each existing user, add them as a client and add tracks to their peer connection
  for (let i = 0; i < allClientIds.length; i++)
    addClient(allClientIds[i]);
}
