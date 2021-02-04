import { Schema } from "superbuffer";
import { RingBuffer } from '../../common/classes/RingBuffer';
import { Entity } from '../../ecs/classes/Entity';
import { NetworkObjectList } from '../interfaces/NetworkObjectList';
import { NetworkSchema } from '../interfaces/NetworkSchema';
import { NetworkTransport } from '../interfaces/NetworkTransport';
import { WorldStateInterface } from "../interfaces/WorldState";
import { Snapshot } from "../types/SnapshotDataTypes";

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
    relSendTransport?: any;
    relRecvTransport?: any;
    dataConsumers?: Map<string, any>; // Key => id of data producer
    dataProducers?: Map<string, any>; // Key => label of data channel}
  };
}

/** Component Class for Network. */
export class Network {
  /** Static instance to access everywhere. */
  static instance: Network = new Network();
  /** Indication of whether the network is initialized or not. */
  isInitialized: boolean
  /** Whether to apply compression on packet or not. */
  packetCompression = true
  /** we dont senr unit64 now, then its a value to -minus from time to get a little value for unit32 */
  timeSnaphotCorrection = Date.now()
  /** Object holding transport details over network. */
  transport: NetworkTransport
  /** Network transports. */
  transports = []
  /** Schema of the component. */
  schema: NetworkSchema
  /** Clients connected over this network. */
  clients: NetworkClientList = {}
  /** Newly connected clients over this network in this frame. */
  clientsConnected = []
  /** Disconnected client in this frame. */
  clientsDisconnected = []
  /** List of data producer nodes. */
  dataProducers = new Map<string, any>()
  /** List of data consumer nodes. */
  dataConsumers = new Map<string, any>()

  /** Newly created Network Objects in this frame. */
  createObjects = []
  /** Destroyed Network Objects in this frame. */
  destroyObjects = []
  /** Map of Network Objects. */
  networkObjects: NetworkObjectList = {}
  localClientEntity: Entity = null
  /** Socket id of the network. */
  socketId: string
  /** User id hosting this network. */
  userId: string
  /** Access tocken of the User. */
  accessToken: string
  /** Snapshot of the network. */
  snapshot: Snapshot

  /** ID of last network created. */
  private static availableNetworkId = 0

  /** Get next network id. */
  static getNetworkId(): number {
    return ++this.availableNetworkId;
  }

  /** Schema of the network. */
  static _schemas: Map<string, Schema> = new Map()

  /** Buffer holding all incoming Messages. */
  incomingMessageQueue: RingBuffer<any>

  /** State of the world. */
  worldState: WorldStateInterface = {
    tick: Network.tick,
    transforms: [],
    inputs: [],
    states: [],
    clientsConnected: [],
    clientsDisconnected: [],
    createObjects: [],
    destroyObjects: []
  };

  /**
   * Attached ID of scene attached with this network.
   * @default 547Y45f7
   */
  static sceneId = '547Y45f7'
  /** Network. */
  static Network: any
  /** Tick of the network. */
  static tick: any = 0

  /** Constructs the network. */
  constructor() {
    Network.instance = this;
    Network.tick = 0;
    this.incomingMessageQueue = new RingBuffer<any>(100);
  }

  /** Disposes the network. */
  dispose(): void {
    // TODO: needs tests
    this.clients = {};
    this.transport = null;
    Network.availableNetworkId = 0;
    Network.instance = null;
    Network.tick = 0;
    Network.sceneId = "default"; // TODO: Clear scene ID, no need for default
  }
}
