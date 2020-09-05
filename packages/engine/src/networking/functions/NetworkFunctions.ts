
import { Network } from '../components/Network';
import { MessageChannel } from '../enums/MessageChannel';
import { MessageTypeAlias } from '../types/MessageTypeAlias';
import { fromBuffer } from './MessageFunctions';
import { createNetworkPrefab } from './NetworkPrefabFunctions';
import { DataConsumer } from 'mediasoup-client/lib/types'

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

export const handleClientDisconnected = (clientID: string): void => {
  console.log('Client ', clientID, ' disconnected.');
  // Remove the network prefab using network schema
  // TODO
  // removeNetworkEntityWithPrefab(clientID, (Network.instance as Network).schema.defaultClientPrefab)
};

export const handleDataChannelConsumerMessage = (dataConsumer: DataConsumer) => (message: any) => {
  // If Data is anything other than string then parse it else just use message directly
    // as it is probably not a json object string
    let data;
    try {
      data = JSON.parse(message);
    } catch (e) {
      data = message;
    }
    // switch on channel, probably use sort of an enums just like MessageTypes for the cases
    switch (dataConsumer.label) {
      // example
      // case 'physics'
      // DO STUFF
      // case 'location'
      // DO STUFF
      case 'default':
        // DO STUFF ON DEFAULT CHANNEL HERE
        console.warn('Default Channel got unreliable message on it!', data)
        break
      default:
        console.warn(
          `Unreliable Message received on ${dataConsumer.label} channel: `,
          data
        )
    }
}

let instance: Network;
let message: any;
export const handleMessage = (messageType: MessageTypeAlias, messageData: any): void => {
  instance = Network.instance;
  message = fromBuffer(messageData);
  // Process the message!
};

export const sendMessage = (messageChannel: MessageChannel, messageType: MessageTypeAlias, messageData: any, unreliableChannel?: string): void => {
  instance = Network.instance
  switch (messageChannel) {
    case MessageChannel.Reliable:
      instance.transport.sendReliableMessage({ channel: messageType.toString(), data: messageData })
    case MessageChannel.Unreliable:
      // instance.transport.sendUnreliableMessage(messageData, messageType.toString()) // Use message type as channel?
      instance.transport.sendUnreliableMessage(messageData, unreliableChannel) // Use default channel?
  }
}
