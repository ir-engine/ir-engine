import { Network as NetworkComponent } from '../components/Network';
import { MessageTypes } from '../enums/MessageTypes';

export function removeClient(_id: string): void {
  // If the client is in the client list...
  if (Object.keys(NetworkComponent.instance.clients).includes(_id)) {
    // Call each behavior in the network template
    NetworkComponent.instance.schema.messageHandlers[MessageTypes.ClientDisconnected].forEach(behavior => {
      behavior.behavior(
        _id,
        _id === NetworkComponent.instance.mySocketID
      );
    });
  }
  else
    console.warn("Couldn't remove client because they didn't exist in our list");
}
