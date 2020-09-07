import { Network } from '../components/Network';
import { MessageTypes } from '../enums/MessageTypes';

export function addClient(_id: string): void {
  Network.instance.schema.messageHandlers[MessageTypes.ClientConnected].forEach(behavior => {
    behavior.behavior(
      _id,
    );
  })
}