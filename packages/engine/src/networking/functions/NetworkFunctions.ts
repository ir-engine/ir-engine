/* eslint-disable @typescript-eslint/no-empty-function */
import { RingBuffer } from '../../common/classes/RingBuffer';
import { Network } from '../components/Network';
import { MessageChannel } from '../enums/MessageChannel';
import { MessageTypeAlias } from '../types/MessageTypeAlias';
import { fromBuffer } from './MessageFunctions';
import { createNetworkPrefab } from './NetworkPrefabFunctions';

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

let instance: Network;
let message: any;
export const handleMessage = (messageType: MessageTypeAlias, messageData: any): void => {
  instance = Network.instance;
  message = fromBuffer(messageData);
  // Process the message!
};

let queue: RingBuffer<any>;
export const sendMessage = (messageChannel: MessageChannel, messageType: MessageTypeAlias, messageData: any): void => {
  instance = Network.instance;
  queue = messageChannel === MessageChannel.Reliable ? instance.outgoingReliableQueue : instance.outgoingUnreliableQueue;
  queue.add(messageType, messageData);
};
