import { Network as NetworkComponent } from '../components/Network';
import { BuiltinMessageTypes } from '../enums/MessageTypes';

export function addClient(_id: string): void {
  if (NetworkComponent.instance.clients.includes(_id))
    return console.error('Client is already in client list');
  NetworkComponent.instance.clients.push(_id);
  NetworkComponent.instance.schema.messageHandlers[BuiltinMessageTypes.ClientConnected].behavior(
    _id,
    _id === NetworkComponent.instance.mySocketID
  ); // args: ID, isLocalPlayer?
}
