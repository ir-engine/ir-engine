
import { Network } from '../components/Network';
import { MessageChannel } from '../enums/MessageChannel';
import { MessageTypeAlias } from '../types/MessageTypeAlias';
import { fromBuffer } from './MessageFunctions';
import { createNetworkPrefab } from './NetworkPrefabFunctions';

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

let instance: Network;
let message: any;

/**
 * Handle incoming network messages
 * @param messageType What type of message is this?
 * @param messageData Received data, packed into a typed buffer array
 */
export const handleMessage = (messageType: MessageTypeAlias, messageData: any): void => {
  instance = Network.instance;
  message = fromBuffer(messageData);
  // Process the message!
};

/**
 * Send a message over the network
 * @param messageChannel Are we sending this message reliably (socket.io) or unreliably? (SCTP on UDP)
 * @param messageData Data to be sent, packed into a typed buffer array
 * @param messageType What type of message is this? Will determine how it is parsed (reliable only)
 */
export const sendMessage = (messageChannel: MessageChannel, messageData: any, messageType?: MessageTypeAlias): void => {
  instance = instance
  switch (messageChannel) {
    case MessageChannel.Reliable:
      instance.transport.sendReliableMessage({ channel: messageType.toString(), data: messageData })
    case MessageChannel.Unreliable:
      // instance.transport.sendUnreliableMessage(messageData, messageType.toString()) // Use message type as channel?
      instance.transport.sendUnreliableMessage(messageData) // Use default channel?
  }
}
