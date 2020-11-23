import { RingBuffer } from '../../common/classes/RingBuffer';
import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';
import { MessageSchema } from '../classes/MessageSchema';
import { NetworkSchema } from '../interfaces/NetworkSchema';
import { NetworkTransport } from '../interfaces/NetworkTransport';
import { NetworkObjectList } from '../interfaces/NetworkObjectList';
import { Entity } from '../../ecs/classes/Entity';

export interface NetworkClientList {
  // Key is socket ID
  [key: string]: {
    userId?: string;
    name?: string;
    socket?: SocketIO.Socket;
    socketId?: string;
    lastSeenTs?: any;
    joinTs?: any;
    media?: {};
    consumerLayers?: {};
    stats?: {};
    instanceSendTransport?: any;
    instanceRecvTransport?: any;
    partySendTransport?: any;
    partyRecvTransport?: any;
    dataConsumers?: Map<string, any>; // Key => id of data producer
    dataProducers?: Map<string, any>; // Key => label of data channel}
  };
}

export class Network extends Component<Network> {
  static instance: Network = null
  isInitialized: boolean
  transport: NetworkTransport
  schema: NetworkSchema
  clients: NetworkClientList = {}
  clientsConnected = []
  clientsDisconnected = []
  createObjects = []
  destroyObjects = []
  networkObjects: NetworkObjectList = {}
  localClientEntity: Entity = null
  socketId: string
  userId: string
  accessToken: string

  private static availableNetworkId = 0
  static getNetworkId() {
    return this.availableNetworkId++;
  }
  static _schemas: Map<string, MessageSchema> = new Map()

  incomingMessageQueue: RingBuffer<ArrayBuffer>

  worldState = {
    tick: Network.tick,
    transforms: [],
    inputs: [],
    states: [],
    clientsConnected: [],
    clientsDisconnected: [],
    createObjects: [],
    destroyObjects: []
  };

  static sceneId = '547Y45f7'//"default"
  static Network: any
  static tick: any = 0
  constructor() {
    super();
    Network.instance = this;
    Network.tick = 0;

    this.incomingMessageQueue = new RingBuffer<ArrayBuffer>(100);
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
};
