import { Network as NetworkComponent } from '../components/Network';
import { BuiltinMessageTypes } from '../enums/MessageTypes';

export function addClient(_id: string): void {
  if (NetworkComponent.instance.clients[_id] !== undefined)
    return console.error('Client is already in client list');
  NetworkComponent.instance.clients[_id] = {
    userId: "uninitialized"
  };
}
