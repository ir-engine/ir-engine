import { Network as NetworkComponent } from '../components/Network';
import { BuiltinMessageTypes } from '../enums/MessageTypes';

export function removeClient(_id: string): void {
  // args: ID, isLocalPlayer?
  if (_id in NetworkComponent.instance.clients) {
    NetworkComponent.instance.clients.splice(NetworkComponent.instance.clients.indexOf(_id));
    NetworkComponent.instance.schema.messageHandlers[BuiltinMessageTypes.ClientDisconnected].behavior(
      _id,
      _id === NetworkComponent.instance.mySocketID
    ); // args: ID, isLocalPlayer?
  }
  else
    console.warn("Couldn't remove client because they didn't exist in our list");
}
