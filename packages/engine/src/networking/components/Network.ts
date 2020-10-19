import { RingBuffer } from '../../common/classes/RingBuffer';
import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
import { MessageSchema } from '../classes/MessageSchema';
import { NetworkSchema } from '../interfaces/NetworkSchema';
import { NetworkTransport } from '../interfaces/NetworkTransport';
import { NetworkObjectList } from '../interfaces/NetworkObjectList';

export interface NetworkClientList {
  // Key is socket ID
  [key: string]: {
    userId?: string;
    socket?: any;
    lastSeenTs?: any;
    joinTs?: any;
    media?: {};
    consumerLayers?: {};
    stats?: {};
    sendTransport?: any;
    recvTransport?: any;
    dataConsumers?: Map<string, any>; // Key => id of data producer
    dataProducers?: Map<string, any>; // Key => label of data channel}
  };
}


export class Network extends Component<Network> {
  static instance: Network = null
  // TODO: localuserId should be set somewhere
  localUserId = ""
  isInitialized: boolean
  transport: NetworkTransport
  schema: NetworkSchema
  // Add more data channels if needed, probably use sort of an enums just like MessageTypes for them
  dataChannels: string[] = [
    // examples
    // 'physics',
    // 'location' 
  ]
  clients: NetworkClientList = {}
  networkObjects: NetworkObjectList = {}
  mySocketID: string
  private static availableNetworkId = 0
  static getNetworkId() {
    return this.availableNetworkId++;
  }
  static _schemas: Map<string, MessageSchema> = new Map()

  incomingMessageQueue: RingBuffer<ArrayBuffer>
  outgoingMessageQueue: RingBuffer<ArrayBuffer>

  worldState = {
    tick: Network.tick,
    transforms: [],
    inputs: [],
    clientsConnected: [],
    clientsDisconnected: [],
    createObjects: [],
    destroyObjects: []
  }

  static sceneId = "default"
  static Network: any
  static tick: any = 0
  constructor() {
    super();
    Network.instance = this;
    Network.tick = 0;

    // TODO: Replace default message queue sizes
    this.incomingMessageQueue = new RingBuffer<ArrayBuffer>(100);
    this.outgoingMessageQueue = new RingBuffer<ArrayBuffer>(100);
  }

  dispose(): void {
    super.dispose();
    // TODO: needs tests
    this.clients = {};
    this.transport = null;
    Network.availableNetworkId = 0;
    Network.instance = null;
    Network.tick = 0;
    Network.sceneId = "default"; // TODO: Clear scene ID, no need for default
  }
}

Network.schema = {
  isInitialized: { type: Types.Boolean },
  transport: { type: Types.Ref },
  schema: { type: Types.Ref },
  clients: { type: Types.Array },
  mySocketID: { type: Types.String }
};
